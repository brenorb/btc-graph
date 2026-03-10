import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { GraphNode } from "../src/core/types";

const PHASE_21_NODE_ID = "mining.asics" as const;

const REQUIRED_PREREQUISITES = ["history.gpu-to-asic-era"] as const;

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

describe("phase 21 explicit asics node", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds a dedicated asics node", () => {
    expect(byId.has(PHASE_21_NODE_ID)).toBe(true);
  });

  it("connects asics to hardware and historical transition context", () => {
    const node = byId.get(PHASE_21_NODE_ID);
    expect(node).toBeTruthy();
    if (!node) return;

    for (const prerequisite of REQUIRED_PREREQUISITES) {
      expect(node.prerequisites).toContain(prerequisite);
    }
  });

  it("keeps asics node concise and curated", () => {
    const node = byId.get(PHASE_21_NODE_ID);
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.description.toLowerCase()).toContain("asic");
    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.estimatedTime).toMatch(/^[0-9]+m$/);
  });
});
