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

describe("phase 55 transaction rebroadcast privacy slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the transaction rebroadcast privacy node", () => {
    expect(byId.has("protocol.transaction-rebroadcast-privacy")).toBe(true);
  });

  it("anchors rebroadcast privacy on local rebroadcast tracking plus the linkability problem", () => {
    const node = byId.get("protocol.transaction-rebroadcast-privacy");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual([
      "protocol.mempool-unbroadcast-set",
      "privacy.pseudonymity",
    ]);
  });

  it("keeps the node focused on origin leakage from different rebroadcast behavior", () => {
    const node = byId.get("protocol.transaction-rebroadcast-privacy");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("rebroadcasts");
    expect(description).toContain("origin");
    expect(description).toContain("wallet-specific signal");
    expect(description).not.toContain("bip39");
    expect(description).not.toContain("cloud backup");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("protocol.transaction-rebroadcast-privacy");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
