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
// Also correctly physical, and out of scope by construction: `_base/_variants.css`'s
// `data-placement-left` / `data-placement-right` custom variants (`data-placement` reports the side a
// floating layer LANDED on after `flip`, which is a physical fact — the inline-relative hook a recipe
// may want is the derived `data-placement-inline-start`/`-end` pair beside them), and
// `origin-left`/`origin-right` — `transform-origin` has no portable logical keyword, so there is no
// replacement to point at and flagging it would only be noise.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { blankNonCode, lineAt, stringInteriors } from "./lib/source-projection.mjs";

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

// Pass 1's table. Each entry matches a WHOLE base utility (variant chain already stripped), so the
// leading `^` and the trailing `-`/`$` both carry weight: `^-?pr-` matches `pr-8` and `-pr-2` but
// not `pre-wrap`, and `^border-l(-|$)` matches `border-l` and `border-l-4` but not `border-blue-500`.
//
// This table is the canonical one shared with `PHYSICAL_UTILITIES` in
// `packages/theming/src/conformance.ts`, which applies the same rule to a *resolved* recipe at
// runtime (and so reaches third-party presets and compound variants). A drift guard in
// `packages/theming/src/__tests__/conformance.test.ts` reads this file and fails if the two diverge.
const PHYSICAL_UTILITIES = [
  { re: /^-?pl-/, physical: "pl-*", logical: "ps-*" },
  { re: /^-?pr-/, physical: "pr-*", logical: "pe-*" },
  { re: /^-?ml-/, physical: "ml-*", logical: "ms-*" },
  { re: /^-?mr-/, physical: "mr-*", logical: "me-*" },
  { re: /^-?left-/, physical: "left-*", logical: "start-*" },
  { re: /^-?right-/, physical: "right-*", logical: "end-*" },
  { re: /^border-l(-|$)/, physical: "border-l*", logical: "border-s*" },
  { re: /^border-r(-|$)/, physical: "border-r*", logical: "border-e*" },
  { re: /^rounded-l(-|$)/, physical: "rounded-l*", logical: "rounded-s*" },
  { re: /^rounded-r(-|$)/, physical: "rounded-r*", logical: "rounded-e*" },
  { re: /^rounded-tl(-|$)/, physical: "rounded-tl*", logical: "rounded-ss*" },
  { re: /^rounded-tr(-|$)/, physical: "rounded-tr*", logical: "rounded-se*" },
  { re: /^rounded-bl(-|$)/, physical: "rounded-bl*", logical: "rounded-es*" },
  { re: /^rounded-br(-|$)/, physical: "rounded-br*", logical: "rounded-ee*" },
  { re: /^text-left$/, physical: "text-left", logical: "text-start" },
  { re: /^text-right$/, physical: "text-right", logical: "text-end" },
  { re: /^float-left$/, physical: "float-left", logical: "float-start" },
  { re: /^float-right$/, physical: "float-right", logical: "float-end" },
  { re: /^clear-left$/, physical: "clear-left", logical: "clear-start" },
  { re: /^clear-right$/, physical: "clear-right", logical: "clear-end" },
  { re: /^scroll-pl-/, physical: "scroll-pl-*", logical: "scroll-ps-*" },
  { re: /^scroll-pr-/, physical: "scroll-pr-*", logical: "scroll-pe-*" },
  { re: /^scroll-ml-/, physical: "scroll-ml-*", logical: "scroll-ms-*" },
  { re: /^scroll-mr-/, physical: "scroll-mr-*", logical: "scroll-me-*" },
];

// Pass 2's table, over the code projection.
const PHYSICAL_STYLE_WRITES = [
  {
    re: /\.style\.(paddingLeft|paddingRight|marginLeft|marginRight|borderLeft\w*|borderRight\w*)\s*=/g,
    logical: "the paddingInlineStart/End, marginInlineStart/End or borderInlineStart/End property",
  },
  {
    re: /getComputedStyle\([^()]*\)\.(paddingLeft|paddingRight|marginLeft|marginRight|borderLeft\w*|borderRight\w*)\b/g,
    logical: "the matching *InlineStart / *InlineEnd property",
  },
  {
    // A `style={{ "padding-left": … }}` object key. It lives at a code position but *is* a string, so
    // neither existing projection can see it: the code projection blanks the key's contents, and the
    // string projection has no way to tell it from a class. Matched on the original source instead,
    // which is safe because the shape is too specific to appear in prose. `TableOfContents.tsx` in
    // the docs indented its headings with exactly this, under a `border-s` rule.
    re: /["']((?:padding|margin|border|scroll-padding|scroll-margin|inset)-(?:left|right))["']\s*:/g,
    logical: "the -inline-start / -inline-end spelling",
    // Neither projection can carry this one: the code projection blanks the key because it is a
    // string, and the string projection drops the surrounding `:` that identifies it as a key.
    onOriginalSource: true,
  },
];

/**
 * Pass 3: the class-bearing slices of an `.mdx` file. See the header for why this is not the JS
 * tokenizer.
 *
 * Keyed on the ATTRIBUTE NAME, not merely on "a quoted string at a property position" — an earlier
 * cut matched any `[=:]\s*"…"` and flagged `dialog.mdx`'s `description: "…a sunken bar that
 * right-aligns its buttons…"`, which is prose. Two shapes cover everything the content actually
 * uses: a `class="…"` attribute, and a `slotClasses={{ … }}` block whose inner keys are arbitrary
 * slot names, so every quoted string inside the braces is a class list.
 */
const MDX_CLASS_ATTRIBUTE = /\bclass(?:Name)?\s*=\s*"([^"\n]*)"/g;
const MDX_SLOT_CLASSES_BLOCK = /\bslotClasses\s*=\s*\{\{([^}]*)\}\}/g;
const QUOTED_STRING = /"([^"\n]*)"/g;

