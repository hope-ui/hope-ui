import type { JSX } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import type {
  AlertColorScheme,
  AlertRecipeVariants,
  AlertSize,
  AlertSlot,
  AlertThemeableProps,
  AlertVariant,
} from "../alert";

// The contract is types-only; its "tests" are compile-time assignability checks verified by
// `pnpm typecheck`, plus a runtime block that pins the vocabulary so a change is deliberate. A
// preset's real recipe is exercised by `@hope-ui/presets/hope`'s conformance test.

// Every variant prop is optional and typed to its union — a recipe/theme relies on this shape.
const _variants: AlertRecipeVariants = {
  variant: "solid",
  colorScheme: "danger",
  size: "lg",
};
void _variants;

// `AlertThemeableProps` is the curated surface a preset may default app-wide: the recipe variants
// **plus** the four flat, discrete status-icon factory keys (never a nested map — a nested map would
// lose a partial override under `mergeComponentOverrides`' shallow per-key merge). It is a strict
// superset of the variants, so a bare variants object is still assignable to it.
const _variantsAreThemeable = (v: AlertRecipeVariants): AlertThemeableProps => v;
void _variantsAreThemeable;
const _statusIcons: AlertThemeableProps = {
  colorScheme: "info",
  infoIcon: () => null as unknown as JSX.Element,
  successIcon: () => null as unknown as JSX.Element,
  warningIcon: () => null as unknown as JSX.Element,
  dangerIcon: () => null as unknown as JSX.Element,
};
void _statusIcons;

describe("alert recipe contract", () => {
  it("names every variant, colorScheme, size, and slot the recipe implements", () => {
    const variants: AlertVariant[] = ["default", "solid", "soft", "subtle", "outline"];
    const colorSchemes: AlertColorScheme[] = [
      "primary",
      "neutral",
      "success",
      "info",
      "warning",
      "danger",
    ];
    const sizes: AlertSize[] = ["sm", "md", "lg"];
    const slots: AlertSlot[] = [
      "root",
      "icon",
      "content",
      "title",
      "description",
      "actions",
      "closeTrigger",
    ];

    expect(variants).toHaveLength(5);
    expect(colorSchemes).toHaveLength(6);
    expect(sizes).toHaveLength(3);
    expect(slots).toHaveLength(7);
  });
});
