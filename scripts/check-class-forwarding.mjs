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
//
// The rule's own logic lives in `lib/class-forwarding.mjs` — this file is an executable that walks
// the repo and exits, so the rule had to move out of it to be testable on its own.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { classForwardingViolations } from "./lib/class-forwarding.mjs";

const SCAN_ROOT = "packages/components/src";

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

for (const path of walk(SCAN_ROOT)) {
  for (const violation of classForwardingViolations(readFileSync(path, "utf8"))) {
    violations.push(`${path}:${violation.line} — ${violation.message}`);
  }
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
