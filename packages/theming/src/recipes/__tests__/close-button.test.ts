import { describe, expect, it } from "vitest";
import type {
  CloseButtonRecipeVariants,
  CloseButtonSize,
  CloseButtonSlot,
  CloseButtonThemeableProps,
} from "../close-button";

// The contract is types-only; its "tests" are compile-time assignability checks verified by
// `pnpm typecheck`, plus a runtime block that pins the vocabulary so a change is deliberate. A
// preset's real recipe is exercised by `@hope-ui/presets/hope`'s conformance test.

// The single variant prop is optional and typed to its union.
const _variants: CloseButtonRecipeVariants = { size: "lg" };
void _variants;

// `CloseButtonThemeableProps` is a **superset** of the recipe variants (like Button, unlike Badge):
// every variants object is a valid themeable-props object, and it carries the `icon` glyph on top in
// **factory** form — a bare element is *not* assignable, which is what forces a reuse-safe preset
// default. There is no `variant`/`colorScheme` axis — a close button never asserts its own color.
const _variantsAreThemeable = (v: CloseButtonRecipeVariants): CloseButtonThemeableProps => v;
void _variantsAreThemeable;
const _themeable: CloseButtonThemeableProps = {
  size: "md",
  icon: () => null,
};
void _themeable;

// Negative pin: the glyph must be a factory, not a bare element (a shared preset node would move if
// reused). If `icon` ever widens to accept a bare `JSX.Element` here, this stops erroring and
// `pnpm typecheck` fails on the stale `@ts-expect-error`.
const _iconIsFactoryOnly: CloseButtonThemeableProps = {
  // @ts-expect-error a preset-wide `icon` default must be a `() => JSX.Element` factory, never a node.
  icon: null,
};
void _iconIsFactoryOnly;

describe("close-button recipe contract", () => {
  it("names every size and slot the recipe implements, and no color axis", () => {
    const sizes: CloseButtonSize[] = ["sm", "md", "lg"];
    const slots: CloseButtonSlot[] = ["root", "icon"];

    expect(sizes).toHaveLength(3);
    expect(slots).toHaveLength(2);
  });
});
