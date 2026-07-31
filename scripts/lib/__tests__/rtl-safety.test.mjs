// Pins the RTL-safety rule (__internal__/theming.md, "RTL-aware recipes").
//
// This rule guards a defect that never fails loudly. A `pr-8` type-checks, renders, passes axe and
// every browser test, and then reserves the gutter on the wrong side for every Arabic, Hebrew and
// Farsi reader. The check script is the only thing standing between that class and `main` — so if
// the *checker* silently loosens, nothing downstream notices either. Two directions matter equally:
// a rule that stops flagging (the bug ships) and a rule that starts over-flagging (correct code —
// `px-3`, `ltr:pr-8`, `data-side-left:ml-2` — breaks the build, and the pressure is then to delete
// the check rather than fix it).
//
// The cases are weighted toward the parts a later edit would plausibly "simplify": the bracket-depth
// parser in `splitVariants`, the deliberate asymmetry between `data-side-left:` and
// `data-[side=left]:`, the `(^|:)` anchoring on both exemption predicates, and the reason-required
// escape hatch.

import { describe, expect, it } from "vitest";
import { isDirectionInvariant, rtlSafetyViolations, splitVariants } from "../rtl-safety.mjs";

/** The rule over a `.tsx` source, unless another language is named. */
const check = (source, extension = ".tsx") => rtlSafetyViolations(source, extension);
const passes = (source, extension = ".tsx") => expect(check(source, extension)).toEqual([]);
const messagesOf = (source, extension = ".tsx") =>
  check(source, extension).map((violation) => violation.message);

/** The single violation `source` produces — fails if there is not exactly one. */
const onlyViolation = (source, extension = ".tsx") => {
  const violations = check(source, extension);
  expect(violations).toHaveLength(1);
  return violations[0];
};

describe("splitVariants", () => {
  it("returns an empty chain for a bare utility", () => {
    expect(splitVariants("pl-2")).toEqual({ variants: "", base: "pl-2" });
  });

  it("splits a plain variant, keeping the separator on the chain", () => {
    expect(splitVariants("hover:pl-2")).toEqual({ variants: "hover:", base: "pl-2" });
  });

  it("splits at the LAST top-level colon of a multi-variant chain", () => {
    expect(splitVariants("md:hover:focus:pl-2")).toEqual({
      variants: "md:hover:focus:",
      base: "pl-2",
    });
  });

  it("ignores the arbitrary-variant brackets themselves", () => {
    expect(splitVariants("[&_svg]:rotate-180")).toEqual({
      variants: "[&_svg]:",
      base: "rotate-180",
    });
    expect(splitVariants("data-[slot=x]:pl-2")).toEqual({
      variants: "data-[slot=x]:",
      base: "pl-2",
    });
  });

  it("ignores a colon INSIDE an arbitrary variant", () => {
    expect(splitVariants("supports-[display:grid]:pl-2")).toEqual({
      variants: "supports-[display:grid]:",
      base: "pl-2",
    });
  });

  // This is what the depth counter actually buys, and the case a "just take the last colon" rewrite
  // loses. A colon in the VARIANT chain is harmless on its own — the scan keeps the LAST separator,
  // which is top-level anyway. The colon that breaks a depth-blind split is the one in the BASE
  // utility's own arbitrary value: Tailwind's type hints (`[length:2px]`) and any bracketed URL put
  // one after every top-level separator, so the "base" becomes `2px]` and the table stops matching.
  it("ignores a colon inside the BASE utility's arbitrary value", () => {
    expect(splitVariants("border-l-[length:2px]")).toEqual({
      variants: "",
      base: "border-l-[length:2px]",
    });
    expect(splitVariants("bg-[url(https://example.com/a.png)]")).toEqual({
      variants: "",
      base: "bg-[url(https://example.com/a.png)]",
    });
    expect(splitVariants("md:hover:rounded-l-[length:4px]")).toEqual({
      variants: "md:hover:",
      base: "rounded-l-[length:4px]",
    });
  });

  it("tracks nested brackets", () => {
    expect(splitVariants("[&[data-x]]:pl-2")).toEqual({ variants: "[&[data-x]]:", base: "pl-2" });
  });

  it("handles a chain mixing arbitrary and plain variants", () => {
    expect(splitVariants("rtl:[&_svg]:rotate-180")).toEqual({
      variants: "rtl:[&_svg]:",
      base: "rotate-180",
    });
    expect(splitVariants("md:data-[state=open]:supports-[display:grid]:pl-2")).toEqual({
      variants: "md:data-[state=open]:supports-[display:grid]:",
      base: "pl-2",
    });
  });

  it("yields an empty base for a candidate that ends in a colon", () => {
    expect(splitVariants("hover:")).toEqual({ variants: "hover:", base: "" });
  });

  it("leaves an empty base unmatched by the table, so a dangling colon reports nothing", () => {
    passes('const a = "hover:";');
  });
});

