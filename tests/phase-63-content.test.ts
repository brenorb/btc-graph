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

describe("phase 63 time warp attack slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the time warp attack node", () => {
    expect(byId.has("protocol.time-warp-attack")).toBe(true);
  });

  it("anchors time warp attack on difficulty retargeting and consensus time rules", () => {
    const node = byId.get("protocol.time-warp-attack");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual([
      "protocol.difficulty-adjustment",
      "protocol.median-time-past"
    ]);
  });

  it("keeps the node focused on timestamp manipulation instead of generic mining theory", () => {
    const node = byId.get("protocol.time-warp-attack");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("timestamps");
    expect(description).toContain("difficulty");
    expect(description).toContain("miners");
    expect(description).toContain("consensus");
    expect(description).not.toContain("garbled circuits");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("protocol.time-warp-attack");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
