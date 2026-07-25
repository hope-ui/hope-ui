// The two complementary projections of a TS/TSX source file that this repo's check scripts scan.
//
// Both walk the file once with the same hand-rolled tokenizer — no AST, no dependency — classifying
// every character as code, comment, string/template literal, or regex literal. They differ only in
// which class survives:
//
// - `blankNonCode`   keeps CODE.    Comment / string / regex *contents* become spaces.
// - `stringInteriors` keeps STRINGS. Code, comments and regex literals become spaces.
//
// Every character offset is preserved (newlines are never replaced), so a match's index still maps
// to the right line in the original file and a caller can report `path:line` accurately.
//
// Which one a check wants follows from where its evidence lives. A rule about what the code *does*
// (`renderToStringAsync` is actually called, an `it.skip` block is paren-balanced) reads the code
// projection. A rule about what a recipe *emits* (a class string containing `color-mix` or a
// physical `pr-8`) reads the string projection — and gets, for free, the guarantee that a header
// comment discussing the forbidden pattern by name cannot trip the check.

/** The character classes a projection can keep. */
const KEEP_CODE = "code";
const KEEP_STRINGS = "strings";

/**
 * One pass of the shared tokenizer. `keep` selects which class survives; everything else is
 * replaced with a space, newlines excepted.
 *
 * @param {string} source
 * @param {typeof KEEP_CODE | typeof KEEP_STRINGS} keep
 */
function project(source, keep) {
  const keepingCode = keep === KEEP_CODE;
  // Start from the source when keeping code (blank as we go), from blanks when keeping strings
  // (fill in as we go). Either way newlines survive, so offsets and line numbers are unchanged.
  const out = keepingCode
    ? source.split("")
    : source.split("").map((c) => (c === "\n" ? "\n" : " "));

  /** Last significant code char — tells a regex literal from a division. */
  let previous = "";
  let index = 0;

  /** Applies the non-kept treatment to `[from, to)`. @param {number} from @param {number} to */
  const drop = (from, to) => {
    for (let i = from; i < to && i < source.length; i++) {
      if (out[i] !== "\n") {
        out[i] = " ";
      }
    }
  };

  /** Applies the kept treatment to `[from, to)`. @param {number} from @param {number} to */
  const restore = (from, to) => {
    for (let i = from; i < to && i < source.length; i++) {
      out[i] = source[i];
    }
  };

  /** The span holding a literal's *contents* — kept by one projection, dropped by the other. */
  const literal = keepingCode ? drop : restore;
  /** A whole comment, including its delimiters. Never kept by either projection. */
  const comment = drop;

  while (index < source.length) {
    const char = source[index];
    const next = source[index + 1];

    if (char === "/" && next === "/") {
      const end = source.indexOf("\n", index);
      const stop = end === -1 ? source.length : end;
      comment(index, stop);
      index = stop;
      continue;
    }

    if (char === "/" && next === "*") {
      const end = source.indexOf("*/", index + 2);
      const stop = end === -1 ? source.length : end + 2;
      comment(index, stop);
      index = stop;
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
      literal(index + 1, Math.min(i, source.length));
      index = Math.min(i + 1, source.length);
      previous = char;
      continue;
    }

    // A `/` starting an expression is a regex literal; after a value it is division. Either way it
    // is code — the string projection drops it, the code projection blanks only its contents so a
    // pattern inside the regex can't be mistaken for a real call.
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
      if (keepingCode) {
        drop(index + 1, Math.min(i, source.length));
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

/**
 * Blanks the *contents* of comments, string/template literals and regex literals, preserving every
 * character offset. Lets a check reason about code positions only: an `it.skip("hydrates (x)")`
 * stays paren-balanced, and a `renderToStringAsync` mentioned in a comment or inside a string is no
 * longer mistaken for a call.
 *
 * This exists because the SSR requirement used to be `source.includes("renderToStringAsync")`,
 * which `Dialog.browser.test.tsx` satisfied three ways at once — a prose comment, a bare import,
 * and a call inside an `it.skip`. None of them ran.
 *
 * @param {string} source
 */
export function blankNonCode(source) {
  return project(source, KEEP_CODE);
}

/**
 * The inverse: projects `source` onto its string-literal interiors. Every character that is code, a
 * comment, or a regex literal becomes a space, and only the contents of `"`/`'`/`` ` `` literals
 * survive. A pattern matched against this result matched something a file actually *emits* as a
 * string — never a comment, and never the check's own regexes.
 *
 * @param {string} source
 */
export function stringInteriors(source) {
  return project(source, KEEP_STRINGS);
}

/**
 * The 1-based line number at `offset` in `text`.
 *
 * @param {string} text @param {number} offset
 */
export function lineAt(text, offset) {
  let line = 1;
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text[i] === "\n") {
      line++;
    }
  }
  return line;
}
