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

describe("phase 74 shamirs secret sharing slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the shamirs secret sharing node", () => {
    expect(byId.has("custody.shamirs-secret-sharing")).toBe(true);
  });

  it("anchors the concept on backup context only", () => {
    const node = byId.get("custody.shamirs-secret-sharing");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["custody.backups-recovery"]);
  });

  it("keeps the description focused on threshold shares and custody recovery", () => {
    const node = byId.get("custody.shamirs-secret-sharing");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("threshold");
    expect(description).toContain("shares");
    expect(description).toContain("seed");
    expect(description).toContain("recovery");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("custody.shamirs-secret-sharing");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
