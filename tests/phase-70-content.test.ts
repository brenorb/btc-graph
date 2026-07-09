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

describe("phase 70 commitment output scripts slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the commitment output scripts node", () => {
    expect(byId.has("lightning.commitment-output-scripts")).toBe(true);
  });

  it("anchors commitment output scripts on key derivation and CSV only", () => {
    const node = byId.get("lightning.commitment-output-scripts");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual([
      "lightning.per-commitment-secrets",
      "protocol.csv-bip112"
    ]);
  });

  it("keeps the node focused on to_local, to_remote, and static_remotekey", () => {
    const node = byId.get("lightning.commitment-output-scripts");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("to_local");
    expect(description).toContain("to_remote");
    expect(description).toContain("csv");
    expect(description).toContain("static_remotekey");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("lightning.commitment-output-scripts");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
