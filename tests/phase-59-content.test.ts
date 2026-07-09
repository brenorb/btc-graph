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

describe("phase 59 bech32m slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the bech32m addresses node", () => {
    expect(byId.has("protocol.bech32m-addresses")).toBe(true);
  });

  it("anchors bech32m on address semantics plus taproot-era witness versions", () => {
    const node = byId.get("protocol.bech32m-addresses");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual([
      "protocol.addresses-outputs",
      "protocol.taproot",
    ]);
  });

  it("keeps the node focused on checksum format and witness-version distinction", () => {
    const node = byId.get("protocol.bech32m-addresses");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("version 1");
    expect(description).toContain("checksum");
    expect(description).toContain("bech32");
    expect(description).toContain("taproot");
    expect(description).not.toContain("cloud backup");
  });

  it("keeps the resources curated and book-covered", () => {
    const node = byId.get("protocol.bech32m-addresses");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
  });
});
