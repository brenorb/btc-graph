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

describe("phase 82 extended keys slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the extended keys node", () => {
    expect(byId.has("dev.extended-keys")).toBe(true);
  });

  it("anchors extended keys on bip32 only", () => {
    const node = byId.get("dev.extended-keys");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["dev.bip32"]);
  });

  it("keeps the description focused on xpub xprv branch derivation semantics", () => {
    const node = byId.get("dev.extended-keys");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("xprv");
    expect(description).toContain("xpub");
    expect(description).toContain("chain code");
    expect(description).toContain("watch-only");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("dev.extended-keys");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
