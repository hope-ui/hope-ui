// The class-forwarding rule, extracted from `check-class-forwarding.mjs` so it can be tested
// directly: that script is a top-level executable that walks the repo and calls `process.exit`, so
// importing it to reach one function would run the whole check. The script keeps the walk, the
// `packages/components/src` filtering, the `path:line — message` formatting and the exit code; this
// module is the pure rule, taking a file's source text and returning its violations.
//
// The rule itself, why it exists, and the shapes deliberately left alone: the header of
// `check-class-forwarding.mjs`, and CLAUDE.md § "Every public part forwards its DOM props".

import { blankNonCode, lineAt } from "./source-projection.mjs";

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

/**
 * Exempt when the marker is on the offending line itself, or anywhere in the comment block directly
 * above `blockStartLine` — the getter the call sits in. Walking the comment block (rather than a
 * fixed one-line lookback) is what lets the reason be written at the length it needs, which for these
 * is a sentence about why the element has no consumer.
 *
 * @param {string[]} sourceLines @param {number} lineNumber @param {number} [blockStartLine]
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

/**
 * Every way `source` discards the consumer's `class`, as `{ line, message }` in source order.
 *
 * @param {string} source The `.tsx` file's text.
 * @returns {Array<{ line: number; message: string }>}
 */
export function classForwardingViolations(source) {
  /** @type {Array<{ line: number; message: string }>} */
  const violations = [];
  const sourceLines = source.split("\n");
  // Comments and strings become blanks, so the script's header — which spells out the forbidden
  // call — and any doc comment naming it cannot trip the check.
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
      violations.push({
        line,
        message:
          `\`slots.${call[1]}()\` in a \`get class()\` drops the consumer's ` +
          `class; pass it: \`slots.${call[1]}(props.class)\``,
      });
    }
  }

  // The other half of the same failure, and the one no getter reveals: a part that removes `class`
  // from what it forwards and then never puts it back. `omit` is how a part hands the rest to a
  // primitive hook, so dropping the key there with no matching read means the class reaches neither
  // the hook nor the element — and the part may render no `get class()` at all (`Dialog.Trigger`
  // carries no recipe slot), which is exactly the case the getter rule above cannot see.
  if (READS_CONSUMER_CLASS.test(code)) {
    return violations;
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
    violations.push({
      line,
      message:
        'omits "class" from the forwarded props but never reads ' +
        "`props.class`/`merged.class`, so the consumer's class reaches nothing",
    });
  }

  return violations;
}
