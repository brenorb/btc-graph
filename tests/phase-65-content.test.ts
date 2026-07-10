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

describe("phase 65 obscured commitment number slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the obscured commitment number node", () => {
    expect(byId.has("lightning.obscured-commitment-number")).toBe(true);
  });

  it("anchors the obscured commitment number on per-commitment secrets only", () => {
    const node = byId.get("lightning.obscured-commitment-number");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["lightning.per-commitment-secrets"]);
  });

  it("keeps the node focused on state-number encoding in transaction fields", () => {
    const node = byId.get("lightning.obscured-commitment-number");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("commitment transaction");
    expect(description).toContain("state number");
    expect(description).toContain("nlocktime");
    expect(description).toContain("nsequence");
    expect(description).not.toContain("route blinding");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("lightning.obscured-commitment-number");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
