import type { GraphData, ProgressState } from "./types";

export type LabelVisibilityMode = "all" | "none";
export type ThemeMode = "light" | "dark";
export type CategoryBulkAction = "select_all" | "deselect_all";
export type ViewportMode = "desktop" | "mobile";

export const GRAPH_TITLE_GAP_MULTIPLIER = 5;

export interface GraphLayoutSettings {
  name: "dagre";
  rankDir: "BT";
  ranker: "network-simplex" | "tight-tree" | "longest-path";
  nodeSep: number;
  rankSep: number;
  edgeSep: number;
  spacingFactor: number;
  nodeDimensionsIncludeLabels: boolean;
  animate: false;
}

export interface GraphNodePosition {
  id: string;
  x: number;
  y: number;
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
  "Extension Systems": "#c026d3",
  "History & Governance": "#7c3aed",
  Mining: "#b45309",
  "Network, Relay & Client Sync": "#0284c7",
  "Protocol & Consensus": "#0f766e",
  Security: "#dc2626",
  Wallets: "#65a30d",
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
    borderColor: "#60a5fa",
    borderWidth: 2,
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

export function resolveProgressClass(progress: ProgressState | null): string | null {
  if (!progress) {
    return null;
  }

  return `state-${progress}`;
}

export function resolveGraphLayoutSettings(viewportMode: ViewportMode = "desktop"): GraphLayoutSettings {
  if (viewportMode === "mobile") {
    return {
      name: "dagre",
      rankDir: "BT",
      ranker: "network-simplex",
      nodeSep: 3,
      rankSep: 96,
      edgeSep: 2,
      spacingFactor: 0.76,
      nodeDimensionsIncludeLabels: false,
      animate: false,
    };
  }

  return {
    name: "dagre",
    rankDir: "BT",
    ranker: "network-simplex",
    nodeSep: 5,
    rankSep: 136,
    edgeSep: 3,
    spacingFactor: 0.88,
    nodeDimensionsIncludeLabels: false,
    animate: false,
  };
}

export function resolveGraphNodeDepths(data: GraphData) {
  const prerequisitesById = new Map(data.nodes.map((node) => [node.id, node.prerequisites]));
  const memo = new Map<string, number>();
  const visiting = new Set<string>();

  const visit = (nodeId: string): number => {
    if (memo.has(nodeId)) {
      return memo.get(nodeId)!;
    }

    if (visiting.has(nodeId)) {
      return 0;
    }

    visiting.add(nodeId);
    const prerequisites = prerequisitesById.get(nodeId) ?? [];
    const depth = prerequisites.length
      ? 1 + Math.max(...prerequisites.map((prerequisite) => visit(prerequisite)))
      : 0;
    visiting.delete(nodeId);
    memo.set(nodeId, depth);
    return depth;
  };

  for (const node of data.nodes) {
    visit(node.id);
  }

  return memo;
}

function resolveGraphRowGap(viewportMode: ViewportMode) {
  return viewportMode === "mobile" ? 82 : 96;
}

export function normalizeGraphNodeRows(
  data: GraphData,
  nodes: GraphNodePosition[],
  viewportMode: ViewportMode = "desktop",
): GraphNodePosition[] {
  if (nodes.length === 0) {
    return [];
  }

  const depths = resolveGraphNodeDepths(data);
  const maxDepth = Math.max(...depths.values(), 0);
  const rowGap = resolveGraphRowGap(viewportMode);

  return nodes.map((node) => ({
    ...node,
    y: (maxDepth - (depths.get(node.id) ?? 0)) * rowGap,
  }));
}

export function compactGraphNodeRows(
  data: GraphData,
  nodes: GraphNodePosition[],
  titleWidths: Map<string, number>,
  viewportMode: ViewportMode = "desktop",
): GraphNodePosition[] {
  if (nodes.length < 2) {
    return nodes;
  }

  const depths = resolveGraphNodeDepths(data);
  const minimumGap = viewportMode === "mobile" ? 30 : 32;
  const rows = new Map<number, GraphNodePosition[]>();

  for (const node of nodes) {
    const depth = depths.get(node.id) ?? 0;
    const row = rows.get(depth) ?? [];
    row.push(node);
    rows.set(depth, row);
  }

  const positionById = new Map<string, GraphNodePosition>();
  for (const row of rows.values()) {
    if (row.length < 2) {
      positionById.set(row[0].id, row[0]);
      continue;
    }

    const orderedRow = [...row].sort((left, right) => left.x - right.x);
    const originalCenter = (orderedRow[0].x + orderedRow.at(-1)!.x) / 2;
    const compactedX: number[] = [orderedRow[0].x];

    for (let index = 1; index < orderedRow.length; index += 1) {
      const previous = orderedRow[index - 1];
      const current = orderedRow[index];
      const previousTitleWidth = titleWidths.get(previous.id) ?? minimumGap / 2;
      const currentTitleWidth = titleWidths.get(current.id) ?? minimumGap / 2;
      const maximumGap = Math.max(
        minimumGap,
        GRAPH_TITLE_GAP_MULTIPLIER * Math.max(previousTitleWidth, currentTitleWidth),
      );
      compactedX.push(Math.min(current.x, compactedX[index - 1] + maximumGap));
    }

    const compactedCenter = (compactedX[0] + compactedX.at(-1)!) / 2;
    const centerOffset = originalCenter - compactedCenter;

    orderedRow.forEach((node, index) => {
      positionById.set(node.id, {
        ...node,
        x: compactedX[index] + centerOffset,
      });
    });
  }

  return nodes.map((node) => positionById.get(node.id) ?? node);
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
    nodeBorder: "#cbd5e1",
    contextualNodeFill: "#9ca3af",
    link: "#0f766e",
  };
}
