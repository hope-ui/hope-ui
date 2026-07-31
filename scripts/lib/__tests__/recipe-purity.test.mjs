// Pins the recipe-purity rule (__internal__/theming.md § "recipe purity").
//
// Worth a test because the damage this check prevents is invisible from inside the repo: a recipe
// that computes a color still paints correctly under the hope preset, and every test, typecheck and
// story stays green. It only breaks for the *consumer* who redefines the base the recipe mixed
// against. So if the checker stops asking, nothing tells us.
//
// The cases are weighted toward the numeric edges, because that is where a well-meaning
// "improvement" lands: `opacity-0`/`opacity-100` are legitimate layout while `opacity-1`..`99` are
// not, and a slash means an alpha modifier on a color utility but a fraction on `w-1/2`. Widening
// either pattern by one step breaks correct recipes; narrowing it by one lets the bug through.
//
// The other half is the `stringInteriors` projection: the rule scans string literals only, which is
// what lets the check script's own header name every forbidden pattern in prose without tripping
// itself. Both directions are pinned below.

import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PATTERNS, recipePurityViolations } from "../recipe-purity.mjs";

/** A recipe file with `value` as its one class string — the shape the rule actually governs. */
const classes = (value) => `const recipe = { root: "${value}" };\n`;

/** The text each violation quotes, which is what a boundary case is really about. */
const matchesIn = (source) =>
  recipePurityViolations(source).map((v) => /"(?<match>[^"]*)"/.exec(v.message).groups.match);

/** The flagged substrings of a single class string. */
const flagged = (value) => matchesIn(classes(value));

describe("the pattern set", () => {
  it("is the four forbidden shapes, each with an actionable hint", () => {
    expect(PATTERNS.map((pattern) => pattern.label)).toEqual([
      "color-mix()",
      "arbitrary value referencing --hope-* or color-mix",
      "alpha modifier on a color utility",
      "magic opacity utility",
    ]);
    for (const pattern of PATTERNS) {
      expect(pattern.hint.length).toBeGreaterThan(0);
    }
  });

  it("passes a recipe that references finished tokens only", () => {
    expect(recipePurityViolations(classes("bg-primary text-on-primary rounded-md px-2"))).toEqual(
      [],
    );
  });
});

describe("magic opacity — the 1–99 band, and only that", () => {
  it("flags both ends of the band", () => {
    expect(flagged("opacity-1 opacity-99")).toEqual(["opacity-1", "opacity-99"]);
  });

  it("leaves opacity-0 and opacity-100 alone — fully transparent/opaque is layout", () => {
    expect(flagged("opacity-0 opacity-100")).toEqual([]);
  });

  it("leaves an opacity-* token alone — it is the replacement the hint points at", () => {
    // The tokens carry no digits, which is the whole reason the pattern can be this simple.
    expect(flagged("opacity-disabled opacity-loading")).toEqual([]);
  });

  it("flags a mid-band value behind a variant prefix", () => {
    expect(flagged("group-hover:opacity-90 data-disabled:opacity-40")).toEqual([
      "opacity-90",
      "opacity-40",
    ]);
  });

  it("names the token replacement in the message", () => {
    const [violation] = recipePurityViolations(classes("opacity-90"));
    expect(violation.message).toContain("magic opacity utility");
    expect(violation.message).toContain("opacity-disabled");
  });
});

describe("alpha modifier — a color utility, not any slash", () => {
  it("flags the modifier across the color-utility prefixes", () => {
    expect(flagged("bg-a/10 text-b/20 border-c/30 ring-d/40 from-e/50 divide-f/60")).toEqual([
      "bg-a/10",
      "text-b/20",
      "border-c/30",
      "ring-d/40",
      "from-e/50",
      "divide-f/60",
    ]);
  });

  it("flags one-, two- and three-digit alphas", () => {
    expect(flagged("bg-primary/5 bg-primary/50 bg-primary/100")).toEqual([
      "bg-primary/5",
      "bg-primary/50",
      "bg-primary/100",
    ]);
  });

  it("leaves a fraction utility alone — w-1/2 is ordinary layout, not a computed color", () => {
    expect(flagged("w-1/2 basis-1/3 h-2/3 top-1/2")).toEqual([]);
  });

  it("leaves an unmodified color utility alone", () => {
    expect(
      flagged("bg-primary text-on-primary border-primary-subtle-line ring-focus-halo"),
    ).toEqual([]);
  });

  it("reaches a nested prefix — inset-ring / inset-shadow are matched at the inner boundary", () => {
    expect(flagged("inset-ring-primary/50 inset-shadow-primary/20")).toEqual([
      "ring-primary/50",
      "shadow-primary/20",
    ]);
  });
});

describe("color-mix()", () => {
  it("flags the call", () => {
    expect(flagged("bg-[color-mix(in oklch, var(--hope-primary), white)]")).toContain("color-mix(");
  });

  it("flags it with whitespace before the paren", () => {
    expect(flagged("color-mix (in oklch, a, b)")).toContain("color-mix (");
  });

  it("leaves a lookalike identifier alone", () => {
    expect(flagged("colorMix(in oklch, a, b)")).toEqual([]);
  });
});

