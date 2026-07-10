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

describe("phase 57 taproot key-path spend slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the taproot key-path spend node", () => {
    expect(byId.has("protocol.taproot-key-path-spends")).toBe(true);
  });

  it("anchors key-path spending on taptweak plus schnorr signatures", () => {
    const node = byId.get("protocol.taproot-key-path-spends");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["protocol.taptweak"]);
  });

  it("keeps the node focused on signature-based spends without revealing scripts", () => {
    const node = byId.get("protocol.taproot-key-path-spends");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("schnorr");
    expect(description).toContain("tweaked output key");
    expect(description).toContain("without revealing");
    expect(description).not.toContain("cloud backup");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("protocol.taproot-key-path-spends");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
