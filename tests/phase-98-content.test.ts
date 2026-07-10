import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "..");
const node = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "content", "nodes", "lightning.dns-seeds.json"), "utf8"),
);
const audit = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "audit", "content-source-audit.json"), "utf8"),
);

describe("Lightning DNS seeds content slice", () => {
  it("keeps Lightning discovery distinct from generic DNS bootstrap", () => {
    expect(node.id).toBe("lightning.dns-seeds");
    expect(node.prerequisites).toEqual(["ops.dns-seeds", "lightning.gossip-protocol"]);
    expect(node.description).toMatch(/bootstrap nodes with no known contacts/i);
    expect(node.description).toMatch(/current address of a known peer/i);
    expect(node.description).toMatch(/Lightning realm, address type, node ID/i);
  });

  it("has canonical BOLT sources and an Amazon book", () => {
    expect(node.resources.map((resource: { url: string }) => resource.url)).toEqual([
      "https://github.com/lightning/bolts/blob/master/10-dns-bootstrap.md",
      "https://github.com/lightning/bolts/blob/master/07-routing-gossip.md",
      "https://github.com/lightning/bolts/blob/master/01-messaging.md",
      "https://amzn.to/40V421t",
    ]);
  });

  it("keeps the canonical tracker aligned with both direct prerequisites", () => {
    const source = audit.sources.find((entry: { id: string }) => entry.id === "source.lightning-bolts");
    const concept = audit.concepts.find((entry: { id: string }) => entry.id === "lightning.dns-seeds");
    const bootstrapEdge = audit.edges.find(
      (entry: { from: string; to: string }) =>
        entry.from === "ops.dns-seeds" && entry.to === "lightning.dns-seeds",
    );
    const gossipEdge = audit.edges.find(
      (entry: { from: string; to: string }) =>
        entry.from === "lightning.gossip-protocol" && entry.to === "lightning.dns-seeds",
    );

    expect(source).toMatchObject({ status: "In review", conceptsNormalized: 4 });
    expect(concept).toMatchObject({
      sourceId: "source.lightning-bolts",
      status: "new",
      chosenPrerequisites: ["ops.dns-seeds", "lightning.gossip-protocol"],
    });
    expect(bootstrapEdge).toMatchObject({ type: "prerequisite", status: "proposed" });
    expect(gossipEdge).toMatchObject({ type: "prerequisite", status: "proposed" });
  });
});
