import { describe, expect, it } from "vitest";
import type {
  PopoverRecipeVariants,
  PopoverSize,
  PopoverSlot,
  PopoverThemeableProps,
} from "../popover";

// The contract is types-only; its "tests" are compile-time assignability checks verified by
// `pnpm typecheck`, plus a runtime block that pins the vocabulary so a change is deliberate. A
// preset's real recipe is exercised by `@hope-ui/presets/hope`'s conformance test.

// The single variant prop is optional and typed to its union — a recipe/theme relies on this shape.
const _variants: PopoverRecipeVariants = { size: "lg" };
void _variants;

// `PopoverThemeableProps` is the curated surface a preset may default app-wide. Popover carries no
// non-variant chrome content, so it is exactly the recipe variants — a strict superset by
// construction, so a bare variants object is still assignable to it (and vice versa).
const _variantsAreThemeable = (v: PopoverRecipeVariants): PopoverThemeableProps => v;
void _variantsAreThemeable;
const _themeableAreVariants = (v: PopoverThemeableProps): PopoverRecipeVariants => v;
void _themeableAreVariants;

describe("popover recipe contract", () => {
  it("names every size and slot the recipe implements", () => {
    const sizes: PopoverSize[] = ["sm", "md", "lg"];
    const slots: PopoverSlot[] = [
      "positioner",
      "content",
      "arrow",
      "header",
      "title",
      "description",
      "closeTrigger",
    ];

    expect(sizes).toHaveLength(3);
    // Seven, not ten: `Popover.Root` renders no element and `Trigger`/`Anchor` render the consumer's,
    // so none of the three carries a slot — see the contract's `PopoverSlot` doc comment.
    expect(slots).toHaveLength(7);
  });
});
