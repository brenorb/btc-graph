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

describe("phase 48 change outputs slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the change outputs node", () => {
    expect(byId.has("protocol.change-outputs")).toBe(true);
  });

  it("anchors change outputs on addresses and outputs", () => {
    const node = byId.get("protocol.change-outputs");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["protocol.addresses-outputs"]);
  });

  it("keeps the node focused on leftover value returned to the spender", () => {
    const node = byId.get("protocol.change-outputs");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("leftover value");
    expect(description).toContain("spender");
    expect(description).toContain("coin selection");
    expect(description).not.toContain("rbf");
    expect(description).not.toContain("taproot");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("protocol.change-outputs");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
