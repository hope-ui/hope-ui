import { describe, expect, it } from "vitest";
import type {
  ComboboxRecipeVariants,
  ComboboxSize,
  ComboboxSlot,
  ComboboxThemeableProps,
} from "../combobox";

// The contract is types-only; its "tests" are compile-time assignability checks verified by
// `pnpm typecheck`, plus a runtime block that pins the vocabulary so a change is deliberate. A
// preset's real recipe is exercised by `@hope-ui/presets/hope`'s conformance test.

// The single variant prop is optional and typed to its union — a recipe/theme relies on this shape.
const _variants: ComboboxRecipeVariants = {
  size: "lg",
};
void _variants;

// `ComboboxThemeableProps` is the curated surface a preset may default app-wide: the variants
// **plus** the three chrome glyphs, each a factory. A strict superset by construction, so a bare
// variants object is still assignable to it — but not the reverse, matching Select.
const _variantsAreThemeable = (v: ComboboxRecipeVariants): ComboboxThemeableProps => v;
void _variantsAreThemeable;

// All three glyphs are factories, never bare elements: a preset value is one object shared by every
// instance, so a built node would move between them.
const _glyphs: ComboboxThemeableProps = {
  size: "sm",
  chevronIcon: () => null,
  checkIcon: () => null,
  clearIcon: () => null,
};
void _glyphs;

const SLOTS: ComboboxSlot[] = [
  "control",
  "input",
  "clear",
  "trigger",
  "icon",
  "positioner",
  "content",
  "list",
  "empty",
  "status",
  "group",
  "groupLabel",
  "separator",
  "item",
  "itemText",
  "itemIndicator",
];

describe("combobox recipe contract", () => {
  it("names every size and slot the recipe implements", () => {
    const sizes: ComboboxSize[] = ["sm", "md", "lg"];

    expect(sizes).toHaveLength(3);
    expect(SLOTS).toHaveLength(16);
  });

  it("splits Select's single trigger into the control shell and the chevron button", () => {
    // On Select one `trigger` slot is both the bordered box and the focusable button. Here the
    // focusable element is the `<input>` inside the box, so the shell (`control`, which takes the
    // `focus-within:` ring) and the chevron's hit area (`trigger`, excluded from the tab order) are
    // separate slots, and the input is a third.
    expect(SLOTS).toContain("control");
    expect(SLOTS).toContain("input");
    expect(SLOTS).toContain("trigger");
  });

  it("gives the no-results message and the live status their own slots", () => {
    // A `role="listbox"` may only contain options and groups, so both live in the card beside the
    // list — the slots Select's contract predicted and left to this one. Each renders an element
    // that does not otherwise exist, which is why neither is a `data-*` state on an existing slot.
    expect(SLOTS).toContain("empty");
    expect(SLOTS).toContain("status");
  });

  it("has no slot for the root, the portal, or the placeholder — all deliberate omissions", () => {
    // `Combobox.Root` and `Combobox.Portal` render no element at all, and the empty input is the
    // native `placeholder:` pseudo-element rather than an element of its own (where Select needs a
    // `value` slot carrying `data-placeholder`).
    expect(SLOTS).not.toContain("root" as ComboboxSlot);
    expect(SLOTS).not.toContain("portal" as ComboboxSlot);
    expect(SLOTS).not.toContain("placeholder" as ComboboxSlot);
    expect(SLOTS).not.toContain("value" as ComboboxSlot);
  });
});
