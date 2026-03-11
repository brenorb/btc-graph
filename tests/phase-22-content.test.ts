import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { GraphNode } from "../src/core/types";

const PHASE_22_NODE_IDS = [
  "fundamentals.blind-signatures",
  "extension.cashu",
  "extension.fedi",
] as const;

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

function getDependents(nodes: GraphNode[], nodeId: string) {
  return nodes.filter((node) => node.prerequisites.includes(nodeId)).map((node) => node.id);
}

describe("phase 22 ecash dependency expansion", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds blind signatures, Cashu, and Fedi as dedicated nodes", () => {
    for (const nodeId of PHASE_22_NODE_IDS) {
      expect(byId.has(nodeId), `${nodeId} should exist`).toBe(true);
    }
  });

  it("connects blind signatures through digital signatures into ecash", () => {
    const blindSignatures = byId.get("fundamentals.blind-signatures");
    const ecash = byId.get("extension.ecash");

    expect(blindSignatures).toBeTruthy();
    expect(ecash).toBeTruthy();
    if (!blindSignatures || !ecash) return;

    expect(blindSignatures.prerequisites).toContain("fundamentals.digital-signatures");
    expect(ecash.prerequisites).toContain("fundamentals.blind-signatures");
  });

  it("makes Cashu and Fedi direct dependents of ecash", () => {
    const dependents = getDependents(nodes, "extension.ecash");

    expect(dependents).toContain("extension.cashu");
    expect(dependents).toContain("extension.fedi");
  });

  it("keeps the new ecash-related nodes concise and curated", () => {
    for (const nodeId of PHASE_22_NODE_IDS) {
      const node = byId.get(nodeId);
      expect(node).toBeTruthy();
      if (!node) continue;

      expect(node.description.length).toBeGreaterThan(30);
      expect(node.resources.length).toBeGreaterThanOrEqual(2);
      expect(node.resources.length).toBeLessThanOrEqual(4);
      expect(node.estimatedTime).toMatch(/^[0-9]+m$/);
    }
  });
});
