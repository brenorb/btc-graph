import { describe, expect, it } from "vitest";
import { collectResourceUrls } from "../scripts/lib/resource-urls.mjs";

describe("resource URL collection", () => {
  it("checks default, regional and free URLs and deduplicates their node usage", () => {
    const usage = collectResourceUrls([
      { id: "first", resources: [{ url: "https://example.com/book", regionalUrls: { BR: "https://example.com.br/book", pt: "https://example.com.br/book" }, freeUrl: "https://example.com/free" }] },
      { id: "second", resources: [{ url: "https://example.com/free" }] },
    ]);
    expect([...usage.keys()]).toEqual(["https://example.com/book", "https://example.com.br/book", "https://example.com/free"]);
    expect([...usage.get("https://example.com.br/book")]).toEqual(["first"]);
    expect([...usage.get("https://example.com/free")]).toEqual(["first", "second"]);
  });
});
