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

describe("phase 80 wallet import format slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the wallet import format node", () => {
    expect(byId.has("dev.wallet-import-format-wif")).toBe(true);
  });

  it("anchors wallet import format on public private key basics", () => {
    const node = byId.get("dev.wallet-import-format-wif");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual([
      "fundamentals.public-private-keys"
    ]);
  });

  it("keeps the description focused on single-key encoding semantics", () => {
    const node = byId.get("dev.wallet-import-format-wif");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("private key");
    expect(description).toContain("base58check");
    expect(description).toContain("checksum");
    expect(description).toContain("compressed");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("dev.wallet-import-format-wif");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
