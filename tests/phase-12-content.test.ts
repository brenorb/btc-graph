import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import type { GraphNode } from "../src/core/types";

const PHASE_12_NODE_IDS = [
  "fundamentals.modular-arithmetic",
  "fundamentals.finite-fields",
  "fundamentals.fermat-little-theorem",
  "fundamentals.modular-inverse",
  "fundamentals.discrete-log-problem",
  "fundamentals.elliptic-curve-cryptography",
  "fundamentals.scalar-multiplication",
  "fundamentals.secp256k1",
  "fundamentals.ecdsa",
  "fundamentals.schnorr-signatures",
] as const;

const REQUIRED_PHASE_12_PREREQUISITES: Record<string, string[]> = {
  "fundamentals.finite-fields": ["fundamentals.modular-arithmetic"],
  "fundamentals.fermat-little-theorem": ["fundamentals.modular-exponentiation"],
  "fundamentals.modular-inverse": ["fundamentals.fermat-little-theorem"],
  "fundamentals.discrete-log-problem": [
    "fundamentals.finite-fields",
    "fundamentals.modular-exponentiation",
  ],
  "fundamentals.elliptic-curve-cryptography": ["fundamentals.discrete-log-problem"],
  "fundamentals.scalar-multiplication": ["fundamentals.elliptic-curve-cryptography"],
  "fundamentals.secp256k1": ["fundamentals.elliptic-curve-cryptography"],
  "fundamentals.ecdsa": [
    "fundamentals.secp256k1",
    "fundamentals.modular-inverse",
    "fundamentals.scalar-multiplication",
  ],
  "fundamentals.schnorr-signatures": ["fundamentals.secp256k1", "fundamentals.hash-functions"],
};

const REQUIRED_EXISTING_UPDATES: Record<string, string[]> = {
  "fundamentals.public-private-keys": ["fundamentals.elliptic-curve-cryptography"],
  "fundamentals.digital-signatures": ["fundamentals.ecdsa"],
  "protocol.taproot": ["fundamentals.schnorr-signatures"],
  "protocol.op-checksigadd": ["protocol.taproot"],
};

const ALLOWED_RESOURCE_DOMAINS = [
  "github.com",
  "developer.bitcoin.org",
  "bitcoindev.network",
  "bitcoincore.academy",
];

function loadNodes(): GraphNode[] {
  const repoRoot = process.cwd();
  const sourceDir = path.join(repoRoot, "content", "nodes");
  const files = fs
    .readdirSync(sourceDir)
    .filter((file) => file.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b));

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(sourceDir, file), "utf8");
    return JSON.parse(raw) as GraphNode;
  });
}

function hasDuplicatePrerequisites(node: GraphNode): boolean {
  return new Set(node.prerequisites).size !== node.prerequisites.length;
}

function isDescriptionTooLong(description: string): boolean {
  const sentenceCount = description
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0).length;
  return sentenceCount > 2;
}

function hasBroadResourceUrl(urlString: string): boolean {
  const url = new URL(urlString);
  const host = url.hostname.replace(/^www\./, "");
  const pathname = url.pathname;

  if (host === "github.com") {
    return !pathname.includes("/blob/");
  }

  if (host === "developer.bitcoin.org") {
    return pathname === "/" || pathname === "/devguide/" || pathname === "/devguide";
  }

  if (host === "bitcoindev.network" || host === "bitcoincore.academy") {
    return pathname === "/" || pathname === "/index.html";
  }

  return false;
}

function hasDisallowedResourceDomain(node: GraphNode): boolean {
  return node.resources.some((resource) => {
    const host = new URL(resource.url).hostname.replace(/^www\./, "");
    return !ALLOWED_RESOURCE_DOMAINS.some(
      (domain) => host === domain || host.endsWith(`.${domain}`),
    );
  });
}

describe("phase 12 foundational math and cryptography expansion", () => {
  const nodes = loadNodes();
  const byId = new Map(nodes.map((node) => [node.id, node]));

  it("includes all required phase-12 foundational ids", () => {
    const missing = PHASE_12_NODE_IDS.filter((id) => !byId.has(id));
    expect(missing).toEqual([]);
  });

  it("keeps foundational nodes concise with focused resources and strict prerequisites", () => {
    for (const nodeId of PHASE_12_NODE_IDS) {
      const node = byId.get(nodeId);
      expect(node, `${nodeId} should exist`).toBeTruthy();
      if (!node) continue;

      if (nodeId === "fundamentals.modular-arithmetic") {
        expect(node.title).toBe("Modular Arithmetic Basics");
      }

      expect(isDescriptionTooLong(node.description), `${nodeId} should use max 2 sentences`).toBe(
        false,
      );
      if (nodeId !== "fundamentals.modular-arithmetic") {
        expect(node.prerequisites.length, `${nodeId} should have prerequisites`).toBeGreaterThan(
          0,
        );
      }
      expect(hasDuplicatePrerequisites(node), `${nodeId} prerequisites should be unique`).toBe(
        false,
      );
      for (const requiredPrerequisite of REQUIRED_PHASE_12_PREREQUISITES[nodeId] ?? []) {
        expect(
          node.prerequisites,
          `${nodeId} should include prerequisite ${requiredPrerequisite}`,
        ).toContain(requiredPrerequisite);
      }

      expect(node.resources.length, `${nodeId} should have 2-4 resources`).toBeGreaterThanOrEqual(
        2,
      );
      expect(node.resources.length, `${nodeId} should have 2-4 resources`).toBeLessThanOrEqual(4);
      expect(
        hasDisallowedResourceDomain(node),
        `${nodeId} should only use approved source domains`,
      ).toBe(false);
      expect(
        node.resources.some((resource) => hasBroadResourceUrl(resource.url)),
        `${nodeId} should avoid broad source landing pages`,
      ).toBe(false);
    }
  });

  it("rewires existing nodes to depend on foundational math where needed", () => {
    for (const [nodeId, requiredPrerequisites] of Object.entries(REQUIRED_EXISTING_UPDATES)) {
      const node = byId.get(nodeId);
      expect(node, `${nodeId} should exist`).toBeTruthy();
      if (!node) continue;

      for (const prerequisite of requiredPrerequisites) {
        expect(node.prerequisites, `${nodeId} should include ${prerequisite}`).toContain(
          prerequisite,
        );
      }
    }
  });

  it("catches broad-link and long-description edge cases in fixtures", () => {
    expect(
      isDescriptionTooLong("Sentence one. Sentence two. Sentence three should fail."),
    ).toBe(true);
    expect(hasBroadResourceUrl("https://github.com/bitcoin/bips")).toBe(true);
    expect(hasBroadResourceUrl("https://bitcoincore.academy/")).toBe(true);
    expect(
      hasBroadResourceUrl("https://github.com/bitcoinbook/bitcoinbook/blob/develop/ch04_keys.adoc"),
    ).toBe(false);
  });
});
