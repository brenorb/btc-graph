import { describe, expect, it } from "vitest";

import { loadProgressState, updateNodeProgress } from "../src/core/graph";

// ProgressTabs.tla NoMarkLost on the real storage helpers: two open tabs
// share localStorage, and each loaded its progress when it opened.
function sharedStorage() {
  const items = new Map<string, string>();
  return {
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => void items.set(key, value),
  };
}

describe("progress across tabs", () => {
  it("keeps a mark made in another tab", () => {
    const storage = sharedStorage();
    let tabA = loadProgressState(storage);
    let tabB = loadProgressState(storage);

    tabA = updateNodeProgress(storage, "bitcoin.utxo", { state: "know_it", updatedAt: "2026-03-03T10:00:00Z" });
    tabB = updateNodeProgress(storage, "bitcoin.mining", { state: "learning", updatedAt: "2026-03-03T10:01:00Z" });

    expect(loadProgressState(storage)).toEqual({
      "bitcoin.utxo": { state: "know_it", updatedAt: "2026-03-03T10:00:00Z" },
      "bitcoin.mining": { state: "learning", updatedAt: "2026-03-03T10:01:00Z" },
    });
    expect(tabB).toEqual(loadProgressState(storage));
    expect(tabA["bitcoin.utxo"].state).toBe("know_it");
  });

  it("clears one node without touching the others", () => {
    const storage = sharedStorage();
    updateNodeProgress(storage, "a", { state: "learning", updatedAt: "2026-03-03T10:00:00Z" });
    updateNodeProgress(storage, "b", { state: "know_it", updatedAt: "2026-03-03T10:00:00Z" });
    expect(updateNodeProgress(storage, "a", null)).toEqual({
      b: { state: "know_it", updatedAt: "2026-03-03T10:00:00Z" },
    });
  });
});
