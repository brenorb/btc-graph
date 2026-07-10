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

describe("phase 75 htlc output scripts slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the htlc output scripts node", () => {
    expect(byId.has("lightning.htlc-output-scripts")).toBe(true);
  });

  it("anchors the concept on htlcs and commitment output scripts only", () => {
    const node = byId.get("lightning.htlc-output-scripts");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual([
      "lightning.htlc",
      "lightning.commitment-output-scripts"
    ]);
  });

  it("keeps the description focused on witness conditions, preimages, and timeouts", () => {
    const node = byId.get("lightning.htlc-output-scripts");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("witness");
    expect(description).toContain("preimage");
    expect(description).toContain("timeout");
    expect(description).toContain("commitment");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("lightning.htlc-output-scripts");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
