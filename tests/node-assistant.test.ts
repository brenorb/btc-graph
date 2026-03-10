import { describe, expect, it } from "vitest";

import {
  buildNodeAssistantPrompt,
  buildNodeAssistantTemplatePrompt,
  renderNodeAssistantSection,
  resolveNodeAssistantContext,
  toggleNodeAssistant,
} from "../src/core/node-assistant";
import type { GraphData, GraphNode } from "../src/core/types";

const SAMPLE_NODE: GraphNode = {
  id: "protocol.utxo-model",
  title: "UTXO Model",
  description: "Bitcoin tracks spendable outputs, not account balances.",
  category: "Protocol & Consensus",
  prerequisites: ["fundamentals.hash-functions"],
  resources: [],
  estimatedTime: "35m",
};

const SAMPLE_GRAPH: GraphData = {
  nodes: [
    SAMPLE_NODE,
    {
      id: "fundamentals.hash-functions",
      title: "Hash Functions",
      description: "One-way functions used across Bitcoin.",
      category: "Fundamentals",
      prerequisites: [],
      resources: [],
      estimatedTime: "20m",
    },
    {
      id: "protocol.transaction-lifecycle",
      title: "Transaction Lifecycle",
      description: "How transactions move through the network.",
      category: "Protocol & Consensus",
      prerequisites: ["protocol.utxo-model"],
      resources: [],
      estimatedTime: "45m",
    },
  ],
};

describe("toggleNodeAssistant", () => {
  it("opens when currently closed", () => {
    expect(toggleNodeAssistant(null, "protocol.utxo-model")).toBe("protocol.utxo-model");
  });

  it("closes when clicking the same node action again", () => {
    expect(toggleNodeAssistant("protocol.utxo-model", "protocol.utxo-model")).toBeNull();
  });

  it("switches to another node when needed", () => {
    expect(toggleNodeAssistant("fundamentals.hash-functions", "protocol.utxo-model")).toBe(
      "protocol.utxo-model",
    );
  });
});

describe("resolveNodeAssistantContext", () => {
  it("collects context for the selected node", () => {
    const context = resolveNodeAssistantContext({
      data: SAMPLE_GRAPH,
      node: SAMPLE_NODE,
      progressState: "learning",
      gaps: ["fundamentals.hash-functions"],
    });

    expect(context.nodeId).toBe("protocol.utxo-model");
    expect(context.progressLabel).toBe("Learning");
    expect(context.prerequisites).toEqual(["fundamentals.hash-functions"]);
    expect(context.postrequisites).toEqual(["protocol.transaction-lifecycle"]);
    expect(context.gaps).toEqual(["fundamentals.hash-functions"]);
  });
});

describe("assistant prompt builders", () => {
  it("builds a rich prompt with node context", () => {
    const context = resolveNodeAssistantContext({
      data: SAMPLE_GRAPH,
      node: SAMPLE_NODE,
      progressState: "learning",
      gaps: ["fundamentals.hash-functions"],
    });

    const prompt = buildNodeAssistantPrompt(context);
    expect(prompt).toContain("Node: UTXO Model (protocol.utxo-model)");
    expect(prompt).toContain("Category: Protocol & Consensus");
    expect(prompt).toContain("Progress state: Learning");
    expect(prompt).toContain("Missing prerequisites/gaps: fundamentals.hash-functions");
  });

  it("adds instruction flavor from template prompts", () => {
    const context = resolveNodeAssistantContext({
      data: SAMPLE_GRAPH,
      node: SAMPLE_NODE,
      progressState: null,
      gaps: [],
    });

    const nextStepsPrompt = buildNodeAssistantTemplatePrompt(context, "next_steps");
    expect(nextStepsPrompt).toContain("Give me the next 3 concepts");
  });
});

describe("renderNodeAssistantSection", () => {
  it("renders collapsed section when closed", () => {
    const context = resolveNodeAssistantContext({
      data: SAMPLE_GRAPH,
      node: SAMPLE_NODE,
      progressState: null,
      gaps: [],
    });
    const html = renderNodeAssistantSection(context, {
      open: false,
      promptValue: "",
      openChatHref: "#",
    });

    expect(html).toContain('data-node-ai-toggle="protocol.utxo-model"');
    expect(html).toContain("Ask AI about this node");
    expect(html).not.toContain("Node assistant");
    expect(html).not.toContain("Progress:");
    expect(html).not.toContain("data-node-ai-panel");
  });

  it("renders quick actions and prompt area when open", () => {
    const context = resolveNodeAssistantContext({
      data: SAMPLE_GRAPH,
      node: SAMPLE_NODE,
      progressState: "learning",
      gaps: ["fundamentals.hash-functions"],
    });
    const html = renderNodeAssistantSection(context, {
      open: true,
      promptValue: "test prompt",
      openChatHref: "https://chatgpt.com/?q=test",
    });

    expect(html).toContain('data-node-ai-panel="protocol.utxo-model"');
    expect(html).toContain('data-node-ai-template="next_steps"');
    expect(html).toContain('data-node-ai-copy="protocol.utxo-model"');
    expect(html).toContain('data-node-ai-open-chat="protocol.utxo-model"');
  });
});
