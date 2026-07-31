import type { ComboboxRecipeVariants, ComboboxSize } from "@hope-ui/theming";
import {
  assertLogicalPropertyConformance,
  assertSlotRecipeConformance,
} from "@hope-ui/theming/conformance";
import { describe, expect, it } from "vitest";
import { comboboxRecipe } from "../combobox";

const SIZES: ComboboxSize[] = ["sm", "md", "lg"];
const SLOTS = [
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
] as const;
const CASES: ComboboxRecipeVariants[] = [
  undefined as unknown as ComboboxRecipeVariants,
  ...SIZES.map((size) => ({ size })),
];

describe("hope combobox recipe", () => {
  it("produces a class for every slot across the full variant matrix", () => {
    assertSlotRecipeConformance(comboboxRecipe, { cases: CASES, slots: SLOTS });
  });

  it("emits only logical, RTL-safe utilities", () => {
    assertLogicalPropertyConformance(comboboxRecipe, { cases: CASES, slots: SLOTS });
  });

  it("draws the focus indicator on the control with focus-within, not focus-visible", () => {
    // The element that takes DOM focus is the `<input>` inside the shell, so `focus-visible:` on the
    // control would never fire — the whole reason Select's single `trigger` slot splits here.
    const control = comboboxRecipe({}).control();
    expect(control).toContain("focus-within:border-focus");
    expect(control).toContain("focus-within:ring-3");
    expect(control).toContain("focus-within:ring-focus-halo");
    expect(control).not.toContain("focus-visible:");
  });

  it("styles the control as the raised shell, with the disabled dim living there", () => {
    const control = comboboxRecipe({}).control();
    expect(control).toContain("bg-surface-raised");
    expect(control).toContain("border-subtle");
    expect(control).toContain("rounded-md");
    expect(control).toContain("relative");
    expect(control).toContain("inline-flex");
    // The widget dims as one — the component writes `data-disabled` here, not on each descendant.
    expect(control).toContain("data-disabled:opacity-disabled");
    expect(control).toContain("data-disabled:pointer-events-none");
    // A `<div>`, not a button: the kernel writes `data-pressed` on the chevron button only, and a
    // text field's affordance is the caret rather than a wash.
    expect(control).not.toContain("data-pressed:");
    // `select-none` here would reach the input's own text.
    expect(control).not.toContain("select-none");
  });

  it("leaves the input chrome-free so it cannot draw a second box inside the control", () => {
    const input = comboboxRecipe({}).input();
    expect(input).toContain("border-0");
    expect(input).toContain("bg-transparent");
    expect(input).toContain("outline-none");
    expect(input).toContain("cursor-text");
    // Shrinkable, or the text pushes the clear and chevron buttons out of the row.
    expect(input).toContain("min-w-0");
    expect(input).toContain("flex-1");
    // The empty state is the native pseudo-element, which is why there is no placeholder slot.
    expect(input).toContain("placeholder:text-foreground-subtle");
    // The control owns the box; a height, a border color or a ring here would fight it.
    expect(input).not.toMatch(/(?:^|\s)h-\d/);
    expect(input).not.toContain("border-subtle");
    expect(input).not.toContain("ring-");
  });

  it("gives the clear button a wash and the chevron trigger none", () => {
    const clear = comboboxRecipe({}).clear();
    // Guarded against the press so the two never fight — CloseButton's shape.
    expect(clear).toContain("hover:not-data-pressed:bg-surface-raised-hovered");
    expect(clear).toContain("data-pressed:bg-surface-raised-pressed");
    expect(clear).toContain("shrink-0");
    expect(clear).toContain("rounded-sm");

    const trigger = comboboxRecipe({}).trigger();
    // Purely the chevron's hit area: the control draws the border and the background.
    expect(trigger).not.toContain("bg-");
    expect(trigger).not.toContain("border");
    expect(trigger).toContain("cursor-default");
    expect(trigger).toContain("text-foreground-muted");
  });

  it("rings neither gutter button — both are tabindex=-1, so the shell's ring is the whole story", () => {
    // `createComboboxToggle` and `createComboboxClear` both set `tabindex="-1"` (the input is the
    // widget's single tab stop), so a `focus-visible:` rule on either would never fire.
    for (const slot of ["clear", "trigger"] as const) {
      const cls = comboboxRecipe({})[slot]();
      expect(cls, `${slot} must not ring`).not.toContain("focus-visible:");
      expect(cls, `${slot} must not ring`).not.toContain("ring-");
    }
  });

  it("pins the popup to the control's measured width, with no competing width anywhere", () => {
    // The one width Combobox has: the kernel measures the anchor and publishes `--anchor-width`, and
    // this spends it. Because it is the only one, no compound variant is needed to keep a second
    // width class from racing it — the failure `popover.ts` uses compounds to avoid.
    const positioner = comboboxRecipe({}).positioner();
    expect(positioner).toContain("w-(--anchor-width)");
    expect(positioner).toContain("z-50");
    expect(positioner).not.toContain("w-max");
    for (const size of SIZES) {
      // Anchored on a class boundary, so the per-size `min-w-*` floor (a different property) is not
      // mistaken for a competing `width`.
      expect(comboboxRecipe({ size }).positioner()).not.toMatch(/(?:^|\s)w-(?!\(--anchor-width\))/);
    }
    // Nothing positional: the kernel writes position/left/top/transform as an inline style.
    expect(positioner).not.toContain("absolute");
    expect(positioner).not.toContain("fixed");
  });

  it("keeps the control and the popup at the same min width, per size", () => {
    for (const size of SIZES) {
      const parts = comboboxRecipe({ size });
      const floor = /min-w-(\d+)/.exec(parts.control())?.[1];
      expect(floor, `no min-w-* on the ${size} control`).toBeDefined();
      expect(parts.positioner()).toContain(`min-w-${floor}`);
    }
  });

  it("caps the card at the measured available height and scrolls the list inside it", () => {
    const content = comboboxRecipe({}).content();
    expect(content).toContain("max-h-(--available-height)");
    expect(content).toContain("overflow-hidden");
    expect(content).toContain("flex flex-col");
    expect(content).toContain("bg-surface-overlay");
    expect(content).toContain("shadow-md");

    const list = comboboxRecipe({}).list();
    // Also what zeroes this flex child's automatic minimum size, so it shrinks inside the cap.
    expect(list).toContain("overflow-y-auto");
    expect(list).toContain("overscroll-contain");
  });

  it("styles the empty message and the status line as card siblings of the list", () => {
    // `role="listbox"` admits only options and groups, so both carry their own padding rather than
    // inheriting the list's — the reason `content` and `list` are separate slots at all.
    const empty = comboboxRecipe({}).empty();
    expect(empty).toContain("text-center");
    expect(empty).toContain("text-foreground-muted");
    expect(empty).toMatch(/(?:^|\s)py-\d/);

    const status = comboboxRecipe({}).status();
    // A visible live region, separated from the rows by a hairline; block-axis, so RTL-invariant.
    expect(status).toContain("border-t");
    expect(status).toContain("border-subtle");
    expect(status).toContain("text-foreground-muted");
    // Keeps the card's max-h cap collapsing the scrolling list rather than the pinned count.
    expect(status).toContain("shrink-0");
  });

  it("animates entry off data-presence and its direction off the measured data-side", () => {
    const content = comboboxRecipe({}).content();
    expect(content).toContain("data-entering:opacity-0");
    expect(content).toContain("data-exiting:opacity-0");
    // Physical, and correct: `data-side` reports where the layer landed after `flip` — measured
    // geometry, identical under `dir="rtl"`.
    expect(content).toContain("data-side-bottom:data-entering:-translate-y-1");
    expect(content).toContain("data-side-bottom:origin-top");
  });

  it("highlights the row on data-active only — never hover or a bare focus background", () => {
    const item = comboboxRecipe({}).item();
    // A Combobox is activedescendant by construction (focus never leaves the input), so `data-active`
    // is the only highlight signal there is.
    expect(item).toContain("data-active:bg-active");
    expect(item).toContain("data-active:text-on-active");
    expect(item).not.toContain("hover:");
    expect(item).not.toContain("focus:bg-");
    expect(item).toContain("relative");
    // Logical, so the indicator gutter mirrors with the locale.
    expect(item).toContain("pe-8");
    expect(comboboxRecipe({}).itemIndicator()).toContain("end-2");
  });

  it("scales the control and the rows together, each size self-contained", () => {
    const sm = comboboxRecipe({ size: "sm" });
    expect(sm.control()).toContain("h-8");
    expect(sm.input()).toContain("text-xs");
    expect(sm.item()).toContain("text-xs");
    expect(sm.item()).toContain("py-0.5");

    const lg = comboboxRecipe({ size: "lg" });
    expect(lg.control()).toContain("h-10");
    expect(lg.input()).toContain("text-base");
    expect(lg.item()).toContain("text-base");
    expect(lg.item()).toContain("py-1.5");
  });

  it("defaults to the md size when no size is passed", () => {
    const parts = comboboxRecipe({});
    expect(parts.control()).toContain("h-9");
    expect(parts.input()).toContain("text-sm");
    expect(parts.item()).toContain("text-sm");
    // Only the md density is applied — no sm/lg endpoints leak in.
    expect(parts.control()).not.toContain("h-8");
    expect(parts.control()).not.toContain("h-10");
  });

  it("computes no color — no color-mix, alpha modifier, or magic opacity (recipe purity)", () => {
    const cases: ComboboxRecipeVariants[] = [{}, ...SIZES.map((size) => ({ size }))];
    for (const variants of cases) {
      const parts = comboboxRecipe(variants);
      for (const slot of SLOTS) {
        const cls = parts[slot]();
        expect(cls).not.toContain("color-mix");
        // Alpha modifier on a color utility (`bg-x/50`).
        expect(cls).not.toMatch(/\b(?:bg|text|border|ring)-[\w-]+\/\d{1,3}\b/);
        // Magic opacity (`opacity-90`); the `opacity-disabled` token has no digits, so it is exempt.
        expect(cls).not.toMatch(/\bopacity-([1-9]|[1-9]\d)\b/);
      }
    }
  });

  it("merges a consumer class through the item slot function", () => {
    const merged = comboboxRecipe({ size: "md" }).item({ class: "rounded-none" });
    expect(merged).toContain("rounded-none");
    expect(merged).not.toContain("rounded-md");
  });
});
