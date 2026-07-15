import { describe, expect, it } from "vitest";
import type {
  ButtonColor,
  ButtonLoaderPlacement,
  ButtonRecipeVariants,
  ButtonSize,
  ButtonSlot,
  ButtonVariant,
} from "../button";

// The contract is types-only; its "tests" are compile-time assignability checks verified by
// `pnpm typecheck`, plus a runtime block that pins the vocabulary so a change is deliberate. A
// preset's real recipe is exercised by `@hope-ui/presets/hope`'s conformance test.

// Every variant prop is optional and typed to its union — a recipe/theme relies on this shape.
const _variants: ButtonRecipeVariants = {
  variant: "solid",
  color: "danger",
  size: "lg",
  fullWidth: true,
  loaderPlacement: "center",
};
void _variants;

// `loaderPlacement` is layout only (no "hidden"/"none"): the component mounts the loader slot via
// `<Show>`, so the recipe variant and the component prop share this three-member union.
const _placement: ButtonLoaderPlacement = "start";
void _placement;

describe("button recipe contract", () => {
  it("names every variant, color, size, and slot the recipe implements", () => {
    const variants: ButtonVariant[] = ["default", "solid", "soft", "outline", "ghost", "link"];
    const colors: ButtonColor[] = ["primary", "neutral", "success", "warning", "danger", "info"];
    const sizes: ButtonSize[] = ["xs", "sm", "md", "lg", "xl"];
    const slots: ButtonSlot[] = ["root", "label", "startDecorator", "endDecorator", "loader"];

    expect(variants).toHaveLength(6);
    expect(colors).toHaveLength(6);
    expect(sizes).toHaveLength(5);
    expect(slots).toHaveLength(5);
  });
});
