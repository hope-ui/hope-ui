import type {
  ButtonColorScheme,
  ButtonRecipeVariants,
  ButtonSize,
  ButtonVariant,
} from "@hope-ui/theming";
import { assertSlotRecipeConformance } from "@hope-ui/theming/conformance";
import { describe, expect, it } from "vitest";
import { buttonRecipe } from "../button";

const VARIANTS: ButtonVariant[] = ["default", "solid", "soft", "outline", "ghost", "link"];
const COLOR_SCHEMES: ButtonColorScheme[] = [
  "primary",
  "neutral",
  "success",
  "warning",
  "danger",
  "info",
];
const SIZES: ButtonSize[] = ["xs", "sm", "md", "lg", "xl"];
const SLOTS = ["root", "label", "startDecorator", "endDecorator", "loader"] as const;

describe("hope button recipe", () => {
  it("produces a class for every slot across the full variant matrix", () => {
    const cases: ButtonRecipeVariants[] = [
      undefined as unknown as ButtonRecipeVariants,
      ...VARIANTS.flatMap((variant) =>
        COLOR_SCHEMES.map((colorScheme) => ({ variant, colorScheme })),
      ),
      ...SIZES.map((size) => ({ size })),
      { fullWidth: true },
      { loaderPlacement: "center" as const },
      { loaderPlacement: "start" as const },
    ];
    assertSlotRecipeConformance(buttonRecipe, { cases, slots: SLOTS });
  });

  it("wires each colored variant to its semantic token fill (rest → hovered → pressed)", () => {
    expect(buttonRecipe({ variant: "solid", colorScheme: "danger" }).root()).toContain("bg-danger");
    expect(buttonRecipe({ variant: "solid", colorScheme: "danger" }).root()).toContain(
      "text-on-danger",
    );
    // Solid interaction ladder: `-hover` renamed to `-hovered`, and press is now a colorable state.
    const solidPrimary = buttonRecipe({ variant: "solid", colorScheme: "primary" }).root();
    expect(solidPrimary).toContain("hover:bg-primary-hovered");
    expect(solidPrimary).toContain("data-pressed:bg-primary-pressed");
    // Soft label is the role's content color (`-emphasis`, renamed from `on-{role}-soft`); its fill
    // has its own hovered/pressed ladder instead of a computed mix.
    const softSuccess = buttonRecipe({ variant: "soft", colorScheme: "success" }).root();
    expect(softSuccess).toContain("bg-success-soft");
    expect(softSuccess).toContain("text-success-emphasis");
    expect(softSuccess).toContain("hover:bg-success-soft-hovered");
    expect(softSuccess).toContain("data-pressed:bg-success-soft-pressed");
    // Outline border is the dedicated `-line` tint (renamed from `-outline`), with its own wash ladder.
    const outlineWarning = buttonRecipe({ variant: "outline", colorScheme: "warning" }).root();
    expect(outlineWarning).toContain("border-warning-line");
    expect(outlineWarning).toContain("hover:bg-warning-outline-hovered");
    expect(outlineWarning).toContain("data-pressed:bg-warning-outline-pressed");
    // Ghost label is `-emphasis` too; its wash is its own token, not borrowed from soft/outline.
    const ghostInfo = buttonRecipe({ variant: "ghost", colorScheme: "info" }).root();
    expect(ghostInfo).toContain("text-info-emphasis");
    expect(ghostInfo).toContain("hover:bg-info-ghost-hovered");
    expect(ghostInfo).toContain("data-pressed:bg-info-ghost-pressed");
    // Link text walks its own color ladder.
    const linkPrimary = buttonRecipe({ variant: "link", colorScheme: "primary" }).root();
    expect(linkPrimary).toContain("text-primary-emphasis");
    expect(linkPrimary).toContain("hover:text-primary-link-hovered");
    expect(linkPrimary).toContain("data-pressed:text-primary-link-pressed");
  });

  it("gives neutral's outline variant the neutral border-strong (it has no role `-line` token)", () => {
    const outlineNeutral = buttonRecipe({ variant: "outline", colorScheme: "neutral" }).root();
    expect(outlineNeutral).toContain("border-strong");
    expect(outlineNeutral).not.toContain("border-neutral-line");
  });

  it("computes no color — no color-mix, alpha modifier, or magic opacity (recipe purity)", () => {
    // Exercise every colored fill and assert the rendered class string is free of computed color.
    for (const variant of ["solid", "soft", "outline", "ghost", "link"] as const) {
      for (const colorScheme of COLOR_SCHEMES) {
        const root = buttonRecipe({ variant, colorScheme }).root();
        expect(root).not.toContain("color-mix");
        // Alpha modifier on a color utility (`bg-x/50`).
        expect(root).not.toMatch(/\b(?:bg|text|border|ring)-[\w-]+\/\d{1,3}\b/);
        // Magic opacity (`opacity-90`); the token utility `opacity-disabled` is not a match.
        expect(root).not.toMatch(/\bopacity-([1-9]|[1-9]\d)\b/);
      }
    }
    // The disabled dim is the opacity token, not a magic value.
    expect(buttonRecipe({ variant: "solid" }).root()).toContain("data-disabled:opacity-disabled");
    // The focus halo is the finished token, not an alpha modifier over `focus`.
    expect(buttonRecipe({}).root()).toContain("focus-visible:ring-focus-halo");
  });

  it("keeps the default variant color-independent (shadcn neutral chrome, surface-raised ladder)", () => {
    const asPrimary = buttonRecipe({ variant: "default", colorScheme: "primary" }).root();
    const asDanger = buttonRecipe({ variant: "default", colorScheme: "danger" }).root();
    expect(asPrimary).toBe(asDanger);
    expect(asPrimary).toContain("bg-surface-raised");
    expect(asPrimary).toContain("border-subtle");
    expect(asPrimary).toContain("hover:bg-surface-raised-hovered");
    expect(asPrimary).toContain("data-pressed:bg-surface-raised-pressed");
  });

  it("styles the disabled state through the single data-disabled axis (no disabled:/aria-disabled:)", () => {
    const root = buttonRecipe({ variant: "solid", colorScheme: "primary" }).root();
    // The fill-bearing variants swap to the dedicated disabled fill token on `data-disabled`.
    expect(root).toContain("data-disabled:bg-disabled");
    // The outline variant drops its role border to the neutral `border-subtle` tint instead.
    expect(buttonRecipe({ variant: "outline" }).root()).toContain("data-disabled:border-subtle");
    // The old two-variant spelling is gone.
    expect(root).not.toMatch(/(?:^|\s)(?:disabled|aria-disabled):/);
  });

  it("hides the label and centers the loader for the center placement (overlay)", () => {
    const centered = buttonRecipe({
      variant: "solid",
      colorScheme: "primary",
      loaderPlacement: "center",
    });
    expect(centered.label()).toContain("opacity-0");
    expect(centered.loader()).toContain("absolute");
    // Layout only: `center` shows the loader (the component mounts it), never `hidden`.
    expect(centered.loader()).not.toContain("hidden");
  });

  it("orders the loader inline for start/end placement without touching the label", () => {
    const start = buttonRecipe({
      variant: "solid",
      colorScheme: "primary",
      loaderPlacement: "start",
    });
    expect(start.loader()).toContain("order-first");
    expect(start.label()).not.toContain("opacity-0");

    const end = buttonRecipe({ variant: "solid", colorScheme: "primary", loaderPlacement: "end" });
    expect(end.loader()).toContain("order-last");
  });

  it("merges a consumer class through the root slot function", () => {
    // The component relies on this: `recipe(v).root({ class })` lets a consumer utility win.
    const merged = buttonRecipe({ variant: "solid", colorScheme: "primary" }).root({
      class: "rounded-none",
    });
    expect(merged).toContain("rounded-none");
    expect(merged).not.toContain("rounded-md");
  });

  it("lets link override the fixed height and padding", () => {
    const link = buttonRecipe({ variant: "link", colorScheme: "primary", size: "md" }).root();
    expect(link).toContain("h-auto");
    expect(link).not.toContain("h-9");
  });
});
