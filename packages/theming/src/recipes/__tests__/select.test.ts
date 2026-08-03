import { describe, expect, it } from "vitest";
import type { SelectRecipeVariants, SelectSize, SelectSlot, SelectThemeableProps } from "../select";

// The contract is types-only; its "tests" are compile-time assignability checks verified by
// `pnpm typecheck`, plus a runtime block that pins the vocabulary so a change is deliberate. A
// preset's real recipe is exercised by `@hope-ui/presets/hope`'s conformance test.

// The single variant prop is optional and typed to its union — a recipe/theme relies on this shape.
const _variants: SelectRecipeVariants = {
  size: "lg",
};
void _variants;

// The curated surface a preset may default app-wide: the variants **plus** the two chrome glyphs.
// A superset, so a bare variants object is assignable to it but not the reverse — unlike Listbox and
// Popover, which add no glyphs.
const _variantsAreThemeable = (v: SelectRecipeVariants): SelectThemeableProps => v;
void _variantsAreThemeable;

// Both glyphs are factories, never bare elements: a preset value is one object shared by every
// instance, so an already-built DOM node would *move* between them.
const _glyphs: SelectThemeableProps = {
  size: "sm",
  chevronIcon: () => null,
  checkIcon: () => null,
};
void _glyphs;

describe("select recipe contract", () => {
  it("names every size and slot the recipe implements", () => {
    const sizes: SelectSize[] = ["sm", "md", "lg"];
    const slots: SelectSlot[] = [
      "trigger",
      "value",
      "icon",
      "positioner",
      "content",
      "list",
      "group",
      "groupLabel",
      "separator",
      "item",
      "itemText",
      "itemIndicator",
    ];

    expect(sizes).toHaveLength(3);
    expect(slots).toHaveLength(12);
  });

  it("has no slot for the empty value or the root — both are deliberate omissions", () => {
    // The empty state is `data-placeholder:` on the `value` slot (nothing extra is rendered, only
    // styled differently), and `Select.Root` renders no element at all.
    const slots: SelectSlot[] = [
      "trigger",
      "value",
      "icon",
      "positioner",
      "content",
      "list",
      "group",
      "groupLabel",
      "separator",
      "item",
      "itemText",
      "itemIndicator",
    ];
    expect(slots).not.toContain("root" as SelectSlot);
    expect(slots).not.toContain("placeholder" as SelectSlot);
  });
});
