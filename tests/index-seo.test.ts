import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("homepage SEO shell", () => {
  it("includes crawlable metadata, structured data, and heading content in the raw HTML", () => {
    const html = readFileSync(resolve(import.meta.dirname, "../index.html"), "utf8");
    const fallbackStyles = readFileSync(resolve(import.meta.dirname, "../public/seo-shell.css"), "utf8");

    expect(html).toContain("<title>Bitcoin Learning Graph | Structured Bitcoin Self-Study</title>");
    expect(html).toContain('name="description"');
    expect(html).toContain('name="keywords"');
    expect(html).toContain('property="og:title"');
    expect(html).toContain('name="twitter:card"');
    expect(html).toContain('rel="canonical" href="https://brenorb.com/btc-graph/"');
    expect(html).toContain('href="https://brenorb.com/btc-graph/llms.txt"');
    expect(html).toContain('rel="stylesheet" href="/seo-shell.css"');
    expect(html).toContain('"@type": "Organization"');
    expect(html).toContain("<h1>Bitcoin Learning Graph</h1>");
    expect(html).toContain("<h2>What you can study</h2>");
    expect(html).toContain("Browse the concept library");
    expect(html).toContain('srcset="/social-card.avif" type="image/avif"');
    expect(html).toContain('srcset="/social-card.webp" type="image/webp"');
    expect(html).toContain('src="/social-card.webp"');
    expect(html).toContain('alt="Preview card for the Bitcoin Learning Graph website."');
    expect(fallbackStyles).toContain("@media screen and (max-width: 820px)");
  });
});
