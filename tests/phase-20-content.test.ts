import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { GraphNode } from "../src/core/types";

const PHASE_20_NODE_ID = "mining.environmental-co-benefits" as const;

const REQUIRED_PREREQUISITES = [
  "mining.energy-accounting",
  "mining.grid-balancing-demand-response",
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

describe("phase 20 environmental co-benefits node", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds a dedicated environmental co-benefits node", () => {
    expect(byId.has(PHASE_20_NODE_ID)).toBe(true);
  });

  it("links the node to mining energy and demand-response prerequisites", () => {
    const node = byId.get(PHASE_20_NODE_ID);
    expect(node).toBeTruthy();
    if (!node) return;

    for (const prerequisite of REQUIRED_PREREQUISITES) {
      expect(node.prerequisites).toContain(prerequisite);
    }
  });

  it("describes renewable usage, demand response, heat recycling, methane reduction, and lost energy usage", () => {
    const node = byId.get(PHASE_20_NODE_ID);
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("renewable");
    expect(description).toContain("demand response");
    expect(description).toContain("heat");
    expect(description).toContain("methane");
    expect(description).toContain("lost energy");
    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
  });
});
