import { describe, expect, it } from "vitest";
import type {
  ListboxRecipeVariants,
  ListboxSize,
  ListboxSlot,
  ListboxThemeableProps,
} from "../listbox";

// The contract is types-only; its "tests" are compile-time assignability checks verified by
// `pnpm typecheck`, plus a runtime block that pins the vocabulary so a change is deliberate. A
// preset's real recipe is exercised by `@hope-ui/presets/hope`'s conformance test.

// The single variant prop is optional and typed to its union — a recipe/theme relies on this shape.
const _variants: ListboxRecipeVariants = {
  size: "lg",
};
void _variants;

// `ListboxThemeableProps` is the curated surface a preset may default app-wide. Listbox carries no
// non-variant chrome content, so it is exactly the recipe variants — a strict superset by
// construction, so a bare variants object is still assignable to it (and vice versa).
const _variantsAreThemeable = (v: ListboxRecipeVariants): ListboxThemeableProps => v;
void _variantsAreThemeable;
const _themeableAreVariants = (v: ListboxThemeableProps): ListboxRecipeVariants => v;
void _themeableAreVariants;

describe("listbox recipe contract", () => {
  it("names every size and slot the recipe implements", () => {
    const sizes: ListboxSize[] = ["sm", "md", "lg"];
    const slots: ListboxSlot[] = [
      "root",
      "item",
      "itemIndicator",
      "group",
      "groupLabel",
      "separator",
    ];

    expect(sizes).toHaveLength(3);
    expect(slots).toHaveLength(6);
  });
});
