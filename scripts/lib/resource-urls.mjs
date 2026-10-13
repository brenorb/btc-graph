export function collectResourceUrls(nodes) {
  const usage = new Map();

  for (const node of nodes) {
    const resources = Array.isArray(node.resources) ? node.resources : [];
    for (const resource of resources) {
      const candidates = [resource.url, ...Object.values(resource.regionalUrls ?? {}), resource.freeUrl];
      for (const candidate of candidates) {
        const url = typeof candidate === "string" ? candidate.trim() : "";
        if (!url) continue;
        if (!usage.has(url)) usage.set(url, new Set());
        usage.get(url).add(node.id);
      }
    }
  }

  return usage;
}

