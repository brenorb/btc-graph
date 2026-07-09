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

describe("phase 76 ideal money slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the ideal money node", () => {
    expect(byId.has("economics.ideal-money")).toBe(true);
  });

  it("anchors the concept on inflation as the direct prerequisite", () => {
    const node = byId.get("economics.ideal-money");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["fundamentals.inflation"]);
  });

  it("keeps the description focused on stability, measurement, and economic calculation", () => {
    const node = byId.get("economics.ideal-money");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("stable");
    expect(description).toContain("measuring stick");
    expect(description).toContain("economic calculation");
    expect(description).toContain("prices");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("economics.ideal-money");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
