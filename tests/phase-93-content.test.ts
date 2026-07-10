import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "..");
const node = JSON.parse(
  fs.readFileSync(
    path.join(repoRoot, "content", "nodes", "security.bitcoin-core-rpc-access.json"),
    "utf8",
  ),
);
const audit = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "audit", "content-source-audit.json"), "utf8"),
);

describe("Bitcoin Core RPC access security content slice", () => {
  it("keeps the control-plane security concept atomic", () => {
    expect(node.id).toBe("security.bitcoin-core-rpc-access");
    expect(node.prerequisites).toEqual(["dev.bitcoin-core-rpc"]);
    expect(node.description).toMatch(/authenticating clients/i);
    expect(node.description).toMatch(/bind and allow rules/i);
    expect(node.description).toMatch(/read private data, spend wallet funds/i);
  });

  it("has curated Bitcoin Core documentation and an Amazon book", () => {
    expect(node.resources.map((resource: { url: string }) => resource.url)).toEqual([
      "https://github.com/bitcoin/bitcoin/blob/master/doc/JSON-RPC-interface.md#security",
      "https://github.com/bitcoin/bitcoin/blob/master/doc/bitcoin-conf.md",
      "https://github.com/bitcoin/bitcoin/blob/master/src/init.cpp",
      "https://amzn.to/4ro0NdG",
    ]);
  });

  it("keeps the canonical tracker aligned with the node", () => {
    const source = audit.sources.find(
      (entry: { id: string }) => entry.id === "source.bitcoin-core-operator-docs",
    );
    const concept = audit.concepts.find(
      (entry: { id: string }) => entry.id === "security.bitcoin-core-rpc-access",
    );
    const edge = audit.edges.find(
      (entry: { from: string; to: string }) =>
        entry.from === "dev.bitcoin-core-rpc" && entry.to === "security.bitcoin-core-rpc-access",
    );

    expect(source).toMatchObject({ status: "In review", conceptsNormalized: 1 });
    expect(concept).toMatchObject({
      sourceId: "source.bitcoin-core-operator-docs",
      status: "new",
      chosenPrerequisites: ["dev.bitcoin-core-rpc"],
    });
    expect(edge).toMatchObject({ type: "prerequisite", status: "proposed" });
  });
});
