import { describe, expect, it } from "vitest";
import {
  assertLogicalPropertyConformance,
  assertOpacityTokenConformance,
  assertSemanticTokenConformance,
  assertSlotRecipeConformance,
  checkLogicalPropertyConformance,
  checkOpacityTokenConformance,
  checkSemanticTokenConformance,
  checkSlotRecipeConformance,
} from "../conformance";
import { SEMANTIC_COLOR_TOKENS, SEMANTIC_OPACITY_TOKENS } from "../semantic-tokens";
import type { SlotRecipeFn } from "../slot-recipe";

// A synthetic multi-slot recipe stands in for what a theme author would pass — the kit is generic,
// so it needs no knowledge of any real component. `cases`/`slots` are what the author supplies.
type DemoVariants = { variant?: "a" | "b" };
const expectation = {
  cases: [{}, { variant: "a" }, { variant: "b" }] as DemoVariants[],
  slots: ["root", "label"] as const,
};

describe("conformance kit", () => {
  it("passes when every slot produces a class for every case", () => {
    // A recipe resolves each slot to a class *function* (the tailwind-variants shape).
    const recipe: SlotRecipeFn<DemoVariants, "root" | "label"> = (props) => ({
      root: () => `demo demo--variant_${props?.variant ?? "a"}`,
      label: () => "demo__label",
    });

    const result = checkSlotRecipeConformance(recipe, expectation);
    expect(result.errors).toEqual([]);
    expect(result.ok).toBe(true);
    expect(() => assertSlotRecipeConformance(recipe, expectation)).not.toThrow();
  });

  it("reports a slot that produces no class for some case", () => {
    // Emits nothing for `root` at variant "b" — the kind of gap types can't catch (the fn still
    // *accepts* "b"; it just maps it to "").
    const broken: SlotRecipeFn<DemoVariants, "root" | "label"> = (props) => ({
      root: () => (props?.variant === "b" ? "" : "demo"),
      label: () => "demo__label",
    });

    const result = checkSlotRecipeConformance(broken, expectation);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('slot "root"'))).toBe(true);
    expect(() => assertSlotRecipeConformance(broken, expectation)).toThrow(/conformance failed/);
  });

  it("allows an intentionally-unstyled slot to produce no class via `unstyledSlots`", () => {
    // `hint` is declared but carries no default classes (like Alert's description). tailwind-variants
    // resolves an empty `""` slot base to `undefined`, so the slot function returns nothing — that is
    // exactly what an unstyled slot is, and it must not be reported.
    const recipe: SlotRecipeFn<DemoVariants, "root" | "hint"> = () => ({
      root: () => "demo",
      hint: () => undefined as unknown as string,
    });

    const withUnstyled = { cases: expectation.cases, slots: ["root"], unstyledSlots: ["hint"] };
    expect(checkSlotRecipeConformance(recipe, withUnstyled).ok).toBe(true);

    // The same unstyled slot listed under the strict `slots` set still fails — `unstyledSlots` is the
    // only way to exempt it from the non-empty requirement.
    const asStrict = { cases: expectation.cases, slots: ["root", "hint"] };
    expect(checkSlotRecipeConformance(recipe, asStrict).ok).toBe(false);
  });

  it("reports an unstyled slot the recipe never declared (a real gap, not a styling choice)", () => {
    // The point of listing a slot as unstyled is to prove it EXISTS so `ctx.slots.<slot>()` is safe.
    // A recipe that forgot to declare `hint` altogether resolves it to `undefined` (not a function).
    const missing: SlotRecipeFn<DemoVariants, "root"> = () => ({ root: () => "demo" });

    const result = checkSlotRecipeConformance(missing as SlotRecipeFn<DemoVariants, string>, {
      cases: expectation.cases,
      slots: ["root"],
      unstyledSlots: ["hint"],
    });
    expect(result.ok).toBe(false);
    expect(
      result.errors.some((e) => e.includes('unstyled slot "hint" is not a declared slot')),
    ).toBe(true);
  });
});

