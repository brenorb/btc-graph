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

describe("phase 51 human-readable addresses slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the human-readable addresses node", () => {
    expect(byId.has("custody.human-readable-addresses")).toBe(true);
  });

  it("anchors human-readable addresses on the reusable-address privacy problem without a redundant direct address edge", () => {
    const node = byId.get("custody.human-readable-addresses");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["privacy.address-reuse"]);
  });

  it("keeps the node focused on readable handles and lookup trust", () => {
    const node = byId.get("custody.human-readable-addresses");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("memorable handles");
    expect(description).toContain("payment instructions");
    expect(description).toContain("trust");
    expect(description).not.toContain("lnurl");
    expect(description).not.toContain("silent payments");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("custody.human-readable-addresses");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
