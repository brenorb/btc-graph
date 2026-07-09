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

describe("phase 68 64-byte transaction bug slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the 64-byte transaction bug node", () => {
    expect(byId.has("protocol.64-byte-transaction-bug")).toBe(true);
  });

  it("anchors the bug on block-structure knowledge only", () => {
    const node = byId.get("protocol.64-byte-transaction-bug");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["protocol.block-structure"]);
  });

  it("keeps the description focused on merkle ambiguity and SPV verification", () => {
    const node = byId.get("protocol.64-byte-transaction-bug");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("merkle");
    expect(description).toContain("spv");
    expect(description).toContain("64-byte");
    expect(description).not.toContain("shamir");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("protocol.64-byte-transaction-bug");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
