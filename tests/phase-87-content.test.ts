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

describe("phase 87 Lightning onion messages slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the Lightning onion messages node", () => {
    expect(byId.has("lightning.onion-messages")).toBe(true);
  });

  it("anchors onion messages on feature negotiation and route blinding", () => {
    const node = byId.get("lightning.onion-messages");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual([
      "lightning.feature-flags",
      "lightning.route-blinding"
    ]);
  });

  it("keeps the description focused on channel-independent encrypted messages", () => {
    const node = byId.get("lightning.onion-messages");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("channel-independent");
    expect(description).toContain("encrypted");
    expect(description).toContain("blinded onion paths");
    expect(description).toContain("payment htlc");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("lightning.onion-messages");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
