import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { GraphNode } from "../src/core/types";

const PHASE_18_NODE_ID = "history.bitcoin-immaculate-conception" as const;

const REQUIRED_PREREQUISITES = [
  "history.pre-bitcoin-digital-cash",
  "history.early-bitcoin",
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

describe("phase 18 immaculate conception context", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds a dedicated Bitcoin immaculate conception node", () => {
    expect(byId.has(PHASE_18_NODE_ID)).toBe(true);
  });

  it("anchors the node in pre-Bitcoin and early-Bitcoin history", () => {
    const node = byId.get(PHASE_18_NODE_ID);
    expect(node).toBeTruthy();
    if (!node) return;

    for (const prerequisite of REQUIRED_PREREQUISITES) {
      expect(node.prerequisites).toContain(prerequisite);
    }
  });

  it("keeps resources curated and description explicit", () => {
    const node = byId.get(PHASE_18_NODE_ID);
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.estimatedTime).toMatch(/^[0-9]+m$/);

    expect(node.description.toLowerCase()).toContain("satoshi");
    expect(node.description.toLowerCase()).toContain("faucet");
    expect(node.description.toLowerCase()).toContain("mine");
  });
});
