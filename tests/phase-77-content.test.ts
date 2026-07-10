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

describe("phase 77 bitcoin uri scheme slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the bitcoin uri scheme node", () => {
    expect(byId.has("protocol.bitcoin-uri-bip21")).toBe(true);
  });

  it("anchors the concept on addresses and outputs only", () => {
    const node = byId.get("protocol.bitcoin-uri-bip21");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["protocol.addresses-outputs"]);
  });

  it("keeps the description focused on uri payment requests rather than raw transaction mechanics", () => {
    const node = byId.get("protocol.bitcoin-uri-bip21");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("bitcoin:");
    expect(description).toContain("uri");
    expect(description).toContain("amount");
    expect(description).toContain("payment");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("protocol.bitcoin-uri-bip21");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
