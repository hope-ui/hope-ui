import { describe, expect, it } from "vitest";
import type {
  ButtonColorScheme,
  ButtonLoaderPlacement,
  ButtonRecipeVariants,
  ButtonSize,
  ButtonSlot,
  ButtonThemeableProps,
  ButtonVariant,
} from "../button";

// The contract is types-only; its "tests" are compile-time assignability checks verified by
// `pnpm typecheck`, plus a runtime block that pins the vocabulary so a change is deliberate. A
// preset's real recipe is exercised by `@hope-ui/presets/hope`'s conformance test.

// Every variant prop is optional and typed to its union — a recipe/theme relies on this shape.
const _variants: ButtonRecipeVariants = {
  variant: "solid",
  colorScheme: "danger",
  size: "lg",
  fullWidth: true,
  iconOnly: true,
  loaderPlacement: "center",
};
void _variants;

// `loaderPlacement` is layout only, with no "hidden"/"none" member: the component mounts the loader
// slot via `<Show>`, so the recipe variant and the component prop share this three-member union.
const _placement: ButtonLoaderPlacement = "start";
void _placement;

// The themeable surface is a superset of the recipe variants, so every variants object is a valid
// themeable object and nothing is lost passing one where the other is expected.
const _variantsAreThemeable = (v: ButtonRecipeVariants): ButtonThemeableProps => v;
void _variantsAreThemeable;

// Chrome content is in **factory** form — a bare `JSX.Element` is not assignable, which is what forces
// a reuse-safe preset default. It deliberately carries no per-usage behavioral props
// (`nativeButton`/`type`): those describe what a given button *is*, not an app-wide default.
const _themeable: ButtonThemeableProps = {
  variant: "solid",
  colorScheme: "primary",
  size: "md",
  fullWidth: false,
  iconOnly: false,
  loaderPlacement: "center",
  loader: () => null,
  loadingText: () => null,
};
void _themeable;

// Negative pin: the themeable surface rejects a per-usage behavioral prop. If one is ever re-added,
// this stops erroring and `pnpm typecheck` fails on the now-stale suppression below.
const _behavioralExcluded: ButtonThemeableProps = {
  // @ts-expect-error `nativeButton` is not themeable — it is per-usage, not an app-wide policy.
  nativeButton: false,
};
void _behavioralExcluded;

describe("button recipe contract", () => {
  it("names every variant, colorScheme, size, and slot the recipe implements", () => {
    const variants: ButtonVariant[] = [
      "default",
      "solid",
      "inverted",
      "soft",
      "outline",
      "ghost",
      "adaptive",
      "link",
    ];
    const colorSchemes: ButtonColorScheme[] = [
      "primary",
      "neutral",
      "success",
      "warning",
      "danger",
      "info",
    ];
    const sizes: ButtonSize[] = ["xs", "sm", "md", "lg", "xl"];
    const slots: ButtonSlot[] = ["root", "label", "startDecorator", "endDecorator", "loader"];

    expect(variants).toHaveLength(8);
    expect(colorSchemes).toHaveLength(6);
    expect(sizes).toHaveLength(5);
    expect(slots).toHaveLength(5);
  });
});
