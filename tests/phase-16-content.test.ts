import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { GraphNode } from "../src/core/types";

const PHASE_16_REQUESTED_TOPICS = [
  "economics.token-basics",
  "fundamentals.digital-scarcity",
  "economics.need-for-inflation",
  "protocol.addresses-outputs",
  "dev.bip32",
  "dev.bip39",
  "protocol.softfork-hardfork",
  "extension.ark",
] as const;

const REQUIRED_PHASE_16_PREREQUISITES: Record<string, string[]> = {
  "economics.token-basics": ["fundamentals.protocol-basics", "protocol.addresses-outputs"],
  "fundamentals.digital-scarcity": ["history.double-spend-problem", "protocol.proof-of-work"],
  "economics.need-for-inflation": [
    "fundamentals.inflation",
    "economics.central-bank-basics",
    "economics.monetary-vs-price-inflation",
  ],
  "protocol.softfork-hardfork": ["protocol.consensus-rules"],
  "extension.ark": ["extension.payment-pools", "lightning.liquidity"],
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

describe("phase 16 requested additions (token, digital scarcity, address, bip32/39, inflation debate)", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("includes all requested topics", () => {
    const missing = PHASE_16_REQUESTED_TOPICS.filter((id) => !byId.has(id));
    expect(missing).toEqual([]);
  });

  it("wires the new phase-16 nodes to core prerequisites", () => {
    for (const [nodeId, requiredPrerequisites] of Object.entries(REQUIRED_PHASE_16_PREREQUISITES)) {
      const node = byId.get(nodeId);
      expect(node, `${nodeId} should exist`).toBeTruthy();
      if (!node) continue;

      for (const prerequisite of requiredPrerequisites) {
        expect(node.prerequisites, `${nodeId} should include ${prerequisite}`).toContain(
          prerequisite,
        );
      }
    }
  });

  it("keeps new phase-16 nodes concise and curated", () => {
    for (const nodeId of Object.keys(REQUIRED_PHASE_16_PREREQUISITES)) {
      const node = byId.get(nodeId);
      expect(node, `${nodeId} should exist`).toBeTruthy();
      if (!node) continue;

      expect(node.resources.length, `${nodeId} should have at least 2 resources`).toBeGreaterThanOrEqual(
        2,
      );
      expect(node.resources.length, `${nodeId} should have at most 4 resources`).toBeLessThanOrEqual(
        4,
      );
      expect(node.estimatedTime, `${nodeId} should define estimated time`).toMatch(/^[0-9]+m$/);
    }
  });
});
