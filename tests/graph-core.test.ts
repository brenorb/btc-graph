import { describe, expect, it } from "vitest";

import {
  detectGaps,
  filterGraphByCategories,
  loadProgressState,
  reconcileSelection,
  saveProgressState,
  sanitizeProgressState,
  searchNodes,
  validateGraphData,
} from "../src/core/graph";
import type { GraphData, NodeProgressState } from "../src/core/types";

function sampleData(): GraphData {
  return {
    nodes: [
      {
        id: "fundamentals.money-properties",
        title: "Properties of Money",
        description: "Scarcity, durability, divisibility, and portability.",
        category: "Fundamentals",
        prerequisites: [],
        resources: [],
        estimatedTime: "30m",
        tags: ["money"],
        aliases: ["sound money"],
      },
      {
        id: "fundamentals.hash-basics",
        title: "Hash Functions",
        description: "One-way functions and collision resistance.",
        category: "Fundamentals",
        prerequisites: [],
        resources: [],
        estimatedTime: "45m",
        tags: ["cryptography"],
      },
      {
        id: "bitcoin.utxo",
        title: "UTXO Model",
        description: "How Bitcoin tracks ownership.",
        category: "Bitcoin Protocol",
        prerequisites: ["fundamentals.money-properties"],
        resources: [],
        estimatedTime: "45m",
      },
      {
        id: "bitcoin.block-validation",
        title: "Block Validation",
        description: "Consensus checks performed by full nodes.",
        category: "Bitcoin Protocol",
        prerequisites: ["fundamentals.hash-basics", "bitcoin.utxo"],
        resources: [],
        estimatedTime: "60m",
      },
      {
        id: "lightning.htlc",
        title: "HTLCs",
        description: "Hash Time-Locked Contracts in payment channels.",
        category: "Lightning",
        prerequisites: ["bitcoin.block-validation"],
        resources: [],
        estimatedTime: "90m",
      },
    ],
  };
}

const emptyProgress: NodeProgressState = {};

describe("validateGraphData", () => {
  it("rejects duplicate node ids", () => {
    const data = sampleData();
    data.nodes.push({ ...data.nodes[0] });
    const result = validateGraphData(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes("Duplicate node id"))).toBe(
      true,
    );
  });

  it("rejects missing required fields", () => {
    const data = sampleData();
    // @ts-expect-error test malformed node
    data.nodes.push({ id: "broken.node", category: "Broken", prerequisites: [] });
    const result = validateGraphData(data);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((error) =>
        error.includes("missing required field: title"),
      ),
    ).toBe(true);
  });

  it("does not throw when prerequisites field is missing", () => {
    const data = sampleData();
    // @ts-expect-error malformed node for validation test
    data.nodes.push({
      id: "broken.missing-prerequisites",
      title: "Broken",
      description: "Broken",
      category: "Broken",
      resources: [],
      estimatedTime: "1m",
    });
    expect(() => validateGraphData(data)).not.toThrow();
    const result = validateGraphData(data);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((error) =>
        error.includes("missing required field: prerequisites"),
      ),
    ).toBe(true);
  });

  it("rejects unknown prerequisites", () => {
    const data = sampleData();
    data.nodes[0].prerequisites = ["does-not-exist"];
    const result = validateGraphData(data);
    expect(result.valid).toBe(false);
    expect(
      result.errors.some((error) => error.includes("Unknown prerequisite")),
    ).toBe(true);
  });

  it("rejects cycles", () => {
    const data = sampleData();
    data.nodes[0].prerequisites = ["lightning.htlc"];
    const result = validateGraphData(data);
    expect(result.valid).toBe(false);
    expect(result.errors.some((error) => error.includes("Cycle detected"))).toBe(
      true,
    );
  });
});

describe("detectGaps", () => {
  it("returns no gaps when concept has no prerequisites", () => {
    const gaps = detectGaps(sampleData(), emptyProgress, "fundamentals.hash-basics");
    expect(gaps).toEqual([]);
  });

  it("returns transitive unmet prerequisites", () => {
    const gaps = detectGaps(sampleData(), emptyProgress, "lightning.htlc");
    expect(gaps).toEqual([
      "bitcoin.block-validation",
      "fundamentals.hash-basics",
      "bitcoin.utxo",
      "fundamentals.money-properties",
    ]);
  });

  it("ignores prerequisites already marked as know_it", () => {
    const progress: NodeProgressState = {
      "fundamentals.hash-basics": { state: "know_it", updatedAt: "2026-03-03" },
      "bitcoin.utxo": { state: "know_it", updatedAt: "2026-03-03" },
      "fundamentals.money-properties": { state: "know_it", updatedAt: "2026-03-03" },
    };
    const gaps = detectGaps(sampleData(), progress, "lightning.htlc");
    expect(gaps).toEqual(["bitcoin.block-validation"]);
  });
});

