import type {
  BadgeColorScheme,
  BadgeRecipeVariants,
  BadgeShape,
  BadgeSize,
  BadgeVariant,
} from "@hope-ui/theming";
import { assertSlotRecipeConformance } from "@hope-ui/theming/conformance";
import { describe, expect, it } from "vitest";
import { badgeRecipe } from "../badge";

const VARIANTS: BadgeVariant[] = ["solid", "inverted", "soft", "subtle", "outline", "dot"];
const COLOR_SCHEMES: BadgeColorScheme[] = [
  "primary",
  "neutral",
  "success",
  "info",
  "warning",
  "danger",
];
const SIZES: BadgeSize[] = ["xs", "sm", "md", "lg"];
const SHAPES: BadgeShape[] = ["sharp", "rounded", "pill", "circle"];
const SLOTS = ["root", "label", "startDecorator", "endDecorator", "dot"] as const;

describe("hope badge recipe", () => {
  it("produces a class for every slot across the full variant matrix", () => {
    const cases: BadgeRecipeVariants[] = [
      undefined as unknown as BadgeRecipeVariants,
      ...VARIANTS.flatMap((variant) =>
        COLOR_SCHEMES.map((colorScheme) => ({ variant, colorScheme })),
      ),
      ...SIZES.map((size) => ({ size })),
      ...SHAPES.map((shape) => ({ shape })),
      { fullWidth: true },
    ];
    assertSlotRecipeConformance(badgeRecipe, { cases, slots: SLOTS });
  });

  it("wires solid to the role fill + on-color text + a fill-matched border", () => {
    const solid = badgeRecipe({ variant: "solid", colorScheme: "danger" }).root();
    expect(solid).toContain("bg-danger");
    expect(solid).toContain("text-on-danger");
    // The reserved border matches the fill, so the chip has no transparent gap to the page bg.
    expect(solid).toContain("border-danger");
  });

  it("wires inverted to its own dedicated swap tokens (never borrowing solid's on-{role}/{role})", () => {
    const inverted = badgeRecipe({ variant: "inverted", colorScheme: "primary" }).root();
    expect(inverted).toContain("bg-primary-inverted");
    expect(inverted).toContain("text-on-primary-inverted");
    // Its reserved border matches the inverted fill on its own `-inverted` family.
    expect(inverted).toContain("border-primary-inverted");
    // It no longer reuses solid's tokens as the swap — it paints its own `-inverted` family.
    expect(inverted).not.toContain("bg-on-primary");
    expect(inverted).not.toContain("text-primary ");
  });

  it("wires soft to the tonal fill + role content color + a fill-matched border", () => {
    const soft = badgeRecipe({ variant: "soft", colorScheme: "primary" }).root();
    expect(soft).toContain("bg-primary-soft");
    expect(soft).toContain("text-primary-emphasis");
    // soft's border matches its own fill (`-soft`), not the darker `-subtle-line` the subtle variant uses.
    expect(soft).toContain("border-primary-soft");
    expect(soft).not.toContain("border-primary-subtle-line");
  });

  it("wires subtle to soft plus the soft role border", () => {
    const subtle = badgeRecipe({ variant: "subtle", colorScheme: "danger" }).root();
    expect(subtle).toContain("bg-danger-soft");
    expect(subtle).toContain("text-danger-emphasis");
    expect(subtle).toContain("border-danger-subtle-line");
  });

  it("wires outline to a transparent fill + role content color + the soft role border", () => {
    const outline = badgeRecipe({ variant: "outline", colorScheme: "warning" }).root();
    expect(outline).toContain("bg-transparent");
    expect(outline).toContain("text-warning-emphasis");
    expect(outline).toContain("border-warning-subtle-line");
  });

  it("gives dot neutral chrome on root and the role color on the dot slot", () => {
    const dot = badgeRecipe({ variant: "dot", colorScheme: "success" });
    const root = dot.root();
    expect(root).toContain("bg-surface-raised");
    expect(root).toContain("text-foreground");
    expect(root).toContain("border-neutral-subtle-line");
    // The role color rides the dot slot, never the root.
    expect(dot.dot()).toContain("bg-success");
    expect(root).not.toContain("bg-success");
  });

  it("reserves a fill-matched 1px border on every variant so none shifts a pixel (no transparent gap)", () => {
    // The reserved border is now a real, fill-matched color — never a transparent gap to the page bg,
    // so `bg-clip-padding` is gone too.
    const solid = badgeRecipe({ variant: "solid", colorScheme: "primary" }).root();
    expect(solid).toMatch(/(?:^|\s)border(?:\s|$)/); // the 1px width utility from the base
    expect(solid).toContain("border-primary");
    expect(solid).not.toContain("border-transparent");
    expect(solid).not.toContain("bg-clip-padding");
    // Every variant carries a 1px border width, so bordered and unbordered ones align to the pixel.
    for (const variant of VARIANTS) {
      expect(badgeRecipe({ variant, colorScheme: "primary" }).root()).toMatch(
        /(?:^|\s)border(?:\s|$)/,
      );
    }
  });

  it("owns the radius through `shape`, with circle squaring the aspect and dropping padding", () => {
    expect(badgeRecipe({ shape: "sharp" }).root()).toContain("rounded-none");
    expect(badgeRecipe({ shape: "rounded" }).root()).toContain("rounded-md");
    expect(badgeRecipe({ shape: "pill" }).root()).toContain("rounded-full");
    const circle = badgeRecipe({ shape: "circle", size: "md" }).root();
    expect(circle).toContain("rounded-full");
    expect(circle).toContain("aspect-square");
    // shape wins the padding merge over size (declared after it): circle drops the size px.
    expect(circle).toContain("px-0");
    expect(circle).not.toContain("px-2.5");
  });

  it("tightens the decorator-side padding optically per size (matching Button), only when a decorator is mounted", () => {
    // Each size drops the decorator side one 2px step below its symmetric text-edge `px`, gated on the
    // decorator part being present (`has-data-[slot=badge-{start,end}-decorator]:`).
    const steps = {
      xs: "1",
      sm: "1.5",
      md: "2",
      lg: "2.5",
    } as const;
    for (const [size, step] of Object.entries(steps) as [BadgeSize, string][]) {
      const root = badgeRecipe({ size }).root();
      expect(root).toContain(`has-data-[slot=badge-start-decorator]:ps-${step}`);
      expect(root).toContain(`has-data-[slot=badge-end-decorator]:pe-${step}`);
      // The gate is `has-data-`, so a decorator-less badge never pays the tighter padding.
      expect(root).not.toMatch(/(?:^|\s)ps-\d/);
      expect(root).not.toMatch(/(?:^|\s)pe-\d/);
    }
  });

  it("stretches to full width when asked", () => {
    expect(badgeRecipe({ fullWidth: true }).root()).toContain("w-full");
    expect(badgeRecipe({ fullWidth: false }).root()).not.toContain("w-full");
  });

  it("is static — no hover / pressed / focus interaction classes on any variant", () => {
    for (const variant of VARIANTS) {
      const root = badgeRecipe({ variant, colorScheme: "primary" }).root();
      expect(root).not.toMatch(/(?:^|\s)hover:/);
      expect(root).not.toContain("data-pressed");
      expect(root).not.toContain("focus-visible:");
      expect(root).not.toContain("transition");
    }
  });

  it("computes no color — no color-mix, alpha modifier, or magic opacity (recipe purity)", () => {
    for (const variant of VARIANTS) {
      for (const colorScheme of COLOR_SCHEMES) {
        const parts = badgeRecipe({ variant, colorScheme });
        for (const slot of SLOTS) {
          const cls = parts[slot]();
          expect(cls).not.toContain("color-mix");
          // Alpha modifier on a color utility (`bg-x/50`).
          expect(cls).not.toMatch(/\b(?:bg|text|border|ring)-[\w-]+\/\d{1,3}\b/);
          // Magic opacity (`opacity-90`); the token utility `opacity-disabled` is not a match.
          expect(cls).not.toMatch(/\bopacity-([1-9]|[1-9]\d)\b/);
        }
      }
    }
  });

  it("defaults to soft / primary / sm / rounded", () => {
    const root = badgeRecipe({}).root();
    expect(root).toContain("bg-primary-soft");
    expect(root).toContain("text-primary-emphasis");
    expect(root).toContain("rounded-md");
  });

  it("merges a consumer class through the root slot function", () => {
    // The component relies on this: `recipe(v).root({ class })` lets a consumer utility win.
    const merged = badgeRecipe({ variant: "soft", colorScheme: "primary", shape: "rounded" }).root({
      class: "rounded-none",
    });
    expect(merged).toContain("rounded-none");
    expect(merged).not.toContain("rounded-md");
  });
});
