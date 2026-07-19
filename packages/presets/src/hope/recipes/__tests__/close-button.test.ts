import type { CloseButtonRecipeVariants, CloseButtonSize } from "@hope-ui/theming";
import { assertSlotRecipeConformance } from "@hope-ui/theming/conformance";
import { describe, expect, it } from "vitest";
import { closeButtonRecipe } from "../close-button";

const SIZES: CloseButtonSize[] = ["sm", "md", "lg"];
const SLOTS = ["root", "icon"] as const;

describe("hope closeButton recipe", () => {
  it("produces a class for every slot across the size axis", () => {
    const cases: CloseButtonRecipeVariants[] = [
      undefined as unknown as CloseButtonRecipeVariants,
      ...SIZES.map((size) => ({ size })),
    ];
    assertSlotRecipeConformance(closeButtonRecipe, { cases, slots: SLOTS });
  });

  it("defaults to sm", () => {
    // The sm box + glyph metrics are what an unspecified close button paints.
    expect(closeButtonRecipe({}).root()).toContain("size-6");
    expect(closeButtonRecipe({}).icon()).toContain("[&_svg]:size-4");
  });

  it("scales the box (root) and the glyph (icon slot) together per size", () => {
    const metrics: Record<CloseButtonSize, { root: string; icon: string }> = {
      sm: { root: "size-6", icon: "[&_svg]:size-4" },
      md: { root: "size-7", icon: "[&_svg]:size-4.5" },
      lg: { root: "size-8", icon: "[&_svg]:size-5" },
    };
    for (const size of SIZES) {
      expect(closeButtonRecipe({ size }).root()).toContain(metrics[size].root);
      expect(closeButtonRecipe({ size }).icon()).toContain(metrics[size].icon);
    }
  });

  it("asserts no color of its own — the glyph inherits currentColor (no text-color class)", () => {
    for (const size of SIZES) {
      const root = closeButtonRecipe({ size }).root();
      const icon = closeButtonRecipe({ size }).icon();
      // No role/foreground text color anywhere; the SVG's `stroke="currentColor"` is what paints it.
      expect(root).not.toMatch(/\btext-[\w-]+\b/);
      expect(icon).not.toMatch(/\btext-[\w-]+\b/);
    }
  });

  it("derives the hover/press wash from the surface-adaptive tokens and focuses via the shared focus-halo", () => {
    const root = closeButtonRecipe({}).root();
    expect(root).toContain("hover:not-data-pressed:bg-surface-adaptive-hovered");
    expect(root).toContain("data-pressed:bg-surface-adaptive-pressed");
    // Focus is the shared halo ring, the same indicator every other focusable control uses.
    expect(root).toContain("focus-visible:ring-focus-halo");
  });

  it("dims a disabled close button via the opacity axis, with no color swap", () => {
    const root = closeButtonRecipe({}).root();
    expect(root).toContain("data-disabled:opacity-disabled");
    expect(root).toContain("data-disabled:pointer-events-none");
  });

  it("computes no color — no color-mix, alpha modifier, or magic opacity (recipe purity)", () => {
    for (const size of SIZES) {
      const parts = closeButtonRecipe({ size });
      for (const slot of SLOTS) {
        const cls = parts[slot]();
        expect(cls).not.toContain("color-mix");
        // Alpha modifier on a color utility (`bg-x/50`).
        expect(cls).not.toMatch(/\b(?:bg|text|border|ring)-[\w-]+\/\d{1,3}\b/);
        // Magic opacity (`opacity-90`); the token utility `opacity-disabled` is not a match.
        expect(cls).not.toMatch(/\bopacity-([1-9]|[1-9]\d)\b/);
      }
    }
  });

  it("merges a consumer class through the root slot function", () => {
    // The component relies on this: `recipe(v).root({ class })` lets a consumer utility win.
    const merged = closeButtonRecipe({ size: "sm" }).root({ class: "rounded-none" });
    expect(merged).toContain("rounded-none");
    expect(merged).not.toContain("rounded-md");
  });
});
