import { describe, expect, it } from "vitest";
import type {
  BadgeColorScheme,
  BadgeRecipeVariants,
  BadgeShape,
  BadgeSize,
  BadgeSlot,
  BadgeThemeableProps,
  BadgeVariant,
} from "../badge";

// The contract is types-only; its "tests" are compile-time assignability checks verified by
// `pnpm typecheck`, plus a runtime block that pins the vocabulary so a change is deliberate. A
// preset's real recipe is exercised by `@hope-ui/presets/hope`'s conformance test.

// Every variant prop is optional and typed to its union — a recipe/theme relies on this shape.
const _variants: BadgeRecipeVariants = {
  variant: "inverted",
  colorScheme: "danger",
  size: "lg",
  shape: "pill",
  fullWidth: true,
};
void _variants;

// `BadgeThemeableProps` is the curated surface a preset may default app-wide. Badge has no
// non-variant themeable props, so it is an exact (empty) extension of `BadgeRecipeVariants` — the
// two are mutually assignable. This pins the "contract uniformity with Button" decision: the
// mechanism (a `…ThemeableProps` per component + a registry entry) is identical even where the
// curated surface equals the recipe variants.
const _variantsAreThemeable = (v: BadgeRecipeVariants): BadgeThemeableProps => v;
void _variantsAreThemeable;
const _themeableAreVariants = (v: BadgeThemeableProps): BadgeRecipeVariants => v;
void _themeableAreVariants;

describe("badge recipe contract", () => {
  it("names every variant, colorScheme, size, shape, and slot the recipe implements", () => {
    const variants: BadgeVariant[] = ["solid", "inverted", "soft", "subtle", "outline", "dot"];
    const colorSchemes: BadgeColorScheme[] = [
      "primary",
      "neutral",
      "success",
      "info",
      "warning",
      "danger",
    ];
    const sizes: BadgeSize[] = ["xs", "sm", "md", "lg"];
    const shapes: BadgeShape[] = ["sharp", "rounded", "pill", "circle"];
    const slots: BadgeSlot[] = ["root", "label", "startDecorator", "endDecorator", "dot"];

    expect(variants).toHaveLength(6);
    expect(colorSchemes).toHaveLength(6);
    expect(sizes).toHaveLength(4);
    expect(shapes).toHaveLength(4);
    expect(slots).toHaveLength(5);
  });
});