describe("filterGraphByCategories", () => {
  it("removes hidden categories from normal view", () => {
    const { visibleNodes } = filterGraphByCategories(sampleData(), new Set(["Fundamentals"]));
    expect(visibleNodes.some((node) => node.category === "Fundamentals")).toBe(false);
  });

  it("keeps hidden prerequisites as gray contextual nodes", () => {
    const { contextualNodes } = filterGraphByCategories(
      sampleData(),
      new Set(["Fundamentals"]),
    );
    const ids = contextualNodes.map((node) => node.id);
    expect(ids).toContain("fundamentals.money-properties");
    expect(ids).toContain("fundamentals.hash-basics");
  });
});

describe("searchNodes", () => {
  it("matches across title, description, tags, and aliases", () => {
    const results = searchNodes(sampleData(), "sound money");
    expect(results.map((node) => node.id)).toContain("fundamentals.money-properties");
  });

  it("matches case-insensitively", () => {
    const results = searchNodes(sampleData(), "hTlC");
    expect(results.map((node) => node.id)).toContain("lightning.htlc");
  });
});

describe("loadProgressState", () => {
  it("falls back to empty object on malformed JSON", () => {
    const storage = {
      getItem: () => "not-json",
      setItem: () => undefined,
    };
    expect(loadProgressState(storage)).toEqual({});
  });

  it("loads valid serialized state", () => {
    const storage = {
      getItem: () =>
        JSON.stringify({
          "bitcoin.utxo": { state: "learning", updatedAt: "2026-03-03T10:00:00Z" },
        }),
      setItem: () => undefined,
    };
    expect(loadProgressState(storage)).toEqual({
      "bitcoin.utxo": { state: "learning", updatedAt: "2026-03-03T10:00:00Z" },
    });
  });

  it("returns empty object when storage getItem throws", () => {
    const storage = {
      getItem: () => {
        throw new Error("storage denied");
      },
      setItem: () => undefined,
    };

    expect(loadProgressState(storage)).toEqual({});
  });
});

describe("sanitizeProgressState", () => {
  it("drops invalid states and malformed entries", () => {
    const sanitized = sanitizeProgressState({
      "bitcoin.utxo": { state: "learning", updatedAt: "2026-03-03T10:00:00Z" },
      "broken.state": { state: "done", updatedAt: "2026-03-03T10:00:00Z" },
      "broken.date": { state: "know_it" },
    });

    expect(sanitized).toEqual({
      "bitcoin.utxo": { state: "learning", updatedAt: "2026-03-03T10:00:00Z" },
    });
  });
});

describe("saveProgressState", () => {
  it("serializes and writes progress map", () => {
    const writes: string[] = [];
    const storage = {
      getItem: () => null,
      setItem: (_key: string, value: string) => {
        writes.push(value);
      },
    };

    const progress: NodeProgressState = {
      "bitcoin.utxo": { state: "learning", updatedAt: "2026-03-03T10:00:00Z" },
    };

    saveProgressState(storage, progress);
    expect(writes).toHaveLength(1);
    expect(JSON.parse(writes[0])).toEqual(progress);
  });

  it("does not throw when storage setItem fails", () => {
    const storage = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota exceeded");
      },
    };

    const progress: NodeProgressState = {
      "bitcoin.utxo": { state: "learning", updatedAt: "2026-03-03T10:00:00Z" },
    };

    expect(() => saveProgressState(storage, progress)).not.toThrow();
  });
});

describe("empty graph behavior", () => {
  const empty: GraphData = { nodes: [] };

  it("validates empty graph as valid", () => {
    const result = validateGraphData(empty);
    expect(result.valid).toBe(true);
  });

  it("handles empty graph in search and filtering", () => {
    expect(searchNodes(empty, "anything")).toEqual([]);
    expect(filterGraphByCategories(empty, new Set())).toEqual({
      visibleNodes: [],
      contextualNodes: [],
      visibleIds: new Set(),
    });
  });

  it("returns no gaps on empty graph", () => {
    expect(detectGaps(empty, {}, "missing.node")).toEqual([]);
  });
});

describe("reconcileSelection", () => {
  it("clears selection when selected node is not visible", () => {
    const visible = new Set(["node.a", "node.b"]);
    expect(reconcileSelection("node.hidden", visible)).toBeNull();
  });

  it("keeps selection when selected node remains visible", () => {
    const visible = new Set(["node.a", "node.b"]);
    expect(reconcileSelection("node.a", visible)).toBe("node.a");
  });
});
