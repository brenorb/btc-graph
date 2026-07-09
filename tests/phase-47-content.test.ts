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

describe("phase 47 descriptors in psbt slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the descriptors in psbt node", () => {
    expect(byId.has("dev.descriptors-in-psbt")).toBe(true);
  });

  it("anchors descriptors in psbt on descriptors and psbt", () => {
    const node = byId.get("dev.descriptors-in-psbt");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["dev.descriptors", "custody.psbt"]);
  });

  it("keeps the node focused on descriptor-aware psbt coordination", () => {
    const node = byId.get("dev.descriptors-in-psbt");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("descriptors");
    expect(description).toContain("psbt");
    expect(description).toContain("signers");
    expect(description).not.toContain("taproot");
    expect(description).not.toContain("wallet policies");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("dev.descriptors-in-psbt");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
