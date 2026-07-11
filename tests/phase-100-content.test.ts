import { describe, expect, it } from "vitest";
import graph from "../public/data/graph.json";
import audit from "../audit/content-source-audit.json";

describe("phase 100 content: selection cryptography", () => {
  it("adds selection cryptography with review culture as its only direct prerequisite", () => {
    const node = graph.nodes.find((candidate) => candidate.id === "dev.selection-cryptography");

    expect(node).toBeDefined();
    expect(node?.prerequisites).toEqual(["dev.review-culture"]);
    expect(node?.description).toContain("cryptographic libraries");
    expect(node?.description).toContain("dependency");
  });

  it("records the dedupe boundary against review, primitives, and build verification", () => {
    const source = audit.sources.find((candidate) => candidate.id === "source.bitcoin-dev-philosophy");
    const concept = audit.concepts.find((candidate) => candidate.id === "dev.selection-cryptography");

    expect(source?.status).toBe("In review");
    expect(source?.conceptsNormalized).toBeGreaterThanOrEqual(8);
    expect(concept).toMatchObject({
      status: "new",
      chosenPrerequisites: ["dev.review-culture"],
    });
    expect(concept?.candidatePrerequisites).toEqual(expect.arrayContaining([
      "dev.reproducible-builds",
      "security.adversarial-thinking",
    ]));
  });

  it("adds exactly one proposed direct prerequisite edge", () => {
    expect(audit.edges.filter((edge) => edge.to === "dev.selection-cryptography"))
      .toMatchObject([{ from: "dev.review-culture", type: "prerequisite", status: "proposed" }]);
  });
});
