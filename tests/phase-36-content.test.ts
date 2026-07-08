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

describe("phase 36 bare-multisig-standardness slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the bare-multisig-standardness policy leaf", () => {
    expect(byId.has("protocol.bare-multisig-standardness")).toBe(true);
  });

  it("anchors bare-multisig standardness on the p2ms template and standardness policy", () => {
    const node = byId.get("protocol.bare-multisig-standardness");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual([
      "protocol.p2ms",
      "protocol.standardness-policy"
    ]);
  });

  it("keeps the node focused on consensus-valid but non-standard relay treatment", () => {
    const node = byId.get("protocol.bare-multisig-standardness");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("consensus-valid");
    expect(description).toContain("relay");
    expect(description).toContain("non-standard");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("protocol.bare-multisig-standardness");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
