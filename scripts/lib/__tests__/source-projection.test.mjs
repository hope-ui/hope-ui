// Pins the hand-rolled tokenizer under `blankNonCode` / `stringInteriors` / `lineAt`.
//
// This is the one file in `scripts/` where a regression is *plural*: all four check scripts
// (`check-coverage-parity`, `check-class-forwarding`, `check-recipe-purity`, `check-rtl-safety`)
// project a source file through it before matching anything, and every one of them relies on it for
// the same guarantee — that a check script cannot be tripped by its own documentation. Break the
// tokenizer and three or four rules go wrong at once.
//
// Both failure directions are silent. Mis-blank something and a real violation stops being reported;
// mis-keep something and a `pr-8` written in a header comment fails a clean build. Neither shows up
// as an error from the projection itself, so the offsets and the character classes are asserted here
// rather than inferred from a passing check run.
//
// The invariant that gets the most weight is the one the module header promises: every character
// offset is preserved and newlines are never replaced. That is what makes `lineAt(projection, index)`
// name a line in the *original* file, which is the only reason any of these checks can report
// `path:line`.

import { describe, expect, it } from "vitest";
import { blankNonCode, lineAt, stringInteriors } from "../source-projection.mjs";

/** A realistic mixed source: prose naming a forbidden pattern, a class string, a regex, a division. */
const MIXED = String.raw`// Never emit a physical pr-8 — this comment names what the RTL check forbids.
import { tv } from "@hope-ui/theming";

/**
 * Trims a class list.
 * @see /\s+/ and the pl-2 spelling, both named in prose only.
 */
const SPLIT = /\s+/;

export const badge = tv({
  base: "inline-flex ps-2 pe-2",
});

const ratio = width / height / 2;
`;

/** The constructs the invariant sweep runs over. Each is also pinned in detail further down. */
const CONSTRUCTS = [
  ["a line comment", "const x = 1; // trailing\nconst y = 2;\n"],
  ["a block comment", "/* a\n   b */ const x = 1;\n"],
  ["a JSDoc block", "/**\n * @param {string} name\n */\nexport function f(name) {}\n"],
  ["an unterminated block comment", "const x = 1;\n/* runs to EOF\nconst y = 2;\n"],
  ["a double-quoted string", 'const s = "hello";\n'],
  ["a single-quoted string", "const s = 'hello';\n"],
  ["a multi-line template literal", "const s = `line one\nline two\nline three`;\n"],
  ["an unterminated string", 'const s = "abc'],
  ["escapes", String.raw`const s = "a\\"; const t = 'b\'c'; const u = 1;`],
  ["a regex literal", "const re = /a[bc]+/g;\nconst y = 2;\n"],
  ["a division", "const q = (a + b) / 2 / c;\n"],
  ["the mixed source", MIXED],
  ["an empty file", ""],
  ["nothing but newlines", "\n\n\n"],
];

/** The offsets of every newline — identical between a source and either projection. */
const newlineOffsets = (text) => {
  const offsets = [];
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "\n") {
      offsets.push(i);
    }
  }
  return offsets;
};

/** Offsets where a projection put a character that is neither the original nor a blank. */
const substitutions = (source, projected) => {
  const offsets = [];
  for (let i = 0; i < source.length; i++) {
    if (projected[i] !== source[i] && projected[i] !== " ") {
      offsets.push(i);
    }
  }
  return offsets;
};

/** Offsets both projections kept — the complementarity violation, newlines excepted. */
const keptByBoth = (source) => {
  const code = blankNonCode(source);
  const strings = stringInteriors(source);
  const offsets = [];
  for (let i = 0; i < source.length; i++) {
    if (source[i] !== "\n" && code[i] !== " " && strings[i] !== " ") {
      offsets.push(i);
    }
  }
  return offsets;
};

