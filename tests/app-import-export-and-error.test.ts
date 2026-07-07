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

describe("progress io and load fallback", () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`;
    window.history.replaceState({}, "", "/?selected=wallets.seed-phrases");

    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      writable: true,
      value: 1280,
    });

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

  it("exports progress as a downloadable JSON file", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => sampleData,
      }),
    );

    const createObjectURL = vi.fn().mockReturnValue("blob:progress");
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: createObjectURL,
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: revokeObjectURL,
    });

    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => undefined);

    await bootstrapApp(document.querySelector("#app"));

    document.querySelector<HTMLButtonElement>('[data-state="know_it"]')?.click();
    document.querySelector<HTMLButtonElement>("#export-progress")?.click();

    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:progress");
    expect(window.localStorage.setItem).toHaveBeenCalled();

    clickSpy.mockRestore();
  });

  it("imports valid progress entries and ignores unknown node ids", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => sampleData,
      }),
    );

    await bootstrapApp(document.querySelector("#app"));

    const input = document.querySelector<HTMLInputElement>("#import-progress-input");
    const file = new File(
      [
        JSON.stringify({
          "wallets.seed-phrases": { state: "learning", updatedAt: "2026-07-07T20:00:00Z" },
          "unknown.node": { state: "know_it", updatedAt: "2026-07-07T20:00:00Z" },
        }),
      ],
      "progress.json",
      { type: "application/json" },
    );

    Object.defineProperty(input, "files", {
      configurable: true,
      value: [file],
    });

    input?.dispatchEvent(new Event("change", { bubbles: true }));
    await new Promise((resolve) => window.setTimeout(resolve, 0));
    await new Promise((resolve) => window.setTimeout(resolve, 0));

    expect(document.querySelector<HTMLButtonElement>('[data-state="learning"]')?.classList.contains("primary")).toBe(true);
    expect(document.querySelector<HTMLElement>("#detail-content")?.textContent).toContain("Seed Phrases");
    expect(window.localStorage.setItem).toHaveBeenCalled();
  });

  it("shows a visible error state when graph loading fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    );

    await bootstrapApp(document.querySelector("#app"));

    expect(document.querySelector<HTMLElement>("#detail-content")?.textContent).toContain("Unable to load graph");
    expect(document.querySelector<HTMLElement>("#detail-content")?.textContent).toContain("500");
  });
});
