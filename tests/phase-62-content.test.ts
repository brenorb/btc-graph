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

describe("phase 62 per-commitment secrets slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the per-commitment secrets node", () => {
    expect(byId.has("lightning.per-commitment-secrets")).toBe(true);
  });

  it("anchors per-commitment secrets on commitment states plus the required crypto primitives", () => {
    const node = byId.get("lightning.per-commitment-secrets");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["lightning.commitment-transactions"]);
  });

  it("keeps the node focused on the state secret chain and its key-derivation role", () => {
    const node = byId.get("lightning.per-commitment-secrets");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("per-commitment secret");
    expect(description).toContain("commitment keys");
    expect(description).toContain("revocation");
    expect(description).toContain("channel state");
    expect(description).not.toContain("route blinding");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("lightning.per-commitment-secrets");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
