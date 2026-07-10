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

describe("phase 40 taproot psbt fields slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the taproot psbt fields node", () => {
    expect(byId.has("dev.taproot-psbt-fields")).toBe(true);
  });

  it("anchors taproot psbt fields on psbt workflow and taproot", () => {
    const node = byId.get("dev.taproot-psbt-fields");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["custody.psbt", "protocol.taproot"]);
  });

  it("keeps the node focused on taproot-specific psbt extensions", () => {
    const node = byId.get("dev.taproot-psbt-fields");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("taproot-specific");
    expect(description).toContain("internal keys");
    expect(description).toContain("leaf scripts");
    expect(description).toContain("merkle");
    expect(description).not.toContain("descriptor");
    expect(description).not.toContain("musig");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("dev.taproot-psbt-fields");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
