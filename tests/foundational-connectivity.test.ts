import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { GraphNode } from "../src/core/types";

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

describe("foundational graph connectivity", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const dependents = new Map<string, string[]>();

  for (const node of nodes) {
    dependents.set(node.id, []);
  }

  for (const node of nodes) {
    for (const prerequisite of node.prerequisites) {
      dependents.get(prerequisite)?.push(node.id);
    }
  }

  it("connects under-connected foundational topics to direct downstream nodes", () => {
    const expectedDirectEdges: Record<string, string[]> = {
      "economics.volatility-psychology-risk-sizing": ["economics.bitcoin-supply-demand"],
      "economics.security-budget": ["economics.miner-revenue-composition"],
      "economics.onchain-cost-allocation": ["fundamentals.bitcoin-layers"],
      "mining.environmental-debate": ["mining.environmental-co-benefits"],
      "privacy.address-reuse": ["privacy.pseudonymity"],
      "protocol.segregated-witness": ["protocol.block-structure"],
      "protocol.halving": ["protocol.block-height"],
      "protocol.witness-commitment": [
        "protocol.op-return",
        "fundamentals.commitment-schemes",
        "fundamentals.merkle-trees",
      ],
    };

    for (const [nodeId, prerequisites] of Object.entries(expectedDirectEdges)) {
      const node = byId.get(nodeId);
      expect(node, `${nodeId} should exist`).toBeTruthy();
      if (!node) continue;

      for (const prerequisite of prerequisites) {
        expect(node.prerequisites, `${nodeId} should include ${prerequisite}`).toContain(
          prerequisite,
        );
      }
    }
  });

  it("ensures the rewired concepts are no longer isolated leaves", () => {
    const noLongerLeafIds = [
      "economics.bitcoin-supply-demand",
      "economics.miner-revenue-composition",
      "fundamentals.bitcoin-layers",
      "mining.environmental-co-benefits",
      "privacy.pseudonymity",
      "protocol.op-return",
      "protocol.block-height",
      "protocol.block-structure",
    ] as const;

    for (const nodeId of noLongerLeafIds) {
      expect(
        (dependents.get(nodeId) ?? []).length,
        `${nodeId} should unlock at least one downstream concept`,
      ).toBeGreaterThan(0);
    }
  });

  it("avoids leaving redundant direct edges after the rewiring", () => {
    const addressReuse = byId.get("privacy.address-reuse");
    const environmentalDebate = byId.get("mining.environmental-debate");

    expect(addressReuse).toBeTruthy();
    expect(environmentalDebate).toBeTruthy();
    if (!addressReuse || !environmentalDebate) return;

    expect(addressReuse.prerequisites).not.toContain("custody.address-types");
    expect(environmentalDebate.prerequisites).not.toContain(
      "mining.grid-balancing-demand-response",
    );
  });
});