describe("the offset invariant", () => {
  it.each(CONSTRUCTS)("blankNonCode preserves every offset through %s", (_name, source) => {
    const projected = blankNonCode(source);
    expect(projected).toHaveLength(source.length);
    expect(newlineOffsets(projected)).toEqual(newlineOffsets(source));
    expect(substitutions(source, projected)).toEqual([]);
  });

  it.each(CONSTRUCTS)("stringInteriors preserves every offset through %s", (_name, source) => {
    const projected = stringInteriors(source);
    expect(projected).toHaveLength(source.length);
    expect(newlineOffsets(projected)).toEqual(newlineOffsets(source));
    expect(substitutions(source, projected)).toEqual([]);
  });

  it("keeps a multi-line template's newlines, so a later match is not pulled up a line", () => {
    const source = "const c = `one\ntwo\nthree`;\nconst afterwards = 1;\n";
    const index = source.indexOf("afterwards");
    expect(lineAt(source, index)).toBe(4);
    for (const projection of [blankNonCode(source), stringInteriors(source)]) {
      expect(lineAt(projection, index)).toBe(4);
    }
  });

  it("keeps a block comment's newlines", () => {
    const source = "/*\n\n\n*/\nconst x = 1;\n";
    expect(lineAt(blankNonCode(source), blankNonCode(source).indexOf("const"))).toBe(5);
  });

  it("maps a match index in either projection back to the source line", () => {
    const strings = stringInteriors(MIXED);
    const classIndex = strings.indexOf("inline-flex");
    expect(lineAt(strings, classIndex)).toBe(lineAt(MIXED, classIndex));
    expect(lineAt(MIXED, classIndex)).toBe(11);

    const code = blankNonCode(MIXED);
    const divisionIndex = code.indexOf("width");
    expect(lineAt(code, divisionIndex)).toBe(lineAt(MIXED, divisionIndex));
    expect(lineAt(MIXED, divisionIndex)).toBe(14);
  });
});

describe("the two projections are complementary", () => {
  it("never keeps the same character twice", () => {
    expect(keptByBoth(MIXED)).toEqual([]);
  });

  it("gives the class list to the string projection and the division to the code projection", () => {
    expect(stringInteriors(MIXED)).toContain("inline-flex ps-2 pe-2");
    expect(blankNonCode(MIXED)).not.toContain("inline-flex");

    expect(blankNonCode(MIXED)).toContain("width / height / 2");
    expect(stringInteriors(MIXED)).not.toContain("width");
  });

  it("gives comments to neither — the immunity the check scripts are built on", () => {
    // Both the line comment and the JSDoc name a pattern `check:rtl-safety` forbids.
    expect(blankNonCode(MIXED)).not.toContain("pr-8");
    expect(stringInteriors(MIXED)).not.toContain("pr-8");
    expect(blankNonCode(MIXED)).not.toContain("pl-2");
    expect(stringInteriors(MIXED)).not.toContain("pl-2");
  });

  it("keeps the quote delimiters as code and their contents as string", () => {
    expect(blankNonCode('const s = "abc";')).toBe('const s = "   ";');
    expect(stringInteriors('const s = "abc";')).toBe("           abc  ");
  });
});

describe("comments", () => {
  it("blanks a line comment to the newline, not past it", () => {
    expect(blankNonCode("const x = 1; // note\nconst y = 2;")).toBe(
      "const x = 1;        \nconst y = 2;",
    );
  });

  it("blanks a block comment including its delimiters", () => {
    expect(blankNonCode("/* a */ const x = 1;")).toBe("        const x = 1;");
  });

  it("does not end a block comment at a `//` inside it", () => {
    expect(blankNonCode("/* a // b */ const x = 1;")).toBe("             const x = 1;");
  });

  it("does not start a block comment at a `/*` inside a line comment", () => {
    expect(blankNonCode("// see /* not a block\nconst x = 1;")).toBe(
      "                     \nconst x = 1;",
    );
  });

  it("blanks a JSDoc block, tags and all", () => {
    const source = "/**\n * @param {string} pr-8\n */\nconst x = 1;";
    expect(blankNonCode(source)).toBe("   \n                       \n   \nconst x = 1;");
  });

  it("blanks an unterminated block comment to end of file", () => {
    // The safe direction for a checker: the tail is prose, not evidence.
    const source = "const x = 1;\n/* runs to EOF\nconst y = 2;";
    expect(blankNonCode(source)).toBe("const x = 1;\n              \n            ");
  });

  it("treats an apostrophe inside a comment as prose, not a string opener", () => {
    const source = "// don't do this\nconst x = 1;";
    expect(blankNonCode(source)).toBe("                \nconst x = 1;");
    expect(stringInteriors(source)).toBe("                \n            ");
  });

  it("does not treat a `//` inside a string as a comment", () => {
    const source = 'const url = "http://x.com//y";';
    expect(blankNonCode(source)).toBe('const url = "               ";');
    expect(stringInteriors(source)).toContain("http://x.com//y");
  });
});

