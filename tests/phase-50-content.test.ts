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

describe("phase 50 mempool unbroadcast set slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the mempool unbroadcast set node", () => {
    expect(byId.has("protocol.mempool-unbroadcast-set")).toBe(true);
  });

  it("anchors the unbroadcast set on mempool state and transaction relay", () => {
    const node = byId.get("protocol.mempool-unbroadcast-set");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual([
      "protocol.mempool",
      "protocol.transaction-relay-inv-getdata",
    ]);
  });

  it("keeps the node focused on rebroadcast tracking rather than generic policy", () => {
    const node = byId.get("protocol.mempool-unbroadcast-set");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("locally submitted");
    expect(description).toContain("rebroadcast");
    expect(description).toContain("propagation");
    expect(description).not.toContain("wallet encryption");
    expect(description).not.toContain("descriptor");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("protocol.mempool-unbroadcast-set");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
