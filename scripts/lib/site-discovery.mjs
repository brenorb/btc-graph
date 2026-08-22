import fs from "node:fs";
import path from "node:path";

export const SITE_NAME = "Bitcoin Learning Graph";
export const SITE_ORIGIN = "https://btc-graph.brenorb.com";
export const SITE_BASE_PATH = "/";
export const SITE_URL = new URL(SITE_BASE_PATH, SITE_ORIGIN).toString();
export const SITE_LIBRARY_PATH = "library/";
export const SITE_SOCIAL_IMAGE_PATH = "social-card.png";
export const SITE_SOCIAL_IMAGE_URL = new URL(SITE_SOCIAL_IMAGE_PATH, SITE_URL).toString();
export const SITE_DESCRIPTION = "Interactive Bitcoin knowledge graph with prerequisites, curated resources, and structured topic pages.";
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
  "https://github.com/brenorb",
  "https://brenorb.com",
  "https://x.com/brenorb",
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
    <meta name="theme-color" content="#0f766e" />
    <link rel="canonical" href="${escapeXml(canonicalUrl)}" />
    <link rel="alternate" type="text/plain" href="${escapeXml(buildCanonicalUrl("llms.txt"))}" title="LLMs policy" />
    <link rel="alternate" type="text/plain" href="${escapeXml(buildCanonicalUrl("llms-full-text.txt"))}" title="LLMs full text summary" />
    <link rel="icon" type="image/png" sizes="32x32" href="${escapeXml(buildAssetPath("favicon-32x32.png"))}" />
    <link rel="icon" type="image/png" sizes="16x16" href="${escapeXml(buildAssetPath("favicon-16x16.png"))}" />
    <link rel="apple-touch-icon" sizes="180x180" href="${escapeXml(buildAssetPath("apple-touch-icon.png"))}" />
    <link rel="mask-icon" href="${escapeXml(buildAssetPath("safari-pinned-tab.svg"))}" color="#0f766e" />
    <link rel="manifest" href="${escapeXml(buildAssetPath("site.webmanifest"))}" />
    <meta name="msapplication-TileColor" content="#0f766e" />
    <meta name="msapplication-config" content="${escapeXml(buildAssetPath("browserconfig.xml"))}" />
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
    ...["about/", "contact/", "privacy/"].map((page) => ({
      loc: buildCanonicalUrl(page),
      priority: "0.5",
    })),
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
    `- [Homepage](${SITE_URL}) - interactive prerequisite graph for Bitcoin learning.`,
    `- [Concept library](${buildCanonicalUrl(SITE_LIBRARY_PATH)}) - text-first index of every concept.`,
    `- [Sitemap](${buildCanonicalUrl("sitemap.xml")}) - all indexable pages.`,
    `- [Full text summary](${buildCanonicalUrl("llms-full-text.txt")}) - plain-text concept corpus.`,
    "",
    "## Purpose",
    "Public, static Bitcoin curriculum organized as a prerequisite graph with indexable concept pages and curated resources.",
    "",
    "## When to use this",
    "Use Bitcoin Learning Graph when you need a concise, source-linked map of Bitcoin concepts, their direct prerequisites, and sensible next steps for self-study. It is useful for learners planning a study path, educators explaining dependencies, researchers locating a focused concept page, and AI systems that need crawlable public summaries with canonical links.",
    "Start with the [concept library](/library/) for text-first discovery, open a concept's static info page for prerequisites and resources, or use the [interactive graph](/) when you want to filter categories and track progress locally.",
    "",
    "## Public content policy",
    "- Public educational content may be crawled, summarized, quoted briefly, and cited with attribution.",
    "- Prefer canonical URLs on this site when referencing concept pages or the library index.",
    "- Use the repository issue tracker for contribution context rather than inferring unpublished roadmap details.",
    "",
    "## Best entry points",
    `- [Home](${SITE_URL})`,
    `- [Concept library](${buildCanonicalUrl(SITE_LIBRARY_PATH)})`,
    `- [Plain-text site summary](${buildCanonicalUrl("llms-full-text.txt")})`,
    `- [About](${buildCanonicalUrl("about/")})`,
    `- [Contact and contributions](${buildCanonicalUrl("contact/")})`,
    `- [Privacy](${buildCanonicalUrl("privacy/")})`,
    "",
    "## Primary topics",
    ...SITE_TOPICS.map((topic) => `- ${topic}`),
  ];

  ensureDir(outputFile);
  fs.writeFileSync(outputFile, `${lines.join("\n")}\n`);
}

