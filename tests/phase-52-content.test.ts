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

describe("phase 52 transaction metadata slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the transaction metadata node", () => {
    expect(byId.has("custody.transaction-metadata")).toBe(true);
  });

  it("anchors transaction metadata on wallet labeling context plus pseudonymous history", () => {
    const node = byId.get("custody.transaction-metadata");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual([
      "custody.output-labeling",
      "privacy.pseudonymity",
    ]);
  });

  it("keeps the node focused on wallet-side context rather than on-chain data", () => {
    const node = byId.get("custody.transaction-metadata");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("wallet-side context");
    expect(description).toContain("search");
    expect(description).toContain("not stored on-chain");
    expect(description).not.toContain("cloud backup");
    expect(description).not.toContain("seed phrase");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("custody.transaction-metadata");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
