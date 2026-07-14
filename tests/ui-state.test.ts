import { describe, expect, it } from "vitest";

import {
  compactGraphNodeRows,
  deriveNextProgressState,
  normalizeGraphNodeRows,
  resolveLabelText,
  resolveInitialTheme,
  resolveNextTheme,
  type LabelVisibilityMode,
} from "../src/core/ui-state";
import type { GraphData, ProgressState } from "../src/core/types";

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

describe("normalizeGraphNodeRows", () => {
  const data: GraphData = {
    nodes: [
      {
        id: "root-a",
        title: "Root A",
        description: "",
        category: "Fundamentals",
        estimatedTime: "10m",
        prerequisites: [],
        resources: [],
      },
      {
        id: "root-b",
        title: "Root B",
        description: "",
        category: "Fundamentals",
        estimatedTime: "10m",
        prerequisites: [],
        resources: [],
      },
      {
        id: "mid-a",
        title: "Mid A",
        description: "",
        category: "Fundamentals",
        estimatedTime: "10m",
        prerequisites: ["root-a"],
        resources: [],
      },
      {
        id: "mid-b",
        title: "Mid B",
        description: "",
        category: "Fundamentals",
        estimatedTime: "10m",
        prerequisites: ["root-a", "root-b"],
        resources: [],
      },
      {
        id: "top",
        title: "Top",
        description: "",
        category: "Fundamentals",
        estimatedTime: "10m",
        prerequisites: ["mid-a"],
        resources: [],
      },
    ],
  };

  const positionedNodes = [
    { id: "root-a", x: 80, y: 640 },
    { id: "root-b", x: 320, y: 1180 },
    { id: "mid-a", x: 100, y: 460 },
    { id: "mid-b", x: 280, y: 720 },
    { id: "top", x: 160, y: 120 },
  ];

    it("keeps Dagre's x positions and aligns nodes by prerequisite depth", () => {
      const normalized = normalizeGraphNodeRows(data, positionedNodes, "desktop");
      const byId = new Map(normalized.map((node) => [node.id, node]));

      expect(byId.get("root-a")?.x).toBe(80);
      expect(byId.get("root-b")?.x).toBe(320);
      expect(byId.get("root-a")?.y).toBe(byId.get("root-b")?.y);
    expect(byId.get("mid-a")?.y).toBe(byId.get("mid-b")?.y);
    expect(byId.get("mid-a")?.y).toBeLessThan(byId.get("root-a")?.y ?? Infinity);
    expect(byId.get("top")?.y).toBeLessThan(byId.get("mid-a")?.y ?? Infinity);
    });

  it("limits large horizontal gaps within each prerequisite row", () => {
    const compacted = compactGraphNodeRows(
      data,
      [
        { id: "root-a", x: 0, y: 192 },
        { id: "root-b", x: 400, y: 192 },
        { id: "mid-a", x: 20, y: 96 },
        { id: "mid-b", x: 120, y: 96 },
        { id: "top", x: 80, y: 0 },
      ],
      new Map([
        ["root-a", 20],
        ["root-b", 30],
        ["mid-a", 20],
        ["mid-b", 20],
        ["top", 20],
      ]),
    );
    const byId = new Map(compacted.map((node) => [node.id, node]));

    expect((byId.get("root-b")?.x ?? 0) - (byId.get("root-a")?.x ?? 0)).toBe(150);
    expect((byId.get("mid-b")?.x ?? 0) - (byId.get("mid-a")?.x ?? 0)).toBe(100);
  });

  it("uses tighter row spacing on mobile", () => {
    const desktop = normalizeGraphNodeRows(data, positionedNodes, "desktop");
    const mobile = normalizeGraphNodeRows(data, positionedNodes, "mobile");
    const desktopById = new Map(desktop.map((node) => [node.id, node]));
    const mobileById = new Map(mobile.map((node) => [node.id, node]));

    const desktopGap =
      (desktopById.get("root-a")?.y ?? 0) - (desktopById.get("mid-a")?.y ?? 0);
    const mobileGap = (mobileById.get("root-a")?.y ?? 0) - (mobileById.get("mid-a")?.y ?? 0);

    expect(mobileGap).toBeLessThan(desktopGap);
  });
});
