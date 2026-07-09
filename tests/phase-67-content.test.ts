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

describe("phase 67 cypherpunk manifesto merge handling", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("does not create a standalone cypherpunk manifesto node", () => {
    expect(byId.has("history.cypherpunk-manifesto")).toBe(false);
  });

  it("makes the cypherpunk movement discoverable through manifesto terminology", () => {
    const node = byId.get("history.cypherpunks");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.aliases).toContain("a cypherpunk's manifesto");
    expect(
      node.resources.some(
        (resource) =>
          resource.title === "A Cypherpunk's Manifesto" &&
          resource.url === "https://www.cypherpunkbooks.com/book/a-cypherpunks-manifesto"
      )
    ).toBe(true);
  });

  it("keeps the cypherpunk movement node curated and book-covered", () => {
    const node = byId.get("history.cypherpunks");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
