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

describe("phase 32 nonce-reuse slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the nonce-reuse attack node", () => {
    expect(byId.has("security.nonce-reuse-attack")).toBe(true);
  });

  it("anchors nonce reuse directly on schnorr signatures", () => {
    const node = byId.get("security.nonce-reuse-attack");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["fundamentals.schnorr-signatures"]);
  });

  it("keeps the node narrowly about private-key leakage from reused schnorr nonces", () => {
    const node = byId.get("security.nonce-reuse-attack");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("schnorr");
    expect(description).toContain("nonce");
    expect(description).toContain("private key");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("security.nonce-reuse-attack");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
