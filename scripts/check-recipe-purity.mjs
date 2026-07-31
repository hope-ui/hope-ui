#!/usr/bin/env node
// Fails CI if a preset recipe *computes* a color instead of referencing a finished token. Recipes
// reference `--hope-*` tokens only, as clean Tailwind utilities (`bg-primary`, `hover:bg-primary-hovered`,
// `focus-visible:ring-focus-halo`); the preset owns the raw scale and authors any derived value
// (a translucent halo, a mixed wash) as its own token in `theme.css`. A recipe that reaches for
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
// and regex literals are blanked first, leaving offsets intact for line-accurate reporting. Both
// projections live in `scripts/lib/source-projection.mjs`.
//
// The pattern table and the per-file scan live in `scripts/lib/recipe-purity.mjs` so they can be
// tested without running this walk; what stays here is the filesystem half.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { recipePurityViolations } from "./lib/recipe-purity.mjs";

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
  const relPath = relative(repoRoot, file);
  for (const { line, message } of recipePurityViolations(readFileSync(file, "utf8"))) {
    violations.push(`${relPath}:${line} — ${message}`);
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
