import type { ProgressState } from "./types";

export type LabelVisibilityMode = "all" | "none";
export type ThemeMode = "light" | "dark";
export type CategoryBulkAction = "select_all" | "deselect_all";

export interface GraphLayoutSettings {
  name: "dagre";
  rankDir: "BT";
  ranker: "tight-tree";
  nodeSep: number;
  rankSep: number;
  edgeSep: number;
  spacingFactor: number;
  nodeDimensionsIncludeLabels: boolean;
  animate: false;
}

export interface GraphColorPalette {
  nodeLabel: string;
  labelBackground: string;
  edge: string;
  nodeBorder: string;
  contextualNodeFill: string;
  link: string;
}

export function resolveLabelText(
  mode: LabelVisibilityMode,
  title: string,
  _isHovered: boolean,
): string {
  if (mode === "all") {
    return title;
  }

  return "";
}

export function deriveNextProgressState(
  current: ProgressState | null,
  clicked: ProgressState,
): ProgressState | null {
  if (current === clicked) {
    return null;
  }

  return clicked;
}

export function resolveInitialTheme(
  storedTheme: string | null,
  prefersDark: boolean,
): ThemeMode {
  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  return prefersDark ? "dark" : "light";
}

export function resolveNextTheme(currentTheme: ThemeMode): ThemeMode {
  return currentTheme === "dark" ? "light" : "dark";
}

export function applyCategoryBulkAction(
  categories: string[],
  action: CategoryBulkAction,
): Set<string> {
  if (action === "select_all") {
    return new Set<string>();
  }

  return new Set(categories);
}

export function resolveGraphLayoutSettings(): GraphLayoutSettings {
  return {
    name: "dagre",
    rankDir: "BT",
    ranker: "tight-tree",
    nodeSep: 8,
    rankSep: 170,
    edgeSep: 4,
    spacingFactor: 1,
    nodeDimensionsIncludeLabels: true,
    animate: false,
  };
}

export function resolveGraphColorPalette(theme: ThemeMode): GraphColorPalette {
  if (theme === "dark") {
    return {
      nodeLabel: "#eaf1ff",
      labelBackground: "#0f1829",
      edge: "#8fa3c8",
      nodeBorder: "#243e63",
      contextualNodeFill: "#6b7280",
      link: "#8cd9ff",
    };
  }

  return {
    nodeLabel: "#243041",
    labelBackground: "#f8fbff",
    edge: "#b4becf",
    nodeBorder: "#ffffff",
    contextualNodeFill: "#9ca3af",
    link: "#0f766e",
  };
}
