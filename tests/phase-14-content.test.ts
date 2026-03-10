import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { GraphNode } from "../src/core/types";

const REQUIRED_TOPIC_NODE_IDS = [
  "economics.history-of-money",
  "fundamentals.money-properties",
  "economics.monetization-process",
  "economics.bitcoin-supply-demand",
  "fundamentals.time-preference",
  "economics.cantillon-effects",
  "economics.monetary-vs-price-inflation",
  "economics.savings-vs-investment",
  "economics.security-budget",
  "fundamentals.censorship-resistance",
  "economics.neutral-money-vs-political-money",
  "custody.custody-vs-self-custody-law",
  "security.aml-kyc-sanctions-tradeoffs",
  "mining.energy-accounting",
  "mining.grid-balancing-demand-response",
  "mining.environmental-debate",
  "history.cypherpunk-roots-bitcoin-origin",
  "economics.volatility-psychology-risk-sizing",
  "history.bitcoin-narrative-cycles",
] as const;

const REQUIRED_NEW_PREREQUISITES: Record<string, string[]> = {
  "economics.monetization-process": [
    "economics.history-of-money",
    "economics.scarcity",
  ],
  "economics.bitcoin-supply-demand": [
    "economics.monetization-process",
    "protocol.halving",
  ],
  "economics.cantillon-effects": ["fundamentals.inflation"],
  "economics.monetary-vs-price-inflation": ["fundamentals.inflation"],
  "economics.savings-vs-investment": ["economics.volatility-psychology-risk-sizing"],
  "economics.neutral-money-vs-political-money": [
    "fundamentals.neutrality",
    "economics.hayek-money-competition",
  ],
  "custody.custody-vs-self-custody-law": ["custody.self-custody"],
  "security.aml-kyc-sanctions-tradeoffs": [
    "privacy.kyc-tradeoffs",
    "fundamentals.censorship-resistance",
  ],
  "mining.energy-accounting": ["protocol.proof-of-work", "economics.cost-of-production"],
  "mining.grid-balancing-demand-response": ["mining.energy-accounting"],
  "mining.environmental-debate": ["mining.grid-balancing-demand-response"],
  "history.cypherpunk-roots-bitcoin-origin": [
    "history.cypherpunks",
    "history.bitcoin-whitepaper",
  ],
  "economics.volatility-psychology-risk-sizing": [
    "fundamentals.time-preference",
    "economics.monetary-premium",
  ],
  "history.bitcoin-narrative-cycles": [
    "history.early-bitcoin",
    "economics.volatility-psychology-risk-sizing",
  ],
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

describe("phase 14 non-technical bitcoin curriculum expansion", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("covers the selected non-technical topic set", () => {
    const missing = REQUIRED_TOPIC_NODE_IDS.filter((id) => !byId.has(id));
    expect(missing).toEqual([]);
  });

  it("wires new non-technical nodes to existing fundamentals and history", () => {
    for (const [nodeId, requiredPrerequisites] of Object.entries(REQUIRED_NEW_PREREQUISITES)) {
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

  it("keeps each new node curated with concise resource sets", () => {
    for (const nodeId of Object.keys(REQUIRED_NEW_PREREQUISITES)) {
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
