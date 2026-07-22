import type { ListboxRecipeVariants, ListboxSize } from "@hope-ui/theming";
import { assertSlotRecipeConformance } from "@hope-ui/theming/conformance";
import { describe, expect, it } from "vitest";
import { listboxRecipe } from "../listbox";

const SIZES: ListboxSize[] = ["sm", "md", "lg"];
const SLOTS = ["root", "item", "itemIndicator", "group", "groupLabel", "separator"] as const;

describe("hope listbox recipe", () => {
  it("produces a class for every slot across the full variant matrix", () => {
    const cases: ListboxRecipeVariants[] = [
      undefined as unknown as ListboxRecipeVariants,
      ...SIZES.map((size) => ({ size })),
    ];
    assertSlotRecipeConformance(listboxRecipe, { cases, slots: SLOTS });
  });

  it("renders a plain in-flow list with no popup chrome by default (standalone-first)", () => {
    const root = listboxRecipe({}).root();
    // Structural only: legible content color, a scroll container, and no container focus ring.
    expect(root).toContain("text-foreground");
    expect(root).toContain("overflow-y-auto");
    expect(root).toContain("outline-none");
    // Deliberately NOT an elevated/floating panel — that chrome belongs to a Select popover or a
    // consumer override, not the standalone default.
    expect(root).not.toContain("bg-surface-overlay");
    expect(root).not.toContain("border");
    expect(root).not.toContain("shadow");
    expect(root).not.toContain("rounded");
    // No panel padding — rows sit flush; grouped and ungrouped rows align.
    expect(root).not.toMatch(/\bp-\d/);
  });

  it("highlights the row on data-active only — never hover or a bare focus background", () => {
    const item = listboxRecipe({}).item();
    // The transient highlight is the shared active state (keyboard + pointer write one index), so it
    // is styled by the registered data-active: variant alone.
    expect(item).toContain("data-active:bg-active");
    expect(item).toContain("data-active:text-on-active");
    // A hover:/bare-focus background would let the cursor paint a second highlight — deliberately absent.
    expect(item).not.toContain("hover:");
    expect(item).not.toContain("focus:bg-");
    // `relative` anchors the absolute indicator; the row is non-selectable text.
    expect(item).toContain("relative");
    expect(item).toContain("select-none");
    expect(item).toContain("pr-8");
  });

  it("dims and de-activates a disabled row through the opacity-disabled token", () => {
    const item = listboxRecipe({}).item();
    expect(item).toContain("data-disabled:pointer-events-none");
    expect(item).toContain("data-disabled:opacity-disabled");
  });

  it("pins the item indicator in the trailing gutter", () => {
    const indicator = listboxRecipe({}).itemIndicator();
    expect(indicator).toContain("absolute");
    expect(indicator).toContain("right-2");
    expect(indicator).toContain("[&_svg]:size-4");
  });

  it("mutes the group label and divides sections with the subtle hairline", () => {
    const groupLabel = listboxRecipe({}).groupLabel();
    expect(groupLabel).toContain("text-foreground-muted");
    expect(groupLabel).toContain("text-xs");

    const separator = listboxRecipe({}).separator();
    expect(separator).toContain("bg-subtle");
    expect(separator).toContain("h-px");
    expect(separator).toContain("pointer-events-none");
  });

  it("scales row density and panel min width per size, each size self-contained", () => {
    // sm: tighter row + narrower panel.
    const sm = listboxRecipe({ size: "sm" });
    expect(sm.item()).toContain("text-xs");
    expect(sm.item()).toContain("py-0.5");
    expect(sm.item()).toContain("gap-1");
    expect(sm.root()).toContain("min-w-32");

    // lg: roomier row + wider panel.
    const lg = listboxRecipe({ size: "lg" });
    expect(lg.item()).toContain("text-base");
    expect(lg.item()).toContain("py-1.5");
    expect(lg.item()).toContain("gap-2");
    expect(lg.root()).toContain("min-w-40");
  });

  it("defaults to the md size when no size is passed", () => {
    const parts = listboxRecipe({});
    expect(parts.item()).toContain("text-sm"); // md
    expect(parts.item()).toContain("py-1"); // md
    expect(parts.item()).toContain("gap-1.5"); // md
    expect(parts.root()).toContain("min-w-36"); // md
    // Only the md density is applied — no sm/lg endpoints leak in.
    expect(parts.item()).not.toContain("text-xs");
    expect(parts.item()).not.toContain("text-base");
  });

  it("computes no color — no color-mix, alpha modifier, or magic opacity (recipe purity)", () => {
    const cases: ListboxRecipeVariants[] = [{}, ...SIZES.map((size) => ({ size }))];
    for (const variants of cases) {
      const parts = listboxRecipe(variants);
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
    const merged = listboxRecipe({ size: "md" }).item({ class: "rounded-none" });
    expect(merged).toContain("rounded-none");
    expect(merged).not.toContain("rounded-md");
  });
});
