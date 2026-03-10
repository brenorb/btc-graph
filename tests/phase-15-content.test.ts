import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { GraphNode } from "../src/core/types";

const PHASE_15_NODE_IDS = [
  "fundamentals.protocol-basics",
  "history.bitcoin-anarchism",
  "extension.nostr",
  "extension.bitchat",
  "ops.mesh-networks",
  "economics.hayek-spontaneous-order",
  "history.rai-stones",
  "history.monetary-contact-shocks",
  "economics.hyperinflation-history",
  "economics.bretton-woods-1971",
  "economics.monetary-backing",
  "economics.central-bank-basics",
  "history.social-consensus-technology",
] as const;

const REQUIRED_PHASE_15_PREREQUISITES: Record<string, string[]> = {
  "fundamentals.protocol-basics": ["fundamentals.peer-to-peer-network"],
  "history.bitcoin-anarchism": ["fundamentals.censorship-resistance"],
  "extension.nostr": [
    "fundamentals.public-private-keys",
    "fundamentals.peer-to-peer-network",
  ],
  "extension.bitchat": ["ops.mesh-networks", "extension.nostr"],
  "ops.mesh-networks": ["fundamentals.peer-to-peer-network"],
  "economics.hayek-spontaneous-order": ["economics.hayek-money-competition"],
  "history.rai-stones": ["economics.history-of-money"],
  "history.monetary-contact-shocks": ["history.rai-stones"],
  "economics.hyperinflation-history": ["fundamentals.inflation", "economics.history-of-money"],
  "economics.bretton-woods-1971": ["economics.history-of-money"],
  "economics.monetary-backing": [
    "fundamentals.money-properties",
    "economics.history-of-money",
  ],
  "economics.central-bank-basics": ["economics.history-of-money"],
  "history.social-consensus-technology": [
    "economics.schelling-points",
    "history.block-size-war",
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

describe("phase 15 social, monetary history, and protocol-intuition expansion", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("includes all phase-15 missing-topic nodes", () => {
    const missing = PHASE_15_NODE_IDS.filter((id) => !byId.has(id));
    expect(missing).toEqual([]);
  });

  it("encodes required prerequisite links for new phase-15 nodes", () => {
    for (const [nodeId, requiredPrerequisites] of Object.entries(REQUIRED_PHASE_15_PREREQUISITES)) {
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

  it("keeps phase-15 nodes concise and curated", () => {
    for (const nodeId of PHASE_15_NODE_IDS) {
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
