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

describe("phase 53 multiple wallets slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the multiple wallets node", () => {
    expect(byId.has("custody.multiple-wallets")).toBe(true);
  });

  it("anchors multiple wallets on self-custody without pulling in account-path or backup parents", () => {
    const node = byId.get("custody.multiple-wallets");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["custody.self-custody"]);
  });

  it("keeps the node focused on purpose-based wallet separation", () => {
    const node = byId.get("custody.multiple-wallets");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("purpose");
    expect(description).toContain("ownership");
    expect(description).toContain("security");
    expect(description).not.toContain("bip44");
    expect(description).not.toContain("cloud backup");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("custody.multiple-wallets");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
