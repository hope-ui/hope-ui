#!/usr/bin/env node
// Fails CI if a recipe (or any class string / CSSOM write in the packages) pins layout to a
// PHYSICAL side instead of a LOGICAL one. hope-ui supports RTL from day one, which is a property of
// the classes it emits, not of a per-component flag: `pr-8` reserves a gutter on the right in every
// locale, while `pe-8` reserves it on the side the text ends — the same side in `ltr`, the mirrored
// one in `rtl`. A physical utility therefore does not fail loudly; it silently mis-paints for every
// Arabic/Hebrew/Farsi reader while every test stays green. See __internal__/theming.md
// ("RTL-aware recipes"), the sibling rule to recipe purity.
//
// Scope: `packages/{presets,components,primitives}/src` source files (`.ts`/`.tsx`) — the three
// packages that author classes or write style properties. Excluded, each for its own reason:
//   - their `__tests__/` — a test legitimately asserts `not.toContain("pr-8")`.
//   - `packages/theming` — the contract layer authors no classes, and it holds the canonical rule
//     table (`PHYSICAL_UTILITIES` in `src/conformance.ts`), whose entries name every forbidden
//     utility as a string literal. Scanning it would flag the rule's own definition, 16 times.
//   - `packages/i18n` — no styling at all.
//   - `.css` — the tokenizer below is a JS one, so a preset authoring directional CSS in
//     `theme.css` is on review, not on this script.
//
// Two passes, over the two projections in `lib/source-projection.mjs`:
//
//  1. CLASS UTILITIES, over the string-literal interiors. Tokenised on whitespace and matched
//     whole, not by substring — so `./listbox-right` or a prose comment naming `pr-8` cannot trip
//     it, and neither can Tailwind v4's already-logical axis shorthands (`px-*` → `padding-inline`,
//     `mx-*`, `inset-x-*`, `border-x-*`, `space-x-*`, `divide-x-*`), which are simply absent from
//     the table.
//  2. CSSOM PROPERTY WRITES, over the code projection. `createScrollLock` compensated for the
//     scrollbar with `body.style.paddingRight`, which pass 1 could never see — RTL engines put the
//     viewport scrollbar on the left, so it shifted the page by exactly the width it existed to
//     absorb.
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
// `data-placement-left` / `data-placement-right` custom variants (floating-ui's placement vocabulary
// is physical by design, so the variant name matches the attribute value it selects), and
// `origin-left`/`origin-right` — `transform-origin` has no portable logical keyword, so there is no
// replacement to point at and flagging it would only be noise.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { blankNonCode, lineAt, stringInteriors } from "./lib/source-projection.mjs";

const repoRoot = new URL("..", import.meta.url).pathname;
const SCAN_ROOTS = ["presets", "components", "primitives"].map((pkg) =>
  join(repoRoot, "packages", pkg, "src"),
);

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
const isTestFile = (p) => /\.(test|ssr\.test|browser\.test)\.tsx?$/.test(p);

/** A source file whose classes and style writes this rule governs. Stories are in — they are read. */
function isScannedFile(path) {
  if (underTests(path) || isTestFile(path) || path.endsWith(".d.ts")) {
    return false;
  }
  return SOURCE_EXTENSIONS.has(path.slice(path.lastIndexOf(".")));
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

  const classText = stringInteriors(source);
  for (const token of classText.matchAll(/\S+/g)) {
    const { variants, base } = splitVariants(token[0]);
    if (isDirectionScoped(variants)) {
      continue;
    }
    const rule = PHYSICAL_UTILITIES.find(({ re }) => re.test(base));
    if (rule) {
      report(
        lineAt(classText, token.index),
        `physical utility "${token[0]}" — use ${rule.logical} instead of ${rule.physical}`,
      );
    }
  }

  const code = blankNonCode(source);
  for (const { re, logical } of PHYSICAL_STYLE_WRITES) {
    re.lastIndex = 0;
    for (const match of code.matchAll(re)) {
      report(lineAt(code, match.index), `physical CSS property "${match[1]}" — use ${logical}`);
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