describe("the direction-invariant escapes", () => {
  it("treats a manual rtl:/ltr: flip as invariant", () => {
    expect(isDirectionInvariant("rtl:")).toBe(true);
    expect(isDirectionInvariant("ltr:")).toBe(true);
  });

  it("finds rtl:/ltr: anywhere in the chain, not only at the front", () => {
    expect(isDirectionInvariant("md:hover:rtl:")).toBe(true);
    expect(isDirectionInvariant("rtl:[&_svg]:")).toBe(true);
  });

  // The whole point of the escape: `ltr:pr-8 rtl:pl-8` is the author spelling both sides by hand.
  it("lets a manual flip through the full rule, both halves", () => {
    passes('const a = "ltr:pr-8 rtl:pl-8";');
  });

  it("treats the registered data-side-* variants as invariant", () => {
    for (const side of ["top", "right", "bottom", "left"]) {
      expect(isDirectionInvariant(`data-side-${side}:`)).toBe(true);
    }
    passes('const a = "data-side-left:ml-2 data-side-bottom:rounded-tl-none";');
  });

  // Deliberate, and the single subtlety most likely to be "simplified" away: the exemption is scoped
  // to `_base/_variants.css`'s REGISTERED variant names — the vocabulary `createFloating` emits — so
  // the arbitrary form does not inherit it. Widening this to `data-\[side=` would silently exempt
  // every hand-written `data-[side=…]` scope in the repo.
  it("does NOT treat the arbitrary data-[side=…] form as invariant", () => {
    expect(isDirectionInvariant("data-[side=bottom]:")).toBe(false);
    expect(onlyViolation('const a = "data-[side=bottom]:pl-2";').message).toBe(
      'physical utility "data-[side=bottom]:pl-2" — use ps-* instead of pl-*',
    );
  });

  // Both predicates are anchored with `(^|:)`, so the marker must START a variant rather than merely
  // appear inside one. Without the anchor, any variant ending in `rtl` or containing `data-side-`
  // would silence the utility beneath it.
  it("anchors both predicates to a variant boundary", () => {
    expect(isDirectionInvariant("foo-rtl:")).toBe(false);
    expect(isDirectionInvariant("notltr:")).toBe(false);
    expect(isDirectionInvariant("xdata-side-left:")).toBe(false);
    expect(check('const a = "foo-rtl:pl-2";')).toHaveLength(1);
  });

  it("is not fooled by rtl appearing in the BASE utility", () => {
    // `isDirectionInvariant` only ever sees the chain, so a base named `rtl-something` cannot
    // exempt itself.
    expect(isDirectionInvariant(splitVariants("rtl-pl-2").variants)).toBe(false);
  });

  it("returns false for an empty chain", () => {
    expect(isDirectionInvariant("")).toBe(false);
  });
});

