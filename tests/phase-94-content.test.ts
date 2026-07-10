import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "..");
const node = JSON.parse(
  fs.readFileSync(
    path.join(repoRoot, "content", "nodes", "dev.submitpackage-rpc.json"),
    "utf8",
  ),
);
const audit = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "audit", "content-source-audit.json"), "utf8"),
);

describe("submitpackage RPC content slice", () => {
  it("keeps local package admission distinct from preflight and relay", () => {
    expect(node.id).toBe("dev.submitpackage-rpc");
    expect(node.prerequisites).toEqual(["dev.testmempoolaccept-rpc"]);
    expect(node.description).toMatch(/local mempool/i);
    expect(node.description).toMatch(/package-policy evaluation/i);
    expect(node.description).toMatch(/does not imply network propagation/i);
  });

  it("has curated package-policy sources and an Amazon book", () => {
    expect(node.resources.map((resource: { url: string }) => resource.url)).toEqual([
      "https://bitcoincore.org/en/doc/31.0.0/rpc/rawtransactions/submitpackage/",
      "https://github.com/bitcoin/bitcoin/blob/master/doc/policy/packages.md",
      "https://bitcoincore.org/en/releases/26.0/",
      "https://amzn.to/4ro0NdG",
    ]);
  });

  it("keeps the canonical tracker aligned with the node", () => {
    const source = audit.sources.find(
      (entry: { id: string }) => entry.id === "source.bitcoin-core-package-policy",
    );
    const concept = audit.concepts.find(
      (entry: { id: string }) => entry.id === "dev.submitpackage-rpc",
    );
    const edge = audit.edges.find(
      (entry: { from: string; to: string }) =>
        entry.from === "dev.testmempoolaccept-rpc" && entry.to === "dev.submitpackage-rpc",
    );

    expect(source).toMatchObject({ status: "In review", conceptsNormalized: 1 });
    expect(concept).toMatchObject({
      sourceId: "source.bitcoin-core-package-policy",
      status: "new",
      chosenPrerequisites: ["dev.testmempoolaccept-rpc"],
    });
    expect(edge).toMatchObject({ type: "prerequisite", status: "proposed" });
  });
});
