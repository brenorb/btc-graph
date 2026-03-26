// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

import { bootstrapApp } from "../src/app";

const sampleData = {
  nodes: [
    {
      id: "protocol.proof-of-work",
      title: "Proof of Work",
      category: "Protocol & Consensus",
      description: "Consensus via hashing.",
      estimatedTime: "30m",
      prerequisites: [],
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
  private readonly classes = new Set<string>();

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

  addClass(names: string) {
    for (const name of names.split(" ").filter(Boolean)) {
      this.classes.add(name);
    }
  }

  removeClass(names: string) {
    for (const name of names.split(" ").filter(Boolean)) {
      this.classes.delete(name);
    }
  }

  nonempty() {
    return true;
  }
}

class FakeEdge {
  private readonly payload: Record<string, unknown>;

  constructor(payload: Record<string, unknown>) {
    this.payload = payload;
  }

  data(key: string, value?: unknown) {
    if (arguments.length === 2) {
      this.payload[key] = value;
      return value;
    }

    return this.payload[key];
  }
}

class FakeCy {
  private nodeList: FakeNode[] = [];
  private edgeList: FakeEdge[] = [];
  private currentZoom = 1;
  fitCalls = 0;

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
        this.edgeList.push(new FakeEdge(element.data));
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
    this.fitCalls += 1;
    return undefined;
  }

  getElementById(id: string) {
    const match = this.nodeList.find((node) => node.id() === id);
    return match ?? { nonempty: () => false };
  }
}

let lastCy: FakeCy | null = null;

vi.mock("cytoscape", () => {
  const factory = () => {
    lastCy = new FakeCy();
    return lastCy;
  };
  return {
    default: Object.assign(factory, {
      use: vi.fn(),
    }),
  };
});

vi.mock("cytoscape-dagre", () => ({
  default: {},
}));

describe("desktop app shell", () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`;
    window.history.replaceState({}, "", "/");

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
        getItem: vi.fn().mockReturnValue("1"),
        setItem: vi.fn(),
      },
    });

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("shows graph zoom controls on desktop and fits the graph on first render", async () => {
    await bootstrapApp(document.querySelector("#app"));

    const controls = document.querySelector<HTMLElement>(".graph-controls");

    expect(document.querySelector<HTMLElement>(".layout")?.dataset.viewportMode).toBe("desktop");
    expect(controls).not.toBeNull();
    expect(controls?.classList.contains("mobile-only")).toBe(false);
    expect(document.querySelector<HTMLButtonElement>("#graph-zoom-in")).not.toBeNull();
    expect(document.querySelector<HTMLButtonElement>("#graph-zoom-out")).not.toBeNull();
    expect(document.querySelector<HTMLButtonElement>("#graph-zoom-fit")).not.toBeNull();
    expect(lastCy?.fitCalls).toBe(1);
  });
});
