import type {
  AlertColorScheme,
  AlertRecipeVariants,
  AlertSize,
  AlertVariant,
} from "@hope-ui/theming";
import { assertSlotRecipeConformance } from "@hope-ui/theming/conformance";
import { describe, expect, it } from "vitest";
import { alertRecipe } from "../alert";

const VARIANTS: AlertVariant[] = ["default", "solid", "soft", "subtle", "outline"];
const COLOR_SCHEMES: AlertColorScheme[] = [
  "primary",
  "neutral",
  "success",
  "info",
  "warning",
  "danger",
];
const SIZES: AlertSize[] = ["sm", "md", "lg"];
const SLOTS = ["root", "icon", "content", "title", "description", "actions", "close"] as const;

describe("hope alert recipe", () => {
  it("produces a class for every slot across the full variant matrix", () => {
    const cases: AlertRecipeVariants[] = [
      undefined as unknown as AlertRecipeVariants,
      ...VARIANTS.flatMap((variant) =>
        COLOR_SCHEMES.map((colorScheme) => ({ variant, colorScheme })),
      ),
      ...SIZES.map((size) => ({ size })),
    ];
    assertSlotRecipeConformance(alertRecipe, { cases, slots: SLOTS });
  });

  it("wires solid to the role fill + on-color text on root", () => {
    const solid = alertRecipe({ variant: "solid", colorScheme: "danger" }).root();
    expect(solid).toContain("bg-danger");
    expect(solid).toContain("text-on-danger");
  });

  it("wires soft to the tonal fill + role content color on root", () => {
    const soft = alertRecipe({ variant: "soft", colorScheme: "primary" }).root();
    expect(soft).toContain("bg-primary-soft");
    expect(soft).toContain("text-primary-emphasis");
    // soft has no border tint — that is the `subtle` variant.
    expect(soft).not.toContain("border-primary-subtle-line");
  });

  it("wires subtle to soft plus the soft role border", () => {
    const subtle = alertRecipe({ variant: "subtle", colorScheme: "info" }).root();
    expect(subtle).toContain("bg-info-soft");
    expect(subtle).toContain("text-info-emphasis");
    expect(subtle).toContain("border-info-subtle-line");
  });

  it("wires outline to a transparent fill + role content color + the soft role border", () => {
    const outline = alertRecipe({ variant: "outline", colorScheme: "warning" }).root();
    expect(outline).toContain("bg-transparent");
    expect(outline).toContain("text-warning-emphasis");
    expect(outline).toContain("border-warning-subtle-line");
  });

  it("colors only the icon + title per role for the default variant, leaving root a raised surface", () => {
    const parts = alertRecipe({ variant: "default", colorScheme: "danger" });
    // root is the role-neutral raised chrome, with no role fill.
    const root = parts.root();
    expect(root).toContain("bg-surface-raised");
    expect(root).toContain("border-subtle");
    expect(root).toContain("text-foreground");
    expect(root).not.toContain("bg-danger");
    expect(root).not.toContain("text-danger-emphasis");
    // the role color rides the icon + title slots.
    expect(parts.icon()).toContain("text-danger-emphasis");
    expect(parts.title()).toContain("text-danger-emphasis");
    // the description inherits the body color (no role class of its own), so text stays foreground.
    expect(parts.description()).not.toContain("text-danger-emphasis");
  });

  it("keeps the default variant shadow-free (unlike Button's default)", () => {
    const root = alertRecipe({ variant: "default", colorScheme: "neutral" }).root();
    expect(root).not.toContain("shadow");
  });

  it("carries the exit-transition chrome keyed on data-state", () => {
    const root = alertRecipe({}).root();
    expect(root).toContain("transition-[opacity,transform]");
    expect(root).toContain("motion-reduce:transition-none");
    expect(root).toContain("data-[state=exiting]:opacity-0");
  });

  it("reserves a transparent border on the root so bordered variants never shift a pixel", () => {
    const solid = alertRecipe({ variant: "solid", colorScheme: "primary" }).root();
    expect(solid).toContain("border");
    expect(solid).toContain("border-transparent");
    expect(solid).toContain("bg-clip-padding");
  });

  it("scales the box + glyph per size", () => {
    expect(alertRecipe({ size: "sm" }).root()).toContain("p-3");
    expect(alertRecipe({ size: "sm" }).icon()).toContain("[&_svg]:size-4");
    expect(alertRecipe({ size: "md" }).root()).toContain("p-4");
    expect(alertRecipe({ size: "md" }).icon()).toContain("[&_svg]:size-5");
    expect(alertRecipe({ size: "lg" }).root()).toContain("p-5");
    expect(alertRecipe({ size: "lg" }).icon()).toContain("[&_svg]:size-6");
  });

  it("is static — no hover / pressed / focus interaction classes on any variant", () => {
    for (const variant of VARIANTS) {
      const root = alertRecipe({ variant, colorScheme: "primary" }).root();
      expect(root).not.toMatch(/(?:^|\s)hover:/);
      expect(root).not.toContain("data-pressed");
      expect(root).not.toContain("focus-visible:");
    }
  });

  it("computes no color — no color-mix, alpha modifier, or magic opacity (recipe purity)", () => {
    for (const variant of VARIANTS) {
      for (const colorScheme of COLOR_SCHEMES) {
        const parts = alertRecipe({ variant, colorScheme });
        for (const slot of SLOTS) {
          const cls = parts[slot]();
          expect(cls).not.toContain("color-mix");
          // Alpha modifier on a color utility (`bg-x/50`).
          expect(cls).not.toMatch(/\b(?:bg|text|border|ring)-[\w-]+\/\d{1,3}\b/);
          // Magic opacity (`opacity-90`); `opacity-0` (full transparent) is legitimate layout.
          expect(cls).not.toMatch(/\bopacity-([1-9]|[1-9]\d)\b/);
        }
      }
    }
  });

  it("defaults to default / neutral / md", () => {
    const parts = alertRecipe({});
    expect(parts.root()).toContain("bg-surface-raised");
    expect(parts.root()).toContain("p-4"); // md
    // neutral default variant colors the icon/title neutral-emphasis.
    expect(parts.icon()).toContain("text-neutral-emphasis");
  });

  it("merges a consumer class through the root slot function", () => {
    const merged = alertRecipe({ variant: "soft", colorScheme: "primary" }).root({
      class: "rounded-none",
    });
    expect(merged).toContain("rounded-none");
    expect(merged).not.toContain("rounded-lg");
  });
});
