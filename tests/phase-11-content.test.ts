import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { GraphNode } from "../src/core/types";

const PHASE_11_NODE_IDS = [
  "protocol.annex",
  "mining.asicboost",
  "extension.channel-factories",
  "extension.coinswap",
  "extension.dual-funding",
  "extension.ecash",
  "custody.codex32",
  "privacy.silent-payments",
  "extension.sidechains",
  "ops.utreexo",
  "extension.lnurl",
  "extension.submarine-swaps",
  "protocol.transaction-pinning",
  "protocol.cpfp-carve-out",
  "security.exfiltration-resistant-signing",
  "protocol.fee-sponsorship",
  "protocol.discrete-log-equivalency",
  "fundamentals.trustlessness",
  "fundamentals.neutrality",
  "privacy.fungibility",
  "security.adversarial-thinking",
  "security.responsible-disclosure",
] as const;

const REQUIRED_PHASE_11_PREREQUISITES: Record<string, string[]> = {
  "protocol.annex": ["protocol.taproot"],
  "mining.asicboost": ["mining.mining-hardware"],
  "extension.channel-factories": ["lightning.liquidity"],
  "extension.coinswap": ["privacy.coinjoin", "protocol.timelocks"],
  "extension.ecash": ["protocol.utxo-model", "fundamentals.blind-signatures"],
  "privacy.silent-payments": ["protocol.taproot", "privacy.address-reuse"],
  "ops.utreexo": ["ops.utxo-set-management"],
  "protocol.transaction-pinning": ["protocol.package-relay"],
  "security.exfiltration-resistant-signing": ["custody.air-gapped-signing"],
  "protocol.fee-sponsorship": ["protocol.cpfp"],
  "protocol.discrete-log-equivalency": ["protocol.adaptor-signatures"],
  "fundamentals.trustlessness": ["ops.run-full-node", "fundamentals.censorship-resistance"],
  "privacy.fungibility": ["privacy.chain-analysis-heuristics", "fundamentals.money-properties"],
  "security.adversarial-thinking": ["security.eclipse-attacks"],
};

const ALLOWED_RESOURCE_DOMAINS = [
  "bitcoinops.org",
  "btctranscripts.com",
  "bitcoindevphilosophy.com",
  "opcodeexplained.com",
  "covenants.info",
  "github.com",
  "developer.bitcoin.org",
  "bitcoin.org",
  "amzn.to",
  "amazon.com",
];

function loadNodes(): GraphNode[] {
  const repoRoot = process.cwd();
  const sourceDir = path.join(repoRoot, "content", "nodes");
  const files = fs
    .readdirSync(sourceDir)
    .filter((file) => file.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b));

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(sourceDir, file), "utf8");
    return JSON.parse(raw) as GraphNode;
  });
}

function hasDuplicatePrerequisites(node: GraphNode): boolean {
  return new Set(node.prerequisites).size !== node.prerequisites.length;
}

function isDescriptionTooLong(description: string): boolean {
  const sentenceCount = description
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0).length;
  return sentenceCount > 2;
}

function hasBroadResourceUrl(urlString: string): boolean {
  const url = new URL(urlString);
  const host = url.hostname.replace(/^www\./, "");
  const pathname = url.pathname;

  if (host === "bitcoinops.org") {
    if (pathname === "/en/topics/" || pathname === "/") {
      return true;
    }
    if (pathname.startsWith("/en/topics/")) {
      return pathname.split("/").filter(Boolean).length < 3;
    }
  }

  if (host === "btctranscripts.com") {
    return !(pathname === "/search" && url.searchParams.has("filter_tags"));
  }

  if (host === "bitcoindevphilosophy.com") {
    return !url.hash;
  }

  if (host === "amazon.com") {
    return !pathname.includes("/dp/");
  }

  return pathname === "/" || pathname.length < 3;
}

function hasDisallowedResourceDomain(node: GraphNode): boolean {
  return node.resources.some((resource) => {
    const host = new URL(resource.url).hostname.replace(/^www\./, "");
    return !ALLOWED_RESOURCE_DOMAINS.some(
      (domain) => host === domain || host.endsWith(`.${domain}`),
    );
  });
}