describe("the rtl-ok: escape hatch", () => {
  it("exempts the offending line when a reason is given", () => {
    passes('const a = "pl-2"; // rtl-ok: mirrors a third-party widget that is LTR-only');
  });

  it("exempts from the line directly above", () => {
    passes(
      ["// rtl-ok: mirrors a third-party widget that is LTR-only", 'const a = "pl-2";'].join("\n"),
    );
  });

  // The boundary. `hasReasonedExemption` reads the offending line and exactly one line above it, so
  // a marker cannot drift up a file and keep silencing whatever lands beneath it.
  it("does NOT exempt from two lines above", () => {
    const violations = check(
      ["// rtl-ok: a reason that is now too far away", "", 'const a = "pl-2";'].join("\n"),
    );
    expect(violations).toHaveLength(1);
    expect(violations[0].line).toBe(3);
  });

  // Modelled on `expectNoA11yViolations`' `allowIncomplete`: name the case, never silence the
  // category. A bare marker is the shape this decays into.
  it("requires a reason — a bare marker does not exempt", () => {
    expect(check('const a = "pl-2"; // rtl-ok:')).toHaveLength(1);
    expect(check('const a = "pl-2"; // rtl-ok:   ')).toHaveLength(1);
    expect(check(["// rtl-ok:", 'const a = "pl-2";'].join("\n"))).toHaveLength(1);
  });

  it("accepts a reason on the next line of whitespace after the marker", () => {
    passes('const a = "pl-2"; // rtl-ok:\tthe tab still separates a reason');
  });

  // It is read from the ORIGINAL source, not from a projection — both projections blank comment
  // contents, so a hatch scanned off `stringInteriors` or `blankNonCode` could never be seen.
  it("is read from the original source, so a COMMENT can carry it", () => {
    passes('/* rtl-ok: a block comment carries it too */ const a = "pl-2";');
    passes('const a = "pl-2"; /* rtl-ok: trailing block comment */');
  });

  it("exempts a CSSOM property write", () => {
    passes('el.style.paddingRight = "1px"; // rtl-ok: compensating a physical scrollbar');
  });

  it("exempts a CSS declaration", () => {
    passes(
      [
        ".a {",
        "  /* rtl-ok: the scrollbar gutter is physical */",
        "  padding-left: 1rem;",
        "}",
      ].join("\n"),
      ".css",
    );
  });

  it("exempts an MDX class attribute", () => {
    passes(
      ['<div class="pl-2" /> {/* rtl-ok: showing the wrong way on purpose */}'].join("\n"),
      ".mdx",
    );
  });

  // A marker covers a two-line window (its own line and the one below), never the rest of the file —
  // otherwise one hatch near the top would silence every utility under it.
  it("does not silence the rest of the file", () => {
    const violations = check(
      [
        'const a = "pl-2"; // rtl-ok: this one is deliberate',
        'const b = "pr-8";',
        'const c = "mr-4";',
      ].join("\n"),
    );
    expect(violations).toHaveLength(1);
    expect(violations[0].line).toBe(3);
  });

  // Pinning the known looseness rather than an idealised rule: the hatch is matched against raw
  // lines, which is exactly what lets a comment carry it, and the price is that the same text inside
  // a string literal also exempts. Tightening this is a deliberate change, not a cleanup.
  it("also matches the marker inside a string literal (a consequence of reading raw lines)", () => {
    passes('const a = "pl-2"; const why = "rtl-ok: recorded in data";');
  });
});

