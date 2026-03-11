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
      resources: [
        {
          type: "article",
          title: "Whitepaper",
          url: "https://bitcoin.org/bitcoin.pdf",
        },
      ],
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

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
}

describe("mobile app shell", () => {
  beforeEach(() => {
    document.body.innerHTML = `<div id="app"></div>`;
    window.history.replaceState({}, "", "/");
    setViewportWidth(390);

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

    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("opens the detail sheet from the URL and closes it from the close button on mobile", async () => {
    window.history.replaceState({}, "", "/?selected=protocol.proof-of-work");

    await bootstrapApp(document.querySelector("#app"));

    const panel = document.querySelector<HTMLElement>("#detail-panel");
    const closeButton = document.querySelector<HTMLButtonElement>("#detail-close");

    expect(document.querySelector<HTMLElement>(".layout")?.dataset.viewportMode).toBe("mobile");
    expect(panel?.classList.contains("open")).toBe(true);
    expect(closeButton).not.toBeNull();

    closeButton?.click();

    expect(panel?.classList.contains("open")).toBe(false);
    expect(window.location.search).toBe("");
  });

  it("opens and closes the mobile tools drawer", async () => {
    await bootstrapApp(document.querySelector("#app"));

    const toggle = document.querySelector<HTMLButtonElement>("#mobile-tools-toggle");
    const close = document.querySelector<HTMLButtonElement>("#mobile-tools-close");
    const panel = document.querySelector<HTMLElement>("#mobile-tools-panel");

    expect(toggle?.getAttribute("aria-expanded")).toBe("false");

    toggle?.click();
    expect(panel?.classList.contains("open")).toBe(true);
    expect(toggle?.getAttribute("aria-expanded")).toBe("true");

    close?.click();
    expect(panel?.classList.contains("open")).toBe(false);
    expect(toggle?.getAttribute("aria-expanded")).toBe("false");
  });

  it("adds mobile graph zoom controls", async () => {
    await bootstrapApp(document.querySelector("#app"));

    document.querySelector<HTMLButtonElement>("#graph-zoom-in")?.click();
    expect(lastCy?.zoom()).toBeGreaterThan(1);

    document.querySelector<HTMLButtonElement>("#graph-zoom-fit")?.click();
    expect(lastCy?.fitCalls).toBe(1);
  });

  it("renders the ask-ai action below resources in the detail panel", async () => {
    window.history.replaceState({}, "", "/?selected=protocol.proof-of-work");

    await bootstrapApp(document.querySelector("#app"));

    const detailText = document.querySelector<HTMLElement>("#detail-content")?.textContent ?? "";
    const resourcesIndex = detailText.indexOf("Resources");
    const assistantIndex = detailText.indexOf("Ask AI about this node");

    expect(resourcesIndex).toBeGreaterThan(-1);
    expect(assistantIndex).toBeGreaterThan(resourcesIndex);
  });

  it("opens the Lightning donation modal from the mobile tools drawer", async () => {
    await bootstrapApp(document.querySelector("#app"));

    document.querySelector<HTMLButtonElement>("#mobile-tools-toggle")?.click();
    document.querySelector<HTMLButtonElement>('[data-donate-trigger="mobile"]')?.click();

    expect(document.querySelector<HTMLElement>("#mobile-tools-panel")?.classList.contains("open")).toBe(
      false,
    );
    expect(document.querySelector<HTMLElement>("#donate-modal")?.hidden).toBe(false);
    expect(document.querySelector<HTMLElement>("#donate-address")?.textContent).toBe(
      "breno@bipa.app",
    );
  });
});
