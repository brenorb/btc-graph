import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { GraphNode } from "../src/core/types";

const REWIRED_POLICY_NODE_IDS = [
  "ops.mempool-policy",
  "protocol.rbf",
  "protocol.dust-policy",
  "protocol.cpfp-carve-out",
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

describe("phase 26 policy-branch parent rewires", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("wires key policy leaves through consensus-vs-policy", () => {
    for (const nodeId of REWIRED_POLICY_NODE_IDS) {
      const node = byId.get(nodeId);
      expect(node, `${nodeId} should exist`).toBeTruthy();
      if (!node) continue;

      expect(node.prerequisites).toContain("protocol.consensus-vs-policy");
    }
  });

  it("keeps deeper policy leaves inheriting the bridge transitively instead of duplicating it", () => {
    const standardness = byId.get("protocol.standardness-policy");
    const packageRelay = byId.get("protocol.package-relay");
    const transactionPinning = byId.get("protocol.transaction-pinning");
    const clusterMempool = byId.get("protocol.cluster-mempool");

    expect(standardness).toBeTruthy();
    expect(packageRelay).toBeTruthy();
    expect(transactionPinning).toBeTruthy();
    expect(clusterMempool).toBeTruthy();
    if (!standardness || !packageRelay || !transactionPinning || !clusterMempool) return;

    expect(standardness.prerequisites).not.toContain("protocol.consensus-vs-policy");
    expect(packageRelay.prerequisites).not.toContain("protocol.consensus-vs-policy");
    expect(transactionPinning.prerequisites).not.toContain("protocol.consensus-vs-policy");
    expect(clusterMempool.prerequisites).not.toContain("protocol.consensus-vs-policy");
  });
});
