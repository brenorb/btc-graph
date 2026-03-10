import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("typography assets", () => {
  it("uses the same font families that are loaded in index.html", () => {
    const html = readFileSync(resolve(import.meta.dirname, "../index.html"), "utf8");
    const styles = readFileSync(resolve(import.meta.dirname, "../src/styles.css"), "utf8");

    expect(html).toContain("family=Archivo");
    expect(html).toContain("family=Syne");
    expect(styles).toContain('font-family: "Archivo", sans-serif;');
    expect(styles).toContain('font-family: "Syne", sans-serif;');
    expect(styles).not.toContain("IBM Plex Sans");
    expect(styles).not.toContain("Space Grotesk");
  });
});
