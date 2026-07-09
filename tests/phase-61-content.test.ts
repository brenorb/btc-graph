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

describe("phase 61 scriptless scripts merge handling", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("does not create scriptless scripts as a standalone node", () => {
    expect(byId.has("protocol.scriptless-scripts")).toBe(false);
  });

  it("makes adaptor signatures discoverable under scriptless scripts terminology", () => {
    const node = byId.get("protocol.adaptor-signatures");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.aliases).toContain("scriptless scripts");
    expect(node.description.toLowerCase()).toContain("scriptless");
    expect(node.description.toLowerCase()).not.toContain("lightning-only");
    expect(node.description.toLowerCase()).toContain("atomic swaps");
  });

  it("keeps neighboring scriptless primitives framed beyond lightning", () => {
    const node = byId.get("protocol.discrete-log-equivalency");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.description.toLowerCase()).toContain("atomic swaps");
    expect(node.description.toLowerCase()).toContain("dlc");
    expect(node.resources.some((resource) => resource.type === "book" && resource.title === "Mastering Bitcoin")).toBe(true);
  });

  it("keeps adaptor signatures curated and book-covered", () => {
    const node = byId.get("protocol.adaptor-signatures");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
