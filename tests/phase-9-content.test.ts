import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { GraphNode } from "../src/core/types";

const PHASE_9_NODE_IDS = [
  "protocol.sequence-locks-bip68",
  "protocol.cltv-bip65",
  "protocol.csv-bip112",
  "protocol.wtxid-relay-bip339",
  "protocol.dust-policy",
  "protocol.standardness-policy",
  "dev.testmempoolaccept-rpc",
  "dev.fundrawtransaction-rpc",
  "dev.scantxoutset-rpc",
  "lightning.revocation-penalty-keys",
  "lightning.channel-reserve-policy",
  "lightning.htlc-timeout-settlement",
  "mining.empty-block-mining",
  "mining.block-propagation-latency",
  "ops.addrman-bucketing",
  "ops.peer-eviction-protection",
  "ops.utxo-set-management",
  "privacy.common-input-ownership",
  "privacy.change-avoidance",
  "custody.musig2-descriptors",
  "economics.onchain-cost-allocation",
  "history.rbf-policy-evolution",
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
];

const REQUIRED_PHASE_9_PREREQUISITES: Record<string, string[]> = {
  "protocol.cltv-bip65": ["protocol.timelocks"],
  "protocol.sequence-locks-bip68": ["protocol.timelocks"],
  "protocol.csv-bip112": ["protocol.timelocks"],
  "protocol.wtxid-relay-bip339": ["protocol.transaction-relay-inv-getdata"],
  "protocol.dust-policy": ["protocol.fee-market"],
  "protocol.standardness-policy": ["ops.mempool-policy"],
  "dev.testmempoolaccept-rpc": ["dev.bitcoin-core-rpc"],
  "dev.fundrawtransaction-rpc": ["dev.bitcoin-core-rpc"],
  "dev.scantxoutset-rpc": ["dev.bitcoin-core-rpc"],
  "lightning.revocation-penalty-keys": ["lightning.commitment-transactions"],
  "lightning.channel-reserve-policy": ["lightning.payment-channels"],
  "lightning.htlc-timeout-settlement": ["lightning.htlc"],
  "mining.empty-block-mining": ["mining.block-template-selection"],
  "mining.block-propagation-latency": ["mining.stale-blocks"],
  "ops.addrman-bucketing": ["ops.peer-discovery"],
  "ops.peer-eviction-protection": ["ops.peer-discovery"],
  "ops.utxo-set-management": ["protocol.utxo-model"],
  "privacy.common-input-ownership": ["privacy.chain-analysis-heuristics"],
  "privacy.change-avoidance": ["privacy.change-detection"],
  "custody.musig2-descriptors": ["custody.multisig", "protocol.taproot"],
  "economics.onchain-cost-allocation": ["economics.transaction-batching-economics"],
  "history.rbf-policy-evolution": ["protocol.rbf"],
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

function hasDisallowedResourceDomain(node: GraphNode): boolean {
  return node.resources.some((resource) => {
    const host = new URL(resource.url).hostname.replace(/^www\./, "");
    return !ALLOWED_RESOURCE_DOMAINS.some(
      (domain) => host === domain || host.endsWith(`.${domain}`),
    );
  });
}

function hasBlankPrerequisite(node: GraphNode): boolean {
  return node.prerequisites.some((prerequisite) => prerequisite.trim().length === 0);
}

function hasResourceCountOutOfRange(node: GraphNode): boolean {
  return node.resources.length < 2 || node.resources.length > 3;
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

describe("phase 9 advanced policy and ops expansion", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("includes all required phase-9 node ids", () => {
    const missing = PHASE_9_NODE_IDS.filter((id) => !byId.has(id));
    expect(missing).toEqual([]);
  });

  it("keeps each phase-9 node source-curated and dependency-specific", () => {
    for (const nodeId of PHASE_9_NODE_IDS) {
      const node = byId.get(nodeId);
      expect(node, `${nodeId} should exist`).toBeTruthy();
      if (!node) {
        continue;
      }

      expect(node.prerequisites.length, `${nodeId} should have prerequisites`).toBeGreaterThan(0);
      expect(hasBlankPrerequisite(node), `${nodeId} should not have blank prerequisites`).toBe(
        false,
      );
      expect(new Set(node.prerequisites).size, `${nodeId} prerequisites should be unique`).toBe(
        node.prerequisites.length,
      );
      for (const requiredPrerequisite of REQUIRED_PHASE_9_PREREQUISITES[nodeId] ?? []) {
        expect(
          node.prerequisites,
          `${nodeId} should include prerequisite ${requiredPrerequisite}`,
        ).toContain(requiredPrerequisite);
      }

      expect(hasResourceCountOutOfRange(node), `${nodeId} should have 2-3 resources`).toBe(false);
      expect(
        hasDisallowedResourceDomain(node),
        `${nodeId} should only use allowed source domains`,
      ).toBe(false);
    }
  });

  it("avoids transitive redundant prerequisites in phase-9 nodes", () => {
    const redundant = PHASE_9_NODE_IDS.filter((nodeId) => {
      const node = byId.get(nodeId);
      if (!node) {
        return false;
      }
      return hasTransitiveRedundantPrerequisite(node, byId);
    });

    expect(redundant).toEqual([]);
  });

  it("catches curation edge cases in synthetic fixtures", () => {
    const noisyResourceFixture: GraphNode = {
      id: "test.resource-bloat-fixture",
      title: "Resource Bloat Fixture",
      description: "Synthetic fixture for resource-count checks.",
      category: "Testing",
      prerequisites: ["foundation.base"],
      resources: [
        { type: "article", title: "one", url: "https://bitcoinops.org/" },
        { type: "article", title: "two", url: "https://bitcoin.design/" },
        { type: "article", title: "three", url: "https://bitcoincore.academy/" },
        { type: "article", title: "four", url: "https://bitcoin.page" },
      ],
      estimatedTime: "1m",
    };

    expect(hasResourceCountOutOfRange(noisyResourceFixture)).toBe(true);

    const invalidDomainFixture: GraphNode = {
      id: "test.invalid-domain-phase9",
      title: "Invalid Domain Fixture",
      description: "Synthetic fixture for domain allowlist validation.",
      category: "Testing",
      prerequisites: ["foundation.base"],
      resources: [
        { type: "article", title: "Bad Source", url: "https://example.invalid/bitcoin" },
        { type: "article", title: "Second Source", url: "https://bitcoinops.org/" },
      ],
      estimatedTime: "1m",
    };

    expect(hasDisallowedResourceDomain(invalidDomainFixture)).toBe(true);

    const blankPrerequisiteFixture: GraphNode = {
      id: "test.blank-prerequisite-phase9",
      title: "Blank Prerequisite Fixture",
      description: "Synthetic fixture for prerequisite trimming validation.",
      category: "Testing",
      prerequisites: ["foundation.base", "   "],
      resources: [
        { type: "article", title: "one", url: "https://bitcoinops.org/" },
        { type: "article", title: "two", url: "https://bitcoin.design/" },
      ],
      estimatedTime: "1m",
    };

    expect(hasBlankPrerequisite(blankPrerequisiteFixture)).toBe(true);
  });
});
