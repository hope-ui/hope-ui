import { describe, expect, it } from "vitest";
import {
  assertOpacityTokenConformance,
  assertSemanticTokenConformance,
  assertSlotRecipeConformance,
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
