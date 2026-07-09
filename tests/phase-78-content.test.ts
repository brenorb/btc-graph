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

describe("phase 78 hardened keys slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the hardened keys node", () => {
    expect(byId.has("dev.hardened-keys")).toBe(true);
  });

  it("anchors the concept on bip32 only", () => {
    const node = byId.get("dev.hardened-keys");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["dev.bip32"]);
  });

  it("keeps the description focused on hardened derivation and key-boundary security", () => {
    const node = byId.get("dev.hardened-keys");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("hardened");
    expect(description).toContain("xpub");
    expect(description).toContain("private key");
    expect(description).toContain("security boundary");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("dev.hardened-keys");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