describe("physical class utilities in .ts/.tsx", () => {
  const FLAGGED = [
    ["pl-2", "use ps-* instead of pl-*"],
    ["pr-8", "use pe-* instead of pr-*"],
    ["ml-1", "use ms-* instead of ml-*"],
    ["mr-4", "use me-* instead of mr-*"],
    ["-ml-2", "use ms-* instead of ml-*"],
    ["left-0", "use start-* instead of left-*"],
    ["right-4", "use end-* instead of right-*"],
    ["border-l", "use border-s* instead of border-l*"],
    ["border-r-2", "use border-e* instead of border-r*"],
    ["rounded-l-md", "use rounded-s* instead of rounded-l*"],
    ["rounded-tr", "use rounded-se* instead of rounded-tr*"],
    ["rounded-bl-sm", "use rounded-es* instead of rounded-bl*"],
    ["text-left", "use text-start instead of text-left"],
    ["text-right", "use text-end instead of text-right"],
    ["float-right", "use float-end instead of float-right"],
    ["clear-left", "use clear-start instead of clear-left"],
    ["scroll-pl-4", "use scroll-ps-* instead of scroll-pl-*"],
    ["scroll-mr-4", "use scroll-me-* instead of scroll-mr-*"],
  ];

  for (const [utility, advice] of FLAGGED) {
    it(`flags ${utility}`, () => {
      expect(onlyViolation(`const a = "${utility}";`).message).toBe(
        `physical utility "${utility}" — ${advice}`,
      );
    });
  }

  it("reports the whole candidate, chain included, so the message points at real source text", () => {
    expect(onlyViolation('const a = "md:hover:pl-2";').message).toBe(
      'physical utility "md:hover:pl-2" — use ps-* instead of pl-*',
    );
  });

  // The end-to-end consequence of `splitVariants`' bracket depth: a type hint puts a colon after the
  // last real separator, so a depth-blind split hands the table `2px]` and the physical utility
  // ships. Nothing else in the suite notices — this is a pure false negative.
  it("still flags a physical utility carrying an arbitrary value with a colon in it", () => {
    expect(onlyViolation('const a = "border-l-[length:2px]";').message).toBe(
      'physical utility "border-l-[length:2px]" — use border-s* instead of border-l*',
    );
    expect(onlyViolation('const a = "md:rounded-l-[length:4px]";').message).toBe(
      'physical utility "md:rounded-l-[length:4px]" — use rounded-s* instead of rounded-l*',
    );
  });

  it("matches the base utility whole, not by substring", () => {
    // Tokenised on whitespace and anchored, which is what keeps a path or a compound word out.
    passes('const a = "./listbox-right";');
    passes('const a = "pre-wrap place-items-center";');
    passes('const a = "border-blue-500 border-lg";');
  });
});

describe("the near-misses that must stay legal", () => {
  const LOGICAL = [
    "ps-2",
    "pe-8",
    "ms-1",
    "me-4",
    "start-0",
    "end-4",
    "border-s",
    "border-e-2",
    "rounded-s-md",
    "rounded-ss",
    "rounded-ee-lg",
    "text-start",
    "text-end",
    "float-start",
    "clear-end",
    "scroll-ps-4",
  ];

  for (const utility of LOGICAL) {
    it(`leaves the logical ${utility} alone`, () => {
      passes(`const a = "${utility}";`);
    });
  }

  // CLAUDE.md is explicit that these are ALREADY logical in Tailwind v4 (`px-*` compiles to
  // `padding-inline`) and must not be "fixed". They are absent from the table by construction; a
  // future edit that adds `^-?px-` beside `^-?pl-` would break correct code everywhere at once.
  const AXIS_SHORTHANDS = [
    "px-3",
    "-px-3",
    "mx-2",
    "inset-x-0",
    "border-x",
    "border-x-2",
    "space-x-2",
    "divide-x",
    "divide-x-2",
    "scroll-px-4",
  ];

  for (const utility of AXIS_SHORTHANDS) {
    it(`leaves Tailwind v4's already-logical ${utility} alone`, () => {
      passes(`const a = "${utility}";`);
    });
  }

  // `transform-origin` has no portable logical keyword, so there is nothing to point at.
  it("leaves origin-left/origin-right alone — out of scope by construction", () => {
    passes('const a = "origin-left origin-right";');
  });
});

