import { describe, expect, it } from "vitest";

import {
  deriveNextProgressState,
  resolveLabelText,
  resolveInitialTheme,
  resolveNextTheme,
  type LabelVisibilityMode,
} from "../src/core/ui-state";
import type { ProgressState } from "../src/core/types";

describe("resolveLabelText", () => {
  const title = "UTXO Model";

  it("shows labels in all mode regardless of hover state", () => {
    const mode: LabelVisibilityMode = "all";
    expect(resolveLabelText(mode, title, false)).toBe(title);
    expect(resolveLabelText(mode, title, true)).toBe(title);
  });

  it("hides labels in none mode even if hovered", () => {
    const mode: LabelVisibilityMode = "none";
    expect(resolveLabelText(mode, title, false)).toBe("");
    expect(resolveLabelText(mode, title, true)).toBe("");
  });
});

describe("deriveNextProgressState", () => {
  const learning: ProgressState = "learning";
  const knowIt: ProgressState = "know_it";

  it("sets selected state when there is no explicit state", () => {
    expect(deriveNextProgressState(null, learning)).toBe(learning);
  });

  it("removes explicit state when clicking the active state", () => {
    expect(deriveNextProgressState(learning, learning)).toBeNull();
  });

  it("switches states when clicking a different option", () => {
    expect(deriveNextProgressState(learning, knowIt)).toBe(knowIt);
  });
});

describe("theme helpers", () => {
  it("uses a valid stored theme value when present", () => {
    expect(resolveInitialTheme("dark", false)).toBe("dark");
    expect(resolveInitialTheme("light", true)).toBe("light");
  });

  it("falls back to preference when stored theme is missing or invalid", () => {
    expect(resolveInitialTheme(null, true)).toBe("dark");
    expect(resolveInitialTheme("broken", false)).toBe("light");
  });

  it("toggles to the opposite theme", () => {
    expect(resolveNextTheme("dark")).toBe("light");
    expect(resolveNextTheme("light")).toBe("dark");
  });
});
