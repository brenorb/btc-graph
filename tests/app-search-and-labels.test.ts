// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

import { bootstrapApp } from "../src/app";

const sampleData = {
  nodes: [
    {
      id: "wallets.seed-phrases",
      title: "Seed Phrases",
      category: "Wallets",
      description: "Mnemonic backups for wallet recovery.",
      estimatedTime: "20m",
      prerequisites: [],
      resources: [],
    },
    {
      id: "wallets.hardware-wallets",
      title: "Hardware Wallets",
      category: "Wallets",
      description: "Dedicated signing devices.",
      estimatedTime: "25m",
      prerequisites: ["wallets.seed-phrases"],
      resources: [],
    },
    {
      id: "mining.asics",
      title: "ASICs",
      category: "Mining",
      description: "Mining hardware specialization.",
      estimatedTime: "20m",
      prerequisites: [],
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

describe("search and label controls", () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`;
    window.history.replaceState({}, "", "/?hidden=Wallets");

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

  it("keeps hidden-category nodes discoverable through search and reveals them on selection", async () => {
    await bootstrapApp(document.querySelector("#app"));

    const input = document.querySelector<HTMLInputElement>("#search-input");
    input!.value = "seed";
    input!.dispatchEvent(new Event("input", { bubbles: true }));

    const results = Array.from(
      document.querySelectorAll<HTMLButtonElement>(".search-result"),
      (button) => button.textContent?.trim(),
    );

    expect(results).toEqual(["Seed Phrases (Wallets)"]);

    document.querySelector<HTMLButtonElement>(".search-result")?.click();

    expect(window.location.search).toBe("?selected=wallets.seed-phrases");
    expect(document.querySelector<HTMLElement>("#detail-content")?.textContent).toContain("Seed Phrases");
  });

  it("shows labels by default and lets the user hide and restore them explicitly", async () => {
    await bootstrapApp(document.querySelector("#app"));

    const initialLabels = lastCy?.nodes().map((node) => node.data("label"));
    expect(initialLabels?.some((label) => typeof label === "string" && label.length > 0)).toBe(true);

    document.querySelector<HTMLButtonElement>("#hide-labels")?.click();
    const hiddenLabels = lastCy?.nodes().map((node) => node.data("label"));
    expect(hiddenLabels?.every((label) => label === "")).toBe(true);

    document.querySelector<HTMLButtonElement>("#show-labels")?.click();
    const shownLabels = lastCy?.nodes().map((node) => node.data("label"));
    expect(shownLabels?.some((label) => typeof label === "string" && label.length > 0)).toBe(true);
  });
});
