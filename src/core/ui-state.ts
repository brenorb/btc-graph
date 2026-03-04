import type { ProgressState } from "./types";

export type LabelVisibilityMode = "all" | "none";
export type ThemeMode = "light" | "dark";

export function resolveLabelText(
  mode: LabelVisibilityMode,
  title: string,
  _isHovered: boolean,
): string {
  if (mode === "all") {
    return title;
  }

  return "";
}

export function deriveNextProgressState(
  current: ProgressState | null,
  clicked: ProgressState,
): ProgressState | null {
  if (current === clicked) {
    return null;
  }

  return clicked;
}

export function resolveInitialTheme(
  storedTheme: string | null,
  prefersDark: boolean,
): ThemeMode {
  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  return prefersDark ? "dark" : "light";
}

export function resolveNextTheme(currentTheme: ThemeMode): ThemeMode {
  return currentTheme === "dark" ? "light" : "dark";
}
