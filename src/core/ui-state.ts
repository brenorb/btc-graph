import type { ProgressState } from "./types";

export type LabelVisibilityMode = "all" | "none";
export type ThemeMode = "light" | "dark";
export type CategoryBulkAction = "select_all" | "deselect_all";
export type ViewportMode = "desktop" | "mobile";

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

export interface ProgressStroke {
  borderColor: string;
  borderWidth: number;
}

const CATEGORY_COLOR_MAP: Record<string, string> = {
  Economics: "#d97706",
  "Extension Systems": "#2563eb",
  "History & Governance": "#7c3aed",
  Mining: "#b45309",
  "Network, Relay & Client Sync": "#0ea5e9",
  "Protocol & Consensus": "#0f766e",
  Security: "#dc2626",
  Wallets: "#059669",
};

const FALLBACK_CATEGORY_COLORS = [
  "#0f766e",
  "#2563eb",
  "#d97706",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#059669",
  "#b45309",
];

const PROGRESS_STROKES: Record<ProgressState, ProgressStroke> = {
  need_to_learn: {
    borderColor: "#2563eb",
    borderWidth: 3,
  },
  learning: {
    borderColor: "#f59e0b",
    borderWidth: 3,
  },
  know_it: {
    borderColor: "#16a34a",
    borderWidth: 3,
  },
};

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

export function resolveCategoryColor(category: string): string {
  if (category in CATEGORY_COLOR_MAP) {
    return CATEGORY_COLOR_MAP[category];
  }

  const hash = [...category].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return FALLBACK_CATEGORY_COLORS[hash % FALLBACK_CATEGORY_COLORS.length];
}

export function resolveProgressStroke(progress: ProgressState): ProgressStroke {
  return PROGRESS_STROKES[progress];
}

export function resolveGraphLayoutSettings(viewportMode: ViewportMode = "desktop"): GraphLayoutSettings {
  if (viewportMode === "mobile") {
    return {
      name: "dagre",
      rankDir: "BT",
      ranker: "tight-tree",
      nodeSep: 4,
      rankSep: 110,
      edgeSep: 2,
      spacingFactor: 0.82,
      nodeDimensionsIncludeLabels: false,
      animate: false,
    };
  }

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
