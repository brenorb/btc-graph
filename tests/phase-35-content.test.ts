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

describe("phase 35 p2ms slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the p2ms script-template node", () => {
    expect(byId.has("protocol.p2ms")).toBe(true);
  });

  it("anchors p2ms on op-checkmultisig", () => {
    const node = byId.get("protocol.p2ms");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["protocol.op-checkmultisig"]);
  });

  it("keeps the node focused on bare multisig as a legacy locking template", () => {
    const node = byId.get("protocol.p2ms");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("bare multisig");
    expect(description).toContain("locking script");
    expect(description).toContain("p2sh");
    expect(node.aliases ?? []).toContain("p2ms");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("protocol.p2ms");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
