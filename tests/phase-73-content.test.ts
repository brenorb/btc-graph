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

describe("phase 73 lamport signatures slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the lamport signatures node", () => {
    expect(byId.has("fundamentals.lamport-signatures")).toBe(true);
  });

  it("anchors the concept on digital signatures and hash functions only", () => {
    const node = byId.get("fundamentals.lamport-signatures");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual([
      "fundamentals.digital-signatures",
      "fundamentals.hash-functions"
    ]);
  });

  it("keeps the description focused on one-time hash-based signature tradeoffs", () => {
    const node = byId.get("fundamentals.lamport-signatures");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("one-time");
    expect(description).toContain("hash");
    expect(description).toContain("signatures");
    expect(description).toContain("post-quantum");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("fundamentals.lamport-signatures");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
