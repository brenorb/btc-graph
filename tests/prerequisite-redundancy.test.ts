import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { GraphNode } from "../src/core/types";

interface LoadedNode extends GraphNode {
  file: string;
}

const ALLOWED_REDUNDANT_PREREQUISITES: Partial<Record<string, string[]>> = {
  "extension.spacechains": ["protocol.proof-of-work"],
  "lightning.htlc": ["fundamentals.hash-functions"],
  "protocol.block-weight-vbytes": ["protocol.block-structure"],
  "protocol.witness-commitment": ["fundamentals.merkle-trees"],
};

function loadNodes(): LoadedNode[] {
  const repoRoot = process.cwd();
  const sourceDir = path.join(repoRoot, "content", "nodes");
  const files = fs
    .readdirSync(sourceDir)
    .filter((file) => file.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b));

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(sourceDir, file), "utf8");
    return {
      file,
      ...(JSON.parse(raw) as GraphNode),
    };
  });
}

function hasPath(
  byId: Map<string, LoadedNode>,
  startId: string,
  targetId: string,
  seen = new Set<string>(),
): boolean {
  if (seen.has(startId)) {
    return false;
  }

  seen.add(startId);
  const node = byId.get(startId);
  if (!node) {
    return false;
  }

  for (const prerequisite of node.prerequisites) {
    if (prerequisite === targetId) {
      return true;
    }

    if (hasPath(byId, prerequisite, targetId, seen)) {
      return true;
    }
  }

  return false;
}

describe("content graph prerequisites", () => {
  it("avoids duplicate direct prerequisites", () => {
    const duplicates = loadNodes()
      .filter((node) => new Set(node.prerequisites).size !== node.prerequisites.length)
      .map((node) => node.id);

    expect(duplicates).toEqual([]);
  });

  it("avoids redundant transitive direct prerequisites", () => {
    const nodes = loadNodes();
    const byId = new Map(nodes.map((node) => [node.id, node]));
    const redundancies: string[] = [];

    for (const node of nodes) {
      const prerequisites = [...new Set(node.prerequisites)];
      const allowedRedundant = new Set(ALLOWED_REDUNDANT_PREREQUISITES[node.id] ?? []);

      for (const directPrerequisite of prerequisites) {
        if (allowedRedundant.has(directPrerequisite)) {
          continue;
        }

        const redundantVia = prerequisites.find(
          (otherPrerequisite) =>
            otherPrerequisite !== directPrerequisite &&
            hasPath(byId, otherPrerequisite, directPrerequisite),
        );

        if (redundantVia) {
          redundancies.push(
            `${node.id}: ${directPrerequisite} is redundant via ${redundantVia}`,
          );
        }
      }
    }

    expect(redundancies).toEqual([]);
  });
});
