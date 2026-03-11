import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { GraphNode } from "../src/core/types";

const PHASE_6_NODE_IDS = [
  "protocol.headers-first-sync",
  "protocol.assumevalid",
  "protocol.bloom-filters-bip37",
  "protocol.witness-commitment",
  "dev.psbt-v2",
  "dev.output-script-descriptors",
  "lightning.route-blinding",
  "lightning.trampoline-routing",
  "lightning.channel-jamming",
  "mining.block-template-selection",
  "mining.stale-blocks",
  "ops.peer-discovery",
  "ops.txindex",
  "ops.compact-blocks-vs-filters",
  "privacy.change-detection",
  "privacy.utxo-consolidation-tradeoffs",
  "custody.air-gapped-signing",
  "custody.output-labeling",
  "economics.miner-revenue-composition",
  "history.segwit-activation",
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
  "amzn.to",
];

const REQUIRED_PHASE_6_PREREQUISITES: Record<string, string[]> = {
  "protocol.assumevalid": ["ops.initial-block-download"],
  "lightning.channel-jamming": ["lightning.liquidity"],
  "mining.block-template-selection": ["mining.getblocktemplate", "protocol.fee-market"],
  "custody.air-gapped-signing": ["custody.psbt", "custody.watch-only-wallets"],
  "history.segwit-activation": ["history.block-size-war", "protocol.segregated-witness"],
};

const MAX_RESOURCE_COUNT_BY_NODE: Partial<Record<(typeof PHASE_6_NODE_IDS)[number], number>> = {
  "history.segwit-activation": 4,
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

describe("phase 6 content saturation", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("includes all required phase-6 node ids", () => {
    const missing = PHASE_6_NODE_IDS.filter((id) => !byId.has(id));
    expect(missing).toEqual([]);
  });

  it("keeps each phase-6 node source-curated and dependency-specific", () => {
    for (const nodeId of PHASE_6_NODE_IDS) {
      const node = byId.get(nodeId);
      expect(node, `${nodeId} should exist`).toBeTruthy();
      if (!node) {
        continue;
      }

      expect(node.prerequisites.length, `${nodeId} should have prerequisites`).toBeGreaterThan(0);
      expect(hasDuplicatePrerequisites(node), `${nodeId} prerequisites should be unique`).toBe(
        false,
      );
      for (const requiredPrerequisite of REQUIRED_PHASE_6_PREREQUISITES[nodeId] ?? []) {
        expect(
          node.prerequisites,
          `${nodeId} should include prerequisite ${requiredPrerequisite}`,
        ).toContain(requiredPrerequisite);
      }

      const maxResources = MAX_RESOURCE_COUNT_BY_NODE[nodeId] ?? 3;
      expect(
        node.resources.length,
        `${nodeId} should have 2-${maxResources} resources`,
      ).toBeGreaterThanOrEqual(2);
      expect(
        node.resources.length,
        `${nodeId} should have 2-${maxResources} resources`,
      ).toBeLessThanOrEqual(maxResources);

      for (const resource of node.resources) {
        const host = new URL(resource.url).hostname.replace(/^www\./, "");
        expect(
          ALLOWED_RESOURCE_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`)),
          `${nodeId} has non-source URL host: ${host}`,
        ).toBe(true);
      }
    }
  });

  it("avoids transitive redundant prerequisites in phase-6 nodes", () => {
    const redundant = PHASE_6_NODE_IDS.filter((nodeId) => {
      const node = byId.get(nodeId);
      if (!node) {
        return false;
      }
      return hasTransitiveRedundantPrerequisite(node, byId);
    });

    expect(redundant).toEqual([]);
  });

  it("catches duplicate and transitive-redundant prerequisites in synthetic edge cases", () => {
    const duplicateFixture: GraphNode = {
      id: "test.duplicate-prerequisites",
      title: "Duplicate Prerequisites Fixture",
      description: "Synthetic fixture for duplicate prerequisite detection.",
      category: "Testing",
      prerequisites: ["foundation.base", "foundation.base"],
      resources: [],
      estimatedTime: "1m",
    };

    expect(hasDuplicatePrerequisites(duplicateFixture)).toBe(true);

    const byId = new Map<string, GraphNode>([
      [
        "foundation.base",
        {
          id: "foundation.base",
          title: "Foundation Base",
          description: "Fixture node.",
          category: "Testing",
          prerequisites: [],
          resources: [],
          estimatedTime: "1m",
        },
      ],
      [
        "intermediate.bridge",
        {
          id: "intermediate.bridge",
          title: "Intermediate Bridge",
          description: "Fixture node.",
          category: "Testing",
          prerequisites: ["foundation.base"],
          resources: [],
          estimatedTime: "1m",
        },
      ],
      [
        "advanced.redundant",
        {
          id: "advanced.redundant",
          title: "Advanced Redundant",
          description: "Fixture node.",
          category: "Testing",
          prerequisites: ["foundation.base", "intermediate.bridge"],
          resources: [],
          estimatedTime: "1m",
        },
      ],
    ]);

    const redundantFixture = byId.get("advanced.redundant");
    expect(redundantFixture).toBeTruthy();
    if (!redundantFixture) {
      return;
    }

    expect(hasTransitiveRedundantPrerequisite(redundantFixture, byId)).toBe(true);
  });
});
