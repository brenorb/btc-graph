import { describe, expect, it } from "vitest";

import {
  applyCategoryBulkAction,
  resolveCategoryColor,
  resolveGraphColorPalette,
  resolveGraphLayoutSettings,
  resolveProgressClass,
  resolveProgressStroke,
} from "../src/core/ui-state";

describe("phase 12 ui helpers", () => {
  describe("applyCategoryBulkAction", () => {
    it("clears hidden categories when selecting all categories", () => {
      const categories = ["Security", "Protocol & Consensus", "Mining"];
      expect(applyCategoryBulkAction(categories, "select_all")).toEqual(new Set());
    });

    it("hides every unique category when deselecting all categories", () => {
      const categories = ["Security", "Security", "Mining"];
      expect(applyCategoryBulkAction(categories, "deselect_all")).toEqual(
        new Set(["Security", "Mining"]),
      );
    });
  });

  describe("resolveGraphLayoutSettings", () => {
    it("uses a vertical-first dagre configuration", () => {
      const layout = resolveGraphLayoutSettings();

      expect(layout.name).toBe("dagre");
      expect(layout.rankDir).toBe("BT");
      expect(layout.rankSep).toBeGreaterThan(layout.nodeSep);
      expect(layout.nodeDimensionsIncludeLabels).toBe(true);
      expect(layout.animate).toBe(false);
    });

    it("packs the graph more tightly on mobile viewports", () => {
      const desktop = resolveGraphLayoutSettings();
      const mobile = resolveGraphLayoutSettings("mobile");

      expect(mobile.rankDir).toBe("BT");
      expect(mobile.rankSep).toBeLessThan(desktop.rankSep);
      expect(mobile.nodeSep).toBeLessThan(desktop.nodeSep);
      expect(mobile.spacingFactor).toBeLessThan(desktop.spacingFactor);
      expect(mobile.nodeDimensionsIncludeLabels).toBe(false);
    });
  });

  describe("resolveGraphColorPalette", () => {
    it("uses high-contrast graph text colors in dark mode", () => {
      const colors = resolveGraphColorPalette("dark");
      expect(colors.nodeLabel).toBe("#eaf1ff");
      expect(colors.link).toBe("#8cd9ff");
      expect(colors.nodeLabel).not.toBe("#243041");
    });

    it("uses dark text labels in light mode", () => {
      const colors = resolveGraphColorPalette("light");
      expect(colors.nodeLabel).toBe("#243041");
      expect(colors.link).toBe("#0f766e");
    });
  });

  describe("resolveCategoryColor", () => {
    it("keeps the nearby categories visually distinct and gives security the red slot", () => {
      expect(resolveCategoryColor("Economics")).toBe("#d97706");
      expect(resolveCategoryColor("History & Governance")).toBe("#7c3aed");
      expect(resolveCategoryColor("Economics")).not.toBe(resolveCategoryColor("History & Governance"));
      expect(resolveCategoryColor("Extension Systems")).not.toBe(
        resolveCategoryColor("Network, Relay & Client Sync"),
      );
      expect(resolveCategoryColor("Protocol & Consensus")).not.toBe(resolveCategoryColor("Wallets"));
      expect(resolveCategoryColor("Security")).toBe("#dc2626");
      expect(resolveCategoryColor("Protocol & Consensus")).toBe("#0f766e");
    });

    it("avoids using a disabled gray for extension systems or a second near-blue beside network sync", () => {
      expect(resolveCategoryColor("Extension Systems")).toBe("#c026d3");
      expect(resolveCategoryColor("Network, Relay & Client Sync")).toBe("#0284c7");
      expect(resolveCategoryColor("Extension Systems")).not.toBe("#7f7f7f");
    });
  });

  describe("resolveProgressStroke", () => {
    it("gives need-to-learn its own visible border treatment", () => {
      expect(resolveProgressStroke("need_to_learn")).toEqual({
        borderColor: "#60a5fa",
        borderWidth: 2,
      });
    });

    it("keeps learning and know-it visually distinct", () => {
      expect(resolveProgressStroke("learning")).toEqual({
        borderColor: "#f59e0b",
        borderWidth: 3,
      });
      expect(resolveProgressStroke("know_it")).toEqual({
        borderColor: "#16a34a",
        borderWidth: 3,
      });
    });
  });

  describe("resolveProgressClass", () => {
    it("keeps the default unset state visually distinct from explicit need-to-learn", () => {
      expect(resolveProgressClass(null)).toBeNull();
      expect(resolveProgressClass("need_to_learn")).toBe("state-need_to_learn");
    });
  });
});
