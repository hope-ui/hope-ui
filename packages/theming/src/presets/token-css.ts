/**
 * The **deterministic token-CSS renderer** — a preset's `tokens` → the `<style>` text
 * `ThemeProvider` inlines (server-rendered, before first paint). Pure and DOM-free.
 *
 * Determinism is the whole point (constraint #1 — byte-stable server === client output, no hydration
 * mismatch): colors are emitted in the fixed `SEMANTIC_COLOR_TOKENS` order (**never** object-key
 * order), with constant whitespace. A preset with no overrides renders `""` (the provider then
 * returns the exact zero-DOM tree).
 *
 * It also owns every CSS-value transform, so `./presets` can store tokens exactly as authored:
 * - camelCase key → `--hope-<kebab>` (`onPrimarySoft` → `--hope-on-primary-soft`);
 * - Tailwind color shorthand `"violet.500"` → `var(--color-violet-500)`, and the scale-less Tailwind
 *   colors `"white"`/`"black"` → `var(--color-white)`/`var(--color-black)`; values already starting
 *   with `var(`/`#`/`rgb`/`hsl`/`oklch`/… (or a bare CSS keyword like `transparent`) pass through raw.
 *
 * A per-token `dark` value emits into a dark block honoring `darkMode` (a selector — default
 * `".dark"` —, `"media"`, or `"none"`); a token with no `dark` emits no dark override (it inherits
 * the base theme). Values are checked for CSS-breaking characters (`{ } ; < >` / newlines) and throw
 * — a cheap defense against a malformed dev-authored token corrupting the stylesheet.
 */
import { hopeVar, SEMANTIC_COLOR_TOKENS } from "../semantic-tokens/semantic-tokens";
import type { ColorTokenKey, DarkMode, PresetTokens, TokenValue } from "./presets";

/**
 * Tailwind v4's generated color custom-property namespace: the `"violet.500"` shorthand resolves to
 * `var(--color-violet-500)`, the same variable `bg-violet-500` compiles to. (hope's own `--hope-*`
 * namespace is owned by `../semantic-tokens/semantic-tokens` and consumed here via `hopeVar`.)
 */
const TAILWIND_COLOR_VAR_PREFIX = "--color-";

/** CSS-breaking characters no legitimate token value needs — presence means a corrupt/injected value. */
const UNSAFE_VALUE = /[{}<>;\n\r]/;

/** Prefixes that mark an already-formed CSS color; such values pass through the shorthand step raw. */
const RAW_COLOR_PREFIXES = [
  "var(",
  "#",
  "rgb",
  "hsl",
  "oklch",
  "oklab",
  "lab(",
  "lch(",
  "hwb(",
  "color(",
];

/** A Tailwind color shorthand: `hue.step` (`"violet.500"`, `"mauve.600"`). */
const TAILWIND_SHORTHAND = /^[a-z][a-z0-9]*\.[a-z0-9]+$/i;

/**
 * Tailwind's scale-less base colors — they have a `--color-*` var (`--color-white`, `--color-black`)
 * but no `hue.step` form, so they're normalized here by name (`"white"` → `var(--color-white)`) just
 * like `"violet.500"`. Everything else with no dot (`transparent`, `currentColor`, a raw hex) is a
 * genuine CSS value and passes through untouched.
 */
const TAILWIND_KEYWORD_COLORS = new Set(["white", "black"]);

/** kebab → camelCase, matching the `KebabToCamel` type: `"on-primary-soft"` → `"onPrimarySoft"`. */
function kebabToCamel(token: string): string {
  return token.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());
}

/** Throw if `value` contains a CSS-breaking character, naming the token so the author can find it. */
function assertSafeValue(value: string, token: string): void {
  if (UNSAFE_VALUE.test(value)) {
    throw new Error(
      `Preset token "${token}" has an unsafe value ${JSON.stringify(value)}: token values may not ` +
        "contain { } ; < > or newlines.",
    );
  }
}

/** Resolve a color value: Tailwind shorthand → `var(--color-…)`; an already-formed value passes raw. */
function resolveColorValue(value: string): string {
  const trimmed = value.trim();
  if (RAW_COLOR_PREFIXES.some((prefix) => trimmed.startsWith(prefix))) {
    return trimmed;
  }
  if (TAILWIND_SHORTHAND.test(trimmed)) {
    return `var(${TAILWIND_COLOR_VAR_PREFIX}${trimmed.replace(".", "-")})`;
  }
  if (TAILWIND_KEYWORD_COLORS.has(trimmed)) {
    return `var(${TAILWIND_COLOR_VAR_PREFIX}${trimmed})`;
  }
  // A bare CSS keyword (`transparent`, `currentColor`) or other raw value — pass through.
  return trimmed;
}

/** Normalize a `TokenValue` to `{ light, dark? }` (a bare string is both modes). */
function normalizeTokenValue(value: TokenValue): { light: string; dark?: string } {
  return typeof value === "string" ? { light: value } : value;
}

/** Indent each declaration by `spaces` and join with newlines. */
function block(declarations: readonly string[], spaces: number): string {
  const pad = " ".repeat(spaces);
  return declarations.map((declaration) => `${pad}${declaration}`).join("\n");
}

/**
 * Render a preset's token overrides to deterministic `<style>` text. Returns `""` when there are no
 * overrides. See the module doc for the full contract.
 */
export function renderPresetStyle(tokens: PresetTokens, darkMode: DarkMode): string {
  const lightDeclarations: string[] = [];
  const darkDeclarations: string[] = [];

  // Colors, in the fixed vocabulary order (byte-stable regardless of the input object's key order).
  for (const token of SEMANTIC_COLOR_TOKENS) {
    const value = tokens.colors?.[kebabToCamel(token) as ColorTokenKey];
    if (value === undefined) {
      continue;
    }
    const { light, dark } = normalizeTokenValue(value);
    assertSafeValue(light, token);
    lightDeclarations.push(`${hopeVar(token)}: ${resolveColorValue(light)};`);
    if (dark !== undefined) {
      assertSafeValue(dark, token);
      darkDeclarations.push(`${hopeVar(token)}: ${resolveColorValue(dark)};`);
    }
  }

  if (lightDeclarations.length === 0) {
    return "";
  }

  const parts = [`:root {\n${block(lightDeclarations, 2)}\n}`];

  if (darkDeclarations.length > 0 && darkMode !== "none") {
    if (darkMode === "media") {
      parts.push(
        `@media (prefers-color-scheme: dark) {\n  :root {\n${block(darkDeclarations, 4)}\n  }\n}`,
      );
    } else {
      parts.push(`${darkMode} {\n${block(darkDeclarations, 2)}\n}`);
    }
  }

  return parts.join("\n");
}