describe("strings", () => {
  it("handles single, double and template quotes", () => {
    expect(stringInteriors("const a = 'one';")).toContain("one");
    expect(stringInteriors('const a = "two";')).toContain("two");
    expect(stringInteriors("const a = `three`;")).toContain("three");
  });

  it("does not end a string at a differently-quoted quote inside it", () => {
    expect(stringInteriors(`const s = "it's";`)).toContain("it's");
    expect(stringInteriors(`const t = 'say "hi"';`)).toContain('say "hi"');
  });

  it("does not end a string at an escaped quote", () => {
    const source = String.raw`const s = "a\"b"; const after = 1;`;
    expect(blankNonCode(source)).toBe(`const s = "    "; const after = 1;`);
  });

  it("does not let an escaped backslash swallow the closing quote", () => {
    // `"a\\"` ends at that quote. Getting this wrong runs the string into the next line, which is
    // exactly how a naive tokenizer starts blanking real code.
    const source = String.raw`const s = "a\\"; const after = 1;`;
    expect(blankNonCode(source)).toBe(`const s = "   "; const after = 1;`);
    expect(stringInteriors(source)).toContain(String.raw`a\\`);
  });

  it("blanks an unterminated string to end of file without overrunning it", () => {
    const source = 'const s = "abc';
    expect(blankNonCode(source)).toBe('const s = "   ');
    expect(stringInteriors(source)).toBe("           abc");
  });

  it("keeps a multi-line template's contents as string on every line", () => {
    const source = "const c = `line1\nline2`;\nconst d = 1;";
    expect(stringInteriors(source)).toBe("           line1\nline2  \n            ");
    expect(blankNonCode(source)).toBe("const c = `     \n     `;\nconst d = 1;");
  });

  it("resumes tokenizing code after the closing quote", () => {
    const source = 'const s = "a / b"; const q = c / d;';
    expect(blankNonCode(source)).toBe('const s = "     "; const q = c / d;');
  });
});

describe("regex literals versus division", () => {
  it("does not start a string at a quote inside a regex", () => {
    // The case the whole `previous` mechanism exists for: a naive scan opens a string at `'`.
    const source = `const re = /['"]/;\nconst after = "kept";`;
    expect(blankNonCode(source)).toBe(`const re = /    /;\nconst after = "    ";`);
    expect(stringInteriors(source)).toContain("kept");
  });

  it("does not treat an escaped `//` inside a regex as a comment", () => {
    const source = String.raw`const proto = /\/\//; const after = 1;`;
    expect(blankNonCode(source)).toBe(`const proto = /    /; const after = 1;`);
  });

  it("does not end a regex at a `/` inside a character class", () => {
    const source = "const re = /[/]/; const after = 1;";
    expect(blankNonCode(source)).toBe("const re = /   /; const after = 1;");
  });

  it("blanks a regex's contents in the code projection so a pattern is not read as a call", () => {
    const source = "const re = /renderToStringAsync/;";
    expect(blankNonCode(source)).not.toContain("renderToStringAsync");
    expect(blankNonCode(source)).toBe("const re = /                   /;");
  });

  it("drops the whole regex in the string projection — a pattern is not something a file emits", () => {
    expect(stringInteriors("const re = /pr-8/;")).toBe("                  ");
  });

  it("reads a regex after (, comma, = and other operators", () => {
    expect(blankNonCode(`x.replace(/a"b/g, 1);`)).toBe("x.replace(/   /g, 1);");
    expect(blankNonCode(`f(1, /a'b/, 2);`)).toBe("f(1, /   /, 2);");
    expect(blankNonCode(`const r = /a'b/;`)).toBe("const r = /   /;");
    expect(blankNonCode(`const o = { k: /a'b/ };`)).toBe("const o = { k: /   / };");
    expect(blankNonCode(`const l = [/a'b/];`)).toBe("const l = [/   /];");
    expect(blankNonCode(`a && /a'b/.test(x);`)).toBe("a && /   /.test(x);");
    expect(blankNonCode(`!/a'b/.test(x);`)).toBe("!/   /.test(x);");
    expect(blankNonCode(`if (a) {} /a'b/.test(x);`)).toBe("if (a) {} /   /.test(x);");
  });

  it("reads a regex at the very start of a file", () => {
    expect(blankNonCode(`/a'b/.test(x);`)).toBe("/   /.test(x);");
  });

  it("does not read division as a regex", () => {
    // Reading `/ b /` as a regex would blank `b`, and the code projection would lose a real call.
    expect(blankNonCode("const q = a / b / c;")).toBe("const q = a / b / c;");
    expect(blankNonCode("const x = (a + b) / 2;")).toBe("const x = (a + b) / 2;");
    expect(blankNonCode("const y = arr[0] / 2;")).toBe("const y = arr[0] / 2;");
    expect(blankNonCode("const z = f() / g();")).toBe("const z = f() / g();");
  });

  it("keeps a division-heavy line intact for a code-projection match", () => {
    const source = "const ratio = w / h / 2;\nrenderToStringAsync(<App />);";
    expect(blankNonCode(source)).toContain("renderToStringAsync(");
  });
});

