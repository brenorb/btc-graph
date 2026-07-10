import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "..");
const node = JSON.parse(
  fs.readFileSync(
    path.join(repoRoot, "content", "nodes", "dev.getmempoolcluster-rpc.json"),
    "utf8",
  ),
);
const audit = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "audit", "content-source-audit.json"), "utf8"),
);

describe("getmempoolcluster RPC content slice", () => {
  it("keeps cluster inspection distinct from package admission and replacement", () => {
    expect(node.id).toBe("dev.getmempoolcluster-rpc");
    expect(node.prerequisites).toEqual(["protocol.cluster-mempool"]);
    expect(node.description).toMatch(/connected mempool cluster/i);
    expect(node.description).toMatch(/mining-ordered chunks/i);
    expect(node.description).toMatch(/transaction count/i);
    expect(node.description).toMatch(/fees and transactions/i);
  });

  it("has canonical cluster documentation and an Amazon book", () => {
    expect(node.resources.map((resource: { url: string }) => resource.url)).toEqual([
      "https://bitcoincore.org/en/doc/31.0.0/rpc/blockchain/getmempoolcluster/",
      "https://bitcoincore.org/en/releases/31.0/",
      "https://github.com/bitcoin/bitcoin/blob/31.x/doc/policy/mempool-terminology.md",
      "https://amzn.to/4ro0NdG",
    ]);
  });

  it("keeps the canonical tracker aligned with the node", () => {
    const source = audit.sources.find(
      (entry: { id: string }) => entry.id === "source.bitcoin-core-cluster-mempool-rpc",
    );
    const concept = audit.concepts.find(
      (entry: { id: string }) => entry.id === "dev.getmempoolcluster-rpc",
    );
    const edge = audit.edges.find(
      (entry: { from: string; to: string }) =>
        entry.from === "protocol.cluster-mempool" && entry.to === "dev.getmempoolcluster-rpc",
    );

    expect(source).toMatchObject({ status: "In review", conceptsNormalized: 1 });
    expect(concept).toMatchObject({
      sourceId: "source.bitcoin-core-cluster-mempool-rpc",
      status: "new",
      chosenPrerequisites: ["protocol.cluster-mempool"],
    });
    expect(edge).toMatchObject({ type: "prerequisite", status: "proposed" });
  });
});
