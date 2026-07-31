import type { SelectRecipeVariants, SelectSize } from "@hope-ui/theming";
import {
  assertLogicalPropertyConformance,
  assertSlotRecipeConformance,
} from "@hope-ui/theming/conformance";
import { describe, expect, it } from "vitest";
import { selectRecipe } from "../select";

const SIZES: SelectSize[] = ["sm", "md", "lg"];
const SLOTS = [
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
] as const;
const CASES: SelectRecipeVariants[] = [
  undefined as unknown as SelectRecipeVariants,
  ...SIZES.map((size) => ({ size })),
];

describe("hope select recipe", () => {
  it("produces a class for every slot across the full variant matrix", () => {
    assertSlotRecipeConformance(selectRecipe, { cases: CASES, slots: SLOTS });
  });

  it("emits only logical, RTL-safe utilities", () => {
    assertLogicalPropertyConformance(selectRecipe, { cases: CASES, slots: SLOTS });
  });

  it("styles the trigger as a raised control with the shared focus indicator", () => {
    const trigger = selectRecipe({}).trigger();
    expect(trigger).toContain("bg-surface-raised");
    expect(trigger).toContain("border-subtle");
    expect(trigger).toContain("rounded-md");
    // The wash is guarded against the press so the two never fight.
    expect(trigger).toContain("hover:not-data-pressed:bg-surface-raised-hovered");
    expect(trigger).toContain("data-pressed:bg-surface-raised-pressed");
    // The same indicator every hope control uses — a finished halo token, never an alpha modifier.
    expect(trigger).toContain("focus-visible:border-focus");
    expect(trigger).toContain("focus-visible:ring-focus-halo");
    expect(trigger).toContain("data-disabled:opacity-disabled");
  });

  it("styles the empty value through data-placeholder rather than a slot of its own", () => {
    const value = selectRecipe({}).value();
    expect(value).toContain("data-placeholder:text-foreground-subtle");
    // Truncation needs a shrinkable box, or the text pushes the chevron out instead of ellipsizing.
    expect(value).toContain("min-w-0");
    expect(value).toContain("flex-1");
    expect(value).toContain("truncate");
    // Logical, so the label starts on the reading edge in both directions.
    expect(value).toContain("text-start");
  });

  it("pins the popup to the trigger's measured width, with no competing width anywhere", () => {
    // The one width Select has: the kernel measures the anchor and publishes `--anchor-width`, and
    // this spends it. Because it is the only one, no compound variant is needed to keep a second
    // width class from racing it — the failure `popover.ts` uses compounds to avoid.
    const positioner = selectRecipe({}).positioner();
    expect(positioner).toContain("w-(--anchor-width)");
    expect(positioner).toContain("z-50");
    expect(positioner).not.toContain("w-max");
    for (const size of SIZES) {
      // Anchored on a class boundary, so the per-size `min-w-*` floor (a different property) is not
      // mistaken for a competing `width`.
      expect(selectRecipe({ size }).positioner()).not.toMatch(/(?:^|\s)w-(?!\(--anchor-width\))/);
    }
    // Nothing positional: the kernel writes position/left/top/transform as an inline style.
    expect(positioner).not.toContain("absolute");
    expect(positioner).not.toContain("fixed");
  });

  it("keeps the trigger and the popup at the same min width, per size", () => {
    for (const size of SIZES) {
      const parts = selectRecipe({ size });
      const floor = /min-w-(\d+)/.exec(parts.trigger())?.[1];
      expect(floor, `no min-w-* on the ${size} trigger`).toBeDefined();
      expect(parts.positioner()).toContain(`min-w-${floor}`);
    }
  });

  it("caps the card at the measured available height and scrolls the list inside it", () => {
    const content = selectRecipe({}).content();
    expect(content).toContain("max-h-(--available-height)");
    expect(content).toContain("overflow-hidden");
    expect(content).toContain("flex flex-col");
    expect(content).toContain("bg-surface-overlay");
    expect(content).toContain("shadow-md");

    const list = selectRecipe({}).list();
    // Also what zeroes this flex child's automatic minimum size, so it shrinks inside the cap.
    expect(list).toContain("overflow-y-auto");
    expect(list).toContain("overscroll-contain");
  });

  it("animates entry off data-presence and its direction off the measured data-side", () => {
    const content = selectRecipe({}).content();
    expect(content).toContain("data-entering:opacity-0");
    expect(content).toContain("data-exiting:opacity-0");
    // Physical, and correct: `data-side` reports where the layer landed after `flip` — measured
    // geometry, identical under `dir="rtl"`.
    expect(content).toContain("data-side-bottom:data-entering:-translate-y-1");
    expect(content).toContain("data-side-bottom:origin-top");
  });

  it("highlights the row on data-active only — never hover or a bare focus background", () => {
    const item = selectRecipe({}).item();
    // In activedescendant mode no option ever holds DOM focus, so `data-active` is the only signal.
    expect(item).toContain("data-active:bg-active");
    expect(item).toContain("data-active:text-on-active");
    expect(item).not.toContain("hover:");
    expect(item).not.toContain("focus:bg-");
    expect(item).toContain("relative");
    // Logical, so the indicator gutter mirrors with the locale.
    expect(item).toContain("pe-8");
    expect(selectRecipe({}).itemIndicator()).toContain("end-2");
  });

  it("scales the control and the rows together, each size self-contained", () => {
    const sm = selectRecipe({ size: "sm" });
    expect(sm.trigger()).toContain("h-8");
    expect(sm.trigger()).toContain("text-xs");
    expect(sm.item()).toContain("text-xs");
    expect(sm.item()).toContain("py-0.5");

    const lg = selectRecipe({ size: "lg" });
    expect(lg.trigger()).toContain("h-10");
    expect(lg.trigger()).toContain("text-base");
    expect(lg.item()).toContain("text-base");
    expect(lg.item()).toContain("py-1.5");
  });

  it("defaults to the md size when no size is passed", () => {
    const parts = selectRecipe({});
    expect(parts.trigger()).toContain("h-9");
    expect(parts.trigger()).toContain("text-sm");
    expect(parts.item()).toContain("text-sm");
    // Only the md density is applied — no sm/lg endpoints leak in.
    expect(parts.trigger()).not.toContain("h-8");
    expect(parts.trigger()).not.toContain("h-10");
  });

  it("computes no color — no color-mix, alpha modifier, or magic opacity (recipe purity)", () => {
    const cases: SelectRecipeVariants[] = [{}, ...SIZES.map((size) => ({ size }))];
    for (const variants of cases) {
      const parts = selectRecipe(variants);
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
    const merged = selectRecipe({ size: "md" }).item({ class: "rounded-none" });
    expect(merged).toContain("rounded-none");
    expect(merged).not.toContain("rounded-md");
  });
});
