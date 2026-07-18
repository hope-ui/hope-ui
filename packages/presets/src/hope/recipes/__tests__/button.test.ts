import type {
  ButtonColorScheme,
  ButtonRecipeVariants,
  ButtonSize,
  ButtonVariant,
} from "@hope-ui/theming";
import { assertSlotRecipeConformance } from "@hope-ui/theming/conformance";
import { describe, expect, it } from "vitest";
import { buttonRecipe } from "../button";

const VARIANTS: ButtonVariant[] = [
  "default",
  "solid",
  "inverted",
  "soft",
  "outline",
  "ghost",
  "link",
];
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
      ...SIZES.map((size) => ({ iconOnly: true, size })),
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
    // Solid interaction ladder: the hover wash is guarded against the pressed state
    // (`hover:not-data-pressed:`) so it never fights the press color; press is its own token.
    const solidPrimary = buttonRecipe({ variant: "solid", colorScheme: "primary" }).root();
    expect(solidPrimary).toContain("hover:not-data-pressed:bg-primary-hovered");
    expect(solidPrimary).toContain("data-pressed:bg-primary-pressed");
    // Inverted is the swap of solid on its own dedicated tokens (fill `{role}-inverted`, content
    // `on-{role}-inverted`), never borrowing solid's `on-{role}`/`{role}`; it carries its own wash.
    const invertedPrimary = buttonRecipe({ variant: "inverted", colorScheme: "primary" }).root();
    expect(invertedPrimary).toContain("bg-primary-inverted");
    expect(invertedPrimary).toContain("text-on-primary-inverted");
    expect(invertedPrimary).toContain("hover:not-data-pressed:bg-primary-inverted-hovered");
    expect(invertedPrimary).toContain("data-pressed:bg-primary-inverted-pressed");
    expect(invertedPrimary).not.toContain("bg-on-primary");
    expect(invertedPrimary).not.toContain("text-primary ");
    // Soft label is the role's content color (`-emphasis`, renamed from `on-{role}-soft`); its fill
    // has its own (pressed-guarded) hovered ladder + pressed token instead of a computed mix.
    const softSuccess = buttonRecipe({ variant: "soft", colorScheme: "success" }).root();
    expect(softSuccess).toContain("bg-success-soft");
    expect(softSuccess).toContain("text-success-emphasis");
    expect(softSuccess).toContain("hover:not-data-pressed:bg-success-soft-hovered");
    expect(softSuccess).toContain("data-pressed:bg-success-soft-pressed");
    // Outline border is the soft `-subtle-line` tint (the softer of the two role-border tiers), with
    // its own wash ladder.
    const outlineWarning = buttonRecipe({ variant: "outline", colorScheme: "warning" }).root();
    expect(outlineWarning).toContain("border-warning-subtle-line");
    expect(outlineWarning).toContain("hover:not-data-pressed:bg-warning-outline-hovered");
    expect(outlineWarning).toContain("data-pressed:bg-warning-outline-pressed");
    // Ghost label is `-emphasis` too; its wash is its own token, not borrowed from soft/outline.
    const ghostInfo = buttonRecipe({ variant: "ghost", colorScheme: "info" }).root();
    expect(ghostInfo).toContain("text-info-emphasis");
    expect(ghostInfo).toContain("hover:not-data-pressed:bg-info-ghost-hovered");
    expect(ghostInfo).toContain("data-pressed:bg-info-ghost-pressed");
    // Link text walks its own color ladder.
    const linkPrimary = buttonRecipe({ variant: "link", colorScheme: "primary" }).root();
    expect(linkPrimary).toContain("text-primary-emphasis");
    expect(linkPrimary).toContain("hover:not-data-pressed:text-primary-link-hovered");
    expect(linkPrimary).toContain("data-pressed:text-primary-link-pressed");
  });

  it("gives neutral's outline variant the soft neutral-subtle-line border (its own role tier, not border-strong)", () => {
    const outlineNeutral = buttonRecipe({ variant: "outline", colorScheme: "neutral" }).root();
    expect(outlineNeutral).toContain("border-neutral-subtle-line");
    expect(outlineNeutral).not.toContain("border-strong");
  });

  it("computes no color — no color-mix, alpha modifier, or magic opacity (recipe purity)", () => {
    // Exercise every colored fill and assert the rendered class string is free of computed color.
    for (const variant of ["solid", "inverted", "soft", "outline", "ghost", "link"] as const) {
      for (const colorScheme of COLOR_SCHEMES) {
        const root = buttonRecipe({ variant, colorScheme }).root();
        expect(root).not.toContain("color-mix");
        // Alpha modifier on a color utility (`bg-x/50`).
        expect(root).not.toMatch(/\b(?:bg|text|border|ring)-[\w-]+\/\d{1,3}\b/);
        // Magic opacity (`opacity-90`); the token utility `opacity-disabled` is not a match.
        expect(root).not.toMatch(/\bopacity-([1-9]|[1-9]\d)\b/);
      }
    }
    // Both dims are opacity tokens, not magic values.
    expect(buttonRecipe({ variant: "solid" }).root()).toContain("data-disabled:opacity-disabled");
    expect(buttonRecipe({ variant: "solid" }).root()).toContain("aria-busy:opacity-loading");
    // The focus halo is the finished token, not an alpha modifier over `focus`.
    expect(buttonRecipe({}).root()).toContain("focus-visible:ring-focus-halo");
  });

  it("keeps the default variant color-independent (shadcn neutral chrome, surface-raised ladder)", () => {
    const asPrimary = buttonRecipe({ variant: "default", colorScheme: "primary" }).root();
    const asDanger = buttonRecipe({ variant: "default", colorScheme: "danger" }).root();
    expect(asPrimary).toBe(asDanger);
    expect(asPrimary).toContain("bg-surface-raised");
    expect(asPrimary).toContain("border-subtle");
    // `default` guards its hover against the pressed state too — consistent with the colored variants.
    expect(asPrimary).toContain("hover:not-data-pressed:bg-surface-raised-hovered");
    expect(asPrimary).toContain("data-pressed:bg-surface-raised-pressed");
  });

  it("dims the disabled state via opacity only — no color swap, single data-disabled axis", () => {
    const root = buttonRecipe({ variant: "solid", colorScheme: "primary" }).root();
    // Disabled neutralises chrome (cursor/pointer/shadow) and dims to the opacity token — it no
    // longer swaps the fill/text/border to dedicated disabled colors.
    expect(root).toContain("data-disabled:opacity-disabled");
    expect(root).toContain("data-disabled:cursor-not-allowed");
    expect(root).toContain("data-disabled:pointer-events-none");
    expect(root).toContain("data-disabled:shadow-none");
    // The old color-swap treatment is gone: no fill token, no muted-text token, and the outline
    // variant no longer drops its role border to `border-subtle`.
    expect(root).not.toContain("data-disabled:bg-disabled");
    expect(root).not.toContain("data-disabled:text-foreground-disabled");
    expect(buttonRecipe({ variant: "outline" }).root()).not.toContain(
      "data-disabled:border-subtle",
    );
    // Still one axis: `data-disabled`, never a `disabled:`/`aria-disabled:` pair.
    expect(root).not.toMatch(/(?:^|\s)(?:disabled|aria-disabled):/);
  });

  it("dims the loading state via aria-busy — mirrors disabled but with the loading opacity token", () => {
    const root = buttonRecipe({ variant: "solid", colorScheme: "primary" }).root();
    // Neutralised chrome like the disabled axis (no pointer events, no shadow), but a `cursor-progress`
    // cue rather than disabled's `cursor-not-allowed` — the action is pending, not unavailable.
    expect(root).toContain("aria-busy:cursor-progress");
    expect(root).not.toContain("aria-busy:cursor-not-allowed");
    expect(root).toContain("aria-busy:pointer-events-none");
    expect(root).toContain("aria-busy:shadow-none");
    // ...but via its own opacity token (`opacity-loading`, a separate preset knob), never the
    // disabled token — so the two dims stay independently tunable.
    expect(root).toContain("aria-busy:opacity-loading");
    expect(root).not.toContain("aria-busy:opacity-disabled");
  });

  it("guards every variant's hover wash against the pressed state (no plain hover: color)", () => {
    for (const variant of VARIANTS) {
      const root = buttonRecipe({ variant, colorScheme: "primary" }).root();
      // The colored hover always carries the `not-data-pressed` guard, so the press color wins.
      expect(root).toMatch(/(?:^|\s)hover:not-data-pressed:(?:bg|text)-/);
      // No plain `hover:bg-*`/`hover:text-*` color wash survives (link's `hover:underline` is layout).
      expect(root).not.toMatch(/(?:^|\s)hover:(?:bg|text)-/);
    }
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

  it("renders a square, icon-only button with no horizontal padding and a per-size icon", () => {
    const md = buttonRecipe({ iconOnly: true, size: "md" });
    // Square: `aspect-square` + the size's `h-*` locks the width to the height.
    expect(md.root()).toContain("aspect-square");
    // No `px-*` ever competes on an icon-only button — the padding compounds skip it entirely.
    expect(md.root()).not.toMatch(/(?:^|\s)px-[\d.]/);
    // The icon sits in the `label` slot (as `children`); the recipe sizes it per button size.
    expect(md.label()).toContain("[&_svg]:size-5");
    expect(buttonRecipe({ iconOnly: true, size: "xs" }).label()).toContain("[&_svg]:size-4");
    expect(buttonRecipe({ iconOnly: true, size: "xl" }).label()).toContain("[&_svg]:size-6");
  });

  it("keeps normal buttons padded (from the compound) and square-free; link keeps its own px-0.5", () => {
    // Padding moved off the `size` base into a (size × iconOnly:false) compound — still present.
    const md = buttonRecipe({ size: "md" }).root();
    expect(md).toContain("px-3");
    expect(md).not.toContain("aspect-square");
    // link is excluded from the size-padding compounds, so it keeps only its own `px-0.5`.
    const link = buttonRecipe({ variant: "link", size: "md" }).root();
    expect(link).toContain("px-0.5");
    expect(link).not.toContain("px-3");
  });
});
