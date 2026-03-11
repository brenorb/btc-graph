import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("homepage SEO shell", () => {
  it("includes crawlable metadata, structured data, and heading content in the raw HTML", () => {
    const html = readFileSync(resolve(import.meta.dirname, "../index.html"), "utf8");

    expect(html).toContain("<title>Bitcoin Learning Graph | Structured Bitcoin Self-Study</title>");
    expect(html).toContain('name="description"');
    expect(html).toContain('name="keywords"');
    expect(html).toContain('property="og:title"');
    expect(html).toContain('name="twitter:card"');
    expect(html).toContain('rel="canonical" href="https://brenorb.com/btc-graph/"');
    expect(html).toContain('href="https://brenorb.com/btc-graph/llms.txt"');
    expect(html).toContain('https://www.googletagmanager.com/gtag/js?id=G-SV5TS1L0K9');
    expect(html).toContain('gtag("config", "G-SV5TS1L0K9")');
    expect(html).toContain('"@type": "Organization"');
    expect(html).toContain("<h1>Bitcoin Learning Graph</h1>");
    expect(html).toContain("<h2>What you can study</h2>");
    expect(html).toContain("Browse the concept library");
  });
});
