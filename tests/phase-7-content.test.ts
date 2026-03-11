import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { GraphNode } from "../src/core/types";

const PHASE_7_NODE_IDS = [
  "protocol.addr-v2-bip155",
  "protocol.transaction-relay-inv-getdata",
  "protocol.package-relay",
  "protocol.sighash-flags",
  "dev.descriptor-wallet-imports",
  "dev.hwi-psbt-flow",
  "dev.fee-estimation-rpc",
  "lightning.gossip-protocol",
  "lightning.probing-attacks",
  "lightning.channel-fee-policies",
  "mining.fee-sniping",
  "mining.template-construction",
  "ops.dns-seeds",
  "ops.asmap",
  "privacy.script-type-fingerprinting",
  "privacy.amount-correlation",
  "custody.bsms",
  "custody.seed-xor-shards",
  "economics.fee-pressure-cycles",
  "economics.transaction-batching-economics",
  "history.taproot-activation",
  "history.gpu-to-asic-era",
] as const;

const ALLOWED_RESOURCE_DOMAINS = [
  "bitcoin.page",
  "bitcoindev.network",
  "bitcoincore.academy",
  "lopp.net",
  "bitcoin.design",
  "bitcoinops.org",
  "github.com",
  "developer.bitcoin.org",
  "mempool.space",
  "bitcoin.org",
  "amzn.to",
];

const REQUIRED_PHASE_7_PREREQUISITES: Record<string, string[]> = {
  "protocol.addr-v2-bip155": ["ops.peer-discovery"],
  "protocol.package-relay": ["protocol.cpfp", "ops.mempool-policy"],
  "dev.hwi-psbt-flow": ["dev.psbt-v2", "custody.hardware-wallets"],
  "lightning.probing-attacks": ["lightning.routing", "privacy.network-privacy"],
  "mining.fee-sniping": ["mining.mining-economics", "protocol.reorgs-finality"],
  "history.taproot-activation": ["protocol.taproot", "history.segwit-activation"],
};

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

function hasBlankPrerequisite(node: GraphNode): boolean {
  return node.prerequisites.some((prerequisite) => prerequisite.trim().length === 0);
}

function hasDisallowedResourceDomain(node: GraphNode): boolean {
  return node.resources.some((resource) => {
    const host = new URL(resource.url).hostname.replace(/^www\./, "");
    return !ALLOWED_RESOURCE_DOMAINS.some(
      (domain) => host === domain || host.endsWith(`.${domain}`),
    );
  });
}

function hasTransitiveRedundantPrerequisite(
  node: GraphNode,
  byId: Map<string, GraphNode>,
): boolean {
  const direct = new Set(node.prerequisites);

  function reaches(fromId: string, targetId: string, seen: Set<string>): boolean {
    if (fromId === targetId) {
      return true;
    }

    if (seen.has(fromId)) {
      return false;
    }

    seen.add(fromId);
    const current = byId.get(fromId);
    if (!current) {
      return false;
    }

    for (const prerequisite of current.prerequisites) {
      if (reaches(prerequisite, targetId, seen)) {
        return true;
      }
    }

    return false;
  }

  for (const prerequisite of node.prerequisites) {
    for (const other of direct) {
      if (other === prerequisite) {
        continue;
      }

      if (reaches(other, prerequisite, new Set())) {
        return true;
      }
    }
  }

  return false;
}

describe("phase 7 comprehensive source expansion", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("includes all required phase-7 node ids", () => {
    const missing = PHASE_7_NODE_IDS.filter((id) => !byId.has(id));
    expect(missing).toEqual([]);
  });

  it("keeps each phase-7 node source-curated and dependency-specific", () => {
    for (const nodeId of PHASE_7_NODE_IDS) {
      const node = byId.get(nodeId);
      expect(node, `${nodeId} should exist`).toBeTruthy();
      if (!node) {
        continue;
      }

      expect(node.prerequisites.length, `${nodeId} should have prerequisites`).toBeGreaterThan(0);
      expect(hasBlankPrerequisite(node), `${nodeId} should not have blank prerequisites`).toBe(
        false,
      );
      expect(hasDuplicatePrerequisites(node), `${nodeId} prerequisites should be unique`).toBe(
        false,
      );
      for (const requiredPrerequisite of REQUIRED_PHASE_7_PREREQUISITES[nodeId] ?? []) {
        expect(
          node.prerequisites,
          `${nodeId} should include prerequisite ${requiredPrerequisite}`,
        ).toContain(requiredPrerequisite);
      }

      expect(node.resources.length, `${nodeId} should have 2-3 resources`).toBeGreaterThanOrEqual(
        2,
      );
      expect(node.resources.length, `${nodeId} should have 2-3 resources`).toBeLessThanOrEqual(3);
      expect(
        hasDisallowedResourceDomain(node),
        `${nodeId} should only use allowed source domains`,
      ).toBe(false);
    }
  });

  it("avoids transitive redundant prerequisites in phase-7 nodes", () => {
    const redundant = PHASE_7_NODE_IDS.filter((nodeId) => {
      const node = byId.get(nodeId);
      if (!node) {
        return false;
      }
      return hasTransitiveRedundantPrerequisite(node, byId);
    });

    expect(redundant).toEqual([]);
  });

  it("catches invalid domain and blank prerequisite edge cases in synthetic fixtures", () => {
    const invalidDomainFixture: GraphNode = {
      id: "test.invalid-domain-fixture",
      title: "Invalid Domain Fixture",
      description: "Synthetic fixture for resource domain validation.",
      category: "Testing",
      prerequisites: ["foundation.base"],
      resources: [
        {
          type: "article",
          title: "Bad Source",
          url: "https://example.invalid/bitcoin",
        },
      ],
      estimatedTime: "1m",
    };

    expect(hasDisallowedResourceDomain(invalidDomainFixture)).toBe(true);

    const blankPrerequisiteFixture: GraphNode = {
      id: "test.blank-prerequisite-fixture",
      title: "Blank Prerequisite Fixture",
      description: "Synthetic fixture for prerequisite trimming validation.",
      category: "Testing",
      prerequisites: ["foundation.base", "   "],
      resources: [],
      estimatedTime: "1m",
    };

    expect(hasBlankPrerequisite(blankPrerequisiteFixture)).toBe(true);
  });
});
