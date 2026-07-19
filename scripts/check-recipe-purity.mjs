#!/usr/bin/env node
// Fails CI if a preset recipe *computes* a color instead of referencing a finished token. Recipes
// reference `--hope-*` tokens only, as clean Tailwind utilities (`bg-primary`, `hover:bg-primary-hovered`,
// `focus-visible:ring-focus-halo`); the preset owns the raw scale and authors any derived value
// (a translucent halo, a mixed wash) as its own token in `tokens.css`. A recipe that reaches for
// `color-mix(...)`, an alpha modifier (`ring-focus/50`), or a magic opacity (`opacity-90`) applies a
// fixed rule to a base it does not own — so a consumer that redefines that base silently gets a
// broken color. See __internal__/theming.md ("recipe purity") and __internal__/semantic-color-token-redesign.md.
//
// Scope: `packages/presets/**/recipes/**` source files (`.ts`/`.tsx`) — the concrete recipes that
// paint tokens. NOT `packages/theming/src/recipes` (that is the type-only recipe *contract*), and
// NOT the recipes' `__tests__/` (a purity test legitimately mentions `color-mix`/`opacity-90` in its
// assertion strings and regexes).
//
// Mechanically this is the INVERSE of check-coverage-parity's `blankNonCode`: there, matches inside
// strings/comments are noise to blank away; here, the flagged patterns are exactly the ones that
// appear inside a class **string literal**. So this scans string-literal interiors only — code,
// comments (incl. this file's own doc examples and a recipe's header comment mentioning `color-mix`),
// and regex literals are blanked first, leaving offsets intact for line-accurate reporting.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const repoRoot = new URL("..", import.meta.url).pathname;
// Per the redesign spec, purity is a rule about the concrete preset recipes only.
const scanRoot = join(repoRoot, "packages", "presets", "src");

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"]);

/** @param {string} dir */
function walk(dir) {
  /** @type {string[]} */
  const files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      files.push(...walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

const underTests = (p) => /[/\\]__tests__[/\\]/.test(p);
const inRecipesDir = (p) => p.split(sep).includes("recipes");
const isTestFile = (p) => /\.(test|ssr\.test|browser\.test)\.tsx?$/.test(p);

/** A concrete recipe source file whose class strings the purity rule governs. */
function isRecipeSourceFile(path) {
  if (!inRecipesDir(path) || underTests(path) || isTestFile(path)) {
    return false;
  }
  if (path.endsWith(".d.ts")) {
    return false;
  }
  const ext = path.slice(path.lastIndexOf("."));
  return SOURCE_EXTENSIONS.has(ext);
}

/**
 * Projects `source` onto its string-literal interiors: every character that is code, a comment, or
 * a regex literal becomes a space (newlines preserved, so character offsets — and therefore line
 * numbers — are unchanged), and only the contents of `"`/`'`/`` ` `` literals survive. The patterns
 * below then match *only* what a recipe actually emits as a class, never a comment or the tokenizer's
 * own regexes. Adapted (inverted) from check-coverage-parity's `blankNonCode`.
 *
 * @param {string} source
 */
function stringInteriors(source) {
  const out = source.split("").map((c) => (c === "\n" ? "\n" : " "));
  /** Last significant code char — tells a regex literal from a division. */
  let previous = "";
  let index = 0;

  /** @param {number} from @param {number} to */
  const keep = (from, to) => {
    for (let i = from; i < to && i < source.length; i++) {
      out[i] = source[i];
    }
  };

  while (index < source.length) {
    const char = source[index];
    const next = source[index + 1];

    if (char === "/" && next === "/") {
      const end = source.indexOf("\n", index);
      index = end === -1 ? source.length : end;
      continue;
    }

    if (char === "/" && next === "*") {
      const end = source.indexOf("*/", index + 2);
      index = end === -1 ? source.length : end + 2;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      let i = index + 1;
      while (i < source.length) {
        if (source[i] === "\\") {
          i += 2;
        } else if (source[i] === char) {
          break;
        } else {
          i++;
        }
      }
      keep(index + 1, Math.min(i, source.length));
      index = Math.min(i + 1, source.length);
      previous = char;
      continue;
    }

    // A `/` starting an expression is a regex literal; after a value it is division. Either way it
    // is code, so it stays blanked — we only skip past it correctly.
    if (char === "/" && (previous === "" || "(,=:[!&|?{};+-*%~^".includes(previous))) {
      let i = index + 1;
      let inClass = false;
      while (i < source.length) {
        if (source[i] === "\\") {
          i += 2;
        } else if (source[i] === "[") {
          inClass = true;
          i++;
        } else if (source[i] === "]") {
          inClass = false;
          i++;
        } else if (source[i] === "\n" || (source[i] === "/" && !inClass)) {
          break;
        } else {
          i++;
        }
      }
      index = Math.min(i + 1, source.length);
      previous = "/";
      continue;
    }

    if (!/\s/.test(/** @type {string} */ (char))) {
      previous = /** @type {string} */ (char);
    }
    index++;
  }

  return out.join("");
}

// The forbidden shapes, each a global regex over the string-literal projection. `opacity-0` and
// `opacity-100` (full transparent / opaque) are legitimate layout, so the magic-opacity pattern only
// matches 1–99; the `opacity-*` *tokens* (`opacity-disabled`) never match — they have no digits.
const PATTERNS = [
  {
    label: "color-mix()",
    re: /color-mix\s*\(/g,
    hint: "author the derived color as a token in tokens.css (the scrim/focus-halo precedent)",
  },
  {
    label: "arbitrary value referencing --hope-* or color-mix",
    re: /\[[^\]]*(?:--hope-|color-mix)[^\]]*\]/g,
    hint: "reference a finished token utility instead of an arbitrary value",
  },
  {
    label: "alpha modifier on a color utility",
    re: /\b(?:bg|text|border|ring|outline|fill|stroke|shadow|decoration|accent|caret|divide|from|via|to)-[\w-]+\/\d{1,3}\b/g,
    hint: "author the translucent color as its own token (e.g. focus-halo) — do not mix it in the recipe",
  },
  {
    label: "magic opacity utility",
    re: /\bopacity-(?:[1-9]|[1-9]\d)\b/g,
    hint: "use an opacity-* token (opacity-disabled / opacity-loading); opacity-0 and opacity-100 are allowed",
  },
];

/** @param {string} text @param {number} offset */
function lineAt(text, offset) {
  let line = 1;
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text[i] === "\n") {
      line++;
    }
  }
  return line;
}

let recipeFiles;
try {
  recipeFiles = walk(scanRoot).filter(isRecipeSourceFile);
} catch {
  console.log("No packages/presets/src directory yet — nothing to check.");
  process.exit(0);
}

/** @type {string[]} */
const violations = [];

for (const file of recipeFiles) {
  const source = readFileSync(file, "utf8");
  const classText = stringInteriors(source);
  const relPath = relative(repoRoot, file);

  for (const { label, re, hint } of PATTERNS) {
    re.lastIndex = 0;
    for (const match of classText.matchAll(re)) {
      const line = lineAt(classText, match.index);
      violations.push(`${relPath}:${line} — ${label}: "${match[0]}" — ${hint}`);
    }
  }
}

if (violations.length > 0) {
  console.error("Recipe purity violated — a recipe computes a color instead of using a token:\n");
  for (const line of violations) {
    console.error(`  - ${line}`);
  }
  console.error(`\n${violations.length} violation(s) found.`);
  process.exit(1);
}

console.log(
  "check:recipe-purity passed — preset recipes reference finished --hope-* tokens only " +
    "(no color-mix, no alpha modifier, no magic opacity).",
);
