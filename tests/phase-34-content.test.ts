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

describe("phase 34 op-checkmultisig slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the op-checkmultisig opcode node", () => {
    expect(byId.has("protocol.op-checkmultisig")).toBe(true);
  });

  it("anchors op-checkmultisig directly on bitcoin script", () => {
    const node = byId.get("protocol.op-checkmultisig");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["protocol.script"]);
  });

  it("keeps the node focused on multisig verification and the off-by-one bug", () => {
    const node = byId.get("protocol.op-checkmultisig");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("m-of-n");
    expect(description).toContain("off-by-one");
    expect(description).toContain("op_0");
    expect(node.aliases ?? []).toContain("checkmultisig");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("protocol.op-checkmultisig");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
