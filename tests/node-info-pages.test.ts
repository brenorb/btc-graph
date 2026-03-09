import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { writeNodeInfoPages } from "../scripts/lib/node-info-pages.mjs";

const tempDirs: string[] = [];

function createTempDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "btc-graph-node-info-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("writeNodeInfoPages", () => {
  it("writes one static /info page per node with direct prerequisite and dependent links", () => {
    const outputDir = createTempDir();

    writeNodeInfoPages({
      nodes: [
        {
          id: "fundamentals.modular-arithmetic",
          title: "Modular Arithmetic",
          description: "Arithmetic over a modulus.",
          category: "Fundamentals",
          prerequisites: [],
          resources: [],
          estimatedTime: "20m",
        },
        {
          id: "fundamentals.ecdsa",
          title: "ECDSA",
          description: "Legacy Bitcoin signature algorithm.",
          category: "Security",
          prerequisites: ["fundamentals.modular-arithmetic"],
          resources: [],
          estimatedTime: "70m",
        },
        {
          id: "fundamentals.digital-signatures",
          title: "Digital Signatures",
          description: "Signing and verification.",
          category: "Security",
          prerequisites: ["fundamentals.ecdsa"],
          resources: [],
          estimatedTime: "40m",
        },
      ],
    }, outputDir);

    const ecdsaInfoPath = path.join(outputDir, "fundamentals.ecdsa", "info", "index.html");
    expect(fs.existsSync(ecdsaInfoPath)).toBe(true);

    const html = fs.readFileSync(ecdsaInfoPath, "utf8");
    expect(html).toContain("<h1>ECDSA</h1>");
    expect(html).toContain("<p class=\"node-id\">fundamentals.ecdsa</p>");
    expect(html).toContain("Direct prerequisites (1)");
    expect(html).toContain("Direct dependents (1)");
    expect(html).toContain("../../fundamentals.modular-arithmetic/info/");
    expect(html).toContain("../../fundamentals.digital-signatures/info/");
    expect(html).toContain("../../../?selected=fundamentals.ecdsa");
  });

  it("renders empty adjacency lists explicitly when a node has no direct neighbors", () => {
    const outputDir = createTempDir();

    writeNodeInfoPages({
      nodes: [
        {
          id: "fundamentals.modular-arithmetic",
          title: "Modular Arithmetic",
          description: "Arithmetic over a modulus.",
          category: "Fundamentals",
          prerequisites: [],
          resources: [],
          estimatedTime: "20m",
        },
      ],
    }, outputDir);

    const html = fs.readFileSync(
      path.join(outputDir, "fundamentals.modular-arithmetic", "info", "index.html"),
      "utf8",
    );

    expect(html).toContain("Direct prerequisites (0)");
    expect(html).toContain("<li>None</li>");
    expect(html).toContain("Direct dependents (0)");
  });
});
