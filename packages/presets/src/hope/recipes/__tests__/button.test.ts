import type {
  ButtonColor,
  ButtonRecipeVariants,
  ButtonSize,
  ButtonVariant,
} from "@hope-ui/theming";
import { assertSlotRecipeConformance } from "@hope-ui/theming/conformance";
import { describe, expect, it } from "vitest";
import { buttonRecipe } from "../button";

const VARIANTS: ButtonVariant[] = ["default", "solid", "soft", "outline", "ghost", "link"];
const COLORS: ButtonColor[] = ["primary", "neutral", "success", "warning", "danger", "info"];
const SIZES: ButtonSize[] = ["xs", "sm", "md", "lg", "xl"];
const SLOTS = ["root", "label", "startDecorator", "endDecorator", "loader"] as const;

describe("hope button recipe", () => {
  it("produces a class for every slot across the full variant matrix", () => {
    const cases: ButtonRecipeVariants[] = [
      undefined as unknown as ButtonRecipeVariants,
      ...VARIANTS.flatMap((variant) => COLORS.map((color) => ({ variant, color }))),
      ...SIZES.map((size) => ({ size })),
      { fullWidth: true },
      { loaderPlacement: "center" as const },
      { loaderPlacement: "start" as const },
    ];
    assertSlotRecipeConformance(buttonRecipe, { cases, slots: SLOTS });
  });

  it("wires each colored variant to its semantic token fill", () => {
    expect(buttonRecipe({ variant: "solid", color: "danger" }).root()).toContain("bg-danger");
    expect(buttonRecipe({ variant: "solid", color: "danger" }).root()).toContain("text-on-danger");
    expect(buttonRecipe({ variant: "solid", color: "primary" }).root()).toContain(
      "hover:bg-primary-hover",
    );
    expect(buttonRecipe({ variant: "soft", color: "success" }).root()).toContain("bg-success-soft");
    expect(buttonRecipe({ variant: "soft", color: "success" }).root()).toContain(
      "text-on-success-soft",
    );
    expect(buttonRecipe({ variant: "outline", color: "warning" }).root()).toContain(
      "border-warning-outline",
    );
    expect(buttonRecipe({ variant: "ghost", color: "info" }).root()).toContain("text-on-info-soft");
  });

  it("keeps the default variant color-independent (shadcn neutral chrome)", () => {
    const asPrimary = buttonRecipe({ variant: "default", color: "primary" }).root();
    const asDanger = buttonRecipe({ variant: "default", color: "danger" }).root();
    expect(asPrimary).toBe(asDanger);
    expect(asPrimary).toContain("bg-surface-raised");
    expect(asPrimary).toContain("border-subtle-outline");
  });

  it("styles the disabled state through the single data-disabled axis (no disabled:/aria-disabled:)", () => {
    const root = buttonRecipe({ variant: "solid", color: "primary" }).root();
    // The fill-bearing variants swap to the dedicated disabled fill token on `data-disabled`.
    expect(root).toContain("data-disabled:bg-disabled");
    // The outline variant tints its border instead.
    expect(buttonRecipe({ variant: "outline" }).root()).toContain(
      "data-disabled:border-disabled-outline",
    );
    // The old two-variant spelling is gone.
    expect(root).not.toMatch(/(?:^|\s)(?:disabled|aria-disabled):/);
  });

  it("hides the label and centers the loader for the center placement (overlay)", () => {
    const centered = buttonRecipe({
      variant: "solid",
      color: "primary",
      loaderPlacement: "center",
    });
    expect(centered.label()).toContain("opacity-0");
    expect(centered.loader()).toContain("absolute");
    // Layout only: `center` shows the loader (the component mounts it), never `hidden`.
    expect(centered.loader()).not.toContain("hidden");
  });

  it("orders the loader inline for start/end placement without touching the label", () => {
    const start = buttonRecipe({ variant: "solid", color: "primary", loaderPlacement: "start" });
    expect(start.loader()).toContain("order-first");
    expect(start.label()).not.toContain("opacity-0");

    const end = buttonRecipe({ variant: "solid", color: "primary", loaderPlacement: "end" });
    expect(end.loader()).toContain("order-last");
  });

  it("merges a consumer class through the root slot function", () => {
    // The component relies on this: `recipe(v).root({ class })` lets a consumer utility win.
    const merged = buttonRecipe({ variant: "solid", color: "primary" }).root({
      class: "rounded-none",
    });
    expect(merged).toContain("rounded-none");
    expect(merged).not.toContain("rounded-md");
  });

  it("lets link override the fixed height and padding", () => {
    const link = buttonRecipe({ variant: "link", color: "primary", size: "md" }).root();
    expect(link).toContain("h-auto");
    expect(link).not.toContain("h-9");
  });
});
