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

function hasBroadResourceUrl(urlString: string): boolean {
  const url = new URL(urlString);
  const host = url.hostname.replace(/^www\./, "");
  const pathname = url.pathname;

  if (host === "bitcoindevphilosophy.com") {
    return !url.hash;
  }

  if (host === "developer.bitcoin.org") {
    return pathname === "/" || pathname === "/devguide/" || pathname === "/devguide";
  }

  return false;
}

describe("phase 30 full-node versus lightweight-wallet slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the downstream consumer for the light-client trust branch", () => {
    expect(byId.has("ops.full-node-vs-lightweight-wallet")).toBe(true);
  });

  it("anchors the node on both validation-sovereignty and the light-client trust model", () => {
    const node = byId.get("ops.full-node-vs-lightweight-wallet");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual([
      "fundamentals.validation-sovereignty",
      "protocol.light-client-trust-model"
    ]);
  });

  it("describes the choice as a trust-model tradeoff between full nodes and lightweight wallets", () => {
    const node = byId.get("ops.full-node-vs-lightweight-wallet");
    expect(node).toBeTruthy();
    if (!node) return;

    const description = node.description.toLowerCase();
    expect(description).toContain("full nodes");
    expect(description).toContain("lightweight wallets");
    expect(description).toContain("trust model");
  });

  it("keeps the node curated, precise, and book-covered", () => {
    const node = byId.get("ops.full-node-vs-lightweight-wallet");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.resources.length).toBeGreaterThanOrEqual(2);
    expect(node.resources.length).toBeLessThanOrEqual(4);
    expect(node.resources.some((resource) => resource.type === "book")).toBe(true);
    expect(node.resources.some((resource) => hasBroadResourceUrl(resource.url))).toBe(false);
  });
});
