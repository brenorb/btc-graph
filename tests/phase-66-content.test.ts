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

describe("phase 66 duplicate transaction bug slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the duplicate transaction bug node", () => {
    expect(byId.has("protocol.duplicate-transaction-bug")).toBe(true);
  });

  it("anchors duplicate transaction bug on coinbase uniqueness and UTXO references", () => {
    const node = byId.get("protocol.duplicate-transaction-bug");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual([
      "protocol.coinbase-transaction",
      "protocol.utxo-model"
    ]);
  });

  it("keeps the node focused on identical txids rather than on generic malleability", () => {
    const node = byId.get("protocol.duplicate-transaction-bug");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("coinbase");
    expect(description).toContain("txids");
    expect(description).toContain("utxo");
    expect(description).toContain("bip 30");
    expect(description).not.toContain("shamir");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("protocol.duplicate-transaction-bug");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
