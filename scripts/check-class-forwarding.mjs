#!/usr/bin/env node
// Fails CI when a component part computes its `class` from a recipe slot but drops the consumer's.
//
// This is a silent-failure rule, the same shape as `check:rtl-safety`. A part declares the native
// attributes (so `class` is in its public type and in the docs), then writes:
//
//     const elementProps = merge(rest, {
//       get class(): string {
//         return ctx.slots.icon();        // ← the consumer's `class` is now gone
//       },
//     });
//
// `merge` resolves by presence and the getter is the later source, so it wins over the `class` that
// arrived in `rest`. Nothing fails: it type-checks, the component's own suite passes, and the docs
// keep promising the class is merged. It shipped exactly this way in five `Alert` parts, and the
// same family of bug shipped twice before (`Calendar.Root`, `Listbox.ItemIndicator`).
//
// THE RULE: inside a `get class()` getter, a slot fn must be called with the consumer's class —
// `ctx.slots.icon(props.class)`, or `slots.root(merged.class)` on a root that merged its defaults.
// A bare `ctx.slots.icon()` there is a violation.
//
// Scope: `packages/components/src/<component>/*.tsx`, minus stories and `__tests__/`. Only
// `@hope-ui/components` assembles slot classes onto elements; theming owns the seam itself and
// primitives never touch classes.
//
// DELIBERATELY NOT FLAGGED — a slot call in a JSX attribute (`class={slots.label()}`). That is how
// this repo writes a component's *internal chrome* — Button's label and decorators, Badge's dot,
// CloseButton's icon, Calendar's weekday `<th>` — inline elements a consumer cannot address with a
// `class` prop because they are not parts. Restricting the rule to the `get class()` getter, which
// is the shape every public part uses for its element props, is what keeps this check at zero false
// positives without a dozen exemption comments. The cost is that a *future* public part written
// with an inline `class={...}` binding would slip through; the cross-component runtime pin
// (`packages/components/src/__tests__/part-class-forwarding.browser.test.tsx`) is what covers that
// side, by asserting the class on the rendered element.
//
// The named escape hatch is a `class-forwarding-ok: <reason>` comment on the offending line, or
// anywhere in the comment block directly above the getter — for an element that genuinely has no
// consumer (`CalendarCell` is built by `Calendar.Grid` from a model, never written in JSX).

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { blankNonCode, lineAt } from "./lib/source-projection.mjs";

const SCAN_ROOT = "packages/components/src";
const EXEMPTION = "class-forwarding-ok:";

/** A `get class()` getter body — single-expression in this codebase, so it holds no nested brace. */
const CLASS_GETTER = /get\s+class\s*\([^)]*\)[^{]*\{([^}]*)\}/g;
/** A slot call with an empty argument list: `ctx.slots.icon()` / `slots.root()`. */
const SLOT_CALL_WITHOUT_CLASS = /\bslots\.([A-Za-z_]\w*)\(\s*\)/g;
/**
 * An `omit(…)` call, matched on the CODE projection so a comment describing one is not a call. The
 * argument list is then re-read from the original source at the same offsets: the projection blanks
 * string *interiors*, so `"class"` is invisible in it — the very reason this check reads both.
 */
const OMIT_CALL = /\bomit\s*\(([^)]*)\)/g;
const CLASS_ARGUMENT = /["']class["']/;
/** Any read of the consumer's class, however it is spelled (`props.class`, `merged.class`). */
const READS_CONSUMER_CLASS = /\b(?:props|merged)\.class\b/;

const violations = [];

function walk(directory) {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) {
      return entry === "__tests__" ? [] : walk(path);
    }
    return path.endsWith(".tsx") && !path.endsWith(".stories.tsx") ? [path] : [];
  });
}

/**
 * Exempt when the marker is on the offending line itself, or anywhere in the comment block directly
 * above `blockStartLine` — the getter the call sits in. Walking the comment block (rather than a
 * fixed one-line lookback) is what lets the reason be written at the length it needs, which for these
 * is a sentence about why the element has no consumer.
 */
function isExempt(sourceLines, lineNumber, blockStartLine = lineNumber) {
  if ((sourceLines[lineNumber - 1] ?? "").includes(EXEMPTION)) {
    return true;
  }
  for (let line = blockStartLine - 1; line >= 1; line--) {
    const text = (sourceLines[line - 1] ?? "").trim();
    if (!text.startsWith("//") && !text.startsWith("*") && !text.startsWith("/*")) {
      return false;
    }
    if (text.includes(EXEMPTION)) {
      return true;
    }
  }
  return false;
}

function checkFile(path) {
  const source = readFileSync(path, "utf8");
  const sourceLines = source.split("\n");
  // Comments and strings become blanks, so this header — which spells out the forbidden call — and
  // any doc comment naming it cannot trip the check.
  const code = blankNonCode(source);

  CLASS_GETTER.lastIndex = 0;
  for (const getter of code.matchAll(CLASS_GETTER)) {
    const body = getter[1];
    const bodyOffset = getter.index + getter[0].indexOf(body);
    const getterLine = lineAt(code, getter.index);
    SLOT_CALL_WITHOUT_CLASS.lastIndex = 0;
    for (const call of body.matchAll(SLOT_CALL_WITHOUT_CLASS)) {
      const line = lineAt(code, bodyOffset + call.index);
      if (isExempt(sourceLines, line, getterLine)) {
        continue;
      }
      violations.push(
        `${path}:${line} — \`slots.${call[1]}()\` in a \`get class()\` drops the consumer's ` +
          `class; pass it: \`slots.${call[1]}(props.class)\``,
      );
    }
  }

  // The other half of the same failure, and the one no getter reveals: a part that removes `class`
  // from what it forwards and then never puts it back. `omit` is how a part hands the rest to a
  // primitive hook, so dropping the key there with no matching read means the class reaches neither
  // the hook nor the element — and the part may render no `get class()` at all (`Dialog.Trigger`
  // carries no recipe slot), which is exactly the case the getter rule above cannot see.
  if (READS_CONSUMER_CLASS.test(code)) {
    return;
  }
  OMIT_CALL.lastIndex = 0;
  for (const omitCall of code.matchAll(OMIT_CALL)) {
    const argumentsStart = omitCall.index + omitCall[0].indexOf(omitCall[1]);
    const originalArguments = source.slice(argumentsStart, argumentsStart + omitCall[1].length);
    if (!CLASS_ARGUMENT.test(originalArguments)) {
      continue;
    }
    const line = lineAt(code, omitCall.index);
    if (isExempt(sourceLines, line)) {
      continue;
    }
    violations.push(
      `${path}:${line} — omits "class" from the forwarded props but never reads ` +
        "`props.class`/`merged.class`, so the consumer's class reaches nothing",
    );
  }
}

for (const path of walk(SCAN_ROOT)) {
  checkFile(path);
}

if (violations.length > 0) {
  console.error("Class forwarding violated — a part is discarding the consumer's `class`:\n");
  for (const violation of violations) {
    console.error(`  - ${violation}`);
  }
  console.error(
    `\n${violations.length} violation(s) found.\n` +
      "Every public part folds its own `class` in through its slot fn — `ctx.slots.item(props.class)` " +
      "(root: `slots.root(merged.class)`). An element with no consumer to forward from is exempted " +
      "with a `class-forwarding-ok: <reason>` comment. See CLAUDE.md " +
      '("Every public part forwards its DOM props").',
  );
  process.exit(1);
}

console.log(
  "check:class-forwarding passed — every `get class()` folds the consumer's class into its slot fn.",
);
