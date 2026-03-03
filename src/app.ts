import cytoscape from "cytoscape";
import dagre from "cytoscape-dagre";

import {
  detectGaps,
  filterGraphByCategories,
  loadProgressState,
  reconcileSelection,
  sanitizeProgressState,
  saveProgressState,
  searchNodes,
  validateGraphData,
} from "./core/graph";
import {
  decodeViewStateFromUrl,
  encodeViewStateToQuery,
  reconcileViewState,
} from "./core/url-state";
import type {
  GraphData,
  GraphNode,
  NodeProgressState,
  ProgressState,
  StorageLike,
} from "./core/types";

cytoscape.use(dagre);

const CATEGORY_PALETTE = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#17becf",
  "#bcbd22",
  "#7f7f7f",
];

const PROGRESS_LABELS: Record<ProgressState, string> = {
  need_to_learn: "Need to learn",
  learning: "Learning",
  know_it: "Know it",
};

interface AppState {
  data: GraphData;
  nodeById: Map<string, GraphNode>;
  hiddenCategories: Set<string>;
  selectedId: string | null;
  progress: NodeProgressState;
  cy: cytoscape.Core;
  categories: string[];
  categoryColors: Map<string, string>;
  storage: StorageLike | undefined;
}

function buildIssueUrl(title: string, body: string) {
  return `https://github.com/brenorb/btc-graph/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}

function getCategoryColor(category: string, map: Map<string, string>) {
  if (map.has(category)) {
    return map.get(category)!;
  }

  const hash = [...category].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const color = CATEGORY_PALETTE[hash % CATEGORY_PALETTE.length];
  map.set(category, color);
  return color;
}

async function fetchGraphData() {
  const url = `${import.meta.env.BASE_URL}data/graph.json`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load graph data (${response.status})`);
  }

  const data = (await response.json()) as GraphData;
  const validation = validateGraphData(data);
  if (!validation.valid) {
    throw new Error(validation.errors.join("\n"));
  }

  return data;
}

function formatNodeOption(node: GraphNode) {
  return `${node.title} (${node.category})`;
}

function createLayout(root: HTMLElement) {
  root.innerHTML = `
    <div class="layout">
      <header class="header">
        <div class="brand">
          <div class="brand-kicker">Proof of Learning</div>
          <h1 class="brand-title">Bitcoin Knowledge Atlas</h1>
          <p class="brand-subtitle">Map prerequisites, surface gaps, and build Bitcoin understanding with intent.</p>
          <div class="brand-pill-row">
            <div class="brand-pill"><span id="total-concepts">0</span> concepts</div>
            <div class="brand-pill"><span id="total-categories">0</span> branches</div>
          </div>
        </div>
        <div class="header-actions">
          <a class="btn" target="_blank" rel="noreferrer" id="add-concept-link">Add concept</a>
          <a class="btn" target="_blank" rel="noreferrer" id="generic-change-link">Generic change</a>
          <a class="btn" target="_blank" rel="noreferrer" href="https://github.com/sponsors/brenorb">Donate</a>
          <button class="icon-btn" id="theme-toggle" aria-label="Toggle theme"></button>
        </div>
      </header>

      <section class="main-panel">
        <div class="controls">
          <div class="floating">
            <label class="field-label" for="search-input">Find concept</label>
            <input type="search" id="search-input" placeholder="Search concepts..." autocomplete="off" />
            <div id="search-results" class="search-results" role="listbox"></div>
          </div>
          <div class="control-actions">
            <button class="btn" id="clear-filters">Reset filters</button>
            <button class="btn" id="export-progress">Export progress</button>
            <label class="btn" for="import-progress-input">Import progress</label>
            <input id="import-progress-input" type="file" accept="application/json" hidden />
          </div>
        </div>
        <div class="overview-strip">
          <div class="overview-item">
            <div class="overview-label">Visible nodes</div>
            <div class="overview-value" id="visible-nodes-count">0</div>
          </div>
          <div class="overview-item">
            <div class="overview-label">Hidden branches</div>
            <div class="overview-value" id="hidden-categories-count">0</div>
          </div>
          <div class="overview-item">
            <div class="overview-label">Mastered nodes</div>
            <div class="overview-value" id="mastered-nodes-count">0</div>
          </div>
        </div>
        <div class="controls legend" id="legend"></div>
        <div id="graph"></div>
      </section>

      <aside class="detail-panel" id="detail-panel">
        <div class="mobile-sheet-handle"></div>
        <div id="detail-content" class="meta">Select a node to inspect prerequisites, resources, and progress.</div>
      </aside>
    </div>
  `;

  const addConceptLink = root.querySelector<HTMLAnchorElement>("#add-concept-link");
  const genericChangeLink = root.querySelector<HTMLAnchorElement>("#generic-change-link");

  if (addConceptLink) {
    addConceptLink.href = buildIssueUrl(
      "Add concept",
      [
        "## New concept",
        "- Title:",
        "- Proposed id:",
        "- Category:",
        "- Description:",
        "",
        "## Dependencies",
        "- Prerequisite node ids:",
        "- Related/attached node ids:",
        "",
        "## Resources",
        "- Resource links:",
      ].join("\n"),
    );
  }

  if (genericChangeLink) {
    genericChangeLink.href = buildIssueUrl(
      "Generic graph change",
      [
        "## What should change?",
        "",
        "## Why?",
        "",
        "## Optional references",
        "",
      ].join("\n"),
    );
  }
}

