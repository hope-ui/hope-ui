import { describe, expect, it } from "vitest";
import type { PresetTokens } from "../presets";
import { renderPresetStyle } from "../token-css";

describe("renderPresetStyle — empty", () => {
  it("returns '' for no overrides", () => {
    expect(renderPresetStyle({}, ".dark")).toBe("");
    expect(renderPresetStyle({ colors: {} }, ".dark")).toBe("");
    expect(renderPresetStyle({ colors: {}, radii: {} }, ".dark")).toBe("");
  });
});

describe("renderPresetStyle — determinism & normalization", () => {
  it("emits colors in the fixed vocabulary order, not the input object's key order", () => {
    // `scrim` is last in SEMANTIC_COLOR_TOKENS, `surface` is first — despite being authored scrim-first.
    const tokens: PresetTokens = { colors: { scrim: "#000", surface: "#fff" } };
    expect(renderPresetStyle(tokens, ".dark")).toBe(
      ":root {\n  --hope-surface: #fff;\n  --hope-scrim: #000;\n}",
    );
  });

  it("normalizes camelCase keys to --hope-<kebab>", () => {
    const tokens: PresetTokens = { colors: { onPrimarySoft: "#111", foregroundMuted: "#222" } };
    expect(renderPresetStyle(tokens, ".dark")).toBe(
      ":root {\n  --hope-foreground-muted: #222;\n  --hope-on-primary-soft: #111;\n}",
    );
  });

  it("normalizes Tailwind shorthand to var(--color-…) and passes raw values through", () => {
    const tokens: PresetTokens = {
      colors: {
        primary: "violet.500", // shorthand
        surface: "#fff", // hex
        neutral: "var(--color-mauve-500)", // already a var()
        info: "oklch(0.7 0.1 250)", // functional color
        scrim: "transparent", // bare keyword
      },
    };
    expect(renderPresetStyle(tokens, ".dark")).toBe(
      ":root {\n" +
        "  --hope-surface: #fff;\n" +
        "  --hope-primary: var(--color-violet-500);\n" +
        "  --hope-neutral: var(--color-mauve-500);\n" +
        "  --hope-info: oklch(0.7 0.1 250);\n" +
        "  --hope-scrim: transparent;\n" +
        "}",
    );
  });
});

describe("renderPresetStyle — dark modes", () => {
  const tokens: PresetTokens = { colors: { primary: { light: "violet.600", dark: "violet.400" } } };

  it("emits a selector dark block by default (.dark)", () => {
    expect(renderPresetStyle(tokens, ".dark")).toBe(
      ":root {\n  --hope-primary: var(--color-violet-600);\n}\n" +
        ".dark {\n  --hope-primary: var(--color-violet-400);\n}",
    );
  });

  it("honors a custom selector", () => {
    expect(renderPresetStyle(tokens, "[data-theme=dark]")).toBe(
      ":root {\n  --hope-primary: var(--color-violet-600);\n}\n" +
        "[data-theme=dark] {\n  --hope-primary: var(--color-violet-400);\n}",
    );
  });

  it("emits a media query for darkMode: 'media'", () => {
    expect(renderPresetStyle(tokens, "media")).toBe(
      ":root {\n  --hope-primary: var(--color-violet-600);\n}\n" +
        "@media (prefers-color-scheme: dark) {\n  :root {\n    --hope-primary: var(--color-violet-400);\n  }\n}",
    );
  });

  it("emits no dark block for darkMode: 'none' even when dark values exist", () => {
    expect(renderPresetStyle(tokens, "none")).toBe(
      ":root {\n  --hope-primary: var(--color-violet-600);\n}",
    );
  });

  it("emits no dark override for a token whose dark value is omitted", () => {
    const lightOnly: PresetTokens = { colors: { primary: { light: "violet.600" } } };
    expect(renderPresetStyle(lightOnly, ".dark")).toBe(
      ":root {\n  --hope-primary: var(--color-violet-600);\n}",
    );
  });

  it("emits a dark block containing only the tokens that define one", () => {
    const mixed: PresetTokens = {
      colors: {
        surface: { light: "#fff", dark: "#000" },
        primary: "violet.500", // string → both modes, no dark override
      },
    };
    expect(renderPresetStyle(mixed, ".dark")).toBe(
      ":root {\n  --hope-surface: #fff;\n  --hope-primary: var(--color-violet-500);\n}\n" +
        ".dark {\n  --hope-surface: #000;\n}",
    );
  });
});

describe("renderPresetStyle — radii", () => {
  it("emits radii as --hope-radii-<key> in :root, after colors, sorted by key", () => {
    const tokens: PresetTokens = {
      colors: { primary: "violet.600" },
      radii: { base: "0.5rem" },
    };
    expect(renderPresetStyle(tokens, ".dark")).toBe(
      ":root {\n  --hope-primary: var(--color-violet-600);\n  --hope-radii-base: 0.5rem;\n}",
    );
  });

  it("emits radii even with no color overrides, and never in a dark block", () => {
    expect(renderPresetStyle({ radii: { base: "0.75rem" } }, ".dark")).toBe(
      ":root {\n  --hope-radii-base: 0.75rem;\n}",
    );
  });
});

describe("renderPresetStyle — sanitization", () => {
  it("throws on a value with CSS-breaking characters, naming the token", () => {
    for (const bad of ["red;color:blue", "red}", "{red", "a<b", "a>b", "line1\nline2"]) {
      expect(() => renderPresetStyle({ colors: { primary: bad } }, ".dark")).toThrow(/primary/);
    }
  });

  it("throws when the offending value is a token's dark value", () => {
    expect(() =>
      renderPresetStyle({ colors: { primary: { light: "violet.600", dark: "x;y" } } }, ".dark"),
    ).toThrow(/primary/);
  });

  it("throws on an unsafe radius value", () => {
    expect(() => renderPresetStyle({ radii: { base: "0.5rem;}" } }, ".dark")).toThrow(
      /radii\.base/,
    );
  });
});
