import { describe, expect, it } from "vitest";
import type {
  DialogPlacement,
  DialogRecipeVariants,
  DialogScrollBehavior,
  DialogSize,
  DialogSlot,
  DialogThemeableProps,
} from "../dialog";

// The contract is types-only; its "tests" are compile-time assignability checks verified by
// `pnpm typecheck`, plus a runtime block that pins the vocabulary so a change is deliberate. A
// preset's real recipe is exercised by `@hope-ui/presets/hope`'s conformance test.

// Every variant prop is optional and typed to its union — a recipe/theme relies on this shape.
const _variants: DialogRecipeVariants = {
  size: "lg",
  placement: "top",
  scrollBehavior: "outside",
};
void _variants;

// `DialogThemeableProps` is the curated surface a preset may default app-wide. Dialog carries no
// non-variant chrome content, so it is exactly the recipe variants — a strict superset by
// construction, so a bare variants object is still assignable to it (and vice versa).
const _variantsAreThemeable = (v: DialogRecipeVariants): DialogThemeableProps => v;
void _variantsAreThemeable;
const _themeableAreVariants = (v: DialogThemeableProps): DialogRecipeVariants => v;
void _themeableAreVariants;

describe("dialog recipe contract", () => {
  it("names every size, placement, scrollBehavior, and slot the recipe implements", () => {
    const sizes: DialogSize[] = ["xs", "sm", "md", "lg", "xl", "cover", "full"];
    const placements: DialogPlacement[] = ["center", "top"];
    const scrollBehaviors: DialogScrollBehavior[] = ["inside", "outside"];
    const slots: DialogSlot[] = [
      "backdrop",
      "content",
      "header",
      "body",
      "footer",
      "title",
      "description",
      "closeTrigger",
    ];

    expect(sizes).toHaveLength(7);
    expect(placements).toHaveLength(2);
    expect(scrollBehaviors).toHaveLength(2);
    expect(slots).toHaveLength(8);
  });
});
