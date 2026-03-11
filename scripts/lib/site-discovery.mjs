import fs from "node:fs";
import path from "node:path";

export const SITE_NAME = "Bitcoin Learning Graph";
export const SITE_ORIGIN = "https://brenorb.com";
export const SITE_BASE_PATH = "/btc-graph/";
export const SITE_URL = new URL(SITE_BASE_PATH, SITE_ORIGIN).toString();
export const SITE_LIBRARY_PATH = "library/";
export const SITE_SOCIAL_IMAGE_PATH = "social-card.svg";
export const SITE_SOCIAL_IMAGE_URL = new URL(SITE_SOCIAL_IMAGE_PATH, SITE_URL).toString();
export const SITE_DESCRIPTION = "Structured Bitcoin self-study graph with prerequisites, resources, and concept pages.";
export const SITE_KEYWORDS = [
  "bitcoin learning graph",
  "bitcoin education",
  "bitcoin curriculum",
  "bitcoin prerequisite map",
  "lightning network learning",
  "bitcoin protocol concepts",
  "bitcoin self-study",
  "bitcoin glossary",
];
export const SITE_TOPICS = [
  "Bitcoin protocol",
  "Lightning Network",
  "self-custody",
  "privacy",
  "mining",
  "economics",
  "history",
  "operations",
  "developer education",
];
export const SITE_SAME_AS = [
  "https://github.com/brenorb/btc-graph",
  "https://github.com/sponsors/brenorb",
];

const AI_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "OAI-ImageBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bytespider",
  "Amazonbot",
  "YouBot",
  "PhindBot",
  "ExaBot",
  "AndiBot",
  "FirecrawlAgent",
  "cohere-ai",
  "AI2Bot",
  "Grok-bot",
  "academic-ai",
  "Timpibot",
  "ImagesiftBot",
  "Kangaroo Bot",
  "omgilibot",
  "Diffbot",
  "Facebookbot",
  "LinkedInBot",
  "TwitterBot",
  "SlackBot",
  "TelegramBot",
  "DiscordBot",
  "Bingbot",
  "DuckDuckBot",
  "SemrushBot",
  "AhrefsBot",
  "PetalBot",
  "SeznamBot",
  "Naverbot",
  "YandexBot",
];

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))];
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function escapeJsonLd(value) {
  return JSON.stringify(value, null, 2)
    .replaceAll("<", "\\u003c")
    .replaceAll("</script", "<\\/script");
}

function groupNodesByCategory(nodes) {
  const grouped = new Map();

  for (const node of nodes) {
    const existing = grouped.get(node.category) ?? [];
    existing.push(node);
    grouped.set(node.category, existing);
  }

  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([category, categoryNodes]) => ({
      category,
      nodes: categoryNodes.sort((left, right) => left.title.localeCompare(right.title)),
    }));
}

function buildMetaKeywords(extraKeywords = []) {
  return uniqueValues([...SITE_KEYWORDS, ...extraKeywords]).join(", ");
}

