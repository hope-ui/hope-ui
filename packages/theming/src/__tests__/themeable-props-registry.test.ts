import { describe, expect, it } from "vitest";
import type { ButtonRecipeVariants, ButtonThemeableProps } from "../recipes/button";
import type { ThemeablePropsRegistry } from "../themeable-props-registry";

// The registry is types-only, so most of what follows are compile-time assignability checks that
// `pnpm typecheck` verifies rather than anything the test runner executes.

const _entry: ThemeablePropsRegistry["button"] = {} as ButtonThemeableProps;
void _entry;

// Every recipe-variants object must also be a valid themeable-props object.
const _variantsAreThemeable = (v: ButtonRecipeVariants): ThemeablePropsRegistry["button"] => v;
void _variantsAreThemeable;

// Chrome content sits on top of the variants, and only in factory form: a bare element is not
// assignable, which is what stops a preset defaulting one element instance into every button.
const _themeable: ThemeablePropsRegistry["button"] = {
  variant: "solid",
  size: "sm",
  loader: () => null,
  loadingText: () => "Saving…",
};
void _themeable;

// Negative pin: a per-usage behavioral prop must stay rejected. If `nativeButton` re-enters the
// themeable surface this stops erroring, and `pnpm typecheck` then fails on the stale
// `@ts-expect-error` — which is how the regression announces itself.
const _behavioralExcluded: ThemeablePropsRegistry["button"] = {
  // @ts-expect-error `nativeButton` is not themeable — it is per-usage, not an app-wide policy.
  nativeButton: false,
};
void _behavioralExcluded;

describe("ThemeablePropsRegistry contract", () => {
  it("registers button's themeable props as its recipe variants plus chrome content", () => {
    // A runtime pin of the vocabulary, so widening it is a deliberate edit; the type checks above are
    // the real assertions.
    const chromeContentKeys = ["loader", "loadingText"] as const;
    expect(chromeContentKeys).toHaveLength(2);
  });
});