/**
 * Pass 4's table. Every entry is anchored to a PROPERTY position, which is the whole reason the pass
 * has a usable signal-to-noise ratio — see the header. `radius` is excluded by construction: no entry
 * matches a property name containing it.
 */
const PHYSICAL_CSS_DECLARATIONS = [
  {
    re: /^[ \t]*((?:scroll-)?(?:padding|margin)-(?:left|right))[ \t]*:/gm,
    logical: "the -inline-start / -inline-end spelling",
  },
  {
    re: /^[ \t]*(border-(?:left|right)(?:-(?:width|style|color))?)[ \t]*:/gm,
    logical: "border-inline-start / border-inline-end",
  },
  { re: /^[ \t]*(left|right)[ \t]*:/gm, logical: "inset-inline-start / inset-inline-end" },
  {
    re: /^[ \t]*(?:text-align|float|clear)[ \t]*:[ \t]*(left|right)\b/gm,
    logical: "the start / end keyword",
  },
];

/**
 * Splits a Tailwind candidate into its variant chain and the base utility, ignoring `:` inside an
 * arbitrary variant (`[&_svg]:`, `data-[slot=x]:`, `supports-[...]:`).
 *
 * @param {string} candidate
 */
function splitVariants(candidate) {
  let depth = 0;
  let lastSeparator = -1;
  for (let i = 0; i < candidate.length; i++) {
    const char = candidate[i];
    if (char === "[") {
      depth++;
    } else if (char === "]") {
      depth--;
    } else if (char === ":" && depth === 0) {
      lastSeparator = i;
    }
  }
  return {
    variants: candidate.slice(0, lastSeparator + 1),
    base: candidate.slice(lastSeparator + 1),
  };
}

/**
 * A `rtl:`/`ltr:`-scoped utility is a deliberate manual flip (`ltr:pr-8 rtl:pl-8`), the one shape
 * where a physical class is the correct answer. `calendar.ts`'s `rtl:[&_svg]:rotate-180` is the
 * in-repo precedent.
 *
 * @param {string} variants
 */
function isDirectionScoped(variants) {
  return /(^|:)(rtl|ltr):/.test(variants);
}

/**
 * The escape hatch, read from the ORIGINAL source (the projections blank comments): `rtl-ok:` plus a
 * reason, on the offending line or the one above it. Modelled on `expectNoA11yViolations`'
 * `allowIncomplete` — name the specific case with a reason, never silence the category. A bare
 * `rtl-ok:` with nothing after it does not count.
 *
 * @param {string[]} sourceLines @param {number} line
 */
function hasReasonedExemption(sourceLines, line) {
  const reasoned = /rtl-ok:\s*\S/;
  return reasoned.test(sourceLines[line - 1] ?? "") || reasoned.test(sourceLines[line - 2] ?? "");
}

/** @type {string[]} */
const violations = [];

/** @param {string} file */
function checkFile(file) {
  const source = readFileSync(file, "utf8");
  const sourceLines = source.split("\n");
  const relPath = relative(repoRoot, file);

  /** @param {number} line @param {string} message */
  const report = (line, message) => {
    if (!hasReasonedExemption(sourceLines, line)) {
      violations.push(`${relPath}:${line} — ${message}`);
    }
  };

  /** Pass 1 / pass 3: whole-token class matching over whichever projection the language allows. */
  const checkClassTokens = (projection) => {
    for (const token of projection.matchAll(/\S+/g)) {
      const { variants, base } = splitVariants(token[0]);
      if (isDirectionScoped(variants)) {
        continue;
      }
      const rule = PHYSICAL_UTILITIES.find(({ re }) => re.test(base));
      if (rule) {
        report(
          lineAt(projection, token.index),
          `physical utility "${token[0]}" — use ${rule.logical} instead of ${rule.physical}`,
        );
      }
    }
  };

  if (extname(file) === ".css") {
    for (const { re, logical } of PHYSICAL_CSS_DECLARATIONS) {
      re.lastIndex = 0;
      for (const match of source.matchAll(re)) {
        report(lineAt(source, match.index), `physical CSS "${match[1]}" — use ${logical}`);
      }
    }
    return;
  }

  if (extname(file) === ".mdx") {
    // Project onto the class-bearing values alone, preserving every offset so a match's line number
    // still points at the original file.
    const values = source.split("").map((c) => (c === "\n" ? "\n" : " "));
    /** @param {number} start @param {string} text */
    const keep = (start, text) => {
      for (let i = 0; i < text.length; i++) {
        values[start + i] = text[i];
      }
    };

    for (const re of [MDX_CLASS_ATTRIBUTE, MDX_SLOT_CLASSES_BLOCK]) {
      re.lastIndex = 0;
      for (const match of source.matchAll(re)) {
        const groupStart = match.index + match[0].indexOf(match[1], 1);
        if (re === MDX_CLASS_ATTRIBUTE) {
          keep(groupStart, match[1]);
          continue;
        }
        QUOTED_STRING.lastIndex = 0;
        for (const inner of match[1].matchAll(QUOTED_STRING)) {
          keep(groupStart + inner.index + 1, inner[1]);
        }
      }
    }
    checkClassTokens(values.join(""));
    return;
  }

  checkClassTokens(stringInteriors(source));

  const code = blankNonCode(source);
  for (const { re, logical, onOriginalSource } of PHYSICAL_STYLE_WRITES) {
    re.lastIndex = 0;
    const haystack = onOriginalSource ? source : code;
    for (const match of haystack.matchAll(re)) {
      report(lineAt(haystack, match.index), `physical CSS property "${match[1]}" — use ${logical}`);
    }
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
