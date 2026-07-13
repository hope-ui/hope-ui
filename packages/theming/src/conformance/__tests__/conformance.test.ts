import { describe, expect, it } from "vitest";
import type { SlotRecipeFn } from "../../theme-recipes/theme-recipes";
import { assertSlotRecipeConformance, checkSlotRecipeConformance } from "../conformance";

// A synthetic multi-slot recipe stands in for what a theme author would pass — the kit is generic,
// so it needs no knowledge of any real component. `cases`/`slots` are what the author supplies.
type DemoVariants = { variant?: "a" | "b" };
const expectation = {
  cases: [{}, { variant: "a" }, { variant: "b" }] as DemoVariants[],
  slots: ["root", "label"] as const,
};

describe("conformance kit", () => {
  it("passes when every slot produces a class for every case", () => {
    const recipe: SlotRecipeFn<DemoVariants, "root" | "label"> = (props) => ({
      root: `demo demo--variant_${props?.variant ?? "a"}`,
      label: "demo__label",
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
      root: props?.variant === "b" ? "" : "demo",
      label: "demo__label",
    });

    const result = checkSlotRecipeConformance(broken, expectation);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes('slot "root"'))).toBe(true);
    expect(() => assertSlotRecipeConformance(broken, expectation)).toThrow(/conformance failed/);
  });
});
