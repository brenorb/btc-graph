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

describe("phase 49 scriptpubkey managers slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the scriptpubkey managers node", () => {
    expect(byId.has("dev.scriptpubkeymanagers")).toBe(true);
  });

  it("anchors scriptpubkey managers on descriptors without a redundant direct address-types edge", () => {
    const node = byId.get("dev.scriptpubkeymanagers");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["dev.descriptors"]);
  });

  it("keeps the node focused on the core wallet abstraction boundary", () => {
    const node = byId.get("dev.scriptpubkeymanagers");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("scriptpubkey");
    expect(description).toContain("output types");
    expect(description).toContain("wallet");
    expect(description).not.toContain("mempool");
    expect(description).not.toContain("passphrase");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("dev.scriptpubkeymanagers");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
