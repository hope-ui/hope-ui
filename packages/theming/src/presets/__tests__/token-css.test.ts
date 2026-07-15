import { describe, expect, it } from "vitest";
import type { PresetTokens } from "../presets";
import { renderPresetStyle } from "../token-css";

describe("renderPresetStyle — empty", () => {
  it("returns '' for no overrides", () => {
    expect(renderPresetStyle({}, ".dark")).toBe("");
    expect(renderPresetStyle({ colors: {} }, ".dark")).toBe("");
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

  it("wraps a `--` custom-property reference in var(…) and passes raw values through", () => {
    const tokens: PresetTokens = {
      colors: {
        primary: "--color-violet-500", // Tailwind palette var reference
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

  it("wraps the scale-less Tailwind colors via their --color-* reference", () => {
    const tokens: PresetTokens = {
      colors: {
        surface: "--color-white", // → var(--color-white)
        foreground: "--color-black", // → var(--color-black)
        scrim: "transparent", // a genuine CSS keyword still passes through untouched
      },
    };
    expect(renderPresetStyle(tokens, ".dark")).toBe(
      ":root {\n" +
        "  --hope-surface: var(--color-white);\n" +
        "  --hope-foreground: var(--color-black);\n" +
        "  --hope-scrim: transparent;\n" +
        "}",
    );
  });

  it("passes a bare CSS color keyword through untouched (no longer treated as a Tailwind color)", () => {
    // `"white"` is a valid CSS keyword; without the `--` prefix it is a literal value, not a
    // reference to `--color-white`. This is the deliberate consequence of dropping the `hue.step`
    // shorthand: the only normalization is `--…` → `var(--…)`.
    const tokens: PresetTokens = { colors: { surface: "white", foreground: "rebeccapurple" } };
    expect(renderPresetStyle(tokens, ".dark")).toBe(
      ":root {\n  --hope-surface: white;\n  --hope-foreground: rebeccapurple;\n}",
    );
  });
});

describe("renderPresetStyle — dark modes", () => {
  const tokens: PresetTokens = {
    colors: { primary: { light: "--color-violet-600", dark: "--color-violet-400" } },
  };

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
    const lightOnly: PresetTokens = { colors: { primary: { light: "--color-violet-600" } } };
    expect(renderPresetStyle(lightOnly, ".dark")).toBe(
      ":root {\n  --hope-primary: var(--color-violet-600);\n}",
    );
  });

  it("emits a dark block containing only the tokens that define one", () => {
    const mixed: PresetTokens = {
      colors: {
        surface: { light: "#fff", dark: "#000" },
        primary: "--color-violet-500", // string → both modes, no dark override
      },
    };
    expect(renderPresetStyle(mixed, ".dark")).toBe(
      ":root {\n  --hope-surface: #fff;\n  --hope-primary: var(--color-violet-500);\n}\n" +
        ".dark {\n  --hope-surface: #000;\n}",
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
      renderPresetStyle(
        { colors: { primary: { light: "--color-violet-600", dark: "x;y" } } },
        ".dark",
      ),
    ).toThrow(/primary/);
  });
});