function buildCanonicalUrl(relativePath = "") {
  return new URL(relativePath.replace(/^\//, ""), SITE_URL).toString();
}

function buildAssetPath(fileName) {
  return `${SITE_BASE_PATH}${fileName}`;
}

function buildDescription(text, fallback = SITE_DESCRIPTION) {
  const normalized = String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();

  if (normalized.length === 0) {
    return fallback;
  }

  return normalized.length <= 170 ? normalized : `${normalized.slice(0, 167).trimEnd()}...`;
}

function renderHtmlPage({
  title,
  description,
  canonicalPath = "",
  keywords = [],
  aiTopic = "Bitcoin education",
  aiAudience = "Bitcoin learners",
  aiUse = "Index, summarize, and cite the public educational content on this page.",
  structuredData,
  body,
}) {
  const canonicalUrl = buildCanonicalUrl(canonicalPath);
  const keywordContent = buildMetaKeywords(keywords);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeXml(title)}</title>
    <meta name="description" content="${escapeXml(buildDescription(description))}" />
    <meta name="keywords" content="${escapeXml(keywordContent)}" />
    <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />
    <meta name="ai-content" content="public educational content" />
    <meta name="ai-topic" content="${escapeXml(aiTopic)}" />
    <meta name="ai-audience" content="${escapeXml(aiAudience)}" />
    <meta name="ai-use" content="${escapeXml(aiUse)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escapeXml(SITE_NAME)}" />
    <meta property="og:title" content="${escapeXml(title)}" />
    <meta property="og:description" content="${escapeXml(buildDescription(description))}" />
    <meta property="og:url" content="${escapeXml(canonicalUrl)}" />
    <meta property="og:image" content="${escapeXml(SITE_SOCIAL_IMAGE_URL)}" />
    <meta property="og:image:alt" content="Bitcoin Learning Graph social card" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeXml(title)}" />
    <meta name="twitter:description" content="${escapeXml(buildDescription(description))}" />
    <meta name="twitter:image" content="${escapeXml(SITE_SOCIAL_IMAGE_URL)}" />
    <link rel="canonical" href="${escapeXml(canonicalUrl)}" />
    <link rel="alternate" type="text/plain" href="${escapeXml(buildCanonicalUrl("llms.txt"))}" title="LLMs policy" />
    <link rel="alternate" type="text/plain" href="${escapeXml(buildCanonicalUrl("llms-full-text.txt"))}" title="LLMs full text summary" />
    <link rel="stylesheet" href="${escapeXml(buildAssetPath("crawl-pages.css"))}" />
    <script type="application/ld+json">${escapeJsonLd(structuredData)}</script>
  </head>
  <body>
    ${body}
  </body>
</html>
`;
}

export function writeSitemap(graph, outputFile, lastModified = new Date().toISOString()) {
  const urls = [
    { loc: buildCanonicalUrl(), priority: "1.0" },
    { loc: buildCanonicalUrl(SITE_LIBRARY_PATH), priority: "0.9" },
    ...graph.nodes.map((node) => ({
      loc: buildCanonicalUrl(`nodes/${node.id}/info/`),
      priority: "0.7",
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${escapeXml(lastModified)}</lastmod>
    <priority>${entry.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

  ensureDir(outputFile);
  fs.writeFileSync(outputFile, xml);
}

export function writeRobotsTxt(outputFile) {
  const lines = [
    "# Public crawl policy for search engines, AI agents, and link unfurlers.",
    ...AI_BOTS.flatMap((bot) => [`User-agent: ${bot}`, "Allow: /", ""]),
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${buildCanonicalUrl("sitemap.xml")}`,
  ];

  ensureDir(outputFile);
  fs.writeFileSync(outputFile, `${lines.join("\n").trimEnd()}\n`);
}

export function writeLlmsTxt(outputFile) {
  const lines = [
    `# ${SITE_NAME}`,
    "",
    `Canonical: ${SITE_URL}`,
    `Library: ${buildCanonicalUrl(SITE_LIBRARY_PATH)}`,
    `Sitemap: ${buildCanonicalUrl("sitemap.xml")}`,
    `Full text summary: ${buildCanonicalUrl("llms-full-text.txt")}`,
    "",
    "## Purpose",
    "Public, static Bitcoin curriculum organized as a prerequisite graph with indexable concept pages and curated resources.",
    "",
    "## Public content policy",
    "- Public educational content may be crawled, summarized, quoted briefly, and cited with attribution.",
    "- Prefer canonical URLs on this site when referencing concept pages or the library index.",
    "- Use the repository issue tracker for contribution context rather than inferring unpublished roadmap details.",
    "",
    "## Best entry points",
    `- Home: ${SITE_URL}`,
    `- Concept library: ${buildCanonicalUrl(SITE_LIBRARY_PATH)}`,
    `- Plain-text site summary: ${buildCanonicalUrl("llms-full-text.txt")}`,
    "",
    "## Primary topics",
    ...SITE_TOPICS.map((topic) => `- ${topic}`),
  ];

  ensureDir(outputFile);
  fs.writeFileSync(outputFile, `${lines.join("\n")}\n`);
}

