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

describe("phase 88 strict DER signatures slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the strict DER signature encoding node", () => {
    expect(byId.has("protocol.strict-der-signatures")).toBe(true);
  });

  it("anchors strict encoding on Script", () => {
    const node = byId.get("protocol.strict-der-signatures");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["protocol.script"]);
  });

  it("keeps the description focused on DER validation and ambiguity", () => {
    const node = byId.get("protocol.strict-der-signatures");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("consensus rule");
    expect(description).toContain("ecdsa");
    expect(description).toContain("der");
    expect(description).toContain("ambiguous");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("protocol.strict-der-signatures");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
