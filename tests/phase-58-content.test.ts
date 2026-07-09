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

describe("phase 58 fee calculation slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the fee calculation node", () => {
    expect(byId.has("protocol.fee-calculation")).toBe(true);
  });

  it("anchors fee calculation on utxo accounting plus vbyte pricing", () => {
    const node = byId.get("protocol.fee-calculation");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["protocol.block-weight-vbytes"]);
  });

  it("keeps the node focused on fee as inputs minus outputs and its size context", () => {
    const node = byId.get("protocol.fee-calculation");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("difference");
    expect(description).toContain("input value");
    expect(description).toContain("output value");
    expect(description).toContain("virtual bytes");
    expect(description).not.toContain("rpc");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("protocol.fee-calculation");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
