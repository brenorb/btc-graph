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

describe("phase 25 consensus-vs-policy bridge", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the consensus-vs-policy bridge node", () => {
    expect(byId.has("protocol.consensus-vs-policy")).toBe(true);
  });

  it("anchors consensus-vs-policy directly on consensus rules", () => {
    const node = byId.get("protocol.consensus-vs-policy");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["protocol.consensus-rules"]);
  });

  it("explains the contrast between network-wide validity and local node behavior", () => {
    const node = byId.get("protocol.consensus-vs-policy");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("consensus");
    expect(description).toContain("policy");
    expect(description).toContain("relay");
    expect(description).toContain("mempool");
  });

  it("keeps the bridge node curated", () => {
    const node = byId.get("protocol.consensus-vs-policy");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.estimatedTime).toMatch(/^[0-9]+m$/);
  });
});