function syncHeaderStats(state: AppState, root: HTMLElement) {
  const totalConcepts = root.querySelector<HTMLElement>("#total-concepts");
  const totalCategories = root.querySelector<HTMLElement>("#total-categories");
  if (totalConcepts) {
    totalConcepts.textContent = String(state.data.nodes.length);
  }
  if (totalCategories) {
    totalCategories.textContent = String(state.categories.length);
  }
}

function syncOverviewStats(state: AppState, root: HTMLElement, visibleNodeCount: number) {
  const visible = root.querySelector<HTMLElement>("#visible-nodes-count");
  const hidden = root.querySelector<HTMLElement>("#hidden-categories-count");
  const mastered = root.querySelector<HTMLElement>("#mastered-nodes-count");

  if (visible) {
    visible.textContent = String(visibleNodeCount);
  }
  if (hidden) {
    hidden.textContent = String(state.hiddenCategories.size);
  }
  if (mastered) {
    mastered.textContent = String(
      Object.values(state.progress).filter((entry) => entry.state === "know_it").length,
    );
  }
}

function getStrictVisibleNodeCount(state: AppState) {
  return state.cy.nodes().filter((node) => !Boolean(node.data("contextual"))).length;
}

function setThemeButtonLabel(button: HTMLButtonElement | null, theme: string) {
  if (!button) return;

  button.textContent = theme === "dark" ? "Light" : "Dark";
  button.title = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
}

function getSafeStorage(): StorageLike | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function themeSetup(root: HTMLElement, storage: StorageLike | undefined) {
  const stored = storage?.getItem("btc-graph-theme") ?? null;
  const preferredDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = stored ?? (preferredDark ? "dark" : "light");
  root.dataset.theme = theme;

  const button = root.querySelector<HTMLButtonElement>("#theme-toggle");
  setThemeButtonLabel(button, theme);
  button?.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = nextTheme;
    setThemeButtonLabel(button, nextTheme);
    try {
      storage?.setItem("btc-graph-theme", nextTheme);
    } catch {
      // Ignore storage write failures (private mode, quota, policy).
    }
  });
}

function setProgress(state: AppState, nodeId: string, next: ProgressState) {
  state.progress[nodeId] = {
    state: next,
    updatedAt: new Date().toISOString(),
  };
  saveProgressState(state.storage, state.progress);
}

function renderLegend(state: AppState, root: HTMLElement, onChange: () => void) {
  const legend = root.querySelector<HTMLElement>("#legend");
  if (!legend) return;

  legend.innerHTML = "";
  for (const category of state.categories) {
    const item = document.createElement("button");
    const isHidden = state.hiddenCategories.has(category);
    item.className = `legend-item${isHidden ? " off" : ""}`;
    item.type = "button";
    item.innerHTML = `<span class="legend-dot" style="background:${getCategoryColor(category, state.categoryColors)}"></span>${category}`;
    item.addEventListener("click", () => {
      if (state.hiddenCategories.has(category)) {
        state.hiddenCategories.delete(category);
      } else {
        state.hiddenCategories.add(category);
      }
      onChange();
    });
    legend.appendChild(item);
  }
}

