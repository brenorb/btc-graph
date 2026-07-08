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

function isAmazonUrl(urlString: string): boolean {
  const host = new URL(urlString).hostname.replace(/^www\./, "");
  return host === "amzn.to" || host.includes("amazon.");
}

describe("phase 27 book coverage", () => {
  const nodes = loadNodes();

  it("gives every node at least one Amazon-linked book resource", () => {
    const missing = nodes
      .filter(
        (node) =>
          !node.resources.some((resource) => resource.type === "book" && isAmazonUrl(resource.url)),
      )
      .map((node) => node.id);

    expect(missing).toEqual([]);
  });
});
