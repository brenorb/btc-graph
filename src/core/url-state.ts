export interface ViewState {
  selectedId: string | null;
  hiddenCategories: Set<string>;
}

interface ReconcileViewStateOptions {
  validNodeIds: Set<string>;
  validCategories: Set<string>;
}

const PARAM_SELECTED = "selected";
const PARAM_HIDDEN = "hidden";

export function encodeViewStateToQuery(state: ViewState): string {
  const parts: string[] = [];
  const selectedId = state.selectedId?.trim() ?? "";
  if (selectedId.length > 0) {
    parts.push(`${PARAM_SELECTED}=${encodeURIComponent(selectedId)}`);
  }

  if (state.hiddenCategories.size > 0) {
    const hidden = [...state.hiddenCategories].map((value) => value.trim()).filter(Boolean);
    const uniqueSorted = [...new Set(hidden)].sort((a, b) => a.localeCompare(b));
    if (uniqueSorted.length > 0) {
      const encodedHidden = uniqueSorted.map((category) => encodeURIComponent(category)).join(",");
      parts.push(`${PARAM_HIDDEN}=${encodedHidden}`);
    }
  }

  return parts.length > 0 ? `?${parts.join("&")}` : "";
}

export function decodeViewStateFromUrl(url: string): ViewState {
  try {
    const parsedUrl = new URL(url, "https://btc-graph.local");
    const params = parsedUrl.searchParams;

    const selectedRaw = params.get(PARAM_SELECTED)?.trim();
    const selectedId = selectedRaw && selectedRaw.length > 0 ? selectedRaw : null;

    const hiddenRaw = params.get(PARAM_HIDDEN) ?? "";
    const hiddenCategories = new Set(
      [...new Set(hiddenRaw.split(",").map((value) => value.trim()).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b),
      ),
    );

    return {
      selectedId,
      hiddenCategories,
    };
  } catch {
    return {
      selectedId: null,
      hiddenCategories: new Set(),
    };
  }
}

export function reconcileViewState(
  viewState: ViewState,
  options: ReconcileViewStateOptions,
): ViewState {
  const hiddenCategories = new Set(
    [...viewState.hiddenCategories].filter((category) => options.validCategories.has(category)),
  );

  const selectedId =
    viewState.selectedId && options.validNodeIds.has(viewState.selectedId)
      ? viewState.selectedId
      : null;

  return {
    selectedId,
    hiddenCategories,
  };
}
