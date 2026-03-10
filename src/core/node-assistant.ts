import type { GraphData, GraphNode, ProgressState } from "./types";

const PROGRESS_LABELS: Record<ProgressState, string> = {
  need_to_learn: "Need to learn",
  learning: "Learning",
  know_it: "Know it",
};

export type NodeAssistantTemplate =
  | "summarize"
  | "explain_like_beginner"
  | "next_steps"
  | "quiz_me";

export interface NodeAssistantContextInput {
  data: GraphData;
  node: GraphNode;
  progressState: ProgressState | null;
  gaps: string[];
}

export interface NodeAssistantContext {
  nodeId: string;
  title: string;
  description: string;
  category: string;
  estimatedTime: string;
  progressLabel: string;
  prerequisites: string[];
  postrequisites: string[];
  gaps: string[];
}

interface NodeAssistantSectionOptions {
  open: boolean;
  promptValue: string;
  openChatHref: string;
}

export function toggleNodeAssistant(openNodeId: string | null, targetNodeId: string) {
  return openNodeId === targetNodeId ? null : targetNodeId;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function resolveNodeAssistantContext(input: NodeAssistantContextInput): NodeAssistantContext {
  const { data, node, progressState, gaps } = input;

  return {
    nodeId: node.id,
    title: node.title,
    description: node.description,
    category: node.category,
    estimatedTime: node.estimatedTime,
    progressLabel: progressState ? PROGRESS_LABELS[progressState] : "Not set",
    prerequisites: [...node.prerequisites],
    postrequisites: data.nodes
      .filter((candidate) => candidate.prerequisites.includes(node.id))
      .map((candidate) => candidate.id),
    gaps: [...gaps],
  };
}

export function buildNodeAssistantPrompt(context: NodeAssistantContext) {
  return [
    "You are helping me learn Bitcoin with concise, technical explanations.",
    "",
    `Node: ${context.title} (${context.nodeId})`,
    `Category: ${context.category}`,
    `Estimated time: ${context.estimatedTime}`,
    `Progress state: ${context.progressLabel}`,
    `Description: ${context.description}`,
    `Prerequisites: ${context.prerequisites.join(", ") || "None"}`,
    `Post-requisites: ${context.postrequisites.join(", ") || "None"}`,
    `Missing prerequisites/gaps: ${context.gaps.join(", ") || "None"}`,
    "",
    "Answer with practical clarity and avoid fluff.",
  ].join("\n");
}

export function buildNodeAssistantTemplatePrompt(
  context: NodeAssistantContext,
  template: NodeAssistantTemplate,
) {
  const base = buildNodeAssistantPrompt(context);
  const instruction = (() => {
    switch (template) {
      case "summarize":
        return "Summarize this node in 5 bullet points and include one common confusion.";
      case "explain_like_beginner":
        return "Explain this as if I am new to Bitcoin, with one real transaction example.";
      case "next_steps":
        return "Give me the next 3 concepts I should learn and why each one matters.";
      case "quiz_me":
        return "Quiz me with 3 short questions and provide an answer key at the end.";
      default:
        return "Help me understand this node better.";
    }
  })();

  return `${base}\n\nTask: ${instruction}`;
}

export function renderNodeAssistantSection(
  context: NodeAssistantContext,
  options: NodeAssistantSectionOptions,
) {
  const toggleLabel = options.open ? "Hide AI assistant" : "Ask AI about this node";

  if (!options.open) {
    return `
      <section class="node-ai-collapsed">
        <button class="btn" type="button" data-node-ai-toggle="${escapeHtml(context.nodeId)}">${toggleLabel}</button>
      </section>
    `;
  }

  const base = `
    <section class="node-ai-block">
      <div class="node-ai-header">
        <h3>Node assistant</h3>
        <button class="btn" type="button" data-node-ai-toggle="${escapeHtml(context.nodeId)}">${toggleLabel}</button>
      </div>
      <div class="node-ai-panel" data-node-ai-panel="${escapeHtml(context.nodeId)}">
        <div class="meta">
          ${escapeHtml(`Progress: ${context.progressLabel} | Prereqs: ${context.prerequisites.join(", ") || "None"} | Gaps: ${context.gaps.join(", ") || "None"}`)}
        </div>
        <div class="node-ai-quick-actions">
          <button class="progress-btn" type="button" data-node-ai-template="summarize">Summarize</button>
          <button class="progress-btn" type="button" data-node-ai-template="explain_like_beginner">Explain simply</button>
          <button class="progress-btn" type="button" data-node-ai-template="next_steps">What next?</button>
          <button class="progress-btn" type="button" data-node-ai-template="quiz_me">Quiz me</button>
        </div>
        <label class="meta" for="node-ai-prompt">Prompt</label>
        <textarea id="node-ai-prompt" class="node-ai-prompt" rows="7">${escapeHtml(options.promptValue)}</textarea>
        <div class="node-ai-actions">
          <button class="btn" type="button" data-node-ai-copy="${escapeHtml(context.nodeId)}">Copy prompt</button>
          <a class="btn primary" target="_blank" rel="noreferrer" data-node-ai-open-chat="${escapeHtml(context.nodeId)}" href="${escapeHtml(options.openChatHref)}">Open chat</a>
        </div>
      </div>
    </section>
  `;

  return base;
}
