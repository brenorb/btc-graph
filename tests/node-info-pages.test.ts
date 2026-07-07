import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { JSDOM } from "jsdom";
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
          resources: [
            {
              type: "article",
              title: "ECDSA primer",
              url: "https://example.com/ecdsa",
              regionalUrls: {
                BR: "https://example.com.br/ecdsa",
              },
              notes: "Short walk-through.",
            },
          ],
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
    expect(html).toContain("Curated resources (1)");
    expect(html).toContain("Direct prerequisites (1)");
    expect(html).toContain("Direct dependents (1)");
    expect(html).toContain("../../fundamentals.modular-arithmetic/info/");
    expect(html).toContain("../../fundamentals.digital-signatures/info/");
    expect(html).toContain("../../../?selected=fundamentals.ecdsa");
    expect(html).toContain('href="/node-info-page.css"');
    expect(html).toContain("https://btc-graph.brenorb.com/nodes/fundamentals.ecdsa/info/");
    expect(html).toContain("Browse the concept library");
    expect(html).toContain("ECDSA primer");
  });

  it("resolves regional resource links in static /info pages at runtime", () => {
    const outputDir = createTempDir();

    writeNodeInfoPages({
      nodes: [
        {
          id: "fundamentals.ecdsa",
          title: "ECDSA",
          description: "Legacy Bitcoin signature algorithm.",
          category: "Security",
          prerequisites: [],
          resources: [
            {
              type: "book",
              title: "Mastering Bitcoin",
              url: "https://www.amazon.com/dp/1491954388",
              regionalUrls: {
                BR: "https://www.amazon.com.br/dp/1491954388",
              },
            },
          ],
          estimatedTime: "70m",
        },
      ],
    }, outputDir);

    const html = fs.readFileSync(
      path.join(outputDir, "fundamentals.ecdsa", "info", "index.html"),
      "utf8",
    );

    const dom = new JSDOM(html, {
      runScripts: "dangerously",
      url: "https://btc-graph.brenorb.com/nodes/fundamentals.ecdsa/info/",
      beforeParse(window) {
        Object.defineProperty(window.navigator, "language", {
          configurable: true,
          value: "pt-BR",
        });
        Object.defineProperty(window.navigator, "languages", {
          configurable: true,
          value: ["pt-BR", "pt", "en-US"],
        });
      },
    });

    const resourceLink = dom.window.document.querySelector<HTMLAnchorElement>("[data-resource-link]");

    expect(resourceLink?.getAttribute("href")).toBe("https://www.amazon.com.br/dp/1491954388");
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

    expect(html).toContain("Resources for this concept have not been curated yet.");
    expect(html).toContain("Direct prerequisites (0)");
    expect(html).toContain("<li>None</li>");
    expect(html).toContain("Direct dependents (0)");
  });
});
