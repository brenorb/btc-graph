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

describe("phase 89 mempool purging slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the mempool purging node", () => {
    expect(byId.has("ops.mempool-purging")).toBe(true);
  });

  it("anchors purging on mempool policy only", () => {
    const node = byId.get("ops.mempool-purging");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["ops.mempool-policy"]);
  });

  it("keeps the description focused on rolling fee escalation and eviction", () => {
    const node = byId.get("ops.mempool-purging");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("rolling minimum relay feerate");
    expect(description).toContain("evicts");
    expect(description).toContain("mempool pressure");
    expect(description).toContain("local policy");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("ops.mempool-purging");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