describe("lineAt", () => {
  const TEXT = "one\ntwo\nthree";

  it("returns 1 for offset 0", () => {
    expect(lineAt(TEXT, 0)).toBe(1);
  });

  it("returns 1 for an empty text", () => {
    expect(lineAt("", 0)).toBe(1);
  });

  it("counts only newlines strictly before the offset", () => {
    expect(lineAt(TEXT, 3)).toBe(1);
    expect(lineAt(TEXT, 4)).toBe(2);
  });

  it("puts an offset landing exactly on a newline on the line that newline ends", () => {
    // `TEXT[3]` is the first `\n`; it belongs to line 1, not line 2.
    expect(TEXT[3]).toBe("\n");
    expect(lineAt(TEXT, 3)).toBe(1);
  });

  it("returns the last line for an offset on it", () => {
    expect(lineAt(TEXT, TEXT.indexOf("three"))).toBe(3);
    expect(lineAt(TEXT, TEXT.length - 1)).toBe(3);
  });

  it("clamps an offset past the end to the last line", () => {
    expect(lineAt(TEXT, TEXT.length)).toBe(3);
    expect(lineAt(TEXT, 9999)).toBe(3);
  });

  it("counts a trailing newline, so a past-the-end offset names the empty final line", () => {
    expect(lineAt("a\n", 9999)).toBe(2);
  });

  it("returns 1 for a negative offset", () => {
    expect(lineAt(TEXT, -5)).toBe(1);
  });
});

// Everything below pins behavior that is WRONG as JavaScript but is what this tokenizer does today.
// These are asserted rather than fixed on purpose: a check script's output depends on them, so a
// well-meant improvement to `source-projection.mjs` should show up here as a red test and a decision,
// not as a silent change in what four checks report.
// biome-ignore-start lint/suspicious/noTemplateCurlyInString: the `${...}` in these fixtures is the
// subject under test — the tokenizer's handling of an interpolation — not an interpolation someone
// meant to write in a template literal.
describe("known limits of a tokenizer with no parser", () => {
  it("does not recognise a regex after a keyword — `previous` only tracks punctuation", () => {
    // KNOWN LIMIT. `previous` is the last non-whitespace *character*, so after `return` it is `n`,
    // which is not in the operator set. The `/` is read as division, then the `'` opens a string
    // that runs to the next quote — swallowing real code on this line and the ones after it.
    const source = `function f(x) { return /['"]/.test(x); }\nconst after = "kept";`;
    const code = blankNonCode(source);
    expect(code).toContain("return /['");
    expect(code).not.toContain(".test(x)");
    expect(code).not.toContain("const after");
    // And the mirror image: the string projection hands back real code as if it were a class string.
    expect(stringInteriors(source)).toContain("]/.test(x); }");
  });

  it("treats JSX text as code, so an apostrophe in it opens a string", () => {
    // KNOWN LIMIT, same root cause: `don't` in JSX text is not inside any JS literal.
    const source = "const el = <p>don't</p>;\nconst after = 2;";
    expect(blankNonCode(source)).toBe("const el = <p>don'      \n                ");
    expect(stringInteriors(source)).toContain("t</p>;");
  });

  it("treats a template's `${...}` interpolation as string interior, not as code", () => {
    // KNOWN LIMIT with consequences in both directions. `check:rtl-safety` and `check:recipe-purity`
    // therefore DO see a class fragment written inside an interpolation (useful), while a call
    // written inside one is invisible to `blankNonCode` (a hole for `check:coverage-parity`).
    expect(stringInteriors("const c = `px-${n} pr-4`;")).toContain("px-${n} pr-4");
    expect(blankNonCode("const c = `${renderToStringAsync(x)}`;")).not.toContain(
      "renderToStringAsync",
    );
  });

  it("ends an outer template at a nested template's backtick", () => {
    // KNOWN LIMIT: the string scan has no interpolation depth, so `a${` closes at the inner tick and
    // the classes interleave from there. Offsets still hold, which is what the callers depend on.
    const source = "const c = `a${`b`}c`;";
    expect(blankNonCode(source)).toBe("const c = `   `b`  `;");
    expect(stringInteriors(source)).toBe("           a${   }c  ");
    expect(keptByBoth(source)).toEqual([]);
  });
});
// biome-ignore-end lint/suspicious/noTemplateCurlyInString: end of the interpolation fixtures.