describe("CSSOM property writes in .ts/.tsx", () => {
  it("flags a .style.<physical> assignment", () => {
    expect(onlyViolation('el.style.paddingRight = "1px";').message).toBe(
      'physical CSS property "paddingRight" — use the paddingInlineStart/End, marginInlineStart/End or borderInlineStart/End property',
    );
  });

  it("flags the rest of the padding/margin/border family", () => {
    expect(messagesOf("el.style.marginLeft = a;")).toHaveLength(1);
    expect(messagesOf("el.style.borderLeftWidth = a;")).toHaveLength(1);
    expect(messagesOf("el.style.borderRightColor = a;")).toHaveLength(1);
  });

  it("flags a getComputedStyle read", () => {
    expect(onlyViolation("const w = getComputedStyle(el).paddingLeft;").message).toBe(
      'physical CSS property "paddingLeft" — use the matching *InlineStart / *InlineEnd property',
    );
  });

  // A `style={{ "padding-left": … }}` key is a code position whose contents are a string, so neither
  // projection can see it — this one entry is matched against the ORIGINAL source.
  it("flags a hyphenated style-object key", () => {
    expect(onlyViolation('const s = { "padding-left": "2px" };').message).toBe(
      'physical CSS property "padding-left" — use the -inline-start / -inline-end spelling',
    );
    expect(messagesOf("const s = { 'margin-right': x };")).toHaveLength(1);
    expect(messagesOf('const s = { "inset-left": x };')).toHaveLength(1);
  });

  // The known cost of matching that one entry on the original source. Documented as safe because the
  // shape is too specific to appear in prose — pinned here so a future move onto the code projection
  // is a deliberate trade (it would fix this, and lose the detection entirely).
  it("also matches a hyphenated key written inside a comment", () => {
    expect(check('// never write { "padding-left": x }\nconst a = 1;')).toHaveLength(1);
  });

  // `createFloating` writes floating-ui's computed coordinates as `{ left, top }`; physical is
  // REQUIRED there, and `inset-inline-start` would double-flip under RTL. Flagging these would push
  // people to suppress the whole category.
  it("leaves bare left/right writes and geometry reads alone", () => {
    passes('el.style.left = x + "px";');
    passes("const x = el.getBoundingClientRect().left;");
    passes("const r = rect.right - rect.left;");
  });

  it("leaves the logical property writes alone", () => {
    passes('el.style.paddingInlineStart = "1px";');
    passes("const w = getComputedStyle(el).marginInlineEnd;");
  });
});

