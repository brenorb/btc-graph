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

describe("phase 33 p2pkh slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the p2pkh script-template node", () => {
    expect(byId.has("protocol.p2pkh")).toBe(true);
  });

  it("anchors p2pkh on p2pk plus hash functions", () => {
    const node = byId.get("protocol.p2pkh");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual([
      "protocol.p2pk",
      "fundamentals.hash-functions"
    ]);
  });

  it("keeps the node focused on locking to a public-key hash and revealing the key at spend time", () => {
    const node = byId.get("protocol.p2pkh");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("hash");
    expect(description).toContain("public key");
    expect(description).toContain("spend");
    expect(node.aliases ?? []).toContain("p2pkh");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("protocol.p2pkh");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
