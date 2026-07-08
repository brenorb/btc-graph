import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { GraphNode } from "../src/core/types";

const NEW_NODE_IDS = [
  "fundamentals.validation-sovereignty",
  "protocol.light-client-trust-model",
] as const;

const ALLOWED_RESOURCE_DOMAINS = [
  "bitcoindevphilosophy.com",
  "developer.bitcoin.org",
  "github.com",
  "amzn.to",
];

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

  if (host === "github.com") {
    return !pathname.includes("/blob/");
  }

  return false;
}

describe("phase 29 verification and light-client trust slice", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds the two audited bridge nodes", () => {
    const missing = NEW_NODE_IDS.filter((id) => !byId.has(id));
    expect(missing).toEqual([]);
  });

  it("keeps validation sovereignty as a direct consequence of trustlessness", () => {
    const node = byId.get("fundamentals.validation-sovereignty");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual(["fundamentals.trustlessness"]);
    expect(node.category).toBe("Security");
  });

  it("models light-client trust as a contrast between full-node guarantees and filtered shortcuts", () => {
    const node = byId.get("protocol.light-client-trust-model");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toEqual([
      "ops.run-full-node",
      "protocol.compact-block-filters",
    ]);

    const description = node.description.toLowerCase();
    expect(description).toContain("light clients");
    expect(description).toContain("full nodes");
    expect(description).toContain("verify");
  });

  it("keeps the new nodes curated, precise, and book-covered", () => {
    for (const nodeId of NEW_NODE_IDS) {
      const node = byId.get(nodeId);
      expect(node, `${nodeId} should exist`).toBeTruthy();
      if (!node) continue;

      expect(node.resources.length, `${nodeId} should have 2-4 resources`).toBeGreaterThanOrEqual(
        2,
      );
      expect(node.resources.length, `${nodeId} should have 2-4 resources`).toBeLessThanOrEqual(4);
      expect(node.resources.some((resource) => resource.type === "book")).toBe(true);

      for (const resource of node.resources) {
        const host = new URL(resource.url).hostname.replace(/^www\./, "");
        expect(
          ALLOWED_RESOURCE_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`)),
          `${nodeId} has non-source URL host: ${host}`,
        ).toBe(true);
        expect(hasBroadResourceUrl(resource.url), `${nodeId} should avoid broad links`).toBe(false);
      }
    }
  });
});
