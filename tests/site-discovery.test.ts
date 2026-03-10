import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  writeLibraryPage,
  writeLlmsFullText,
  writeLlmsTxt,
  writeRobotsTxt,
  writeSitemap,
} from "../scripts/lib/site-discovery.mjs";

const tempDirs = [];

function createTempDir() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "btc-graph-site-discovery-"));
  tempDirs.push(dir);
  return dir;
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

const sampleGraph = {
  nodes: [
    {
      id: "fundamentals.hash-functions",
      title: "Hash Functions",
      description: "One-way functions used across Bitcoin.",
      category: "Fundamentals",
      prerequisites: [],
      resources: [],
      estimatedTime: "20m",
    },
    {
      id: "lightning.payment-channels",
      title: "Payment Channels",
      description: "Bidirectional payment relationships used by Lightning.",
      category: "Lightning",
      prerequisites: ["fundamentals.hash-functions"],
      resources: [],
      estimatedTime: "35m",
    },
  ],
};

describe("site discovery assets", () => {
  it("writes a sitemap with the homepage, library, and node pages", () => {
    const dir = createTempDir();
    const outputFile = path.join(dir, "sitemap.xml");

    writeSitemap(sampleGraph, outputFile, "2026-03-10T00:00:00.000Z");

    const xml = fs.readFileSync(outputFile, "utf8");
    expect(xml).toContain("https://brenorb.com/btc-graph/");
    expect(xml).toContain("https://brenorb.com/btc-graph/library/");
    expect(xml).toContain("https://brenorb.com/btc-graph/nodes/fundamentals.hash-functions/info/");
    expect(xml).toContain("<lastmod>2026-03-10T00:00:00.000Z</lastmod>");
  });

  it("writes robots and llms policy files with crawl entry points", () => {
    const dir = createTempDir();
    const robotsFile = path.join(dir, "robots.txt");
    const llmsFile = path.join(dir, "llms.txt");

    writeRobotsTxt(robotsFile);
    writeLlmsTxt(llmsFile);

    const robots = fs.readFileSync(robotsFile, "utf8");
    const llms = fs.readFileSync(llmsFile, "utf8");

    expect(robots).toContain("User-agent: GPTBot");
    expect(robots).toContain("User-agent: ClaudeBot");
    expect(robots).toContain("Sitemap: https://brenorb.com/btc-graph/sitemap.xml");

    expect(llms).toContain("Canonical: https://brenorb.com/btc-graph/");
    expect(llms).toContain("Full text summary: https://brenorb.com/btc-graph/llms-full-text.txt");
    expect(llms).toContain("Bitcoin protocol");
  });

  it("writes a text-first library page and a full-text summary", () => {
    const dir = createTempDir();
    const libraryFile = path.join(dir, "library", "index.html");
    const llmsFullTextFile = path.join(dir, "llms-full-text.txt");

    writeLibraryPage(sampleGraph, libraryFile);
    writeLlmsFullText(sampleGraph, llmsFullTextFile);

    const libraryHtml = fs.readFileSync(libraryFile, "utf8");
    const fullText = fs.readFileSync(llmsFullTextFile, "utf8");

    expect(libraryHtml).toContain("<h1>Bitcoin Learning Graph Library</h1>");
    expect(libraryHtml).toContain("Hash Functions");
    expect(libraryHtml).toContain("https://brenorb.com/btc-graph/nodes/lightning.payment-channels/info/");

    expect(fullText).toContain("Bitcoin Learning Graph is a public static website");
    expect(fullText).toContain("Fundamentals (1 concepts)");
    expect(fullText).toContain("Payment Channels: Bidirectional payment relationships used by Lightning.");
  });
});
