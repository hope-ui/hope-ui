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
 * - a value beginning with `--` is a CSS custom-property *reference* and is wrapped in `var(...)`
 *   (`"--color-violet-500"` → `var(--color-violet-500)`). This is the deliberate way to point a token
 *   at a Tailwind palette var (`--color-*`) or any other custom property. Because the literal
 *   `--color-violet-500` string then appears in the preset's own (build-scanned) source, Tailwind's
 *   scanner keeps that palette var instead of tree-shaking it — a bare `"violet.500"`-style shorthand
 *   would not, so the runtime `var(--color-violet-500)` would resolve to nothing.
 * - every other value is an already-formed CSS color (`"#fff"`, `"oklch(…)"`, `"var(--x)"`,
 *   `"transparent"`, `"color-mix(…)"`) and passes through untouched.
 *
 * A per-token `dark` value emits into a dark block honoring `darkMode` (a selector — default
 * `".dark"` —, `"media"`, or `"none"`); a token with no `dark` emits no dark override (it inherits
 * the base theme). Values are checked for CSS-breaking characters (`{ } ; < >` / newlines) and throw
 * — a cheap defense against a malformed dev-authored token corrupting the stylesheet.
 */
import { hopeVar, SEMANTIC_COLOR_TOKENS } from "../semantic-tokens/semantic-tokens";
import type { ColorTokenKey, DarkMode, PresetTokens, TokenValue } from "./presets";

/**
 * The prefix that marks a value as a CSS custom-property *reference* rather than a literal color.
 * A value starting with `--` (`"--color-violet-500"`, the same variable `bg-violet-500` compiles to)
 * is wrapped in `var(...)`; anything else is an already-formed CSS value and passes through raw.
 * (hope's own `--hope-*` namespace is owned by `../semantic-tokens/semantic-tokens`, via `hopeVar`.)
 */
const CSS_VAR_REFERENCE_PREFIX = "--";

/** CSS-breaking characters no legitimate token value needs — presence means a corrupt/injected value. */
const UNSAFE_VALUE = /[{}<>;\n\r]/;

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

/** Resolve a color value: a `--` reference → `var(--…)`; an already-formed value passes through raw. */
function resolveColorValue(value: string): string {
  const trimmed = value.trim();
  return trimmed.startsWith(CSS_VAR_REFERENCE_PREFIX) ? `var(${trimmed})` : trimmed;
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
