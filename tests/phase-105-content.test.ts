import { expect, it } from "vitest";
import graph from "../public/data/graph.json";

it("adds pseudonymous development after review culture", () => {
  const node = graph.nodes.find((candidate) => candidate.id === "dev.pseudonymous-development");

  expect(node?.prerequisites).toEqual(["dev.review-culture"]);
  expect(node?.aliases).toContain("developer pseudonymity");
  expect(node?.resources.some((resource) => resource.type === "book")).toBe(true);
});
