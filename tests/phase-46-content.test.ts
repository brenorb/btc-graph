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

describe("phase 46 degrading multisig slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the degrading multisig node", () => {
    expect(byId.has("custody.degrading-multisig")).toBe(true);
  });

  it("anchors degrading multisig on multisig and timelocks", () => {
    const node = byId.get("custody.degrading-multisig");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["custody.multisig", "protocol.timelocks"]);
  });

  it("keeps the node focused on live-versus-backup timeout policy", () => {
    const node = byId.get("custody.degrading-multisig");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("live");
    expect(description).toContain("backup");
    expect(description).toContain("timeout");
    expect(description).toContain("taproot");
    expect(description).not.toContain("threshold signature");
    expect(description).not.toContain("descriptor");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("custody.degrading-multisig");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