export function writeLlmsFullText(graph, outputFile) {
  const groupedCategories = groupNodesByCategory(graph.nodes);
  const lines = [
    SITE_NAME,
    "",
    `Canonical URL: ${SITE_URL}`,
    `Library URL: ${buildCanonicalUrl(SITE_LIBRARY_PATH)}`,
    `Sitemap URL: ${buildCanonicalUrl("sitemap.xml")}`,
    "",
    "Summary:",
    `${SITE_NAME} is a public static website for structured Bitcoin self-study. It combines an interactive prerequisite graph with crawlable HTML concept pages, a text-first library index, and curated external resources.`,
    "",
    "Audience:",
    "Bitcoin learners, developers, educators, writers, and researchers who want a concise map of prerequisite relationships between concepts.",
    "",
    "Keywords:",
    buildMetaKeywords(),
    "",
    "Site sections:",
    `- Home: ${SITE_URL}`,
    `- Library: ${buildCanonicalUrl(SITE_LIBRARY_PATH)}`,
    `- Node info pages: ${buildCanonicalUrl("nodes/<node-id>/info/")}`,
    "",
    "Topics by category:",
  ];

  for (const { category, nodes } of groupedCategories) {
    lines.push("");
    lines.push(`${category} (${nodes.length} concepts)`);

    for (const node of nodes) {
      lines.push(`- ${node.title}: ${node.description}`);
    }
  }

  ensureDir(outputFile);
  fs.writeFileSync(outputFile, `${lines.join("\n")}\n`);
}

export function writeLibraryPage(graph, outputFile) {
  const groupedCategories = groupNodesByCategory(graph.nodes);
  const totalNodeCount = graph.nodes.length;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${buildCanonicalUrl(SITE_LIBRARY_PATH)}#page`,
    name: `${SITE_NAME} Library`,
    url: buildCanonicalUrl(SITE_LIBRARY_PATH),
    isPartOf: {
      "@type": "WebSite",
      "@id": `${SITE_URL}#website`,
      name: SITE_NAME,
      url: SITE_URL,
    },
    about: SITE_TOPICS,
    description: `Text-first index of ${totalNodeCount} Bitcoin concepts grouped by category and linked to static info pages.`,
  };

  const body = `<main>
      <p class="eyebrow">Text-first index for search engines, AI systems, and humans who want the full concept catalog.</p>
      <h1>${escapeXml(SITE_NAME)} Library</h1>
      <p class="lede">Browse ${totalNodeCount} Bitcoin concepts grouped by category. Each entry links to a static information page with prerequisites, dependents, curated resources, and a jump back into the interactive graph.</p>
      <div class="link-row">
        <a href="${escapeXml(SITE_URL)}">Open the interactive graph</a>
        <a href="${escapeXml(buildCanonicalUrl("llms-full-text.txt"))}">Read the plain-text site summary</a>
        <a href="${escapeXml("https://github.com/brenorb/btc-graph")}" rel="noreferrer">View the repository</a>
      </div>
      <div class="panel-grid">
        ${groupedCategories
          .map(
            ({ category, nodes }) => `<section class="panel">
              <h2>${escapeXml(category)} (${nodes.length})</h2>
              <ul class="category-list">
                ${nodes
                  .map(
                    (node) =>
                      `<li><a href="${escapeXml(buildCanonicalUrl(`nodes/${node.id}/info/`))}">${escapeXml(node.title)}</a> <span class="meta">(${escapeXml(node.estimatedTime)})</span></li>`,
                  )
                  .join("")}
              </ul>
            </section>`,
          )
          .join("")}
      </div>
    </main>`;

  const html = renderHtmlPage({
    title: `${SITE_NAME} Library`,
    description: `Browse ${totalNodeCount} crawlable Bitcoin concept pages grouped by category, with prerequisites, curated resources, and direct links back into the interactive graph.`,
    canonicalPath: SITE_LIBRARY_PATH,
    keywords: ["bitcoin concept library", "bitcoin learning library", ...groupedCategories.map(({ category }) => category)],
    aiTopic: "Bitcoin concept library",
    aiAudience: "Search engines, AI systems, and Bitcoin learners",
    structuredData,
    body,
  });

  ensureDir(outputFile);
  fs.writeFileSync(outputFile, html);
}

export function buildSiteUrl(relativePath = "") {
  return buildCanonicalUrl(relativePath);
}
