import fs from "node:fs";
import path from "node:path";

const repoRoot = process.cwd();
const sourceDir = path.join(repoRoot, "content", "nodes");
const DEFAULT_TIMEOUT_MS = 15000;
const CONCURRENCY = 6;
const MAX_ATTEMPTS = 3;
const RETRYABLE_STATUS = new Set([408, 425, 429, 500, 502, 503, 504]);

function loadNodes() {
  const files = fs
    .readdirSync(sourceDir)
    .filter((file) => file.endsWith(".json"))
    .sort((a, b) => a.localeCompare(b));

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(sourceDir, file), "utf8");
    return JSON.parse(raw);
  });
}

function collectUrls(nodes) {
  const usage = new Map();

  for (const node of nodes) {
    const resources = Array.isArray(node.resources) ? node.resources : [];
    for (const resource of resources) {
      const url = typeof resource.url === "string" ? resource.url.trim() : "";
      if (!url) continue;

      if (!usage.has(url)) {
        usage.set(url, new Set());
      }
      usage.get(url).add(node.id);
    }
  }

  return usage;
}

async function fetchWithTimeout(url, method) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    return await fetch(url, {
      method,
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "btc-graph-link-check/1.0",
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestWithRetry(url, method) {
  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, method);
      if (!RETRYABLE_STATUS.has(response.status) || attempt === MAX_ATTEMPTS) {
        return response;
      }
    } catch (error) {
      lastError = error;
      if (attempt === MAX_ATTEMPTS) {
        throw error;
      }
    }

    // Short exponential backoff to reduce transient network flakiness in CI.
    await sleep(300 * 2 ** (attempt - 1));
  }

  throw lastError ?? new Error("Link check failed with unknown error");
}

async function checkUrl(url) {
  let headResponse;
  try {
    headResponse = await requestWithRetry(url, "HEAD");
  } catch {
    headResponse = undefined;
  }

  if (headResponse && headResponse.status < 400) {
    return { ok: true, status: headResponse.status, method: "HEAD" };
  }

  if (headResponse && [405, 501].includes(headResponse.status)) {
    const getResponse = await requestWithRetry(url, "GET");
    return {
      ok: getResponse.status < 400,
      status: getResponse.status,
      method: "GET",
    };
  }

  if (headResponse) {
    // Retry with GET for stricter verification when HEAD is not successful.
    const getResponse = await requestWithRetry(url, "GET");
    return {
      ok: getResponse.status < 400,
      status: getResponse.status,
      method: "GET",
      headStatus: headResponse.status,
    };
  }

  const getResponse = await requestWithRetry(url, "GET");
  return { ok: getResponse.status < 400, status: getResponse.status, method: "GET" };
}

async function run() {
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Content directory not found: ${sourceDir}`);
  }

  const nodes = loadNodes();
  const usage = collectUrls(nodes);
  const urls = [...usage.keys()];

  const failures = [];
  let index = 0;

  async function worker() {
    while (index < urls.length) {
      const current = urls[index];
      index += 1;

      try {
        const result = await checkUrl(current);
        if (!result.ok) {
          failures.push({
            url: current,
            status: result.status,
            method: result.method,
            headStatus: result.headStatus,
            usedBy: [...usage.get(current)],
          });
        }
      } catch (error) {
        failures.push({
          url: current,
          error: String(error),
          usedBy: [...usage.get(current)],
        });
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  console.log(`Checked ${urls.length} unique resource URLs across ${nodes.length} nodes.`);

  if (failures.length > 0) {
    console.error(`\nFound ${failures.length} failing URL(s):`);
    for (const failure of failures) {
      const detail = failure.error
        ? `error=${failure.error}`
        : `status=${failure.status} method=${failure.method}${failure.headStatus ? ` head=${failure.headStatus}` : ""}`;
      console.error(`- ${failure.url} (${detail}) usedBy=${failure.usedBy.join(",")}`);
    }
    process.exit(1);
  }

  console.log("All links are reachable.");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
