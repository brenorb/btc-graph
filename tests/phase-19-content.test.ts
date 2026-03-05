import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { GraphNode } from "../src/core/types";

const PHASE_19_NODE_ID = "privacy.pseudonymity" as const;

const REQUIRED_PREREQUISITES = [
  "protocol.addresses-outputs",
  "fundamentals.public-private-keys",
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

describe("phase 19 pseudonymity clarification", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds a dedicated pseudonymity node", () => {
    expect(byId.has(PHASE_19_NODE_ID)).toBe(true);
  });

  it("wires pseudonymity to key and address fundamentals", () => {
    const node = byId.get(PHASE_19_NODE_ID);
    expect(node).toBeTruthy();
    if (!node) return;

    for (const prerequisite of REQUIRED_PREREQUISITES) {
      expect(node.prerequisites).toContain(prerequisite);
    }
  });

  it("states that bitcoin is pseudonymous, not anonymous", () => {
    const node = byId.get(PHASE_19_NODE_ID);
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("pseudonym");
    expect(description).toContain("not anonymous");
    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.estimatedTime).toMatch(/^[0-9]+m$/);
  });
});