describe("directional CSS declarations in .css", () => {
  it("flags a physical padding/margin property", () => {
    expect(onlyViolation(".a {\n  padding-left: 1rem;\n}", ".css")).toEqual({
      line: 2,
      message: 'physical CSS "padding-left" — use the -inline-start / -inline-end spelling',
    });
    expect(messagesOf(".a {\n  scroll-margin-right: 1rem;\n}", ".css")).toHaveLength(1);
  });

  it("flags a physical border property, including its longhands", () => {
    expect(onlyViolation(".a {\n  border-right: 1px solid red;\n}", ".css").message).toBe(
      'physical CSS "border-right" — use border-inline-start / border-inline-end',
    );
    expect(messagesOf(".a {\n  border-left-width: 1px;\n}", ".css")).toHaveLength(1);
  });

  it("flags a bare left/right inset property", () => {
    expect(onlyViolation(".a {\n  right: 0;\n}", ".css").message).toBe(
      'physical CSS "right" — use inset-inline-start / inset-inline-end',
    );
  });

  it("flags a physical text-align/float/clear KEYWORD", () => {
    expect(onlyViolation(".a {\n  text-align: right;\n}", ".css").message).toBe(
      'physical CSS "right" — use the start / end keyword',
    );
    expect(messagesOf(".a {\n  float: left;\n}", ".css")).toHaveLength(1);
    expect(messagesOf(".a {\n  clear: right;\n}", ".css")).toHaveLength(1);
  });

  it("leaves the logical spellings alone", () => {
    passes(
      [
        ".a {",
        "  padding-inline-start: 1rem;",
        "  margin-inline-end: 1rem;",
        "  border-inline-start: 1px solid red;",
        "  inset-inline-end: 0;",
        "  text-align: start;",
        "  float: inline-end;",
        "}",
      ].join("\n"),
      ".css",
    );
  });

  // The property anchoring is what gives this pass a usable signal-to-noise ratio: a direction word
  // in a VALUE is almost always direction-invariant.
  it("never matches a direction word at a value position", () => {
    passes(".a {\n  background: linear-gradient(to right, red, blue);\n}", ".css");
    passes(".a {\n  mask-image: linear-gradient(to left, #000, transparent);\n}", ".css");
    passes(".a {\n  transform-origin: left center;\n}", ".css");
  });

  // A corner is always authored as a symmetric pair, so flagging one half is pure noise. Excluded by
  // construction: no entry matches a property name carrying `radius`.
  it("never matches a corner radius", () => {
    passes(".a {\n  border-bottom-left-radius: 2px;\n  border-top-right-radius: 2px;\n}", ".css");
  });

  it("does not read a class name in a selector as a utility", () => {
    // A `.pl-2` selector DEFINES a class; it is not Tailwind applying one, so it stays out of
    // scope. `@apply pl-2` below is the case that is in scope.
    passes(".pl-2 {\n  color: red;\n}", ".css");
  });

  it("flags a physical utility inlined with @apply", () => {
    // Regression: `@apply` smuggles utilities into a stylesheet, where the declaration pass cannot
    // see them and the class-token pass did not run — so this was checked by nothing.
    // `apps/docs/src/styles/app.css` uses the directive, so the surface is live.
    expect(onlyViolation(".card {\n  @apply pl-2;\n}", ".css").message).toBe(
      'physical utility "pl-2" — use ps-* instead of pl-*',
    );
    expect(onlyViolation(".card {\n  @apply pl-2;\n}", ".css").line).toBe(2);
  });

  it("reads every utility in an @apply list, not just the first", () => {
    const messages = messagesOf(".card {\n  @apply flex pl-2 mr-4 gap-2;\n}", ".css");
    expect(messages).toHaveLength(2);
    expect(messages[0]).toContain('"pl-2"');
    expect(messages[1]).toContain('"mr-4"');
  });

  it("honours a variant chain inside @apply", () => {
    passes(".card {\n  @apply ltr:pl-2 rtl:pr-2;\n}", ".css");
    passes(".card {\n  @apply ps-2;\n}", ".css");
  });

  it("honours rtl-ok: inside a CSS comment above the @apply", () => {
    passes(
      ".card {\n  /* rtl-ok: mirrors a physical scrollbar gutter */\n  @apply pl-2;\n}",
      ".css",
    );
  });

  it("does not read an @apply named inside a CSS comment", () => {
    passes(".card {\n  /* do not write @apply pl-2; here */\n  color: red;\n}", ".css");
  });

  it("does not read a physical declaration named inside a CSS comment", () => {
    passes(".card {\n  /* padding-left: 1px; is wrong */\n  color: red;\n}", ".css");
  });
});

describe("class utilities in .mdx", () => {
  it("flags a class attribute", () => {
    expect(onlyViolation('<div class="pl-2" />', ".mdx").message).toBe(
      'physical utility "pl-2" — use ps-* instead of pl-*',
    );
    expect(messagesOf('<div className="pr-8" />', ".mdx")).toHaveLength(1);
  });

  it("flags every quoted string inside a slotClasses block", () => {
    expect(
      messagesOf('<Preview slotClasses={{ root: "pl-2", label: "mr-4 flex" }} />', ".mdx"),
    ).toEqual([
      'physical utility "pl-2" — use ps-* instead of pl-*',
      'physical utility "mr-4" — use me-* instead of mr-*',
    ]);
  });

  it("reads a class attribute inside a fenced code block", () => {
    const source = ["```tsx", '<Badge class="pr-8">New</Badge>', "```"].join("\n");
    expect(onlyViolation(source, ".mdx").line).toBe(2);
  });

  // Prose staying out is the feature, not a limitation: a doc EXPLAINING that `pr-8` is wrong, or
  // one that says "right-to-left" / "right-aligns", must not fail the check. An earlier cut keyed on
  // any `[=:]\s*"…"` and flagged exactly that.
  it("never reads prose", () => {
    passes("Never write `pr-8`; the RTL reader gets the gutter on the wrong side.", ".mdx");
    passes("Hope supports right-to-left locales out of the box.", ".mdx");
    passes('description: "a sunken bar that right-aligns its buttons"', ".mdx");
  });

  it("never reads a plain string outside a class-bearing attribute", () => {
    passes('const a = "pl-2";', ".mdx");
    passes('<Demo title="the left-4 example" />', ".mdx");
  });

  it("keeps line numbers aligned with the original file", () => {
    const source = ["# Badge", "", "Some prose about badges.", "", '<div class="mr-4" />'].join(
      "\n",
    );
    expect(onlyViolation(source, ".mdx").line).toBe(5);
  });

  it("honours the direction-invariant escapes in MDX too", () => {
    passes('<div class="ltr:pr-8 rtl:pl-8 data-side-left:ml-2" />', ".mdx");
  });
});

