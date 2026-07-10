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

describe("phase 45 descriptor wallet policies slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the descriptor wallet policies node", () => {
    expect(byId.has("dev.descriptor-wallet-policies")).toBe(true);
  });

  it("anchors descriptor wallet policies on descriptors and bip32", () => {
    const node = byId.get("dev.descriptor-wallet-policies");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["dev.descriptors", "dev.bip32"]);
  });

  it("keeps the node focused on wallet policy structure rather than imports or psbt transport", () => {
    const node = byId.get("dev.descriptor-wallet-policies");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("descriptor template");
    expect(description).toContain("key information");
    expect(description).toContain("external signers");
    expect(description).not.toContain("psbt");
    expect(description).not.toContain("import metadata");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("dev.descriptor-wallet-policies");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
