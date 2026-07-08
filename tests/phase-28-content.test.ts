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

describe("phase 28 version-3 relay slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the version-3 transaction relay node", () => {
    expect(byId.has("protocol.version-3-transaction-relay")).toBe(true);
  });

  it("anchors version-3 relay directly on the pinning problem it addresses", () => {
    const node = byId.get("protocol.version-3-transaction-relay");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["protocol.transaction-pinning"]);
  });

  it("keeps the node focused on TRUC as a policy relay mechanism", () => {
    const node = byId.get("protocol.version-3-transaction-relay");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("truc");
    expect(description).toContain("pinning");
    expect(description).toContain("policy");
    expect(node.aliases ?? []).toContain("truc");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("protocol.version-3-transaction-relay");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
