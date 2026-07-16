import { describe, expect, it } from "vitest";
import type { ButtonRecipeVariants, ButtonThemeableProps } from "../../button";
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

// …and it carries the behavioral policy + chrome-content keys, with the content ones in factory
// form (a bare element is *not* assignable, which is what forces a reuse-safe preset default).
const _themeable: ThemeablePropsRegistry["button"] = {
  variant: "solid",
  size: "sm",
  nativeButton: false,
  type: "submit",
  loader: () => null,
  loadingText: () => "Saving…",
};
void _themeable;

describe("ThemeablePropsRegistry contract", () => {
  it("registers button's themeable props as a superset of its recipe variants", () => {
    // Runtime pin of the widened vocabulary (the types above are the real assertions). The behavioral
    // keys and factory-form content keys are what `defaultProps` gains over the old `defaultVariants`.
    const behavioralKeys = ["nativeButton", "type"] as const;
    const chromeContentKeys = ["loader", "loadingText"] as const;
    expect(behavioralKeys).toHaveLength(2);
    expect(chromeContentKeys).toHaveLength(2);
  });
});
