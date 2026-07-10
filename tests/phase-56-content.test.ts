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

describe("phase 56 txid vs wtxid slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the txid vs wtxid bridge node", () => {
    expect(byId.has("protocol.txid-vs-wtxid")).toBe(true);
  });

  it("anchors the identifier distinction on segwit serialization", () => {
    const node = byId.get("protocol.txid-vs-wtxid");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["protocol.segregated-witness"]);
  });

  it("keeps the new node focused on the two identifier forms and when they differ", () => {
    const node = byId.get("protocol.txid-vs-wtxid");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("txid");
    expect(description).toContain("wtxid");
    expect(description).toContain("witness");
    expect(description).toContain("same");
    expect(description).not.toContain("cloud backup");
  });

  it("keeps the new node curated and book-covered", () => {
    const node = byId.get("protocol.txid-vs-wtxid");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
