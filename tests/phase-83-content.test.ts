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

describe("phase 83 transaction witness structure slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the transaction witness structure node", () => {
    expect(byId.has("protocol.witness-structure")).toBe(true);
  });

  it("anchors the transaction layout on SegWit", () => {
    const node = byId.get("protocol.witness-structure");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["protocol.segregated-witness"]);
  });

  it("keeps the description focused on per-input witness serialization", () => {
    const node = byId.get("protocol.witness-structure");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("witness stack");
    expect(description).toContain("input");
    expect(description).toContain("marker");
    expect(description).toContain("serialization");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("protocol.witness-structure");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
