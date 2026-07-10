import { describe, expect, it } from "vitest";
import graph from "../public/data/graph.json";
import audit from "../audit/content-source-audit.json";

describe("phase 99 content: miner decentralization", () => {
  it("adds miner decentralization with its minimal authority and mining-economics prerequisites", () => {
    const node = graph.nodes.find((candidate) => candidate.id === "mining.miner-decentralization");

    expect(node).toBeDefined();
    expect(node?.prerequisites).toEqual(["protocol.nodes-vs-miners", "mining.pool-vs-solo"]);
    expect(node?.description).toContain("transaction ordering");
    expect(node?.description).toContain("censorship");
    expect(node?.description).toContain("consensus rules");
  });

  it("keeps the concept distinct from its source-adjacent and implementation-adjacent neighbors", () => {
    const source = audit.sources.find((candidate) => candidate.id === "source.bitcoin-dev-philosophy");
    const concept = audit.concepts.find((candidate) => candidate.id === "mining.miner-decentralization");

    expect(source).toMatchObject({ status: "In review" });
    expect(source?.conceptsNormalized).toBeGreaterThanOrEqual(7);
    expect(concept).toMatchObject({
      status: "new",
      chosenPrerequisites: ["protocol.nodes-vs-miners", "mining.pool-vs-solo"],
    });
    expect(concept?.candidatePrerequisites).toEqual(expect.arrayContaining([
      "fundamentals.censorship-resistance",
      "mining.stratum-v2",
    ]));
  });

  it("adds direct audit edges only from the two prerequisite concepts", () => {
    const edges = audit.edges.filter((edge) => edge.to === "mining.miner-decentralization");

    expect(edges).toHaveLength(2);
    expect(edges.map((edge) => edge.from)).toEqual([
      "protocol.nodes-vs-miners",
      "mining.pool-vs-solo",
    ]);
  });
});
