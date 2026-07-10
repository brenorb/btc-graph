import { expect, it } from "vitest";
import graph from "../public/data/graph.json";

it("adds Taproot control blocks after Taproot and tapleaf proofs", () => {
  const node = graph.nodes.find((candidate) => candidate.id === "protocol.taproot-control-blocks");
  expect(node?.prerequisites).toEqual(["protocol.tapleaf-inclusion-proofs"]);
  expect(node?.description).toContain("internal key");
});
