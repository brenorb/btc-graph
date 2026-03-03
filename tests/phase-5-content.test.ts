import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { GraphNode } from "../src/core/types";

const PHASE_5_NODE_IDS = [
  "fundamentals.bitcoin-layers",
  "history.user-activated-soft-fork",
  "protocol.block-height",
  "protocol.versionbits",
  "protocol.compact-block-relay",
  "protocol.compact-block-filters",
  "protocol.pay-to-script-hash",
  "protocol.op-return",
  "protocol.median-time-past",
  "lightning.commitment-transactions",
  "lightning.anchor-outputs",
  "lightning.force-closures",
  "mining.51-percent-attack",
  "ops.initial-block-download",
  "ops.assumeutxo",
  "privacy.xpub-leakage",
  "custody.watch-only-wallets",
  "economics.lost-coins",
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
];

const REQUIRED_PHASE_5_PREREQUISITES: Record<string, string[]> = {
  "mining.51-percent-attack": ["mining.pool-vs-solo", "protocol.reorgs-finality"],
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

describe("phase 5 content coverage", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("includes all required phase-5 node ids", () => {
    const missing = PHASE_5_NODE_IDS.filter((id) => !byId.has(id));
    expect(missing).toEqual([]);
  });

  it("keeps each phase-5 node curated and dependency-specific", () => {
    for (const nodeId of PHASE_5_NODE_IDS) {
      const node = byId.get(nodeId);
      expect(node, `${nodeId} should exist`).toBeTruthy();
      if (!node) {
        continue;
      }

      expect(node.prerequisites.length, `${nodeId} should have prerequisites`).toBeGreaterThan(0);
      expect(new Set(node.prerequisites).size, `${nodeId} prerequisites should be unique`).toBe(
        node.prerequisites.length,
      );
      for (const requiredPrerequisite of REQUIRED_PHASE_5_PREREQUISITES[nodeId] ?? []) {
        expect(
          node.prerequisites,
          `${nodeId} should include prerequisite ${requiredPrerequisite}`,
        ).toContain(requiredPrerequisite);
      }

      expect(node.resources.length, `${nodeId} should have 2-3 resources`).toBeGreaterThanOrEqual(
        2,
      );
      expect(node.resources.length, `${nodeId} should have 2-3 resources`).toBeLessThanOrEqual(3);

      for (const resource of node.resources) {
        const host = new URL(resource.url).hostname.replace(/^www\./, "");
        expect(
          ALLOWED_RESOURCE_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`)),
          `${nodeId} has non-source URL host: ${host}`,
        ).toBe(true);
      }
    }
  });

  it("avoids transitive redundant prerequisites in phase-5 nodes", () => {
    const redundant = PHASE_5_NODE_IDS.filter((nodeId) => {
      const node = byId.get(nodeId);
      if (!node) {
        return false;
      }
      return hasTransitiveRedundantPrerequisite(node, byId);
    });

    expect(redundant).toEqual([]);
  });
});
