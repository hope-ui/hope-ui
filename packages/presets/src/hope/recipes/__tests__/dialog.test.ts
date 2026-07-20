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
  "positioner",
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

  it("dims the backdrop with the finished scrim token and fades it in and out", () => {
    const backdrop = dialogRecipe({}).backdrop();
    expect(backdrop).toContain("fixed");
    expect(backdrop).toContain("bg-scrim");
    expect(backdrop).toContain("data-entering:opacity-0");
    expect(backdrop).toContain("data-exiting:opacity-0");
  });

  it("renders the positioner as a fixed full-viewport flex frame wrapping the content card", () => {
    const positioner = dialogRecipe({}).positioner();
    expect(positioner).toContain("fixed");
    expect(positioner).toContain("inset-0");
    expect(positioner).toContain("flex");

    // The card is a flow child now (relative, not fixed) but keeps its chrome + transitions.
    const content = dialogRecipe({}).content();
    expect(content).toContain("relative");
    expect(content).toContain("flex");
    expect(content).toContain("flex-col");
    expect(content).not.toContain("fixed");
    expect(content).toContain("bg-surface-overlay");
    expect(content).toContain("border-subtle");
    expect(content).toContain("rounded-xl");
    expect(content).toContain("shadow-lg");
    // Symmetric enter/exit zoom+fade, keyed on data-presence. Transitions `scale` (Tailwind v4's
    // standalone property), not `transform`, or the zoom would snap.
    expect(content).toContain("transition-[opacity,scale]");
    expect(content).toContain("data-entering:opacity-0");
    expect(content).toContain("data-entering:scale-95");
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

  it("centers by default via auto margins and anchors near the top for placement=top", () => {
    // Centering is auto margins on the card within the `items-start justify-center` frame.
    const center = dialogRecipe({ placement: "center" });
    expect(center.content()).toContain("my-auto");
    expect(center.positioner()).toContain("items-start");
    expect(center.positioner()).toContain("justify-center");

    // `top` nudges the positioner's top gutter down; the card gets no `my-auto`.
    const top = dialogRecipe({ placement: "top" });
    expect(top.positioner()).toContain("sm:pt-16");
    expect(top.content()).not.toContain("my-auto");
  });

  it("scales the centered card width per size, honoring the xs→xs / xl→2xl endpoints", () => {
    expect(dialogRecipe({ size: "xs" }).content()).toContain("sm:max-w-xs");
    expect(dialogRecipe({ size: "md" }).content()).toContain("sm:max-w-lg");
    expect(dialogRecipe({ size: "xl" }).content()).toContain("sm:max-w-2xl");
  });

  it("makes cover a pseudo-fullscreen card that keeps its radius and cancels the centering", () => {
    const cover = dialogRecipe({ size: "cover", placement: "center" });
    // The positioner shrinks its padding; the card fills it and keeps the radius.
    expect(cover.positioner()).toContain("sm:p-8");
    expect(cover.content()).toContain("h-full");
    expect(cover.content()).toContain("max-w-none");
    expect(cover.content()).toContain("rounded-xl");
    expect(cover.content()).not.toContain("rounded-none");
    // `my-0` (size, declared last) cancels `placement:center`'s `my-auto` — same `my` group.
    expect(cover.content()).toContain("my-0");
    expect(cover.content()).not.toContain("my-auto");
  });

  it("makes full a true edge-to-edge fullscreen with no radius or positioner gutter", () => {
    const full = dialogRecipe({
      size: "full",
      placement: "center",
      scrollBehavior: "inside",
    });
    // `p-0`/`sm:p-0` drop the positioner gutter so the card reaches every edge.
    expect(full.positioner()).toContain("p-0");
    expect(full.content()).toContain("h-full");
    expect(full.content()).toContain("rounded-none");
    expect(full.content()).toContain("max-w-none");
    expect(full.content()).not.toContain("rounded-xl");
    expect(full.content()).toContain("my-0");
  });

  it("caps the card and scrolls the body (scrollbar hidden) for scrollBehavior=inside", () => {
    const parts = dialogRecipe({ scrollBehavior: "inside" });
    expect(parts.positioner()).toContain("overflow-hidden");
    expect(parts.content()).toContain("max-h-full");
    expect(parts.body()).toContain("overflow-y-auto");
    // The body scrolls but hides its scrollbar (the base `no-scrollbar` @utility).
    expect(parts.body()).toContain("no-scrollbar");
  });

  it("scrolls the positioner (not the card) for scrollBehavior=outside", () => {
    const parts = dialogRecipe({ scrollBehavior: "outside" });
    expect(parts.positioner()).toContain("overflow-y-auto");
    expect(parts.content()).not.toContain("max-h");
    expect(parts.content()).not.toContain("overflow");
    expect(parts.body()).not.toContain("overflow-y-auto");
  });

  it("defaults to md / center / inside", () => {
    const parts = dialogRecipe({});
    expect(parts.content()).toContain("sm:max-w-lg"); // md
    expect(parts.content()).toContain("my-auto"); // center
    expect(parts.content()).toContain("max-h-full"); // inside
    expect(parts.positioner()).toContain("overflow-hidden"); // inside
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
