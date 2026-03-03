import type {
  FilteredGraphResult,
  GraphData,
  GraphNode,
  NodeProgressState,
  ProgressState,
  StorageLike,
  ValidationResult,
} from "./types";

export const PROGRESS_STORAGE_KEY = "btc-graph-progress";

const REQUIRED_NODE_FIELDS = [
  "id",
  "title",
  "description",
  "category",
  "prerequisites",
  "resources",
  "estimatedTime",
] as const;

export function validateGraphData(data: GraphData): ValidationResult {
  const errors: string[] = [];
  const nodes = data.nodes ?? [];
  const byId = new Map<string, GraphNode>();

  for (const node of nodes) {
    for (const field of REQUIRED_NODE_FIELDS) {
      if (!(field in node) || (node as Record<string, unknown>)[field] === undefined) {
        errors.push(`Node "${node.id ?? "<unknown>"}" missing required field: ${field}`);
      }
    }

    if (byId.has(node.id)) {
      errors.push(`Duplicate node id: ${node.id}`);
    } else {
      byId.set(node.id, node);
    }
  }

  for (const node of nodes) {
    const prerequisites = Array.isArray(node.prerequisites)
      ? node.prerequisites
      : [];
    for (const prerequisite of prerequisites) {
      if (!byId.has(prerequisite)) {
        errors.push(`Unknown prerequisite "${prerequisite}" referenced by "${node.id}"`);
      }
    }
  }

  const visited = new Set<string>();
  const stack = new Set<string>();

  function walk(nodeId: string) {
    if (stack.has(nodeId)) {
      errors.push(`Cycle detected at node: ${nodeId}`);
      return;
    }

    if (visited.has(nodeId)) {
      return;
    }

    visited.add(nodeId);
    stack.add(nodeId);

    const node = byId.get(nodeId);
    if (node) {
      const prerequisites = Array.isArray(node.prerequisites)
        ? node.prerequisites
        : [];
      for (const prerequisite of prerequisites) {
        walk(prerequisite);
      }
    }

    stack.delete(nodeId);
  }

  for (const node of nodes) {
    walk(node.id);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function detectGaps(
  data: GraphData,
  progress: NodeProgressState,
  nodeId: string,
): string[] {
  const byId = toNodeMap(data);
  const seen = new Set<string>();
  const gaps: string[] = [];

  function traverse(currentId: string) {
    const node = byId.get(currentId);
    if (!node) {
      return;
    }

    const prerequisites = Array.isArray(node.prerequisites) ? node.prerequisites : [];
    for (const prerequisite of prerequisites) {
      if (seen.has(prerequisite)) {
        continue;
      }

      seen.add(prerequisite);
      const state = progress[prerequisite]?.state;
      if (state !== "know_it") {
        gaps.push(prerequisite);
        traverse(prerequisite);
      }
    }
  }

  traverse(nodeId);
  return gaps;
}

export function filterGraphByCategories(
  data: GraphData,
  hiddenCategories: Set<string>,
): FilteredGraphResult {
  const byId = toNodeMap(data);
  const visibleNodes = data.nodes.filter((node) => !hiddenCategories.has(node.category));
  const contextualIds = new Set<string>();
  const queue = [...visibleNodes.map((node) => node.id)];
  const traversed = new Set<string>();

  while (queue.length > 0) {
    const currentId = queue.shift();
    if (!currentId || traversed.has(currentId)) {
      continue;
    }

    traversed.add(currentId);
    const current = byId.get(currentId);
    if (!current) {
      continue;
    }

    const prerequisites = Array.isArray(current.prerequisites)
      ? current.prerequisites
      : [];
    for (const prerequisite of prerequisites) {
      const prerequisiteNode = byId.get(prerequisite);
      if (!prerequisiteNode) {
        continue;
      }

      if (hiddenCategories.has(prerequisiteNode.category)) {
        contextualIds.add(prerequisiteNode.id);
      }

      queue.push(prerequisiteNode.id);
    }
  }

  const visibleIds = new Set(visibleNodes.map((node) => node.id));
  const contextualNodes = [...contextualIds]
    .map((id) => byId.get(id))
    .filter((node): node is GraphNode => !!node)
    .sort((a, b) => a.id.localeCompare(b.id));

  for (const contextualNode of contextualNodes) {
    visibleIds.add(contextualNode.id);
  }

  return {
    visibleNodes,
    contextualNodes,
    visibleIds,
  };
}

export function searchNodes(data: GraphData, query: string): GraphNode[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  return data.nodes.filter((node) => {
    const fields = [
      node.title,
      node.description,
      ...(node.tags ?? []),
      ...(node.aliases ?? []),
    ];
    return fields.some((field) => field.toLowerCase().includes(normalized));
  });
}

export function loadProgressState(
  storage: StorageLike | undefined,
  storageKey = PROGRESS_STORAGE_KEY,
): NodeProgressState {
  if (!storage) {
    return {};
  }

  try {
    const raw = storage.getItem(storageKey);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as unknown;
    return sanitizeProgressState(parsed);
  } catch {
    return {};
  }
}

export function saveProgressState(
  storage: StorageLike | undefined,
  progress: NodeProgressState,
  storageKey = PROGRESS_STORAGE_KEY,
) {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(storageKey, JSON.stringify(progress));
  } catch {
    // Ignore quota/security errors and keep app functional.
  }
}

export function sanitizeProgressState(input: unknown): NodeProgressState {
  if (!input || typeof input !== "object") {
    return {};
  }

  const parsed = input as Record<string, { state?: unknown; updatedAt?: unknown }>;
  const safe: NodeProgressState = {};

  for (const [nodeId, value] of Object.entries(parsed)) {
    if (
      value &&
      isProgressState(value.state) &&
      typeof value.updatedAt === "string" &&
      value.updatedAt.length > 0
    ) {
      safe[nodeId] = {
        state: value.state,
        updatedAt: value.updatedAt,
      };
    }
  }

  return safe;
}

export function reconcileSelection(
  selectedId: string | null,
  visibleIds: Set<string>,
): string | null {
  if (!selectedId) {
    return null;
  }

  return visibleIds.has(selectedId) ? selectedId : null;
}

function toNodeMap(data: GraphData): Map<string, GraphNode> {
  return new Map(data.nodes.map((node) => [node.id, node]));
}

function isProgressState(value: unknown): value is ProgressState {
  return value === "need_to_learn" || value === "learning" || value === "know_it";
}
