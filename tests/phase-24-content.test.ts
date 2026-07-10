import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { GraphNode } from "../src/core/types";

const PHASE_24_NODE_IDS = [
  "protocol.tagged-hashes",
  "protocol.x-only-public-keys",
  "protocol.taptweak",
  "protocol.taptree",
  "protocol.tapleaf-inclusion-proofs",
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

describe("phase 24 taproot-internal bridge expansion", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("adds tagged-hash, x-only-key, taptweak, taptree, and tapleaf-proof nodes", () => {
    for (const nodeId of PHASE_24_NODE_IDS) {
      expect(byId.has(nodeId), `${nodeId} should exist`).toBe(true);
    }
  });

  it("anchors the new Taproot internals with direct-only prerequisite chains", () => {
    const taggedHashes = byId.get("protocol.tagged-hashes");
    const xOnlyKeys = byId.get("protocol.x-only-public-keys");
    const tapTweak = byId.get("protocol.taptweak");
    const tapTree = byId.get("protocol.taptree");
    const tapleafProofs = byId.get("protocol.tapleaf-inclusion-proofs");

    expect(taggedHashes).toBeTruthy();
    expect(xOnlyKeys).toBeTruthy();
    expect(tapTweak).toBeTruthy();
    expect(tapTree).toBeTruthy();
    expect(tapleafProofs).toBeTruthy();
    if (!taggedHashes || !xOnlyKeys || !tapTweak || !tapTree || !tapleafProofs) return;

    expect(taggedHashes.prerequisites).toEqual(["fundamentals.hash-functions"]);
    expect(xOnlyKeys.prerequisites).toContain("fundamentals.public-private-keys");
    expect(xOnlyKeys.prerequisites).toContain("fundamentals.schnorr-signatures");
    expect(tapTweak.prerequisites).toContain("protocol.taproot");
    expect(tapTweak.prerequisites).toContain("protocol.tagged-hashes");
    expect(tapTweak.prerequisites).toContain("protocol.x-only-public-keys");
    expect(tapTree.prerequisites).toEqual(["protocol.taptweak"]);
    expect(tapleafProofs.prerequisites).toEqual(["protocol.taptree"]);
  });

  it("describes the new nodes in concrete Taproot terms", () => {
    const taggedHashes = byId.get("protocol.tagged-hashes");
    const xOnlyKeys = byId.get("protocol.x-only-public-keys");
    const tapTweak = byId.get("protocol.taptweak");
    const tapTree = byId.get("protocol.taptree");
    const tapleafProofs = byId.get("protocol.tapleaf-inclusion-proofs");

    expect(taggedHashes).toBeTruthy();
    expect(xOnlyKeys).toBeTruthy();
    expect(tapTweak).toBeTruthy();
    expect(tapTree).toBeTruthy();
    expect(tapleafProofs).toBeTruthy();
    if (!taggedHashes || !xOnlyKeys || !tapTweak || !tapTree || !tapleafProofs) return;

    expect(taggedHashes.description.toLowerCase()).toContain("domain");
    expect(xOnlyKeys.description.toLowerCase()).toContain("32-byte");
    expect(tapTweak.description.toLowerCase()).toContain("output key");
    expect(tapTree.description.toLowerCase()).toContain("merkle tree");
    expect(tapleafProofs.description.toLowerCase()).toContain("proof");
    expect(tapleafProofs.description.toLowerCase()).toContain("taproot");
  });

  it("keeps the new Taproot internal nodes curated", () => {
    for (const nodeId of PHASE_24_NODE_IDS) {
      const node = byId.get(nodeId);
      expect(node).toBeTruthy();
      if (!node) continue;

      expect(node.resources.length).toBeGreaterThanOrEqual(2);
      expect(node.resources.length).toBeLessThanOrEqual(4);
      expect(node.estimatedTime).toMatch(/^[0-9]+m$/);
    }
  });
});
