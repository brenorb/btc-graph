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

describe("phase 91 Lightning encrypted transport slice", () => {
  const byId = new Map(loadNodes().map((node) => [node.id, node]));

  it("adds the BOLT 08 transport node", () => {
    expect(byId.has("lightning.encrypted-authenticated-transport")).toBe(true);
  });

  it("keeps only key identity and key exchange as direct prerequisites", () => {
    const node = byId.get("lightning.encrypted-authenticated-transport");
    expect(node?.prerequisites).toEqual([
      "fundamentals.public-private-keys",
      "fundamentals.diffie-hellman-key-exchange"
    ]);
  });

  it("describes the Noise handshake and authenticated encryption outcome", () => {
    const description = byId.get("lightning.encrypted-authenticated-transport")?.description.toLowerCase();
    expect(description).toContain("noise_xk");
    expect(description).toContain("diffie");
    expect(description).toContain("session keys");
    expect(description).toContain("authenticated encryption");
  });

  it("keeps the node curated and book-covered", () => {
    const node = byId.get("lightning.encrypted-authenticated-transport");
    expect(node?.resources.length).toBeGreaterThanOrEqual(2);
    expect(node?.resources.length).toBeLessThanOrEqual(4);
    expect(node?.resources.some((resource) => resource.type === "book" && resource.url.includes("amzn.to"))).toBe(true);
  });
});
