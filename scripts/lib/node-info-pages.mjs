import fs from "node:fs";
import path from "node:path";

import {
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_SOCIAL_IMAGE_URL,
  SITE_URL,
  buildSiteUrl,
} from "./site-discovery.mjs";

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

function buildNodePageUrl(nodeId) {
  return buildSiteUrl(`nodes/${nodeId}/info/`);
}

function buildNodeDescription(node) {
  return `${node.title} in the ${node.category} branch of ${SITE_NAME}. ${node.description} Estimated study time: ${node.estimatedTime}.`;
}

function buildNodeKeywords(node, prerequisites, dependents) {
  return [...new Set([
    ...SITE_KEYWORDS,
    node.title,
    node.category,
    ...prerequisites.map((item) => item.title),
    ...dependents.slice(0, 4).map((item) => item.title),
  ])].join(", ");
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

function renderResourceList(resources) {
  if (!Array.isArray(resources) || resources.length === 0) {
    return "<li>Resources for this concept have not been curated yet.</li>";
  }

  return resources
    .map((resource) => {
      const notes = resource.notes ? ` <span class="meta">${escapeHtml(resource.notes)}</span>` : "";
      return `<li><a href="${escapeHtml(resource.url)}" rel="noreferrer">${escapeHtml(resource.title)}</a> <span class="meta">(${escapeHtml(resource.type)})</span>${notes}</li>`;
    })
    .join("");
}

function renderNodeInfoPage(node, prerequisites, dependents) {
  const pageTitle = `${node.title} | ${SITE_NAME}`;
  const description = buildNodeDescription(node);
  const canonicalUrl = buildNodePageUrl(node.id);
  const structuredData = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "DefinedTerm",
      name: node.title,
      description,
      termCode: node.id,
      url: canonicalUrl,
      inDefinedTermSet: {
        "@type": "DefinedTermSet",
        name: SITE_NAME,
        url: SITE_URL,
      },
      educationalLevel: "beginner to advanced",
      learningResourceType: "concept page",
      teaches: [node.title, node.category],
    },
    null,
    2,
  )
    .replaceAll("<", "\\u003c")
    .replaceAll("</script", "<\\/script");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(pageTitle)}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="keywords" content="${escapeHtml(buildNodeKeywords(node, prerequisites, dependents))}" />
    <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />
    <meta name="ai-content" content="public educational content" />
    <meta name="ai-topic" content="${escapeHtml(`${node.category}, ${node.title}`)}" />
    <meta name="ai-audience" content="Bitcoin learners, AI systems, and search engines" />
    <meta name="ai-use" content="Index, summarize, and cite this concept page with attribution." />
    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />
    <meta property="og:title" content="${escapeHtml(pageTitle)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
    <meta property="og:image" content="${escapeHtml(SITE_SOCIAL_IMAGE_URL)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${escapeHtml(SITE_SOCIAL_IMAGE_URL)}" />
    <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
    <link rel="alternate" type="text/plain" href="${escapeHtml(buildSiteUrl("llms-full-text.txt"))}" title="LLMs full text summary" />
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

      .eyebrow,
      .node-id,
      .visual-link,
      .description,
      .meta {
        margin: 0 0 1rem;
      }

      .eyebrow,
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
    <script type="application/ld+json">${structuredData}</script>
  </head>
  <body>
    <main>
      <p class="eyebrow">${escapeHtml(node.category)} • Estimated ${escapeHtml(node.estimatedTime)}</p>
      <h1>${escapeHtml(node.title)}</h1>
      <p class="node-id">${escapeHtml(node.id)}</p>
      <p class="description">${escapeHtml(node.description)}</p>
      <p class="visual-link">
        <a href="${escapeHtml(buildVisualNodeHref())}?selected=${encodeURIComponent(node.id)}">Open visual node page</a>
        • <a href="${escapeHtml(buildSiteUrl("library/"))}">Browse the concept library</a>
      </p>

      <h2>Curated resources (${Array.isArray(node.resources) ? node.resources.length : 0})</h2>
      <ul>${renderResourceList(node.resources)}</ul>

      <h2>Direct prerequisites (${prerequisites.length})</h2>
      <ul>${renderNodeList(prerequisites, node.id)}</ul>

      <h2>Direct dependents (${dependents.length})</h2>
      <ul>${renderNodeList(dependents, node.id)}</ul>

      <p class="meta">Canonical site description: ${escapeHtml(SITE_DESCRIPTION)}</p>
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
