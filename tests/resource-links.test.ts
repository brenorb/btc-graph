import { describe, expect, it } from "vitest";

import { buildRegionalUrlCandidates, resolveResourceUrl } from "../src/core/resource-links";
import type { NodeResource } from "../src/core/types";

describe("buildRegionalUrlCandidates", () => {
  it("prioritizes exact locale, then country, then language", () => {
    expect(buildRegionalUrlCandidates(["pt-BR"])).toEqual(["pt-br", "br", "pt"]);
  });

  it("deduplicates equivalent locale variants", () => {
    expect(buildRegionalUrlCandidates(["pt_BR", "pt-BR", "pt"])).toEqual(["pt-br", "br", "pt"]);
  });
});

describe("resolveResourceUrl", () => {
  const resource: NodeResource = {
    type: "book",
    title: "Mastering Bitcoin",
    url: "https://www.amazon.com/dp/1491954388",
    regionalUrls: {
      BR: "https://www.amazon.com.br/dp/1491954388",
      pt: "https://example.com/pt/mastering-bitcoin",
    },
  };

  it("uses an exact locale match when available", () => {
    expect(
      resolveResourceUrl(
        {
          ...resource,
          regionalUrls: {
            "pt-BR": "https://example.com/pt-br/mastering-bitcoin",
            BR: "https://www.amazon.com.br/dp/1491954388",
          },
        },
        ["pt-BR"],
      ),
    ).toBe("https://example.com/pt-br/mastering-bitcoin");
  });

  it("falls back to a country-specific match", () => {
    expect(resolveResourceUrl(resource, ["pt-BR"])).toBe("https://www.amazon.com.br/dp/1491954388");
  });

  it("falls back to a language-specific match", () => {
    expect(
      resolveResourceUrl(
        {
          ...resource,
          regionalUrls: {
            pt: "https://example.com/pt/mastering-bitcoin",
          },
        },
        ["pt-PT"],
      ),
    ).toBe("https://example.com/pt/mastering-bitcoin");
  });

  it("returns the default url when no regional match exists", () => {
    expect(resolveResourceUrl(resource, ["en-US"])).toBe("https://www.amazon.com/dp/1491954388");
  });
});