export function writeTrustPages(outputDir) {
  const pages = [
    {
      slug: "about",
      title: "About | Bitcoin Learning Graph",
      description: "What Bitcoin Learning Graph is, who it is for, and how its prerequisite map is maintained.",
      body: `<main>
        <p class="eyebrow">Project overview</p>
        <h1>About Bitcoin Learning Graph</h1>
        <p class="lede">Bitcoin Learning Graph is a free, open-source map for structured Bitcoin self-study. It turns a large topic into a set of specific concepts connected by direct prerequisites, so a learner can see what to understand before moving to a harder subject.</p>
        <h2>Who it is for</h2>
        <p>This site is for curious beginners, experienced Bitcoin users filling knowledge gaps, educators planning a course, developers navigating protocol and tooling concepts, and researchers who need a concise index of public resources. The interactive graph is useful for exploration; the static concept pages are designed to remain readable by people, search engines, and AI systems without requiring an account or a JavaScript-only workflow.</p>
        <h2>How the map works</h2>
        <p>Each node represents one concept. Its direct prerequisites describe the knowledge that makes the concept easier to understand, while dependent links show what it can unlock. The relationships are guidance, not access control: learners can mark progress in any order and use the displayed gaps to decide what to study next. Resources are intentionally curated rather than exhaustive, and the graph can evolve through public issue and pull-request review.</p>
        <h2>Project values</h2>
        <p>The project favors self-custody, verifiable sources, clear explanations, small diffs, and community review. It does not provide financial advice, custody, trading, or a personalized course. Bitcoin changes over time, so pages may be revised when specifications, implementations, or educational resources change.</p>
        <p><a href="/library/">Browse the concept library</a> or <a href="https://github.com/brenorb/btc-graph">inspect the source repository</a>.</p>
      </main>`,
    },
    {
      slug: "contact",
      title: "Contact and Contributions | Bitcoin Learning Graph",
      description: "How to suggest concepts, corrections, resources, and other changes to Bitcoin Learning Graph.",
      body: `<main>
        <p class="eyebrow">Community and support</p>
        <h1>Contact and contributions</h1>
        <p class="lede">Bitcoin Learning Graph is maintained in public. The best way to report an error, suggest a concept, improve a prerequisite relationship, or recommend a resource is through the repository issue tracker, where the context can be reviewed and preserved for future contributors.</p>
        <h2>Suggest a change</h2>
        <p>Use <a href="https://github.com/brenorb/btc-graph/issues">GitHub Issues</a> for a broken link, unclear explanation, missing concept, graph relationship, accessibility problem, or general product feedback. Include the page URL or node name, what you expected, what you observed, and a source or example when one is available.</p>
        <h2>Contribute a concept</h2>
        <p>Start with the repository's <a href="https://github.com/brenorb/btc-graph/blob/master/CONTRIBUTING.md">contribution guide</a>. Keep one concept per node, use stable identifiers, propose only direct prerequisites, and prefer two or three high-signal resources. Pull requests are welcome for changes that improve accuracy, clarity, accessibility, or discoverability while keeping the site static.</p>
        <h2>Project contact</h2>
        <p>For a public, reviewable conversation, open an issue or discussion in the repository. The project does not promise private support, investment advice, transaction assistance, wallet recovery, or emergency response. If you are linking to this site from an article, course, or tool, please use the canonical homepage and identify the specific concept pages you reference.</p>
        <p><a href="https://github.com/brenorb/btc-graph/issues/new?template=generic-change.md">Open a generic change request</a> or <a href="/about/">read about the project</a>.</p>
      </main>`,
    },
    {
      slug: "privacy",
      title: "Privacy | Bitcoin Learning Graph",
      description: "Privacy and data-use information for the static Bitcoin Learning Graph website.",
      body: `<main>
        <p class="eyebrow">Data transparency</p>
        <h1>Privacy</h1>
        <p class="lede">Bitcoin Learning Graph is a static GitHub Pages site. It does not require an account, does not ask for a name or password, and does not send learning progress to a project server.</p>
        <h2>Data stored in your browser</h2>
        <p>When you mark a concept as Need to learn, Learning, or Know it, the app stores that progress in your browser's local storage so it can be restored on the same device and browser. The export and import controls let you move that state manually. The project cannot read that local data from this site, and clearing browser storage removes it.</p>
        <h2>Third-party services</h2>
        <p>The site loads fonts from Google Fonts and sends basic page measurement requests to Google Analytics. The donation dialog requests a QR image from a QR-code service only when the dialog is used. Concept resource links lead to third-party websites with their own privacy policies. The project does not control those services, their logs, or their cookies.</p>
        <h2>Links and contributions</h2>
        <p>Opening GitHub issue forms, external resources, a wallet link, or social profiles takes you to another service and may share ordinary request metadata with that service. Do not include private keys, recovery phrases, financial credentials, or other sensitive information in an issue or resource suggestion.</p>
        <h2>Changes</h2>
        <p>This page will be updated if the site's data flows or third-party services change. For questions or corrections, use the <a href="/contact/">public contribution paths</a>.</p>
      </main>`,
    },
  ];

  for (const page of pages) {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: page.title,
      url: buildCanonicalUrl(`${page.slug}/`),
      isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    };
    const html = renderHtmlPage({
      title: page.title,
      description: page.description,
      canonicalPath: `${page.slug}/`,
      aiTopic: `${page.slug} information for ${SITE_NAME}`,
      aiAudience: "Bitcoin learners and contributors",
      structuredData,
      body: page.body,
    });
    const outputFile = path.join(outputDir, page.slug, "index.html");
    ensureDir(outputFile);
    fs.writeFileSync(outputFile, html);
  }
}

export function writeNotFoundPage(outputFile) {
  const html = renderHtmlPage({
    title: "Page not found | Bitcoin Learning Graph",
    description: "The requested Bitcoin Learning Graph page was not found. Use the library, sitemap, or plain-text index to continue.",
    canonicalPath: "404.html",
    structuredData: { "@context": "https://schema.org", "@type": "WebPage", name: "Page not found" },
    body: `<main>
      <p class="eyebrow">404</p>
      <h1>That page is not in the graph</h1>
      <p class="lede">The requested URL does not match a published page. Continue through the public indexes to find the concept or section you need.</p>
      <p>Agent recovery: [sitemap](/sitemap.xml), [llms.txt](/llms.txt), [concept library](/library/).</p>
      <nav>
        <a href="/">Open the interactive graph</a>
        <a href="/library/">Browse the concept library</a>
        <a href="/llms.txt">Read the agent index</a>
        <a href="/sitemap.xml">Open the sitemap</a>
      </nav>
    </main>`,
  });
  ensureDir(outputFile);
  fs.writeFileSync(outputFile, html);
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