function renderDetails(state: AppState, root: HTMLElement) {
  const detail = root.querySelector<HTMLElement>("#detail-content");
  const panel = root.querySelector<HTMLElement>("#detail-panel");
  if (!detail || !panel) return;

  if (!state.selectedId) {
    panel.classList.remove("open");
    detail.className = "meta";
    detail.textContent = "Select a node to inspect prerequisites, resources, and progress.";
    return;
  }

  const node = state.nodeById.get(state.selectedId);
  if (!node) {
    return;
  }

  panel.classList.add("open");

  const currentState = state.progress[node.id]?.state ?? "need_to_learn";
  const gaps = detectGaps(state.data, state.progress, node.id);

  const resources =
    node.resources.length > 0
      ? `<div class="resources">${node.resources
          .map(
            (resource) => `
              <div class="resource">
                <div class="resource-type">${resource.type}</div>
                <a href="${resource.url}" target="_blank" rel="noreferrer">${resource.title}</a>
                ${resource.notes ? `<div class="meta">${resource.notes}</div>` : ""}
              </div>
            `,
          )
          .join("")}</div>`
      : `<div class="meta">No resources curated yet.</div>`;

  detail.className = "";
  detail.innerHTML = `
    <div class="detail-heading">
      <div>
        <h2 class="detail-title">${node.title}</h2>
        <div class="meta">${node.category} • Estimated ${node.estimatedTime}</div>
      </div>
      <a class="btn" target="_blank" rel="noreferrer" href="${buildIssueUrl(
        `Suggest change: ${node.title}`,
        [
          `## Node`,
          `- id: ${node.id}`,
          `- title: ${node.title}`,
          "",
          "## What should change?",
          "",
          "## Why?",
          "",
          "## Suggested resources",
          "",
        ].join("\n"),
      )}">Suggest change</a>
    </div>
    <p>${node.description}</p>
    <div class="meta"><strong>Prerequisites:</strong> ${node.prerequisites.join(", ") || "None"}</div>
    <div class="meta"><strong>Unlocks:</strong> ${state.data.nodes
      .filter((candidate) => candidate.prerequisites.includes(node.id))
      .map((candidate) => candidate.id)
      .join(", ") || "None"}</div>

    ${
      gaps.length > 0
        ? `<div class="gaps"><h3>Gaps to fill</h3><div>${gaps.join(", ")}</div></div>`
        : ""
    }

    <div>
      <div class="meta">Progress state</div>
      <div class="progress-controls">
        ${Object.entries(PROGRESS_LABELS)
          .map(([value, label]) => {
            const active = currentState === value;
            return `<button class="progress-btn ${active ? "primary" : ""}" data-state="${value}">${label}</button>`;
          })
          .join("")}
      </div>
    </div>

    <div>
      <h3>Resources</h3>
      ${resources}
    </div>
  `;

  detail.querySelectorAll<HTMLButtonElement>("[data-state]").forEach((button) => {
    button.addEventListener("click", () => {
      const next = button.dataset.state as ProgressState;
      setProgress(state, node.id, next);
      renderDetails(state, root);
      syncNodeClasses(state);
      syncOverviewStats(state, root, getStrictVisibleNodeCount(state));
    });
  });
}

function syncNodeClasses(state: AppState) {
  for (const node of state.cy.nodes()) {
    node.removeClass("state-need_to_learn state-learning state-know_it contextual");

    const id = node.id();
    const progress = state.progress[id]?.state ?? "need_to_learn";
    node.addClass(`state-${progress}`);
    if (node.data("contextual")) {
      node.addClass("contextual");
    }
  }
}

function refreshLabels(state: AppState) {
  const zoom = state.cy.zoom();
  const showAll = zoom >= 1.15;
  for (const node of state.cy.nodes()) {
    const title = node.data("title");
    const isHovered = Boolean(node.data("hovered"));
    node.data("label", showAll || isHovered ? title : "");
  }
}

function renderSearch(state: AppState, root: HTMLElement) {
  const input = root.querySelector<HTMLInputElement>("#search-input");
  const list = root.querySelector<HTMLElement>("#search-results");
  if (!input || !list) return;

  const value = input.value.trim();
  if (!value) {
    list.innerHTML = "";
    list.classList.remove("open");
    return;
  }

  const results = searchNodes(state.data, value)
    .filter((node) => !state.hiddenCategories.has(node.category))
    .slice(0, 20);
  list.innerHTML = "";
  list.classList.toggle("open", results.length > 0);

  for (const node of results) {
    const button = document.createElement("button");
    button.className = "search-result";
    button.textContent = formatNodeOption(node);
    button.type = "button";
    button.addEventListener("click", () => {
      state.selectedId = node.id;
      const graphNode = state.cy.getElementById(node.id);
      if (graphNode.nonempty()) {
        state.cy.animate({
          center: { eles: graphNode },
          zoom: Math.max(state.cy.zoom(), 1.25),
          duration: 280,
        });
      }
      renderDetails(state, root);
      refreshLabels(state);
      list.classList.remove("open");
      input.value = "";
      syncUrlState(state);
    });
    list.appendChild(button);
  }
}

function computeElements(state: AppState) {
  const filtered = filterGraphByCategories(state.data, state.hiddenCategories);
  const contextualIds = new Set(filtered.contextualNodes.map((node) => node.id));
  const strictVisibleIds = new Set(filtered.visibleNodes.map((node) => node.id));

  const nodes = [...filtered.visibleNodes, ...filtered.contextualNodes].map((node) => ({
    data: {
      id: node.id,
      title: node.title,
      category: node.category,
      label: "",
      contextual: contextualIds.has(node.id),
      color: contextualIds.has(node.id)
        ? "#9ca3af"
        : getCategoryColor(node.category, state.categoryColors),
    },
  }));

  const visibleIds = filtered.visibleIds;
  const edges = state.data.nodes.flatMap((node) =>
    node.prerequisites
      .filter((prerequisite) => visibleIds.has(prerequisite) && visibleIds.has(node.id))
      .map((prerequisite) => ({
        data: {
          id: `${prerequisite}->${node.id}`,
          source: prerequisite,
          target: node.id,
        },
      })),
  );

  return { nodes, edges, strictVisibleIds };
}

function wireExportImport(state: AppState, root: HTMLElement) {
  root.querySelector<HTMLButtonElement>("#export-progress")?.addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(state.progress, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "btc-graph-progress.json";
    link.click();
    URL.revokeObjectURL(url);
  });

  root
    .querySelector<HTMLInputElement>("#import-progress-input")
    ?.addEventListener("change", async (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      try {
        const text = await file.text();
        const parsed = sanitizeProgressState(JSON.parse(text));
        for (const [id, entry] of Object.entries(parsed)) {
          if (state.nodeById.has(id)) {
            state.progress[id] = entry;
          }
        }
        saveProgressState(state.storage, state.progress);
        renderDetails(state, root);
        syncNodeClasses(state);
        syncOverviewStats(state, root, getStrictVisibleNodeCount(state));
      } catch {
        window.alert("Invalid progress file.");
      } finally {
        target.value = "";
      }
    });
}

function readViewStateFromUrl(state: AppState) {
  return reconcileViewState(decodeViewStateFromUrl(window.location.href), {
    validNodeIds: new Set(state.nodeById.keys()),
    validCategories: new Set(state.categories),
  });
}

function syncUrlState(state: AppState) {
  const query = encodeViewStateToQuery({
    selectedId: state.selectedId,
    hiddenCategories: state.hiddenCategories,
  });
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const next = `${window.location.pathname}${query}${window.location.hash}`;
  if (current !== next) {
    window.history.replaceState(null, "", next);
  }
}

function rerenderGraph(state: AppState, root: HTMLElement) {
  const elements = computeElements(state);
  state.selectedId = reconcileSelection(state.selectedId, elements.strictVisibleIds);
  state.cy.elements().remove();
  state.cy.add([...elements.nodes, ...elements.edges]);
  syncNodeClasses(state);

  state.cy.layout({
    name: "dagre",
    rankDir: "BT",
    nodeSep: 34,
    rankSep: 48,
    edgeSep: 12,
    animate: false,
  }).run();

  refreshLabels(state);
  syncOverviewStats(state, root, elements.strictVisibleIds.size);
  renderLegend(state, root, () => rerenderGraph(state, root));
  renderDetails(state, root);
  syncUrlState(state);
}

function wireInteractions(state: AppState, root: HTMLElement) {
  state.cy.on("tap", "node", (event) => {
    const id = event.target.id();
    state.selectedId = id;
    renderDetails(state, root);
    refreshLabels(state);
    syncUrlState(state);
  });

  state.cy.on("mouseover", "node", (event) => {
    event.target.data("hovered", true);
    refreshLabels(state);
  });

  state.cy.on("mouseout", "node", (event) => {
    event.target.data("hovered", false);
    refreshLabels(state);
  });

  state.cy.on("zoom", () => {
    refreshLabels(state);
  });

  root.querySelector<HTMLInputElement>("#search-input")?.addEventListener("input", () => {
    renderSearch(state, root);
  });

  root.querySelector<HTMLButtonElement>("#clear-filters")?.addEventListener("click", () => {
    state.hiddenCategories.clear();
    rerenderGraph(state, root);
  });

  document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement;
    if (!target.closest(".floating")) {
      root.querySelector<HTMLElement>("#search-results")?.classList.remove("open");
    }
  });

  window.addEventListener("popstate", () => {
    const fromUrl = readViewStateFromUrl(state);
    state.selectedId = fromUrl.selectedId;
    state.hiddenCategories = fromUrl.hiddenCategories;
    rerenderGraph(state, root);
  });
}

function createGraph(container: HTMLElement) {
  return cytoscape({
    container,
    wheelSensitivity: 0.18,
    style: [
      {
        selector: "node",
        style: {
          width: 30,
          height: 30,
          shape: "ellipse",
          label: "data(label)",
          "font-size": 9,
          "text-wrap": "wrap",
          "text-max-width": 150,
          "text-valign": "top",
          "text-margin-y": -10,
          "background-color": "data(color)",
          color: "#0f172a",
          "border-width": 1.4,
          "border-color": "#f8fafc",
        },
      },
      {
        selector: "edge",
        style: {
          width: 1.4,
          "line-color": "#94a3b8",
          "target-arrow-shape": "triangle",
          "target-arrow-color": "#94a3b8",
          "curve-style": "bezier",
          opacity: 0.8,
        },
      },
      {
        selector: ".contextual",
        style: {
          opacity: 0.45,
          "border-color": "#6b7280",
          "line-color": "#9ca3af",
          "target-arrow-color": "#9ca3af",
        },
      },
      {
        selector: ".state-need_to_learn",
        style: {
          "border-width": 2,
          "border-color": "#cbd5e1",
        },
      },
      {
        selector: ".state-learning",
        style: {
          "border-width": 3,
          "border-color": "#f59e0b",
        },
      },
      {
        selector: ".state-know_it",
        style: {
          "border-width": 3,
          "border-color": "#16a34a",
        },
      },
      {
        selector: ":selected",
        style: {
          "border-width": 4,
          "border-color": "#f97316",
        },
      },
    ],
  });
}

export async function bootstrapApp(root: HTMLElement | null) {
  if (!root) return;

  createLayout(root);
  const storage = getSafeStorage();
  themeSetup(root, storage);

  let data: GraphData;
  try {
    data = await fetchGraphData();
  } catch (error) {
    const detail = root.querySelector<HTMLElement>("#detail-content");
    if (detail) {
      detail.innerHTML = `<div class="gaps"><h3>Unable to load graph</h3><pre>${String(error)}</pre></div>`;
    }
    return;
  }

  const categories = [...new Set(data.nodes.map((node) => node.category))].sort();
  const categoryColors = new Map<string, string>();

  const state: AppState = {
    data,
    nodeById: new Map(data.nodes.map((node) => [node.id, node])),
    hiddenCategories: new Set<string>(),
    selectedId: null,
    progress: loadProgressState(storage),
    cy: createGraph(root.querySelector<HTMLElement>("#graph")!),
    categories,
    categoryColors,
    storage,
  };

  const fromUrl = readViewStateFromUrl(state);
  state.selectedId = fromUrl.selectedId;
  state.hiddenCategories = fromUrl.hiddenCategories;

  syncHeaderStats(state, root);
  rerenderGraph(state, root);
  wireInteractions(state, root);
  wireExportImport(state, root);
}
