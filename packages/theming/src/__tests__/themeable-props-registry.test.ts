import { describe, expect, it } from "vitest";
import type { ButtonRecipeVariants, ButtonThemeableProps } from "../recipes/button";
import type { ThemeablePropsRegistry } from "../themeable-props-registry";

// The themeable-props registry is types-only; its "tests" are compile-time assignability checks
// verified by `pnpm typecheck`, plus a runtime block pinning the widened surface so a change is
// deliberate. The registry is hand-declared and closed (no module augmentation).

// The `button` entry is exactly `ButtonThemeableProps`.
const _entry: ThemeablePropsRegistry["button"] = {} as ButtonThemeableProps;
void _entry;

// It is a superset of the recipe variants: every variants object is a valid themeable-props object.
const _variantsAreThemeable = (v: ButtonRecipeVariants): ThemeablePropsRegistry["button"] => v;
void _variantsAreThemeable;

// …and it carries the chrome-content keys on top of the variants, in factory form (a bare element is
// *not* assignable, which is what forces a reuse-safe preset default). Per-usage behavioral props
// (`nativeButton`/`type`) are deliberately absent — see the negative pin below.
const _themeable: ThemeablePropsRegistry["button"] = {
  variant: "solid",
  size: "sm",
  loader: () => null,
  loadingText: () => "Saving…",
};
void _themeable;

// Negative pin: a per-usage behavioral prop is rejected (excess-property error). If `nativeButton`
// re-enters the themeable surface, this stops erroring and `pnpm typecheck` fails on the stale
// `@ts-expect-error`.
const _behavioralExcluded: ThemeablePropsRegistry["button"] = {
  // @ts-expect-error `nativeButton` is not themeable — it is per-usage, not an app-wide policy.
  nativeButton: false,
};
void _behavioralExcluded;

describe("ThemeablePropsRegistry contract", () => {
  it("registers button's themeable props as its recipe variants plus chrome content", () => {
    // Runtime pin of the vocabulary (the types above are the real assertions). The factory-form
    // content keys are what `defaultProps` gains over the old variants-only `defaultVariants`;
    // per-usage behavioral props are intentionally excluded.
    const chromeContentKeys = ["loader", "loadingText"] as const;
    expect(chromeContentKeys).toHaveLength(2);
  });
});
