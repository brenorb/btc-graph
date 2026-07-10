import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "..");
const node = JSON.parse(
  fs.readFileSync(
    path.join(repoRoot, "content", "nodes", "protocol.package-rbf.json"),
    "utf8",
  ),
);
const audit = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "audit", "content-source-audit.json"), "utf8"),
);

describe("package RBF content slice", () => {
  it("keeps package replacement distinct from ordinary RBF and relay", () => {
    expect(node.id).toBe("protocol.package-rbf");
    expect(node.prerequisites).toEqual(["protocol.rbf"]);
    expect(node.description).toMatch(/limited 1P1C-style replacement/i);
    expect(node.description).toMatch(/conflicting in-mempool transaction packages/i);
    expect(node.description).toMatch(/aggregate-fee/i);
    expect(node.description).toMatch(/child fees to replace a package/i);
  });

  it("has curated replacement-policy sources and an Amazon book", () => {
    expect(node.resources.map((resource: { url: string }) => resource.url)).toEqual([
      "https://github.com/bitcoin/bitcoin/blob/master/doc/policy/packages.md",
      "https://github.com/bitcoin/bitcoin/blob/master/doc/policy/mempool-replacements.md",
      "https://bitcoinops.org/en/bitcoin-core-28-wallet-integration-guide/",
      "https://amzn.to/4ro0NdG",
    ]);
  });

  it("keeps the canonical tracker aligned with the node", () => {
    const source = audit.sources.find(
      (entry: { id: string }) => entry.id === "source.bitcoin-core-package-policy",
    );
    const concept = audit.concepts.find(
      (entry: { id: string }) => entry.id === "protocol.package-rbf",
    );
    const edge = audit.edges.find(
      (entry: { from: string; to: string }) =>
        entry.from === "protocol.rbf" && entry.to === "protocol.package-rbf",
    );

    expect(source).toMatchObject({ status: "In review", conceptsNormalized: 2 });
    expect(concept).toMatchObject({
      sourceId: "source.bitcoin-core-package-policy",
      status: "new",
      chosenPrerequisites: ["protocol.rbf"],
    });
    expect(edge).toMatchObject({ type: "prerequisite", status: "proposed" });
  });
});
