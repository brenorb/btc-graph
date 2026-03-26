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

class FakeCy {
  private nodeList: FakeNode[] = [];
  private currentZoom = 1;

  elements() {
    return {
      remove: () => {
        this.nodeList = [];
      },
    };
  }

  add(elements: Array<{ data: Record<string, unknown> }>) {
    for (const element of elements) {
      if (typeof element.data.source === "string" && typeof element.data.target === "string") {
        continue;
      }

      this.nodeList.push(new FakeNode(element.data));
    }
  }

  nodes() {
    return this.nodeList;
  }

  edges() {
    return [];
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

function createStorageMock(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));

  return {
    getItem: vi.fn((key: string) => data.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      data.set(key, value);
    }),
  };
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

describe("help modal", () => {
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

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("opens the help modal on first visit and persists that the onboarding was shown", async () => {
    const storage = createStorageMock();

    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: storage,
    });

    await bootstrapApp(document.querySelector("#app"));

    const modal = document.querySelector<HTMLElement>("#help-modal");
    const closeButton = document.querySelector<HTMLButtonElement>("#help-close");
    const modalText = modal?.textContent?.replace(/\s+/g, " ").trim() ?? "";

    expect(modal?.hidden).toBe(false);
    expect(modal?.getAttribute("aria-label")).toBe("How to use this site");
    expect(modalText).toContain("public learning guide for Bitcoin self-study");
    expect(modalText).toContain("what to learn next, what can wait, and where your gaps are");
    expect(modalText).toContain("concept map organized by prerequisite relationships");
    expect(modalText).toContain("Learn the topic");
    expect(modalText).toContain("AI helper");
    expect(modalText).toContain("discover your gaps");
    expect(modalText).toContain("community-driven education project");
    expect(modalText).toContain("Bitcoin never stops evolving");
    expect(modalText).toContain("learning resources improving");
    expect(storage.setItem).toHaveBeenCalledWith("btc-graph-help-seen", "1");

    closeButton?.click();

    expect(modal?.hidden).toBe(true);
  });

  it("keeps the help modal closed after the first visit but lets the user reopen it manually", async () => {
    const storage = createStorageMock({
      "btc-graph-help-seen": "1",
    });

    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: storage,
    });

    await bootstrapApp(document.querySelector("#app"));

    const modal = document.querySelector<HTMLElement>("#help-modal");
    const trigger = document.querySelector<HTMLButtonElement>("#help-toggle");

    expect(modal?.hidden).toBe(true);
    expect(trigger?.textContent?.trim()).toBe("?");

    trigger?.click();

    expect(modal?.hidden).toBe(false);

    document.querySelector<HTMLElement>("#help-backdrop")?.click();

    expect(modal?.hidden).toBe(true);
  });
});
