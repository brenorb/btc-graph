import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { GraphNode } from "../src/core/types";

const PHASE_13_NODE_IDS = [
  "fundamentals.modular-exponentiation",
  "fundamentals.cyclic-groups",
  "fundamentals.diffie-hellman-key-exchange",
  "economics.hayek-money-competition",
  "economics.double-entry-bookkeeping",
  "economics.schelling-points",
] as const;

const REQUIRED_PHASE_13_PREREQUISITES: Record<string, string[]> = {
  "fundamentals.modular-exponentiation": ["fundamentals.modular-arithmetic"],
  "fundamentals.cyclic-groups": ["fundamentals.modular-arithmetic"],
  "fundamentals.diffie-hellman-key-exchange": [
    "fundamentals.modular-exponentiation",
    "fundamentals.cyclic-groups",
    "fundamentals.discrete-log-problem",
    "fundamentals.finite-fields",
  ],
};

const ECONOMICS_BOOK_NODE_IDS = [
  "economics.hayek-money-competition",
  "economics.double-entry-bookkeeping",
  "economics.schelling-points",
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

function hasAmazonBookResource(node: GraphNode): boolean {
  return node.resources.some((resource) => {
    if (resource.type !== "book") {
      return false;
    }

    const url = new URL(resource.url);
    const host = url.hostname.replace(/^www\./, "");
    return host === "amazon.com" && url.pathname.includes("/dp/");
  });
}

describe("phase 13 starter multidisciplinary topic scaffold", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("includes starter nodes for economics and cryptography entry points", () => {
    const missing = PHASE_13_NODE_IDS.filter((id) => !byId.has(id));
    expect(missing).toEqual([]);
  });

  it("encodes the expected Diffie-Hellman prerequisite chain", () => {
    for (const [nodeId, requiredPrerequisites] of Object.entries(REQUIRED_PHASE_13_PREREQUISITES)) {
      const node = byId.get(nodeId);
      expect(node, `${nodeId} should exist`).toBeTruthy();
      if (!node) continue;

      for (const prerequisite of requiredPrerequisites) {
        expect(node.prerequisites, `${nodeId} should include ${prerequisite}`).toContain(
          prerequisite,
        );
      }
    }
  });

  it("keeps mempool and fee market as separate topics", () => {
    const mempool = byId.get("protocol.mempool");
    const feeMarket = byId.get("protocol.fee-market");

    expect(mempool, "protocol.mempool should exist").toBeTruthy();
    expect(feeMarket, "protocol.fee-market should exist").toBeTruthy();
    if (!mempool || !feeMarket) return;

    expect(mempool.title).toBe("Mempool");
    expect(feeMarket.title).toBe("Fee Market");
    expect(feeMarket.prerequisites).toContain("protocol.mempool");
  });

  it("adds at least one amazon book resource to each new economics starter node", () => {
    for (const nodeId of ECONOMICS_BOOK_NODE_IDS) {
      const node = byId.get(nodeId);
      expect(node, `${nodeId} should exist`).toBeTruthy();
      if (!node) continue;

      expect(hasAmazonBookResource(node), `${nodeId} should include an Amazon book resource`).toBe(
        true,
      );
    }
  });
});