describe("arbitrary values — only those reaching for --hope-* or color-mix", () => {
  it("flags a --hope-* var inside brackets", () => {
    expect(flagged("shadow-[0_0_0_3px_var(--hope-focus-halo)]")).toEqual([
      "[0_0_0_3px_var(--hope-focus-halo)]",
    ]);
  });

  it("leaves a plain arbitrary value alone — most of them are geometry", () => {
    expect(
      flagged("[3px] [&_svg]:size-4 w-[calc(100%-2rem)] shadow-[0_1px_2px_rgb(0_0_0)]"),
    ).toEqual([]);
  });
});

describe("the string-literal projection", () => {
  // The forbidden patterns spelled out in prose. A recipe's header comment explains the rule this
  // way, and so does the check script's own header.
  const everyPattern = "color-mix( bg-primary/50 opacity-90 [var(--hope-primary)]";

  it("ignores a forbidden pattern in a line comment", () => {
    expect(recipePurityViolations(`// ${everyPattern}\nconst recipe = {};\n`)).toEqual([]);
  });

  it("ignores a forbidden pattern in a block comment", () => {
    expect(recipePurityViolations(`/*\n * ${everyPattern}\n */\nconst recipe = {};\n`)).toEqual([]);
  });

  it("ignores a forbidden pattern in ordinary code", () => {
    expect(
      recipePurityViolations("const step = opacity-90;\nconst ratio = bg-primary/50;\n"),
    ).toEqual([]);
  });

  it("ignores a forbidden pattern in a regex literal", () => {
    expect(recipePurityViolations("const MAGIC = /opacity-90|bg-primary\\/50/g;\n")).toEqual([]);
  });

  it("flags it inside a double-quoted string", () => {
    expect(matchesIn('const root = "opacity-90";\n')).toEqual(["opacity-90"]);
  });

  it("flags it inside a single-quoted string", () => {
    expect(matchesIn("const root = 'opacity-90';\n")).toEqual(["opacity-90"]);
  });

  it("flags it inside a template literal", () => {
    expect(matchesIn("const root = `opacity-90`;\n")).toEqual(["opacity-90"]);
  });

  it("gives the check script's own header immunity — it names every pattern in prose", () => {
    const script = readFileSync(new URL("../../check-recipe-purity.mjs", import.meta.url), "utf8");
    // Guard against the header being rewritten out from under the assertion below.
    expect(script).toContain("color-mix(");
    expect(script).toContain("ring-focus/50");
    expect(script).toContain("opacity-90");
    expect(recipePurityViolations(script)).toEqual([]);
  });
});

describe("reporting", () => {
  it("reports the line a violation sits on, not line 1", () => {
    const source = [
      "/*",
      " * A recipe header.",
      " */",
      "export const recipe = {",
      "  slots: {",
      '    root: "bg-primary opacity-90",',
      "  },",
      "};",
      "",
    ].join("\n");
    expect(recipePurityViolations(source)).toEqual([
      { line: 6, message: expect.stringContaining('magic opacity utility: "opacity-90"') },
    ]);
  });

  it("reports every violation in a file, in pattern order rather than line order", () => {
    const source = [
      "export const recipe = {",
      '  root: "bg-primary opacity-90",',
      '  icon: "bg-[color-mix(in oklch, var(--hope-primary), white)]",',
      '  dot: "bg-primary/50",',
      "};",
      "",
    ].join("\n");
    // Two different patterns match on line 3 — the call and the arbitrary value wrapping it.
    expect(recipePurityViolations(source)).toEqual([
      { line: 3, message: expect.stringContaining('color-mix(): "color-mix("') },
      { line: 3, message: expect.stringContaining("arbitrary value referencing --hope-*") },
      {
        line: 4,
        message: expect.stringContaining('alpha modifier on a color utility: "bg-primary/50"'),
      },
      { line: 2, message: expect.stringContaining('magic opacity utility: "opacity-90"') },
    ]);
  });

  it("is idempotent — the module-scope /g patterns do not carry state between files", () => {
    const source = classes("opacity-90 opacity-80");
    expect(recipePurityViolations(source)).toEqual(recipePurityViolations(source));
  });
});

// Known-but-unfixed behavior, pinned here so a fix shows up as a red test rather than a surprise.
// Both are reported in __internal__/theming.md's terms: the rule is about *computed* colors, and
// these two cases are the rule disagreeing with that definition.
describe("known gaps in the rule (pinned, not endorsed)", () => {
  it("misses an arbitrary alpha modifier — the same sin spelled with brackets", () => {
    expect(flagged("bg-primary/[0.5] bg-primary/[12.5%] bg-primary/[var(--alpha)]")).toEqual([]);
  });

  it("false-positives on text-<size>/<leading>, which is a font-size shorthand, not a color", () => {
    expect(flagged("text-sm/6")).toEqual(["text-sm/6"]);
  });
});
