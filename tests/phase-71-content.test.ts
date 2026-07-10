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

describe("phase 71 off-by-one difficulty bug merge handling", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("does not create a standalone off-by-one difficulty bug node", () => {
    expect(byId.has("protocol.off-by-one-difficulty-bug")).toBe(false);
  });

  it("makes time warp discoverable through off-by-one terminology", () => {
    const node = byId.get("protocol.time-warp-attack");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.aliases).toContain("off-by-one difficulty bug");
    expect(node.aliases).toContain("off-by-one retarget bug");
    expect(
      node.resources.some(
        (resource) =>
          resource.title === "Bitcoin Optech Newsletter #299" &&
          resource.url === "https://bitcoinops.org/en/newsletters/2024/04/24/"
      )
    ).toBe(true);
  });

  it("keeps the time-warp node explicit about the off-by-one retarget mechanism", () => {
    const node = byId.get("protocol.time-warp-attack");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("off-by-one");
    expect(description).toContain("time warp");
    expect(description).toContain("retarget");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("protocol.time-warp-attack");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
