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

describe("phase 38 chain split risk slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the chain split risk node", () => {
    expect(byId.has("protocol.chain-split-risk")).toBe(true);
  });

  it("anchors chain split risk on soft forks versus hard forks", () => {
    const node = byId.get("protocol.chain-split-risk");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["protocol.softfork-hardfork"]);
  });

  it("keeps the node focused on persistent split externalities", () => {
    const node = byId.get("protocol.chain-split-risk");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("persistent");
    expect(description).toContain("replay");
    expect(description).toContain("coordination");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("protocol.chain-split-risk");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
