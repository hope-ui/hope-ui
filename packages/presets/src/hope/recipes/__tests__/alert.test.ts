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
const SLOTS = [
  "root",
  "icon",
  "content",
  "title",
  "description",
  "actions",
  "closeTrigger",
] as const;

// `description` is intentionally unstyled by default (it inherits the root's content color and body
// metrics), so it's checked for presence via `unstyledSlots` rather than the non-empty `slots` set.
const STYLED_SLOTS = SLOTS.filter((slot) => slot !== "description");
const UNSTYLED_SLOTS = ["description"] as const;

describe("hope alert recipe", () => {
  it("produces a class for every styled slot (description stays a present, unstyled slot)", () => {
    const cases: AlertRecipeVariants[] = [
      undefined as unknown as AlertRecipeVariants,
      ...VARIANTS.flatMap((variant) =>
        COLOR_SCHEMES.map((colorScheme) => ({ variant, colorScheme })),
      ),
      ...SIZES.map((size) => ({ size })),
    ];
    assertSlotRecipeConformance(alertRecipe, {
      cases,
      slots: STYLED_SLOTS,
      unstyledSlots: UNSTYLED_SLOTS,
    });
  });

  it("wires solid to the role fill + on-color text + a fill-matched border on root", () => {
    const solid = alertRecipe({ variant: "solid", colorScheme: "danger" }).root();
    expect(solid).toContain("bg-danger");
    expect(solid).toContain("text-on-danger");
    // solid's reserved border is the role color itself, so the fill reaches the outer edge cleanly.
    expect(solid).toContain("border-danger");
  });

  it("wires soft to the tonal fill + role content color + a fill-matched border on root", () => {
    const soft = alertRecipe({ variant: "soft", colorScheme: "primary" }).root();
    expect(soft).toContain("bg-primary-soft");
    expect(soft).toContain("text-primary-emphasis");
    // soft's reserved border matches its own fill (closing the page-bg gap), not the darker
    // `-subtle-line` edge the `subtle` variant uses.
    expect(soft).toContain("border-primary-soft");
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
    // the description is an intentionally-unstyled slot — it carries no class of its own (it inherits
    // the root's content color), so it never picks up the role color.
    expect(parts.description() ?? "").toBe("");
  });

  it("keeps the default variant shadow-free (unlike Button's default)", () => {
    const root = alertRecipe({ variant: "default", colorScheme: "neutral" }).root();
    expect(root).not.toContain("shadow");
  });

  it("carries the exit-transition chrome keyed on data-presence", () => {
    const root = alertRecipe({}).root();
    expect(root).toContain("transition-[opacity,translate]");
    expect(root).toContain("motion-reduce:transition-none");
    expect(root).toContain("data-exiting:opacity-0");
  });

  it("reserves a fill-matched 1px border on every variant so none shifts a pixel (no transparent gap)", () => {
    // The reserved border is now a real, fill-matched color — never a transparent gap to the page bg,
    // so `bg-clip-padding` is gone too.
    const solid = alertRecipe({ variant: "solid", colorScheme: "primary" }).root();
    expect(solid).toMatch(/(?:^|\s)border(?:\s|$)/); // the 1px width utility from the base
    expect(solid).toContain("border-primary");
    expect(solid).not.toContain("border-transparent");
    expect(solid).not.toContain("bg-clip-padding");
    // Every variant carries a 1px border width, so bordered and unbordered ones align to the pixel.
    for (const variant of VARIANTS) {
      expect(alertRecipe({ variant, colorScheme: "primary" }).root()).toMatch(
        /(?:^|\s)border(?:\s|$)/,
      );
    }
  });

  it("scales the box + glyph per size", () => {
    // Word-boundary matches so a `gap-N` never accidentally satisfies the `p-N` padding assertion.
    expect(alertRecipe({ size: "sm" }).root()).toMatch(/(?:^|\s)p-2(?:\s|$)/);
    expect(alertRecipe({ size: "sm" }).icon()).toContain("[&_svg]:size-4");
    expect(alertRecipe({ size: "md" }).root()).toMatch(/(?:^|\s)p-3(?:\s|$)/);
    expect(alertRecipe({ size: "md" }).icon()).toContain("[&_svg]:size-5");
    expect(alertRecipe({ size: "lg" }).root()).toMatch(/(?:^|\s)p-4(?:\s|$)/);
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
          // `description` is an unstyled slot: an empty tv base resolves to `undefined`, so coerce.
          const cls = parts[slot]() ?? "";
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
    expect(parts.root()).toMatch(/(?:^|\s)p-3(?:\s|$)/); // md
    // neutral default variant colors the icon/title neutral-emphasis.
    expect(parts.icon()).toContain("text-neutral-emphasis");
  });

  it("keeps description a present but unstyled slot (declared, no default class)", () => {
    // The slot is declared across variants — so the component can safely call `ctx.slots.description()`
    // and consumers can target it via `slotClasses.description` — but it carries no default classes.
    // An empty tailwind-variants slot base resolves to `undefined`, which is the "no class" result.
    for (const variant of VARIANTS) {
      const parts = alertRecipe({ variant, colorScheme: "primary" });
      expect(typeof parts.description).toBe("function");
      expect(parts.description() ?? "").toBe("");
    }
  });

  it("merges a consumer class through the root slot function", () => {
    const merged = alertRecipe({ variant: "soft", colorScheme: "primary" }).root({
      class: "rounded-none",
    });
    expect(merged).toContain("rounded-none");
    expect(merged).not.toContain("rounded-lg");
  });
});
