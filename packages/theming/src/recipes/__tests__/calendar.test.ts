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

// `CalendarThemeableProps` is a **superset** of the recipe variants (like CloseButton/Button): every
// variants object is a valid themeable-props object, and it carries the two navigation glyphs
// (`prevIcon`/`nextIcon`) on top in **factory** form — a bare element is *not* assignable, which is
// what forces a reuse-safe preset default. Calendar is a multi-part component, so its themeable
// surface stays on the root (no per-part themeable props); the parts read the resolved glyph off context.
const _variantsAreThemeable = (v: CalendarRecipeVariants): CalendarThemeableProps => v;
void _variantsAreThemeable;
const _themeable: CalendarThemeableProps = {
  size: "md",
  prevIcon: () => null,
  nextIcon: () => null,
};
void _themeable;

// Negative pin: each nav glyph must be a factory, not a bare element (a shared preset node would move
// if reused). If `prevIcon`/`nextIcon` ever widen to accept a bare `JSX.Element`, this stops erroring
// and `pnpm typecheck` fails on the stale `@ts-expect-error`.
const _navIconsAreFactoryOnly: CalendarThemeableProps = {
  // @ts-expect-error a preset-wide `prevIcon` default must be a `() => JSX.Element` factory, never a node.
  prevIcon: null,
  // @ts-expect-error a preset-wide `nextIcon` default must be a `() => JSX.Element` factory, never a node.
  nextIcon: null,
};
void _navIconsAreFactoryOnly;

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
