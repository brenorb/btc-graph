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

describe("phase 64 chaumian ecash slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the chaumian ecash node", () => {
    expect(byId.has("history.chaumian-ecash")).toBe(true);
  });

  it("anchors chaumian ecash on blind signatures plus the double-spend problem", () => {
    const node = byId.get("history.chaumian-ecash");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual([
      "fundamentals.blind-signatures",
      "history.double-spend-problem"
    ]);
  });

  it("keeps the node focused on pre-bitcoin privacy cash rather than modern mint software", () => {
    const node = byId.get("history.chaumian-ecash");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("blind signatures");
    expect(description).toContain("central issuer");
    expect(description).toContain("pre-bitcoin");
    expect(description).toContain("trusted mint");
    expect(description).not.toContain("cashu");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("history.chaumian-ecash");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
