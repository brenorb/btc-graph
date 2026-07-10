import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "..");
const clusterNode = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "content", "nodes", "protocol.cluster-mempool.json"), "utf8"),
);
const audit = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "audit", "content-source-audit.json"), "utf8"),
);

describe("cluster mempool RPC scope decision", () => {
  it("keeps implementation-detail RPCs out of the first-class graph", () => {
    expect(fs.existsSync(path.join(repoRoot, "content", "nodes", "dev.getmempoolcluster-rpc.json"))).toBe(
      false,
    );
    expect(
      fs.existsSync(path.join(repoRoot, "content", "nodes", "dev.getmempoolfeeratediagram-rpc.json")),
    ).toBe(false);
    expect(clusterNode.resources.map((resource: { url: string }) => resource.url)).toContain(
      "https://bitcoincore.org/en/doc/31.0.0/rpc/blockchain/getmempoolcluster/",
    );
  });

  it("records both RPC candidates as merges into cluster mempool", () => {
    for (const id of ["dev.getmempoolcluster-rpc", "dev.getmempoolfeeratediagram-rpc"]) {
      const concept = audit.concepts.find((entry: { id: string }) => entry.id === id);
      expect(concept).toMatchObject({
        existingNodeId: "protocol.cluster-mempool",
        status: "merge",
        chosenPrerequisites: ["protocol.cluster-mempool"],
      });
    }
  });

  it("does not leave prerequisite edges to omitted RPC wrappers", () => {
    expect(
      audit.edges.some((entry: { to: string }) =>
        ["dev.getmempoolcluster-rpc", "dev.getmempoolfeeratediagram-rpc"].includes(entry.to),
      ),
    ).toBe(false);
  });
});
