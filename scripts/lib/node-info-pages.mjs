import fs from "node:fs";
import path from "node:path";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildDependentsMap(nodes) {
  const dependents = new Map(nodes.map((node) => [node.id, []]));

  for (const node of nodes) {
    for (const prerequisite of node.prerequisites ?? []) {
      if (!dependents.has(prerequisite)) {
        dependents.set(prerequisite, []);
      }

      dependents.get(prerequisite).push(node);
    }
  }

  for (const list of dependents.values()) {
    list.sort((left, right) => left.title.localeCompare(right.title));
  }

  return dependents;
}

function nodeInfoDirectory(nodeId) {
  return path.posix.join("nodes", nodeId, "info");
}

function buildRelativeInfoHref(fromNodeId, targetNodeId) {
  const fromDirectory = nodeInfoDirectory(fromNodeId);
  const targetDirectory = nodeInfoDirectory(targetNodeId);
  const relativePath = path.posix.relative(fromDirectory, targetDirectory);
  return `${relativePath}/`;
}

function buildVisualNodeHref() {
  return "../../../";
}

function renderNodeList(items, fromNodeId) {
  if (items.length === 0) {
    return "<li>None</li>";
  }

  return items
    .map(
      (node) =>
        `<li><a href="${escapeHtml(buildRelativeInfoHref(fromNodeId, node.id))}">${escapeHtml(node.title)}</a></li>`,
    )
    .join("");
}

function renderNodeInfoPage(node, prerequisites, dependents) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>${escapeHtml(node.title)} | Bitcoin Learning Graph</title>
    <style>
      :root {
        color-scheme: light dark;
        font-family: Georgia, "Times New Roman", serif;
        line-height: 1.55;
      }

      body {
        margin: 0;
        padding: 2rem 1.25rem 3rem;
        background: #f5f1e8;
        color: #1f2937;
      }

      main {
        max-width: 46rem;
        margin: 0 auto;
      }

      a {
        color: #0f766e;
      }

      a:hover {
        color: #115e59;
      }

      h1,
      h2 {
        margin-bottom: 0.5rem;
      }

      .node-id,
      .visual-link,
      .description {
        margin: 0 0 1rem;
      }

      .node-id,
      .visual-link {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 0.95rem;
      }

      ul {
        margin: 0 0 1.5rem 1.25rem;
        padding: 0;
      }

      @media (prefers-color-scheme: dark) {
        body {
          background: #111827;
          color: #e5e7eb;
        }

        a {
          color: #7dd3fc;
        }

        a:hover {
          color: #bae6fd;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(node.title)}</h1>
      <p class="node-id">${escapeHtml(node.id)}</p>
      <p class="description">${escapeHtml(node.description)}</p>
      <p class="visual-link"><a href="${escapeHtml(buildVisualNodeHref())}?selected=${encodeURIComponent(node.id)}">Open visual node page</a></p>

      <h2>Direct prerequisites (${prerequisites.length})</h2>
      <ul>${renderNodeList(prerequisites, node.id)}</ul>

      <h2>Direct dependents (${dependents.length})</h2>
      <ul>${renderNodeList(dependents, node.id)}</ul>
    </main>
  </body>
</html>
`;
}

export function writeNodeInfoPages(graph, outputDir) {
  const nodes = [...graph.nodes].sort((left, right) => left.id.localeCompare(right.id));
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const dependentsById = buildDependentsMap(nodes);

  fs.rmSync(outputDir, { recursive: true, force: true });

  for (const node of nodes) {
    const prerequisites = (node.prerequisites ?? [])
      .map((id) => nodesById.get(id))
      .filter(Boolean)
      .sort((left, right) => left.title.localeCompare(right.title));
    const dependents = dependentsById.get(node.id) ?? [];
    const nodeOutputDir = path.join(outputDir, node.id, "info");

    fs.mkdirSync(nodeOutputDir, { recursive: true });
    fs.writeFileSync(
      path.join(nodeOutputDir, "index.html"),
      renderNodeInfoPage(node, prerequisites, dependents),
    );
  }
}
