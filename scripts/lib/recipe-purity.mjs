// The recipe-purity rule, extracted from `check-recipe-purity.mjs` so it can be tested directly:
// that script is a top-level executable that walks `packages/presets/src` and calls `process.exit`,
// so importing it to reach the scanner would run the whole check.
//
// The script keeps everything that touches the filesystem — the walk, the recipe-source filter, the
// `path:line — message` formatting and the exit code. What lives here is the part that decides, from
// a file's text alone, whether that file computes a color: the pattern table and the scan over it.
//
// The `stringInteriors` projection is load-bearing, not an optimisation. The rule's evidence is what
// a recipe *emits* as a class string, so anything that is code, a comment or a regex literal is
// blanked before the patterns run — which is what gives the check script's own header (it names
// `color-mix`, `bg-x/50` and `opacity-90` in prose) and a recipe's header comment immunity.
//
// The rule itself, and why a computed color is a bug: __internal__/theming.md ("recipe purity").
import { lineAt, stringInteriors } from "./source-projection.mjs";

// The forbidden shapes, each a global regex over the string-literal projection. `opacity-0` and
// `opacity-100` (full transparent / opaque) are legitimate layout, so the magic-opacity pattern only
// matches 1–99; the `opacity-*` *tokens* (`opacity-disabled`) never match — they have no digits.
export const PATTERNS = [
  {
    label: "color-mix()",
    re: /color-mix\s*\(/g,
    hint: "author the derived color as a token in theme.css (the scrim/focus-halo precedent)",
  },
  {
    label: "arbitrary value referencing --hope-* or color-mix",
    re: /\[[^\]]*(?:--hope-|color-mix)[^\]]*\]/g,
    hint: "reference a finished token utility instead of an arbitrary value",
  },
  {
    label: "alpha modifier on a color utility",
    // The modifier is a plain 1–3 digit percentage (`bg-primary/50`) OR an arbitrary value
    // (`bg-primary/[0.5]`, `/[12.5%]`, `/[var(--a)]`). The bracket form is the same sin spelled
    // differently, and it used to escape both this pattern (which required digits) and the
    // arbitrary-value pattern above (which only fires on `--hope-`/`color-mix` inside the brackets).
    re: /\b(?:bg|text|border|ring|outline|fill|stroke|shadow|decoration|accent|caret|divide|from|via|to)-[\w-]+\/(?:\d{1,3}\b|\[[^\]]*\])/g,
    // `text-sm/6` is Tailwind's font-size/line-height shorthand, not a color with an alpha —
    // `text-` is in the prefix list above, so without this a correct recipe is rejected. Scoped to
    // the font-size scale rather than "any bare number", so `text-primary/50` still fails.
    except: /^text-(?:xs|sm|base|lg|xl|[2-9]xl)\/(?:\d+|\[[^\]]*\])$/,
    hint: "author the translucent color as its own token (e.g. focus-halo) — do not mix it in the recipe",
  },
  {
    label: "magic opacity utility",
    re: /\bopacity-(?:[1-9]|[1-9]\d)\b/g,
    hint: "use an opacity-* token (opacity-disabled / opacity-loading); opacity-0 and opacity-100 are allowed",
  },
];

/**
 * Every computed color in one recipe source file, in pattern order, each with the 1-based line it
 * sits on so the caller can report `path:line`.
 *
 * @param {string} source The recipe file's text.
 * @returns {Array<{ line: number; message: string }>}
 */
export function recipePurityViolations(source) {
  const classText = stringInteriors(source);

  /** @type {Array<{ line: number; message: string }>} */
  const violations = [];
  for (const { label, re, except, hint } of PATTERNS) {
    // The patterns are module-scope `/g` regexes shared across every file the script scans, so
    // `lastIndex` has to be cleared before each run.
    re.lastIndex = 0;
    for (const match of classText.matchAll(re)) {
      // A pattern's `except` carves out a utility that is shaped like the sin but isn't one. It is
      // matched against the whole candidate, so it can only ever narrow that one pattern.
      if (except?.test(match[0])) {
        continue;
      }
      violations.push({
        line: lineAt(classText, match.index),
        message: `${label}: "${match[0]}" — ${hint}`,
      });
    }
  }
  return violations;
}
