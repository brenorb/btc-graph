import { describe, expect, it } from "vitest";
import graph from "../public/data/graph.json";

describe("phase 103 content: replacement cycling", () => {
  it("adds replacement cycling after RBF and CPFP", () => {
    const node = graph.nodes.find((candidate) => candidate.id === "protocol.replacement-cycling");
    expect(node?.prerequisites).toEqual(["protocol.rbf", "protocol.cpfp"]);
    expect(node?.description).toContain("evict");
    expect(node?.description).toContain("time-sensitive");
  });
});
