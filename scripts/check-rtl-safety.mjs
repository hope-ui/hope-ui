#!/usr/bin/env node
// Fails CI if a recipe (or any class string / CSSOM write in the packages) pins layout to a
// PHYSICAL side instead of a LOGICAL one. hope-ui supports RTL from day one, which is a property of
// the classes it emits, not of a per-component flag: `pr-8` reserves a gutter on the right in every
// locale, while `pe-8` reserves it on the side the text ends — the same side in `ltr`, the mirrored
// one in `rtl`. A physical utility therefore does not fail loudly; it silently mis-paints for every
// Arabic/Hebrew/Farsi reader while every test stays green. See __internal__/theming.md
// ("RTL-aware recipes"), the sibling rule to recipe purity.
//
// Scope: `packages/{presets,components,primitives}/src` (`.ts`/`.tsx`) — the three packages that
// author classes or write style properties — plus `apps/docs/src` (`.ts`/`.tsx`/`.mdx`/`.css`).
//
// The docs site is in scope because it is the highest-leverage surface of all: a `border-l-4` in a
// component doc is a recipe consumers copy into their own apps, so the defect propagates rather than
// merely shipping. Excluded, each for its own reason:
//   - `__tests__/` — a test legitimately asserts `not.toContain("pr-8")`.
//   - `packages/theming` — the contract layer authors no classes, and it holds the canonical rule
//     table (`PHYSICAL_UTILITIES` in `src/conformance.ts`), whose entries name every forbidden
//     utility as a string literal. Scanning it would flag the rule's own definition, 16 times.
//   - `packages/i18n` — no styling at all.
//
// Four passes. Which ones run is chosen per file extension, because the three languages here need
// three different projections:
//
//  1. CLASS UTILITIES (`.ts`/`.tsx`), over the string-literal interiors. Tokenised on whitespace and
//     matched whole, not by substring — so `./listbox-right` or a prose comment naming `pr-8` cannot
//     trip it, and neither can Tailwind v4's already-logical axis shorthands (`px-*` →
//     `padding-inline`, `mx-*`, `inset-x-*`, `border-x-*`, `space-x-*`, `divide-x-*`), which are
//     simply absent from the table.
//  2. CSSOM PROPERTY WRITES (`.ts`/`.tsx`), over the code projection. `createScrollLock` compensated
//     for the scrollbar with `body.style.paddingRight`, which pass 1 could never see — RTL engines
//     put the viewport scrollbar on the left, so it shifted the page by exactly the width it existed
//     to absorb. This pass also covers a JSX/`style` OBJECT key (`{ "padding-left": … }`), which is
//     invisible to both other projections: it is a code position, but the key is a string.
//  3. CLASS UTILITIES IN MDX (`.mdx`), over attribute/property values only — `[=:]\s*"…"`, so
//     `class="…"`, `slotClasses={{ root: "…" }}` and the `class="…"` inside a ```tsx fence are all
//     read, while prose is not. Deliberately NOT the JS tokenizer from `lib/source-projection.mjs`:
//     an apostrophe in MDX prose ("doesn't") opens a string literal that runs to the next
//     apostrophe, which garbles the projection for the rest of the paragraph. Prose staying out is a
//     feature, not a limitation — a doc *explaining* that `pr-8` is wrong must not fail the check
//     (`i18n.mdx` says "right-to-left", `dialog.mdx` says "right-aligns").
//  4. DIRECTIONAL CSS DECLARATIONS (`.css`), matched only at a PROPERTY position
//     (`^\s*padding-left:`), never anywhere in a value. That anchoring is what makes the pass worth
//     having: it never sees `linear-gradient(to right, …)` or a mask's `to right`, which are
//     direction-invariant, and it never sees `border-bottom-left-radius` because the property name
//     carries `radius` (a corner is always authored as a symmetric pair, so flagging one half is
//     pure noise). What is left is the small set that genuinely mis-paints.
//
// Deliberately NOT flagged by pass 2: bare `left` / `right`. `createFloating` writes floating-ui's
// computed coordinates as `{ left: `${x}px`, top: `${y}px` }` — physical is *required* there, and
// `inset-inline-start` would double-flip under RTL (__internal__/reference-implementations.md,
// § createFloating). `createPress`/`createFloating` also read `rect.left`/`rect.right` off
// `getBoundingClientRect()`, which is physical geometry by definition. Catching those would produce
// more noise than signal and push people to suppress the whole category, so pass 2 stays on
// padding/margin/border property *writes*, where it has no false positives at all.
//
// Also correctly physical: a utility scoped by one of `_base/_variants.css`'s `data-side-*` custom
// variants. `data-side` reports the side a floating layer LANDED on after `flip`, which is measured
// geometry, so a physical response under that scope is the matching answer rather than a defect —
// `MEASURED_SIDE_SCOPED` exempts it in pass 1, and the conformance kit's identical predicate does the
// same at runtime. A recipe that wants the reading-relative hook instead layers `ltr:`/`rtl:` on top,
// which `DIRECTION_SCOPED` covers. There is deliberately no inline-relative `data-side-*` pair beside
// the four physical ones, for that reason.
//
// Out of scope by construction: `origin-left`/`origin-right` — `transform-origin` has no portable
// logical keyword, so there is no replacement to point at and flagging it would only be noise.
//
// The four passes, their pattern tables and the two exemption predicates live in
// `lib/rtl-safety.mjs`, not here: this file is an executable that walks the repo and exits, so the
// rule had to move out of it to be testable on its own. What is left here is the scope, the walk,
// the `path:line` prefixing and the exit code.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { rtlSafetyViolations } from "./lib/rtl-safety.mjs";

const repoRoot = new URL("..", import.meta.url).pathname;
const SCAN_ROOTS = [
  ...["presets", "components", "primitives"].map((pkg) => join(repoRoot, "packages", pkg, "src")),
  join(repoRoot, "apps", "docs", "src"),
];

const SCANNED_EXTENSIONS = new Set([".ts", ".tsx", ".mdx", ".css"]);

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
const isTestFile = (p) => /\.(test|ssr\.test|browser\.test)\.tsx?$/.test(p);

/** A source file whose classes and style writes this rule governs. Stories are in — they are read. */
function isScannedFile(path) {
  if (underTests(path) || isTestFile(path) || path.endsWith(".d.ts")) {
    return false;
  }
  return SCANNED_EXTENSIONS.has(extname(path));
}

/** @type {string[]} */
const violations = [];

/** @param {string} file */
function checkFile(file) {
  const source = readFileSync(file, "utf8");
  const relPath = relative(repoRoot, file);
  for (const { line, message } of rtlSafetyViolations(source, extname(file))) {
    violations.push(`${relPath}:${line} — ${message}`);
  }
}

for (const root of SCAN_ROOTS) {
  let files;
  try {
    files = walk(root).filter(isScannedFile);
  } catch {
    continue;
  }
  for (const file of files) {
    checkFile(file);
  }
}

if (violations.length > 0) {
  console.error("RTL safety violated — layout is pinned to a physical side, not a logical one:\n");
  for (const line of violations) {
    console.error(`  - ${line}`);
  }
  console.error(
    `\n${violations.length} violation(s) found.\n` +
      "A deliberate physical class is spelled `ltr:`/`rtl:` (a manual flip), or exempted with an " +
      '`rtl-ok: <reason>` comment on the line. See __internal__/theming.md ("RTL-aware recipes").',
  );
  process.exit(1);
}

console.log(
  "check:rtl-safety passed — every class and style write is direction-relative " +
    "(logical properties only; no pl-/pr-/ml-/mr-/left-/right-/text-left/…).",
);
