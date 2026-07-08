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

describe("phase 42 coin selection slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the coin selection node", () => {
    expect(byId.has("custody.coin-selection")).toBe(true);
  });

  it("anchors coin selection on fee market", () => {
    const node = byId.get("custody.coin-selection");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["protocol.fee-market"]);
  });

  it("keeps the node focused on utxo choice under fee, change, and privacy tradeoffs", () => {
    const node = byId.get("custody.coin-selection");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("utxos");
    expect(description).toContain("change");
    expect(description).toContain("privacy");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("custody.coin-selection");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
