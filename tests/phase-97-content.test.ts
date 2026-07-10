import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "..");
const node = JSON.parse(
  fs.readFileSync(
    path.join(repoRoot, "content", "nodes", "ops.mempool-cluster-limits.json"),
    "utf8",
  ),
);
const audit = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "audit", "content-source-audit.json"), "utf8"),
);

describe("mempool cluster limits content slice", () => {
  it("keeps cluster limits as an atomic policy concept", () => {
    expect(node.id).toBe("ops.mempool-cluster-limits");
    expect(node.prerequisites).toEqual(["protocol.cluster-mempool"]);
    expect(node.description).toMatch(/bounded transaction count/i);
    expect(node.description).toMatch(/aggregate virtual size/i);
    expect(node.description).toMatch(/ancestor and descendant limits/i);
    expect(node.description).toMatch(/package admission, relay, replacement/i);
  });

  it("has canonical policy sources and an Amazon book", () => {
    expect(node.resources.map((resource: { url: string }) => resource.url)).toEqual([
      "https://bitcoincore.org/en/releases/31.0/",
      "https://github.com/bitcoin/bitcoin/blob/v31.0/src/init.cpp",
      "https://bitcoinops.org/en/topics/cluster-mempool/",
      "https://amzn.to/4ro0NdG",
    ]);
  });

  it("keeps the canonical tracker aligned with the node", () => {
    const source = audit.sources.find(
      (entry: { id: string }) => entry.id === "source.bitcoin-core-cluster-mempool-rpc",
    );
    const concept = audit.concepts.find(
      (entry: { id: string }) => entry.id === "ops.mempool-cluster-limits",
    );
    const edge = audit.edges.find(
      (entry: { from: string; to: string }) =>
        entry.from === "protocol.cluster-mempool" && entry.to === "ops.mempool-cluster-limits",
    );

    expect(source).toMatchObject({ status: "In review", conceptsNormalized: 3 });
    expect(concept).toMatchObject({
      sourceId: "source.bitcoin-core-cluster-mempool-rpc",
      status: "new",
      chosenPrerequisites: ["protocol.cluster-mempool"],
    });
    expect(edge).toMatchObject({ type: "prerequisite", status: "proposed" });
  });
});
