import type { NodeResource } from "./types";

function normalizeRegionalUrlKey(value: string): string {
  return value.trim().replaceAll("_", "-").toLowerCase();
}

function parseLocaleParts(locale: string): { exact: string; language: string | null; region: string | null } {
  const trimmed = locale.trim();
  if (!trimmed) {
    return {
      exact: "",
      language: null,
      region: null,
    };
  }

  try {
    const parsed = new Intl.Locale(trimmed);
    return {
      exact: normalizeRegionalUrlKey(parsed.toString()),
      language: parsed.language ? normalizeRegionalUrlKey(parsed.language) : null,
      region: parsed.region ? normalizeRegionalUrlKey(parsed.region) : null,
    };
  } catch {
    const exact = normalizeRegionalUrlKey(trimmed);
    const parts = exact.split("-").filter(Boolean);
    return {
      exact,
      language: parts[0] ?? null,
      region: parts.length > 1 ? parts.at(-1) ?? null : null,
    };
  }
}

export function buildRegionalUrlCandidates(localePreferences: readonly string[]): string[] {
  const candidates: string[] = [];
  const seen = new Set<string>();

  const addCandidate = (value: string | null) => {
    if (!value || seen.has(value)) {
      return;
    }

    seen.add(value);
    candidates.push(value);
  };

  for (const locale of localePreferences) {
    const { exact, region, language } = parseLocaleParts(locale);
    addCandidate(exact);
    addCandidate(region);
    addCandidate(language);
  }

  return candidates;
}

export function readLocalePreferences(
  localeSource:
    | {
        language?: string;
        languages?: readonly string[];
      }
    | undefined,
): string[] {
  const rawCandidates = [
    ...(localeSource?.languages ?? []),
    localeSource?.language ?? "",
  ];

  return rawCandidates.filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

export function resolveResourceUrl(
  resource: Pick<NodeResource, "url" | "regionalUrls">,
  localePreferences: readonly string[],
): string {
  if (!resource.regionalUrls || Object.keys(resource.regionalUrls).length === 0) {
    return resource.url;
  }

  const regionalUrlMap = new Map(
    Object.entries(resource.regionalUrls)
      .filter(([, value]) => typeof value === "string" && value.trim().length > 0)
      .map(([key, value]) => [normalizeRegionalUrlKey(key), value]),
  );

  for (const candidate of buildRegionalUrlCandidates(localePreferences)) {
    const match = regionalUrlMap.get(candidate);
    if (match) {
      return match;
    }
  }

  return resource.url;
}
