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
import {
  applyCategoryBulkAction,
  deriveNextProgressState,
  resolveGraphColorPalette,
  resolveGraphLayoutSettings,
  resolveLabelText,
  resolveInitialTheme,
  resolveNextTheme,
} from "./core/ui-state";
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
          <div class="brand-title">Bitcoin Learning Graph</div>
          <div class="brand-subtitle">Map your understanding, expose gaps, keep moving.</div>
        </div>
        <div class="header-actions">
          <a class="btn" target="_blank" rel="noreferrer" id="add-concept-link">Add concept</a>
          <a class="btn" target="_blank" rel="noreferrer" id="generic-change-link">Generic change</a>
          <a class="btn" target="_blank" rel="noreferrer" href="https://github.com/sponsors/brenorb">Donate</a>
          <button class="icon-btn" id="theme-toggle" aria-label="Toggle theme">◐</button>
        </div>
      </header>

      <section class="main-panel">
        <div class="controls">
          <div class="floating">
            <input type="search" id="search-input" placeholder="Search concepts..." autocomplete="off" />
            <div id="search-results" class="search-results" role="listbox"></div>
          </div>
          <button class="btn" id="clear-filters">Reset filters</button>
          <div class="label-controls">
            <button class="btn" id="select-all-categories" type="button">Select all categories</button>
            <button class="btn" id="deselect-all-categories" type="button">Deselect all categories</button>
          </div>
          <button class="btn" id="export-progress">Export progress</button>
          <label class="btn" for="import-progress-input">Import progress</label>
          <input id="import-progress-input" type="file" accept="application/json" hidden />
        </div>
        <div class="controls legend" id="legend"></div>
        <div id="graph"></div>
      </section>

      <aside class="detail-panel" id="detail-panel">
        <div class="mobile-sheet-handle"></div>
        <div id="detail-content" class="meta">Select a node to inspect prerequisites, resources, and progress.</div>
      </aside>

      <footer class="site-footer">
        <div class="footer-main">
          <div class="footer-title">Bitcoin Learning Graph</div>
          <div class="meta">Static, open-source concept map for structured Bitcoin learning.</div>
        </div>
        <div class="footer-links">
          <a class="footer-link" target="_blank" rel="noreferrer" href="https://github.com/brenorb/btc-graph">Repository</a>
          <a class="footer-link" target="_blank" rel="noreferrer" href="https://github.com/brenorb/btc-graph/issues">Issues</a>
          <a class="footer-link" target="_blank" rel="noreferrer" href="https://github.com/brenorb/btc-graph/blob/master/CONTRIBUTING.md">Contribute</a>
          <a class="footer-link" target="_blank" rel="noreferrer" href="https://github.com/sponsors/brenorb">Donate</a>
        </div>
        <div class="footer-socials" aria-label="Social links">
          <a class="footer-social-link" target="_blank" rel="noreferrer" href="https://github.com/brenorb/btc-graph" aria-label="GitHub">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2C6.48 2 2 6.58 2 12.22c0 4.5 2.87 8.31 6.84 9.66.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.74-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .08 1.53 1.05 1.53 1.05.9 1.56 2.35 1.11 2.92.85.09-.67.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.09 0-1.13.39-2.05 1.03-2.77-.1-.26-.45-1.31.1-2.72 0 0 .84-.28 2.75 1.06A9.36 9.36 0 0 1 12 6.84c.85 0 1.7.12 2.5.35 1.91-1.34 2.75-1.06 2.75-1.06.55 1.41.2 2.46.1 2.72.64.72 1.03 1.64 1.03 2.77 0 3.96-2.35 4.82-4.58 5.08.36.31.67.93.67 1.87 0 1.35-.01 2.43-.01 2.76 0 .27.18.6.69.49A10.22 10.22 0 0 0 22 12.22C22 6.58 17.52 2 12 2z"/>
            </svg>
          </a>
          <a class="footer-social-link" target="_blank" rel="noreferrer" href="https://nostr.com" aria-label="Nostr">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 2 3 7v10l9 5 9-5V7l-9-5zm0 2.2 6.9 3.84L12 11.9 5.1 8.04 12 4.2zm-7 5.51 6 3.34v6.78l-6-3.33V9.71zm14 0v6.79l-6 3.33v-6.78l6-3.34z"/>
            </svg>
          </a>
          <a class="footer-social-link" target="_blank" rel="noreferrer" href="https://x.com/search?q=btc%20graph" aria-label="X (Twitter)">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M18.9 2H22l-6.77 7.73L23.2 22h-6.27l-4.91-6.43L6.4 22H3.3l7.24-8.26L.8 2h6.43l4.45 5.88L18.9 2zm-1.1 18h1.73L6.33 3.9H4.48L17.8 20z"/>
            </svg>
          </a>
        </div>
      </footer>
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
        "- Post-requisite node ids (nodes that depend on this concept):",
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

function getSafeStorage(): StorageLike | undefined {
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}

function themeSetup(storage: StorageLike | undefined) {
  const themeRoot = document.documentElement;
  const stored = storage?.getItem("btc-graph-theme") ?? null;
  const preferredDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = resolveInitialTheme(stored, preferredDark);
  themeRoot.dataset.theme = theme;

  const button = document.querySelector<HTMLButtonElement>("#theme-toggle");
  button?.addEventListener("click", () => {
    const currentTheme = themeRoot.dataset.theme === "dark" ? "dark" : "light";
    const nextTheme = resolveNextTheme(currentTheme);
    themeRoot.dataset.theme = nextTheme;
    try {
      storage?.setItem("btc-graph-theme", nextTheme);
    } catch {
      // Ignore storage write failures (private mode, quota, policy).
    }
  });
}