describe("semantic token conformance", () => {
  it("passes when every --hope-* token is declared", () => {
    const css = SEMANTIC_COLOR_TOKENS.map((token) => `--hope-${token}: #000;`).join("\n");
    expect(checkSemanticTokenConformance(css).ok).toBe(true);
    expect(() => assertSemanticTokenConformance(css)).not.toThrow();
  });

  it("reports a token the theme CSS forgot to define", () => {
    const result = checkSemanticTokenConformance("--hope-primary: #000;");
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("--hope-surface"))).toBe(true);
    expect(() => assertSemanticTokenConformance("--hope-primary: #000;")).toThrow(
      /conformance failed/,
    );
  });
});

describe("opacity token conformance", () => {
  it("passes when every --hope-opacity-* token is declared", () => {
    const css = SEMANTIC_OPACITY_TOKENS.map((token) => `--hope-${token}: 0.5;`).join("\n");
    expect(checkOpacityTokenConformance(css).ok).toBe(true);
    expect(() => assertOpacityTokenConformance(css)).not.toThrow();
  });

  it("reports an opacity token the theme CSS forgot to define", () => {
    const result = checkOpacityTokenConformance("--hope-opacity-disabled: 0.4;");
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("--hope-opacity-loading"))).toBe(true);
    expect(() => assertOpacityTokenConformance("--hope-opacity-disabled: 0.4;")).toThrow(
      /Opacity token conformance failed/,
    );
  });
});

