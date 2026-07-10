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

describe("phase 84 partial Merkle proofs slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the partial Merkle proofs node", () => {
    expect(byId.has("protocol.partial-merkle-proofs")).toBe(true);
  });

  it("anchors proofs on block structure without a redundant Merkle-tree edge", () => {
    const node = byId.get("protocol.partial-merkle-proofs");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["protocol.block-structure"]);
  });

  it("keeps the description focused on compact SPV inclusion proofs", () => {
    const node = byId.get("protocol.partial-merkle-proofs");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("proof");
    expect(description).toContain("transaction");
    expect(description).toContain("block");
    expect(description).toContain("spv");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("protocol.partial-merkle-proofs");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
