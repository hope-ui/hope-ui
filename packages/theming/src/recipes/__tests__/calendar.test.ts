import { describe, expect, it } from "vitest";
import type {
  CalendarRecipeVariants,
  CalendarSize,
  CalendarSlot,
  CalendarThemeableProps,
} from "../calendar";

// The contract is types-only; its "tests" are compile-time assignability checks verified by
// `pnpm typecheck`, plus a runtime block that pins the vocabulary so a change is deliberate. A
// preset's real recipe is exercised by `@hope-ui/presets/hope`'s conformance test.

// The single variant prop is optional and typed to its union — a recipe/theme relies on this shape.
const _variants: CalendarRecipeVariants = {
  size: "lg",
};
void _variants;

// `CalendarThemeableProps` is the curated surface a preset may default app-wide. Calendar carries no
// non-variant chrome content, so it is exactly the recipe variants — a strict superset by
// construction, so a bare variants object is still assignable to it (and vice versa).
const _variantsAreThemeable = (v: CalendarRecipeVariants): CalendarThemeableProps => v;
void _variantsAreThemeable;
const _themeableAreVariants = (v: CalendarThemeableProps): CalendarRecipeVariants => v;
void _themeableAreVariants;

describe("calendar recipe contract", () => {
  it("names every size and slot the recipe implements", () => {
    const sizes: CalendarSize[] = ["sm", "md", "lg"];
    const slots: CalendarSlot[] = [
      "root",
      "header",
      "heading",
      "prevButton",
      "nextButton",
      "grid",
      "weekday",
      "cell",
      "cellTrigger",
    ];

    expect(sizes).toHaveLength(3);
    expect(slots).toHaveLength(9);
  });
});
