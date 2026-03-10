// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

import { bootstrapApp } from "../src/app";

const sampleData = {
  nodes: [
    {
      id: "fundamentals.hash-functions",
      title: "Hash Functions",
      category: "Security",
      description: "One-way functions used across Bitcoin.",
      estimatedTime: "20m",
      prerequisites: [],
      resources: [],
    },
    {
      id: "fundamentals.distributed-systems",
      title: "Distributed Systems",
      category: "Protocol & Consensus",
      description: "Shared-state coordination without central control.",
      estimatedTime: "25m",
      prerequisites: [],
      resources: [],
    },
    {
      id: "fundamentals.sybil-resistance",
      title: "Sybil Resistance",
      category: "Security",
      description: "Preventing fake-identity attacks in open systems.",
      estimatedTime: "25m",
      prerequisites: [],
      resources: [],
    },
    {
      id: "protocol.proof-of-work",
      title: "Proof of Work",
      category: "Protocol & Consensus",
      description: "Consensus via hashing.",
      estimatedTime: "30m",
      prerequisites: [
        "fundamentals.hash-functions",
        "fundamentals.distributed-systems",
        "fundamentals.sybil-resistance",
      ],
      resources: [],
    },
    {
      id: "mining.asics",
      title: "ASICs",
      category: "Mining",
      description: "Mining hardware specialization.",
      estimatedTime: "20m",
      prerequisites: ["protocol.proof-of-work"],
      resources: [],
    },
  ],
};

class FakeNode {
  private readonly payload: Record<string, unknown>;

  constructor(payload: Record<string, unknown>) {
    this.payload = payload;
  }

  id() {
    return String(this.payload.id);
  }

  data(key: string, value?: unknown) {
    if (arguments.length === 2) {
      this.payload[key] = value;
      return value;
    }

    return this.payload[key];
  }

  addClass() {
    return undefined;
  }

  removeClass() {
    return undefined;
  }

  nonempty() {
    return true;
  }
}

class FakeEdge {
  data(_key: string, value?: unknown) {
    return value;
  }
}

class FakeCy {
  private nodeList: FakeNode[] = [];
  private edgeList: FakeEdge[] = [];
  private currentZoom = 1;

  elements() {
    return {
      remove: () => {
        this.nodeList = [];
        this.edgeList = [];
      },
    };
  }

  add(elements: Array<{ data: Record<string, unknown> }>) {
    for (const element of elements) {
      if (typeof element.data.source === "string" && typeof element.data.target === "string") {
        this.edgeList.push(new FakeEdge());
        continue;
      }

      this.nodeList.push(new FakeNode(element.data));
    }
  }

  nodes() {
    return this.nodeList;
  }

  edges() {
    return this.edgeList;
  }

  layout() {
    return {
      run() {
        return undefined;
      },
    };
  }

  zoom(level?: number) {
    if (typeof level === "number") {
      this.currentZoom = level;
    }

    return this.currentZoom;
  }

  on() {
    return undefined;
  }

  animate() {
    return undefined;
  }

  resize() {
    return undefined;
  }

  fit() {
    return undefined;
  }

  getElementById(id: string) {
    const match = this.nodeList.find((node) => node.id() === id);
    return match ?? { nonempty: () => false };
  }
}

vi.mock("cytoscape", () => {
  const factory = () => new FakeCy();
  return {
    default: Object.assign(factory, {
      use: vi.fn(),
    }),
  };
});

vi.mock("cytoscape-dagre", () => ({
  default: {},
}));

describe("node detail links", () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`;
    window.history.replaceState({}, "", "/?selected=protocol.proof-of-work&hidden=Mining");

    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 1280,
    });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => sampleData,
      }),
    );

    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });

    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      value: (callback: FrameRequestCallback) => callback(0),
    });

    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: vi.fn().mockReturnValue(null),
        setItem: vi.fn(),
      },
    });
  });

  it("renders prerequisite and dependent references as links and uses the Dependents label", async () => {
    await bootstrapApp(document.querySelector("#app"));

    const detail = document.querySelector<HTMLElement>("#detail-content");
    const dependentLink = detail?.querySelector<HTMLAnchorElement>(
      'a[data-node-link-id="mining.asics"]',
    );

    expect(detail?.textContent).toContain("Dependents:");
    expect(detail?.textContent).not.toContain("Post-requisites");
    expect(dependentLink?.getAttribute("href")).toContain("?selected=mining.asics");
    expect(dependentLink?.textContent).toContain("ASICs");
  });

  it("shows only the first two gaps by default and expands the rest on demand", async () => {
    await bootstrapApp(document.querySelector("#app"));

    const detail = document.querySelector<HTMLElement>("#detail-content");
    const gaps = detail?.querySelector<HTMLElement>(".gaps");
    const gapLinks = gaps?.querySelectorAll<HTMLAnchorElement>('a[data-node-link-id]');
    const toggle = gaps?.querySelector<HTMLButtonElement>("[data-gap-toggle]");

    expect(gapLinks).toHaveLength(2);
    expect(gaps?.textContent).toContain("Hash Functions");
    expect(gaps?.textContent).toContain("Distributed Systems");
    expect(gaps?.textContent).not.toContain("Sybil Resistance");
    expect(toggle?.textContent).toContain("...");

    toggle?.click();

    const expandedGaps = detail?.querySelector<HTMLElement>(".gaps");
    const expandedGapLinks = expandedGaps?.querySelectorAll<HTMLAnchorElement>(
      'a[data-node-link-id]',
    );
    expect(expandedGapLinks).toHaveLength(3);
    expect(expandedGaps?.textContent).toContain("Sybil Resistance");
  });

  it("keeps only the progress buttons and collapses the assistant to a single action by default", async () => {
    await bootstrapApp(document.querySelector("#app"));

    const detail = document.querySelector<HTMLElement>("#detail-content");
    const progressButtons = detail?.querySelectorAll<HTMLButtonElement>(".progress-controls [data-state]");
    const assistantToggle = detail?.querySelector<HTMLButtonElement>("[data-node-ai-toggle]");

    expect(progressButtons).toHaveLength(3);
    expect(detail?.textContent).not.toContain("Progress state");
    expect(detail?.textContent).not.toContain("Selected:");
    expect(assistantToggle?.textContent).toBe("Ask AI about this node");
    expect(detail?.textContent).not.toContain("Node assistant");
    expect(detail?.querySelector("[data-node-ai-panel]")).toBeNull();

    assistantToggle?.click();

    expect(detail?.querySelector("[data-node-ai-panel]")).not.toBeNull();
    expect(detail?.textContent).toContain("Node assistant");
  });

  it("selects linked nodes from the detail panel and reveals their category when needed", async () => {
    await bootstrapApp(document.querySelector("#app"));

    const dependentLink = document.querySelector<HTMLAnchorElement>(
      '#detail-content a[data-node-link-id="mining.asics"]',
    );

    dependentLink?.click();

    expect(window.location.search).toBe("?selected=mining.asics");
    expect(document.querySelector<HTMLElement>("#detail-content")?.textContent).toContain("ASICs");
    expect(document.querySelector<HTMLElement>("#detail-content")?.textContent).toContain(
      "Prerequisites:",
    );
  });
});
