import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const repoRoot = path.resolve(import.meta.dirname, "..");
const node = JSON.parse(
  fs.readFileSync(
    path.join(repoRoot, "content", "nodes", "protocol.generic-signed-messages.json"),
    "utf8",
  ),
);
const audit = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "audit", "content-source-audit.json"), "utf8"),
);

describe("generic signed messages content slice", () => {
  it("keeps BIP 322 atomic with only Script as a direct prerequisite", () => {
    expect(node.id).toBe("protocol.generic-signed-messages");
    expect(node.prerequisites).toEqual(["protocol.script"]);
    expect(node.description).toMatch(/virtual transactions/i);
    expect(node.description).toMatch(/scriptPubKey/i);
    expect(node.description).toMatch(/message/i);
    expect(node.description).toMatch(/without spending or broadcasting/i);
  });

  it("has curated specification and Amazon book resources", () => {
    expect(node.resources.map((resource: { url: string }) => resource.url)).toEqual([
      "https://github.com/bitcoin/bips/blob/master/bip-0322.mediawiki",
      "https://github.com/bitcoin/bips/blob/master/bip-0174.mediawiki",
      "https://amzn.to/4b5xUhC",
    ]);
  });

  it("keeps the canonical tracker aligned with the node", () => {
    const concept = audit.concepts.find(
      (entry: { id: string }) => entry.id === "protocol.generic-signed-messages",
    );
    const edge = audit.edges.find(
      (entry: { from: string; to: string }) =>
        entry.from === "protocol.script" && entry.to === "protocol.generic-signed-messages",
    );

    expect(concept).toMatchObject({
      sourceId: "source.bitcoin-bips",
      status: "new",
      chosenPrerequisites: ["protocol.script"],
    });
    expect(edge).toMatchObject({ type: "prerequisite", status: "proposed" });
  });
});