describe("projection immunity", () => {
  // The canonical case: this rule's own script header names `pr-8`, `pl-*`, `border-l-4` and
  // `body.style.paddingRight` in prose. `stringInteriors` and `blankNonCode` are the only reason the
  // check does not fail on the file that defines it.
  it("ignores a physical utility named in a line comment", () => {
    passes('// `pr-8` reserves the gutter on the right in every locale.\nconst a = "flex";');
  });

  it("ignores a physical utility named in a block comment", () => {
    passes("/**\n * Use ps-* rather than pl-2 or -ml-2.\n */\nconst a = 1;");
  });

  it("ignores a physical utility named in a JSDoc line", () => {
    passes("/** Prefer border-s over border-l-4. */\nexport const a = 1;");
  });

  it("ignores a CSSOM write shown inside a comment", () => {
    passes("// createScrollLock used to do el.style.paddingRight = x;\nconst a = 1;");
  });

  it("ignores a CSSOM-looking write that is only a string", () => {
    // Pass 2 reads the CODE projection, so a property name quoted as data is not a write.
    passes('const doc = "el.style.paddingRight = 1";');
  });

  it("ignores a physical utility inside a regex literal", () => {
    // The string projection drops regex literals; the check's own tables are written this way.
    passes("const re = /^-?pl-/;");
  });

  it("still sees a real utility in the same file as a comment naming one", () => {
    const violations = check(
      ["// Never use pr-8 here.", 'const a = "flex";', 'const b = "pr-8";'].join("\n"),
    );
    expect(violations).toHaveLength(1);
    expect(violations[0].line).toBe(3);
  });

  it("reads the class pass off strings in .tsx but off class attributes in .mdx", () => {
    const source = 'const a = "pl-2";';
    expect(check(source, ".tsx")).toHaveLength(1);
    expect(check(source, ".mdx")).toHaveLength(0);
  });

  it("reads the class pass off strings in .ts as well as .tsx", () => {
    expect(check('const a = "pl-2";', ".ts")).toHaveLength(1);
  });
});

describe("line numbers and multiple violations", () => {
  it("reports every violation on a line, in order", () => {
    expect(messagesOf('const a = "pl-2 mr-4 text-left";')).toEqual([
      'physical utility "pl-2" — use ps-* instead of pl-*',
      'physical utility "mr-4" — use me-* instead of mr-*',
      'physical utility "text-left" — use text-start instead of text-left',
    ]);
  });

  it("numbers violations from 1, at their own line", () => {
    const source = [
      "export const recipe = tv({",
      '  base: "flex gap-2",',
      '  variants: { size: { sm: "pl-2" } },',
      "});",
      "",
      "export function pad(el) {",
      '  el.style.marginRight = "1px";',
      "}",
    ].join("\n");
    expect(check(source)).toEqual([
      { line: 3, message: 'physical utility "pl-2" — use ps-* instead of pl-*' },
      {
        line: 7,
        message:
          'physical CSS property "marginRight" — use the paddingInlineStart/End, marginInlineStart/End or borderInlineStart/End property',
      },
    ]);
  });

  it("runs the class pass before the CSSOM pass, so a file's report is grouped by pass", () => {
    const source = ['el.style.paddingLeft = "1px";', 'const a = "pr-8";'].join("\n");
    expect(check(source).map((v) => v.line)).toEqual([2, 1]);
  });

  it("returns an empty array for a clean file", () => {
    passes('const a = "flex gap-2 ps-4 text-start";');
    passes(".a {\n  padding-inline-start: 1rem;\n}", ".css");
    passes('<div class="ps-4" />', ".mdx");
  });
});
