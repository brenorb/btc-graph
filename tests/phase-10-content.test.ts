import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { GraphNode } from "../src/core/types";

const PHASE_10_NODE_IDS = [
  "protocol.covenants",
  "protocol.adaptor-signatures",
  "protocol.anyprevout",
  "protocol.op-checktemplateverify",
  "protocol.tluv",
  "protocol.txhash",
  "protocol.direct-introspection",
  "protocol.matt-ccv",
  "security.op-vault",
  "extension.great-script-restoration",
  "extension.bitvm",
  "protocol.op-cat",
  "protocol.op-checksigfromstack",
  "protocol.op-checksigadd",
  "protocol.op-codeseparator",
  "extension.transaction-templating",
  "extension.payment-pools",
  "extension.ark",
  "extension.statechains",
  "extension.spacechains",
  "extension.congestion-control",
  "extension.coinpools",
  "extension.discreet-log-contracts",
  "protocol.cross-input-signature-aggregation",
  "protocol.erlay",
  "protocol.cluster-mempool",
  "protocol.v2-p2p-transport",
  "protocol.ephemeral-anchors",
  "lightning.ptlc",
  "lightning.eltoo",
  "security.eclipse-attacks",
  "privacy.dandelion",
  "dev.reproducible-builds",
] as const;

const REQUIRED_PHASE_10_PREREQUISITES: Record<string, string[]> = {
  "protocol.anyprevout": ["protocol.sighash-flags", "protocol.taproot"],
  "protocol.op-checktemplateverify": ["protocol.timelocks", "protocol.covenants"],
  "protocol.op-cat": ["protocol.script"],
  "extension.bitvm": ["protocol.taproot", "protocol.matt-ccv"],
  "lightning.eltoo": ["protocol.anyprevout", "lightning.commitment-transactions"],
  "lightning.ptlc": ["lightning.htlc", "protocol.adaptor-signatures"],
  "protocol.erlay": ["protocol.transaction-relay-inv-getdata"],
  "protocol.cluster-mempool": ["protocol.mempool", "ops.mempool-policy"],
};

const ALLOWED_RESOURCE_DOMAINS = [
  "bitcoinops.org",
  "btctranscripts.com",
  "opcodeexplained.com",
  "covenants.info",
  "github.com",
  "developer.bitcoin.org",
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

  if (host === "amazon.com") {
    return !pathname.includes("/dp/");
  }

  if (host === "opcodeexplained.com" || host === "covenants.info") {
    if (host === "covenants.info" && ["/proposals/", "/use-cases/", "/extra/"].includes(pathname)) {
      return true;
    }
    return pathname === "/" || pathname.length < 3;
  }

  return false;
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
    /^OP_1NEGATE$/i.test(topic)
  );
}

describe("phase 10 external topic corpus integration", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("includes all required phase-10 node ids", () => {
    const missing = PHASE_10_NODE_IDS.filter((id) => !byId.has(id));
    expect(missing).toEqual([]);
  });

  it("keeps phase-10 nodes concise, dependency-specific, and source-focused", () => {
    let amazonResourceNodeCount = 0;

    for (const nodeId of PHASE_10_NODE_IDS) {
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
      for (const requiredPrerequisite of REQUIRED_PHASE_10_PREREQUISITES[nodeId] ?? []) {
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

  it("catches description and trivial-opcode edge cases in synthetic fixtures", () => {
    const tooLongDescription =
      "Sentence one is valid. Sentence two is also valid. Sentence three should fail.";
    expect(isDescriptionTooLong(tooLongDescription)).toBe(true);

    expect(isTrivialOpcodeTopic("OP_PUSHBYTES_1")).toBe(true);
    expect(isTrivialOpcodeTopic("OP_2")).toBe(true);
    expect(isTrivialOpcodeTopic("OP_PUSHDATA4")).toBe(true);
    expect(isTrivialOpcodeTopic("OP_CAT")).toBe(false);

    expect(hasBroadResourceUrl("https://covenants.info/use-cases/")).toBe(true);
    expect(hasBroadResourceUrl("https://bitcoinops.org/en/topics/")).toBe(true);
    expect(hasBroadResourceUrl("https://btctranscripts.com/topics")).toBe(true);
    expect(hasBroadResourceUrl("https://covenants.info/use-cases/tx-templating/")).toBe(false);
  });
});
