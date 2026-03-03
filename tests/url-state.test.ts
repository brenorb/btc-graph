import { describe, expect, it } from "vitest";

import {
  decodeViewStateFromUrl,
  encodeViewStateToQuery,
  reconcileViewState,
  type ViewState,
} from "../src/core/url-state";

describe("encodeViewStateToQuery", () => {
  it("encodes selected id and hidden categories deterministically", () => {
    const query = encodeViewStateToQuery({
      selectedId: "protocol.utxo-model",
      hiddenCategories: new Set(["Privacy", "Fundamentals"]),
    });

    expect(query).toBe("?selected=protocol.utxo-model&hidden=Fundamentals,Privacy");
  });

  it("deduplicates and trims hidden categories before encoding", () => {
    const query = encodeViewStateToQuery({
      selectedId: null,
      hiddenCategories: new Set([" Privacy ", "Privacy", "Fundamentals", " "]),
    });

    expect(query).toBe("?hidden=Fundamentals,Privacy");
  });

  it("never encodes progress state", () => {
    const state = {
      selectedId: "node.a",
      hiddenCategories: new Set(["Category"]),
      // @ts-expect-error testing accidental extra field
      progress: { "node.a": "know_it" },
    };

    expect(encodeViewStateToQuery(state)).toBe("?selected=node.a&hidden=Category");
  });

  it("roundtrips selected id and hidden categories", () => {
    const encoded = encodeViewStateToQuery({
      selectedId: "protocol.utxo-model",
      hiddenCategories: new Set(["Privacy", "Fundamentals"]),
    });

    const decoded = decodeViewStateFromUrl(`https://example.com/${encoded}`);
    expect(decoded).toEqual<ViewState>({
      selectedId: "protocol.utxo-model",
      hiddenCategories: new Set(["Fundamentals", "Privacy"]),
    });
  });
});

describe("decodeViewStateFromUrl", () => {
  it("decodes selected and hidden filters", () => {
    const parsed = decodeViewStateFromUrl(
      "https://example.com/?selected=protocol.utxo-model&hidden=Fundamentals,Privacy",
    );
    expect(parsed).toEqual<ViewState>({
      selectedId: "protocol.utxo-model",
      hiddenCategories: new Set(["Fundamentals", "Privacy"]),
    });
  });

  it("deduplicates and trims hidden filters", () => {
    const parsed = decodeViewStateFromUrl(
      "https://example.com/?hidden=Privacy,%20Privacy,Fundamentals,%20",
    );
    expect(parsed.hiddenCategories).toEqual(new Set(["Fundamentals", "Privacy"]));
  });

  it("ignores malformed params", () => {
    const parsed = decodeViewStateFromUrl("https://example.com/?selected=%20&hidden=");
    expect(parsed).toEqual<ViewState>({
      selectedId: null,
      hiddenCategories: new Set(),
    });
  });

  it("returns empty state for empty querystring", () => {
    expect(decodeViewStateFromUrl("https://example.com/")).toEqual<ViewState>({
      selectedId: null,
      hiddenCategories: new Set(),
    });
  });

  it("returns empty state for invalid URL input", () => {
    expect(decodeViewStateFromUrl("https://example.com:invalid")).toEqual<ViewState>({
      selectedId: null,
      hiddenCategories: new Set(),
    });
  });
});

describe("reconcileViewState", () => {
  it("drops unknown categories and invalid selected node id", () => {
    const reconciled = reconcileViewState(
      {
        selectedId: "missing.node",
        hiddenCategories: new Set(["Privacy", "Unknown Category"]),
      },
      {
        validNodeIds: new Set(["protocol.utxo-model"]),
        validCategories: new Set(["Privacy", "Protocol"]),
      },
    );

    expect(reconciled).toEqual<ViewState>({
      selectedId: null,
      hiddenCategories: new Set(["Privacy"]),
    });
  });
});
