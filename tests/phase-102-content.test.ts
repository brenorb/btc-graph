import { describe, expect, it } from "vitest";
import graph from "../public/data/graph.json";
import audit from "../audit/content-source-audit.json";

describe("phase 102 content: pay to contract and client-side validation", () => {
  it("adds pay to contract from key and hash foundations", () => {
    const node = graph.nodes.find((candidate) => candidate.id === "protocol.pay-to-contract");

    expect(node?.prerequisites).toEqual([
      "fundamentals.public-private-keys",
      "fundamentals.hash-functions",
    ]);
    expect(node?.description).toContain("offchain contract data");
  });

  it("adds single-use seals between UTXOs and client-side validation", () => {
    const seals = graph.nodes.find((candidate) => candidate.id === "extension.single-use-seals");
    const node = graph.nodes.find((candidate) => candidate.id === "extension.client-side-validation");

    expect(seals?.prerequisites).toEqual(["protocol.utxo-model"]);
    expect(node?.prerequisites).toEqual(["extension.single-use-seals", "protocol.pay-to-contract"]);
    expect(node?.description).toContain("recipient");
    expect(node?.description).toContain("transition history");
  });

  it("records both concepts and their three direct audit edges", () => {
    const ids = audit.concepts.map((candidate) => candidate.id);
    const edges = audit.edges.filter((edge) => ["protocol.pay-to-contract", "extension.single-use-seals", "extension.client-side-validation"].includes(edge.to));

    expect(ids).toEqual(expect.arrayContaining(["protocol.pay-to-contract", "extension.single-use-seals", "extension.client-side-validation"]));
    expect(edges.map((edge) => `${edge.from}->${edge.to}`)).toEqual([
      "fundamentals.public-private-keys->protocol.pay-to-contract",
      "fundamentals.hash-functions->protocol.pay-to-contract",
      "protocol.utxo-model->extension.single-use-seals",
      "extension.single-use-seals->extension.client-side-validation",
      "protocol.pay-to-contract->extension.client-side-validation",
    ]);
  });
});
