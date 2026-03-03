export type ProgressState = "need_to_learn" | "learning" | "know_it";

export interface NodeResource {
  type: "article" | "video" | "book" | "tool" | "other";
  title: string;
  url: string;
  notes?: string;
}

export interface GraphNode {
  id: string;
  title: string;
  description: string;
  category: string;
  prerequisites: string[];
  resources: NodeResource[];
  estimatedTime: string;
  tags?: string[];
  aliases?: string[];
}

export interface GraphData {
  nodes: GraphNode[];
}

export interface NodeProgressEntry {
  state: ProgressState;
  updatedAt: string;
}

export type NodeProgressState = Record<string, NodeProgressEntry>;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface FilteredGraphResult {
  visibleNodes: GraphNode[];
  contextualNodes: GraphNode[];
  visibleIds: Set<string>;
}
