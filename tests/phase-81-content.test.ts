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

describe("phase 81 mining pool shares slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the mining pool shares node", () => {
    expect(byId.has("mining.pool-shares")).toBe(true);
  });

  it("anchors mining pool shares on the pooled mining comparison node only", () => {
    const node = byId.get("mining.pool-shares");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual([
      "mining.pool-vs-solo"
    ]);
  });

  it("keeps the description focused on easier-target proofs and payout accounting", () => {
    const node = byId.get("mining.pool-shares");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("easier");
    expect(description).toContain("network target");
    expect(description).toContain("contribution");
    expect(description).toContain("payout");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("mining.pool-shares");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
