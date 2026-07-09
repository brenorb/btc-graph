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

describe("phase 69 crypto anarchist manifesto merge handling", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("does not create a standalone crypto anarchist manifesto node", () => {
    expect(byId.has("history.crypto-anarchist-manifesto")).toBe(false);
  });

  it("makes bitcoin and anarchism discoverable through manifesto terminology", () => {
    const node = byId.get("history.bitcoin-anarchism");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.aliases).toContain("crypto anarchist manifesto");
    expect(
      node.resources.some(
        (resource) =>
          resource.title === "The Crypto Anarchist Manifesto" &&
          resource.url === "https://www.cypherpunkbooks.com/book/the-crypto-anarchist-manifesto"
      )
    ).toBe(true);
  });

  it("keeps the bitcoin and anarchism node curated and book-covered", () => {
    const node = byId.get("history.bitcoin-anarchism");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