function isTrivialOpcodeTopic(topic: string): boolean {
  return (
    /^OP_PUSHBYTES_\d+$/i.test(topic) ||
    /^OP_PUSHDATA[124]$/i.test(topic) ||
    /^OP_[0-9]+$/i.test(topic) ||
    /^OP_RETURN_[0-9]+$/i.test(topic) ||
    /^OP_1NEGATE$/i.test(topic)
  );
}

function isClearlyNonBitcoinTopic(topic: string): boolean {
  return /^(atlanta|conference|tabconf|2025)$/i.test(topic.trim());
}

describe("phase 11 source-driven specificity expansion", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("includes all required phase-11 node ids", () => {
    const missing = PHASE_11_NODE_IDS.filter((id) => !byId.has(id));
    expect(missing).toEqual([]);
  });

  it("keeps phase-11 nodes concise, dependency-specific, and source-focused", () => {
    let amazonResourceNodeCount = 0;

    for (const nodeId of PHASE_11_NODE_IDS) {
      const node = byId.get(nodeId);
      expect(node, `${nodeId} should exist`).toBeTruthy();
      if (!node) {
        continue;
      }

      if (node.resources.some((resource) => resource.type === "book")) {
        amazonResourceNodeCount += 1;
      }

      expect(isDescriptionTooLong(node.description), `${nodeId} should use max 2 sentences`).toBe(
        false,
      );
      expect(node.prerequisites.length, `${nodeId} should have prerequisites`).toBeGreaterThan(0);
      expect(hasDuplicatePrerequisites(node), `${nodeId} prerequisites should be unique`).toBe(
        false,
      );
      for (const requiredPrerequisite of REQUIRED_PHASE_11_PREREQUISITES[nodeId] ?? []) {
        expect(
          node.prerequisites,
          `${nodeId} should include prerequisite ${requiredPrerequisite}`,
        ).toContain(requiredPrerequisite);
      }

      expect(node.resources.length, `${nodeId} should have 2-4 resources`).toBeGreaterThanOrEqual(
        2,
      );
      expect(node.resources.length, `${nodeId} should have 2-4 resources`).toBeLessThanOrEqual(4);
      expect(
        hasDisallowedResourceDomain(node),
        `${nodeId} should only use approved source domains`,
      ).toBe(false);
      expect(
        node.resources.some((resource) => hasBroadResourceUrl(resource.url)),
        `${nodeId} should avoid broad source landing pages`,
      ).toBe(false);
    }

    expect(amazonResourceNodeCount).toBeGreaterThanOrEqual(8);
  });

  it("catches edge cases for topic quality and link precision", () => {
    const tooLongDescription =
      "Sentence one is valid. Sentence two is also valid. Sentence three should fail.";
    expect(isDescriptionTooLong(tooLongDescription)).toBe(true);

    expect(isTrivialOpcodeTopic("OP_PUSHBYTES_1")).toBe(true);
    expect(isTrivialOpcodeTopic("OP_RETURN_205")).toBe(true);
    expect(isTrivialOpcodeTopic("OP_PUSHDATA4")).toBe(true);
    expect(isTrivialOpcodeTopic("OP_CAT")).toBe(false);

    expect(isClearlyNonBitcoinTopic("atlanta")).toBe(true);
    expect(isClearlyNonBitcoinTopic("tabconf")).toBe(true);
    expect(isClearlyNonBitcoinTopic("channel-factories")).toBe(false);

    expect(hasBroadResourceUrl("https://bitcoindevphilosophy.com/")).toBe(true);
    expect(hasBroadResourceUrl("https://bitcoinops.org/en/topics/")).toBe(true);
    expect(hasBroadResourceUrl("https://btctranscripts.com/topics")).toBe(true);
    expect(hasBroadResourceUrl("https://bitcoindevphilosophy.com/#trustlessness")).toBe(false);
  });
});
