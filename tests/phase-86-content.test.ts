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

describe("phase 86 Lightning feature flags slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the Lightning feature flags node", () => {
    expect(byId.has("lightning.feature-flags")).toBe(true);
  });

  it("anchors feature negotiation on Lightning gossip", () => {
    const node = byId.get("lightning.feature-flags");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["lightning.gossip-protocol"]);
  });

  it("keeps the description focused on optional and required capability bits", () => {
    const node = byId.get("lightning.feature-flags");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("capability bits");
    expect(description).toContain("init");
    expect(description).toContain("optional");
    expect(description).toContain("required");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("lightning.feature-flags");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
