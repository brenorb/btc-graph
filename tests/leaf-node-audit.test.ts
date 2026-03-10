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

describe("leaf-node audit prerequisites", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("connects diffie-hellman to nodes that explicitly use shared-secret derivation", () => {
    const expectedDependents = [
      "privacy.silent-payments",
      "protocol.v2-p2p-transport",
    ] as const;

    for (const nodeId of expectedDependents) {
      const node = byId.get(nodeId);
      expect(node).toBeTruthy();
      if (!node) continue;

      expect(node.prerequisites).toContain(
        "fundamentals.diffie-hellman-key-exchange",
      );
    }
  });

  it("connects the BIP39 passphrase topic back to BIP39 itself", () => {
    const node = byId.get("custody.passphrase");
    expect(node).toBeTruthy();
    if (!node) return;

    expect(node.prerequisites).toContain("dev.bip39");
  });

  it("places route blinding before BOLT12 offers in the graph", () => {
    const routeBlinding = byId.get("lightning.route-blinding");
    const offers = byId.get("lightning.bolt12-offers");

    expect(routeBlinding).toBeTruthy();
    expect(offers).toBeTruthy();
    if (!routeBlinding || !offers) return;

    expect(routeBlinding.prerequisites).toContain("lightning.onion-routing");
    expect(routeBlinding.prerequisites).not.toContain("lightning.bolt12-offers");

    expect(offers.prerequisites).toContain("lightning.route-blinding");
    expect(offers.prerequisites).not.toContain("lightning.onion-routing");
  });

  it("models segwit as the malleability fix that Lightning builds on", () => {
    const segwit = byId.get("protocol.segregated-witness");
    const paymentChannels = byId.get("lightning.payment-channels");

    expect(segwit).toBeTruthy();
    expect(paymentChannels).toBeTruthy();
    if (!segwit || !paymentChannels) return;

    expect(segwit.prerequisites).toContain("protocol.transaction-malleability");

    expect(paymentChannels.prerequisites).toContain("protocol.segregated-witness");
    expect(paymentChannels.prerequisites).not.toContain(
      "protocol.transaction-lifecycle",
    );
  });
});
