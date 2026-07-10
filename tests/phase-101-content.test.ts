import { describe, expect, it } from "vitest";
import graph from "../public/data/graph.json";
import audit from "../audit/content-source-audit.json";

describe("phase 101 content: block withholding", () => {
  it("adds block withholding with pool shares as its only direct prerequisite", () => {
    const node = graph.nodes.find((candidate) => candidate.id === "mining.block-withholding");

    expect(node).toBeDefined();
    expect(node?.prerequisites).toEqual(["mining.pool-shares"]);
    expect(node?.description).toContain("block-valid");
    expect(node?.description).toContain("withhold");
  });

  it("keeps the concept distinct from pooled mining, payout accounting, and majority attacks", () => {
    const source = audit.sources.find((candidate) => candidate.id === "source.bitcoinops-topics");
    const concept = audit.concepts.find((candidate) => candidate.id === "mining.block-withholding");

    expect(source).toMatchObject({ status: "In review" });
    expect(source?.conceptsNormalized).toBeGreaterThanOrEqual(11);
    expect(concept).toMatchObject({ status: "new", chosenPrerequisites: ["mining.pool-shares"] });
    expect(concept?.candidatePrerequisites).toEqual(expect.arrayContaining([
      "mining.pool-vs-solo",
      "mining.51-percent-attack",
    ]));
  });

  it("adds exactly one direct audit edge from mining pool shares", () => {
    expect(audit.edges.filter((edge) => edge.to === "mining.block-withholding"))
      .toMatchObject([{ from: "mining.pool-shares", type: "prerequisite", status: "proposed" }]);
  });
});