function setProgress(state: AppState, nodeId: string, next: ProgressState) {
  const current = state.progress[nodeId]?.state ?? null;
  const resolved = deriveNextProgressState(current, next);
  if (!resolved) {
    delete state.progress[nodeId];
  } else {
    state.progress[nodeId] = {
      state: resolved,
      updatedAt: new Date().toISOString(),
    };
  }
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

  const currentState = state.progress[node.id]?.state ?? null;
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
    <div class="meta"><strong>Post-requisites (depends on this concept):</strong> ${state.data.nodes
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
      <div class="meta">${
        currentState
          ? `Selected: ${PROGRESS_LABELS[currentState]}`
          : "No explicit state selected (default graph style is Need to learn)."
      }</div>
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
  const denseLabelThreshold = 1.4;
  const showDenseLabels = state.cy.zoom() >= denseLabelThreshold;

  for (const node of state.cy.nodes()) {
    const title = node.data("title");
    const isHovered = Boolean(node.data("hovered"));
    const isSelected = node.id() === state.selectedId;
    const mode = showDenseLabels || isHovered || isSelected ? "all" : "none";
    node.data("label", resolveLabelText(mode, title, isHovered));
  }
}

function renderCategoryBulkControls(state: AppState, root: HTMLElement) {
  const selectAllButton = root.querySelector<HTMLButtonElement>("#select-all-categories");
  const deselectAllButton = root.querySelector<HTMLButtonElement>("#deselect-all-categories");
  if (!selectAllButton || !deselectAllButton) return;

  selectAllButton.classList.toggle("primary", state.hiddenCategories.size === 0);
  deselectAllButton.classList.toggle("primary", state.hiddenCategories.size === state.categories.length);
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
  const palette = resolveGraphColorPalette(
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );
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
        ? palette.contextualNodeFill
        : getCategoryColor(node.category, state.categoryColors),
      borderColor: palette.nodeBorder,
      labelColor: palette.nodeLabel,
      labelBackgroundColor: palette.labelBackground,
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
          lineColor: palette.edge,
          opacity:
            contextualIds.has(prerequisite) || contextualIds.has(node.id)
              ? 0.45
              : 0.74,
        },
      })),
  );

  return { nodes, edges, strictVisibleIds };
}

function applyGraphTheme(state: AppState) {
  const palette = resolveGraphColorPalette(
    document.documentElement.dataset.theme === "dark" ? "dark" : "light",
  );

  for (const node of state.cy.nodes()) {
    node.data("labelColor", palette.nodeLabel);
    node.data("labelBackgroundColor", palette.labelBackground);
    node.data("borderColor", palette.nodeBorder);

    if (Boolean(node.data("contextual"))) {
      node.data("color", palette.contextualNodeFill);
    }
  }

  for (const edge of state.cy.edges()) {
    edge.data("lineColor", palette.edge);
  }
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

  state.cy.layout(resolveGraphLayoutSettings()).run();

  refreshLabels(state);
  renderCategoryBulkControls(state, root);
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

  root.querySelector<HTMLButtonElement>("#select-all-categories")?.addEventListener("click", () => {
    state.hiddenCategories = applyCategoryBulkAction(state.categories, "select_all");
    rerenderGraph(state, root);
  });

  root.querySelector<HTMLButtonElement>("#deselect-all-categories")?.addEventListener("click", () => {
    state.hiddenCategories = applyCategoryBulkAction(state.categories, "deselect_all");
    rerenderGraph(state, root);
  });

  root.querySelector<HTMLButtonElement>("#theme-toggle")?.addEventListener("click", () => {
    window.requestAnimationFrame(() => {
      applyGraphTheme(state);
      refreshLabels(state);
    });
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
          width: 26,
          height: 26,
          shape: "ellipse",
          label: "data(label)",
          "font-size": 10,
          "text-wrap": "wrap",
          "text-max-width": 120,
          "text-valign": "bottom",
          "text-margin-y": 8,
          "background-color": "data(color)",
          color: "data(labelColor)",
          "text-background-color": "data(labelBackgroundColor)",
          "text-background-opacity": 0.84,
          "text-background-padding": 3,
          "text-background-shape": "roundrectangle",
          "border-width": 1,
          "border-color": "data(borderColor)",
        },
      },
      {
        selector: "edge",
        style: {
          width: 1.2,
          "line-color": "data(lineColor)",
          "target-arrow-shape": "triangle",
          "target-arrow-color": "data(lineColor)",
          "curve-style": "bezier",
          opacity: "data(opacity)",
        },
      },
      {
        selector: ".contextual",
        style: {
          opacity: 0.55,
          "border-color": "#6b7280",
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
    ],
  });
}

export async function bootstrapApp(root: HTMLElement | null) {
  if (!root) return;

  createLayout(root);
  const storage = getSafeStorage();
  themeSetup(storage);

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

  rerenderGraph(state, root);
  wireInteractions(state, root);
  wireExportImport(state, root);
}
