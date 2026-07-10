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

describe("phase 79 escrow and arbitration slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the escrow and arbitration node", () => {
    expect(byId.has("protocol.escrow-and-arbitration")).toBe(true);
  });

  it("anchors the concept on multisig and p2sh", () => {
    const node = byId.get("protocol.escrow-and-arbitration");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual([
      "custody.multisig",
      "protocol.pay-to-script-hash"
    ]);
  });

  it("keeps the description focused on the 2-of-3 dispute-resolution contract pattern", () => {
    const node = byId.get("protocol.escrow-and-arbitration");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("2-of-3");
    expect(description).toContain("multisig");
    expect(description).toContain("arbitrator");
    expect(description).toContain("dispute");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("protocol.escrow-and-arbitration");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
