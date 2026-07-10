import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { GraphNode } from "../src/core/types";

function loadNodes(): GraphNode[] {
  const sourceDir = path.join(process.cwd(), "content", "nodes");
  return fs
    .readdirSync(sourceDir)
    .filter((file) => file.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b))
    .map((file) => JSON.parse(fs.readFileSync(path.join(sourceDir, file), "utf8")) as GraphNode);
}

describe("phase 90 deterministic multisig key sorting slice", () => {
  const byId = new Map(loadNodes().map((node) => [node.id, node]));

  it("adds the BIP 67 interoperability node", () => {
    expect(byId.has("custody.deterministic-multisig-key-sorting")).toBe(true);
  });

  it("keeps only multisig policy and P2SH as direct prerequisites", () => {
    const node = byId.get("custody.deterministic-multisig-key-sorting");
    expect(node?.prerequisites).toEqual([
      "custody.multisig",
      "protocol.pay-to-script-hash"
    ]);
  });

  it("describes deterministic sorting and cross-wallet script agreement", () => {
    const description = byId.get("custody.deterministic-multisig-key-sorting")?.description.toLowerCase();
    expect(description).toContain("sorting");
    expect(description).toContain("public keys");
    expect(description).toContain("same script");
  });

  it("keeps the node curated and book-covered", () => {
    const node = byId.get("custody.deterministic-multisig-key-sorting");
    expect(node?.resources.length).toBeGreaterThanOrEqual(2);
    expect(node?.resources.length).toBeLessThanOrEqual(4);
    expect(node?.resources.some((resource) => resource.type === "book" && resource.url.includes("amzn.to"))).toBe(true);
  });
});
