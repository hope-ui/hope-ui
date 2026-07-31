// The RTL-safety rule, extracted from `check-rtl-safety.mjs` so it can be tested directly: that
// script is a top-level executable that walks the repo and calls `process.exit`, so importing it to
// reach the rule would run the whole check.
//
// What stays in the script: the scan roots, `walk`, `isScannedFile`, the `path:line — message`
// formatting and the exit code. What lives here: the four passes, their pattern tables, and the two
// exemption predicates — everything that turns a file's TEXT into violations.
//
// Because the rule branches on language, `rtlSafetyViolations` takes the extension as an ARGUMENT
// rather than re-deriving it from a path: this module never sees a path, and a test can exercise the
// `.css` pass without inventing a filesystem.
//
// The rule itself, and why a physical utility is a silent defect rather than a loud one:
// __internal__/theming.md ("RTL-aware recipes"), plus the header of `check-rtl-safety.mjs`, which
// documents the scope and the four projections.
import { blankNonCode, lineAt, stringInteriors } from "./source-projection.mjs";

// Pass 1's table. Each entry matches a WHOLE base utility (variant chain already stripped), so the
// leading `^` and the trailing `-`/`$` both carry weight: `^-?pr-` matches `pr-8` and `-pr-2` but
// not `pre-wrap`, and `^border-l(-|$)` matches `border-l` and `border-l-4` but not `border-blue-500`.
//
// This table is the canonical one shared with `PHYSICAL_UTILITIES` in
// `packages/theming/src/conformance.ts`, which applies the same rule to a *resolved* recipe at
// runtime (and so reaches third-party presets and compound variants). A drift guard in
// `packages/presets/src/hope/__tests__/hope.test.ts` reads the script file and fails if the two
// diverge — on the rule table AND on the exemption predicates below.
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
 * Pass 3: the class-bearing slices of an `.mdx` file. See `check-rtl-safety.mjs`'s header for why
 * this is not the JS tokenizer.
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
 * has a usable signal-to-noise ratio — see `check-rtl-safety.mjs`'s header. `radius` is excluded by
 * construction: no entry matches a property name containing it.
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
 * Splits a Tailwind candidate into its variant chain and the base utility at the last **top-level**
 * `:`, ignoring any inside square brackets.
 *
 * The bracket depth is load-bearing for a colon in the BASE utility's arbitrary value, not for one
 * in the variant chain: `supports-[display:grid]:pl-2` splits correctly either way, because the
 * last colon in the string is already the real separator. What needs the counter is
 * `border-l-[length:2px]` — without it the split lands inside the brackets, leaving base `2px]`,
 * which matches no rule, and a physical `border-l-` ships unflagged.
 *
 * @param {string} candidate
 */
export function splitVariants(candidate) {
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
 */
const DIRECTION_SCOPED = /(^|:)(rtl|ltr):/;

/**
 * `data-side` reports where a floating layer LANDED after `flip` — measured geometry, a physical
 * fact — so a physical response under that scope is the matching answer, not a defect
 * (`__internal__/theming.md` § The governing rule). A recipe that genuinely needs "the side nearest
 * where the text starts" still layers `ltr:`/`rtl:` on top, which `DIRECTION_SCOPED` covers.
 *
 * Scoped to `_base/_variants.css`'s registered variant names, the vocabulary `createFloating`
 * emits. The arbitrary form (`data-[side=bottom]:`) is deliberately NOT matched.
 */
const MEASURED_SIDE_SCOPED = /(^|:)data-side-(top|right|bottom|left):/;

/**
 * Whether a candidate's variant chain makes its base utility direction-invariant — either a manual
 * flip the author already spelled both ways, or a scope whose own values are physical geometry.
 *
 * @param {string} variants
 */
export function isDirectionInvariant(variants) {
  return DIRECTION_SCOPED.test(variants) || MEASURED_SIDE_SCOPED.test(variants);
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

/**
 * Every place `source` pins layout to a physical side rather than a logical one, in the order the
 * four passes run.
 *
 * @param {string} source The file's text, unprojected — the exemption scan needs the comments.
 * @param {string} extension The file's extension, dot included (`".tsx"`, `".mdx"`, `".css"`). The
 *   rule runs three different projections, so the language is a parameter rather than a guess.
 * @returns {Array<{ line: number; message: string }>}
 */
export function rtlSafetyViolations(source, extension) {
  const sourceLines = source.split("\n");

  /** @type {Array<{ line: number; message: string }>} */
  const violations = [];

  /** @param {number} line @param {string} message */
  const report = (line, message) => {
    if (!hasReasonedExemption(sourceLines, line)) {
      violations.push({ line, message });
    }
  };

  /** Pass 1 / pass 3: whole-token class matching over whichever projection the language allows. */
  const checkClassTokens = (projection) => {
    for (const token of projection.matchAll(/\S+/g)) {
      const { variants, base } = splitVariants(token[0]);
      if (isDirectionInvariant(variants)) {
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

  if (extension === ".css") {
    for (const { re, logical } of PHYSICAL_CSS_DECLARATIONS) {
      re.lastIndex = 0;
      for (const match of source.matchAll(re)) {
        report(lineAt(source, match.index), `physical CSS "${match[1]}" — use ${logical}`);
      }
    }
    return violations;
  }

  if (extension === ".mdx") {
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
    return violations;
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

  return violations;
}