describe("logical-property (RTL) conformance", () => {
  /** A one-slot recipe whose classes the test controls directly. */
  const recipeEmitting = (classes: string): SlotRecipeFn<DemoVariants, "root"> => {
    return () => ({ root: () => classes });
  };
  const rootOnly = { cases: [{}] as DemoVariants[], slots: ["root"] as const };

  it("passes a recipe built entirely from logical utilities", () => {
    const recipe = recipeEmitting("flex ps-2 pe-8 ms-auto -me-1 end-2 rounded-s-md text-end");
    expect(checkLogicalPropertyConformance(recipe, rootOnly).ok).toBe(true);
    expect(() => assertLogicalPropertyConformance(recipe, rootOnly)).not.toThrow();
  });

  it("reports a physical utility and names the logical replacement", () => {
    const result = checkLogicalPropertyConformance(recipeEmitting("relative pr-8"), rootOnly);
    expect(result.ok).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('"pr-8"');
    expect(result.errors[0]).toContain("pe-*");
    expect(() => assertLogicalPropertyConformance(recipeEmitting("pr-8"), rootOnly)).toThrow(
      /Logical-property \(RTL\) conformance failed/,
    );
  });

  it("leaves Tailwind v4's already-logical axis shorthands alone", () => {
    // These compile to `padding-inline` / `margin-inline` / `inset-inline` / `border-inline-*`, so
    // flagging them would fire on nearly every recipe in the repo while fixing nothing.
    const recipe = recipeEmitting("px-4 mx-2 -mx-4 inset-x-0 border-x space-x-2 divide-x");
    expect(checkLogicalPropertyConformance(recipe, rootOnly).ok).toBe(true);
  });

  it("does not mistake a longer utility for a physical one", () => {
    const recipe = recipeEmitting(
      "border-blue-500 rounded-t-xl border-t pre-wrap origin-center order-first",
    );
    expect(checkLogicalPropertyConformance(recipe, rootOnly).ok).toBe(true);
  });

  it("allows a physical utility that an rtl:/ltr: variant deliberately flips", () => {
    // The one shape where physical is correct — an explicit manual flip, or a rule no logical
    // property can express (hope's calendar mirrors its chevrons with `rtl:[&_svg]:rotate-180`).
    const recipe = recipeEmitting("ltr:pr-8 rtl:pl-8 rtl:[&_svg]:rotate-180");
    expect(checkLogicalPropertyConformance(recipe, rootOnly).ok).toBe(true);
  });

  it("allows a physical utility scoped by a measured `data-side-*`", () => {
    // `data-side` reports where a floating layer LANDED after `flip`. Which two edges of a
    // 45°-rotated arrow face outward is a fact of that measured geometry, not of reading direction,
    // so the pair is IDENTICAL under `dir="rtl"` — hope's popover arrow is the worked example.
    const recipe = recipeEmitting(
      "data-side-bottom:border-t data-side-bottom:border-l data-side-left:border-r",
    );
    expect(checkLogicalPropertyConformance(recipe, rootOnly).ok).toBe(true);
    expect(() => assertLogicalPropertyConformance(recipe, rootOnly)).not.toThrow();
  });

  it("exempts on the variant chain, never on the base utility", () => {
    // The exemption is the SCOPE. The same `border-l` bare, or under an unrelated variant, is the
    // ordinary defect this rule exists for — a `data-side-*` class elsewhere in the recipe must not
    // launder it.
    for (const classes of [
      "flex border-l",
      "hover:border-l",
      "data-side-bottom:border-t border-l",
    ]) {
      const result = checkLogicalPropertyConformance(recipeEmitting(classes), rootOnly);
      expect(result.ok, `"${classes}" should fail`).toBe(false);
      expect(result.errors[0]).toContain("border-s*");
    }
  });

  it("does not exempt the arbitrary `data-[side=…]` form", () => {
    // Only `_base/_variants.css`'s four registered variant names are exempt — the vocabulary
    // `createFloating` actually emits. The arbitrary form is out of scope by design: it can select
    // values the registered set never produces, so it gets no free pass.
    const result = checkLogicalPropertyConformance(
      recipeEmitting("data-[side=bottom]:border-l"),
      rootOnly,
    );
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toContain("border-s*");
  });

  it("keys the `data-side-*` exemption on the attribute, not on a utility allowlist", () => {
    // The deliberate boundary, pinned rather than narrowed. `pl-4` under a side scope passes too:
    // the doctrine is "a measured-geometry scope carries physical values", not "these particular
    // utilities are safe". A recipe that genuinely wants "the side nearest where the text starts"
    // under a side scope layers `ltr:`/`rtl:` on top, which is the other exemption.
    expect(
      checkLogicalPropertyConformance(recipeEmitting("data-side-bottom:pl-4"), rootOnly).ok,
    ).toBe(true);
  });

  it("strips a variant chain before matching, including arbitrary variants", () => {
    const result = checkLogicalPropertyConformance(
      recipeEmitting("hover:md:data-[slot=x]:[&_svg]:pl-2"),
      rootOnly,
    );
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toContain("ps-*");
  });

  it("catches a violation only a compound variant introduces", () => {
    // The reason this runtime half exists alongside the source scan: a class assembled at call time
    // never appears as a literal the static scan could read.
    const recipe: SlotRecipeFn<DemoVariants, "root"> = (props) => ({
      root: () => (props?.variant === "b" ? "flex text-right" : "flex text-end"),
    });
    const expectation = {
      cases: [{}, { variant: "b" }] as DemoVariants[],
      slots: ["root"] as const,
    };
    expect(checkLogicalPropertyConformance(recipe, expectation).ok).toBe(false);
  });

  it("checks unstyled slots too, and tolerates a slot resolving to no class", () => {
    const recipe: SlotRecipeFn<DemoVariants, "root" | "hint"> = () => ({
      root: () => "flex",
      hint: () => undefined as unknown as string,
    });
    expect(
      checkLogicalPropertyConformance(recipe, {
        cases: [{}] as DemoVariants[],
        slots: ["root"],
        unstyledSlots: ["hint"],
      }).ok,
    ).toBe(true);
  });
});
