import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { GraphNode } from "../src/core/types";

const PHASE_23_NODE_IDS = [
  "fundamentals.zero-knowledge-proofs",
  "fundamentals.zk-snarks",
  "fundamentals.zk-starks",
] as const;

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

describe("phase 23 zero-knowledge proof-system expansion", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds zero-knowledge, zk-SNARK, and zk-STARK nodes", () => {
    for (const nodeId of PHASE_23_NODE_IDS) {
      expect(byId.has(nodeId), `${nodeId} should exist`).toBe(true);
    }
  });

  it("anchors SNARKs and STARKs in zero-knowledge fundamentals", () => {
    const snarks = byId.get("fundamentals.zk-snarks");
    const starks = byId.get("fundamentals.zk-starks");

    expect(snarks).toBeTruthy();
    expect(starks).toBeTruthy();
    if (!snarks || !starks) return;

    expect(snarks.prerequisites).toContain("fundamentals.zero-knowledge-proofs");
    expect(starks.prerequisites).toContain("fundamentals.zero-knowledge-proofs");
    expect(starks.prerequisites).toContain("fundamentals.merkle-trees");
  });

  it("describes the main tradeoffs clearly", () => {
    const zeroKnowledge = byId.get("fundamentals.zero-knowledge-proofs");
    const snarks = byId.get("fundamentals.zk-snarks");
    const starks = byId.get("fundamentals.zk-starks");

    expect(zeroKnowledge).toBeTruthy();
    expect(snarks).toBeTruthy();
    expect(starks).toBeTruthy();
    if (!zeroKnowledge || !snarks || !starks) return;

    expect(zeroKnowledge.description.toLowerCase()).toContain("without revealing");
    expect(snarks.description.toLowerCase()).toContain("trusted");
    expect(starks.description.toLowerCase()).toContain("transparent");
    expect(starks.description.toLowerCase()).toContain("post-quantum");
  });

  it("keeps the new proof-system nodes curated", () => {
    for (const nodeId of PHASE_23_NODE_IDS) {
      const node = byId.get(nodeId);
      expect(node).toBeTruthy();
      if (!node) continue;

      expect(node.resources.length).toBeGreaterThanOrEqual(2);
      expect(node.resources.length).toBeLessThanOrEqual(4);
      expect(node.estimatedTime).toMatch(/^[0-9]+m$/);
    }
  });
});
