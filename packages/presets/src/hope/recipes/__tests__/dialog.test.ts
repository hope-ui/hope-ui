import type {
  DialogPlacement,
  DialogRecipeVariants,
  DialogScrollBehavior,
  DialogSize,
} from "@hope-ui/theming";
import { assertSlotRecipeConformance } from "@hope-ui/theming/conformance";
import { describe, expect, it } from "vitest";
import { dialogRecipe } from "../dialog";

const SIZES: DialogSize[] = ["xs", "sm", "md", "lg", "xl", "cover", "full"];
const PLACEMENTS: DialogPlacement[] = ["center", "top"];
const SCROLL_BEHAVIORS: DialogScrollBehavior[] = ["inside", "outside"];
const SLOTS = [
  "backdrop",
  "content",
  "header",
  "body",
  "footer",
  "title",
  "description",
  "closeTrigger",
] as const;

describe("hope dialog recipe", () => {
  it("produces a class for every slot across the full variant matrix", () => {
    const cases: DialogRecipeVariants[] = [
      undefined as unknown as DialogRecipeVariants,
      ...SIZES.map((size) => ({ size })),
      ...PLACEMENTS.map((placement) => ({ placement })),
      ...SCROLL_BEHAVIORS.map((scrollBehavior) => ({ scrollBehavior })),
    ];
    assertSlotRecipeConformance(dialogRecipe, { cases, slots: SLOTS });
  });

  it("dims the backdrop with the finished scrim token and fades it on exit", () => {
    const backdrop = dialogRecipe({}).backdrop();
    expect(backdrop).toContain("fixed");
    expect(backdrop).toContain("bg-scrim");
    expect(backdrop).toContain("data-exiting:opacity-0");
  });

  it("renders the content as a fixed card on a surface-overlay with a subtle border", () => {
    const content = dialogRecipe({}).content();
    expect(content).toContain("fixed");
    expect(content).toContain("bg-surface-overlay");
    expect(content).toContain("border-subtle");
    expect(content).toContain("rounded-xl");
    expect(content).toContain("shadow-lg");
    // Enter/exit chrome keyed on data-presence, the Alert pattern.
    expect(content).toContain("transition-[opacity,transform]");
    expect(content).toContain("data-exiting:opacity-0");
    expect(content).toContain("data-exiting:scale-95");
  });

  it("tints the footer with the sunken surface + a top hairline", () => {
    const footer = dialogRecipe({}).footer();
    expect(footer).toContain("bg-surface-sunken");
    expect(footer).toContain("border-t");
    expect(footer).toContain("border-subtle");
    expect(footer).toContain("rounded-b-xl");
  });

  it("mutes the description and underlines links inside it", () => {
    const description = dialogRecipe({}).description();
    expect(description).toContain("text-foreground-muted");
    expect(description).toContain("[&_a]:underline");
  });

  it("centers by default and anchors near the top for placement=top", () => {
    const center = dialogRecipe({ placement: "center" }).content();
    expect(center).toContain("left-1/2");
    expect(center).toContain("top-1/2");
    expect(center).toContain("-translate-y-1/2");

    const top = dialogRecipe({ placement: "top" }).content();
    expect(top).toContain("top-4");
    expect(top).toContain("sm:top-16");
    // horizontally centered, but not vertically.
    expect(top).toContain("-translate-x-1/2");
    expect(top).not.toContain("-translate-y-1/2");
  });

  it("scales the centered card width per size, honoring the xs→xs / xl→2xl endpoints", () => {
    expect(dialogRecipe({ size: "xs" }).content()).toContain("sm:max-w-xs");
    expect(dialogRecipe({ size: "md" }).content()).toContain("sm:max-w-lg");
    expect(dialogRecipe({ size: "xl" }).content()).toContain("sm:max-w-2xl");
  });

  it("makes cover a pseudo-fullscreen card that keeps its radius and cancels the centering", () => {
    const cover = dialogRecipe({ size: "cover", placement: "center" }).content();
    expect(cover).toContain("inset-4");
    expect(cover).toContain("sm:inset-8");
    expect(cover).toContain("max-w-none");
    expect(cover).toContain("rounded-xl");
    expect(cover).not.toContain("rounded-none");
    // The centered positioning `placement` set is removed by tailwind-merge (inset > left/top,
    // translate-x-0 > -translate-x-1/2).
    expect(cover).not.toContain("left-1/2");
    expect(cover).not.toContain("top-1/2");
    expect(cover).not.toContain("-translate-x-1/2");
  });

  it("makes full a true edge-to-edge fullscreen with no radius or height cap", () => {
    const full = dialogRecipe({
      size: "full",
      placement: "center",
      scrollBehavior: "inside",
    }).content();
    expect(full).toContain("inset-0");
    expect(full).toContain("rounded-none");
    expect(full).toContain("max-w-none");
    // `max-h-none` wins over scrollBehavior=inside's height cap so it fills the viewport.
    expect(full).toContain("max-h-none");
    expect(full).not.toContain("rounded-xl");
    expect(full).not.toContain("left-1/2");
  });

  it("caps content height and scrolls the body for scrollBehavior=inside", () => {
    const parts = dialogRecipe({ scrollBehavior: "inside" });
    expect(parts.content()).toContain("max-h-[calc(100dvh-2rem)]");
    expect(parts.body()).toContain("overflow-y-auto");
  });

  it("scrolls the whole content block for scrollBehavior=outside", () => {
    const parts = dialogRecipe({ scrollBehavior: "outside" });
    expect(parts.content()).toContain("max-h-[calc(100dvh-2rem)]");
    expect(parts.content()).toContain("overflow-y-auto");
    expect(parts.body()).not.toContain("overflow-y-auto");
  });

  it("defaults to md / center / inside", () => {
    const parts = dialogRecipe({});
    expect(parts.content()).toContain("sm:max-w-lg"); // md
    expect(parts.content()).toContain("left-1/2"); // center
    expect(parts.content()).toContain("max-h-[calc(100dvh-2rem)]"); // inside
    expect(parts.body()).toContain("overflow-y-auto"); // inside
  });

  it("computes no color — no color-mix, alpha modifier, or magic opacity (recipe purity)", () => {
    const cases: DialogRecipeVariants[] = [
      {},
      ...SIZES.map((size) => ({ size })),
      ...PLACEMENTS.map((placement) => ({ placement })),
      ...SCROLL_BEHAVIORS.map((scrollBehavior) => ({ scrollBehavior })),
    ];
    for (const variants of cases) {
      const parts = dialogRecipe(variants);
      for (const slot of SLOTS) {
        const cls = parts[slot]();
        expect(cls).not.toContain("color-mix");
        // Alpha modifier on a color utility (`bg-x/50`).
        expect(cls).not.toMatch(/\b(?:bg|text|border|ring)-[\w-]+\/\d{1,3}\b/);
        // Magic opacity (`opacity-90`); `opacity-0` (full transparent) is legitimate layout.
        expect(cls).not.toMatch(/\bopacity-([1-9]|[1-9]\d)\b/);
      }
    }
  });

  it("merges a consumer class through the content slot function", () => {
    const merged = dialogRecipe({ size: "md" }).content({ class: "rounded-none" });
    expect(merged).toContain("rounded-none");
    expect(merged).not.toContain("rounded-xl");
  });
});
