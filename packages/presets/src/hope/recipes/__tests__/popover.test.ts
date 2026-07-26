import type { PopoverRecipeVariants, PopoverSize } from "@hope-ui/theming";
import {
  assertLogicalPropertyConformance,
  assertSlotRecipeConformance,
} from "@hope-ui/theming/conformance";
import { describe, expect, it } from "vitest";
import { popoverRecipe } from "../popover";

const SIZES: PopoverSize[] = ["sm", "md", "lg"];
const SLOTS = [
  "positioner",
  "content",
  "arrow",
  "header",
  "title",
  "description",
  "closeTrigger",
] as const;

const CASES: PopoverRecipeVariants[] = [
  undefined as unknown as PopoverRecipeVariants,
  ...SIZES.map((size) => ({ size })),
];

/**
 * The custom property `createPopoverArrow`'s pin offset reads —
 * `calc(var(--popover-arrow-size, 8px) / -2)` in `packages/primitives/src/popover/popover-arrow.ts`.
 * The name is the one value the two packages must spell identically (presets does not depend on
 * primitives, so nothing but this constant and the pointer comment on `PIN_OFFSET` ties them).
 */
const ARROW_SIZE_PROPERTY = "--popover-arrow-size";

describe("hope popover recipe", () => {
  it("produces a class for every slot across the full variant matrix", () => {
    assertSlotRecipeConformance(popoverRecipe, { cases: CASES, slots: SLOTS });
  });

  it("emits only logical, RTL-safe utilities", () => {
    assertLogicalPropertyConformance(popoverRecipe, { cases: CASES, slots: SLOTS });
  });

  it("keeps the positioner free of anything positional — the kernel writes that inline", () => {
    const positioner = popoverRecipe({}).positioner();
    expect(positioner).toContain("z-50");
    // Shrink-wrap the card so floating-ui measures its real width.
    expect(positioner).toContain("w-max");

    // `createFloating` owns position/left/top/transform (and the pre-measurement `visibility`) as an
    // inline style on this element. A class here would fight a value only the kernel can know.
    for (const forbidden of [
      "absolute",
      "fixed",
      "relative",
      "sticky",
      "translate",
      "transform",
      "inset",
      "top-",
      "start-",
      "end-",
      "visible",
      "invisible",
    ]) {
      expect(positioner).not.toContain(forbidden);
    }
  });

  it("gives the content the elevated card chrome and a symmetric fade+zoom", () => {
    const content = popoverRecipe({}).content();
    // `relative` is load-bearing: the arrow's absolute pin resolves against the card.
    expect(content).toContain("relative");
    expect(content).toContain("bg-surface-overlay");
    expect(content).toContain("border-subtle");
    expect(content).toContain("rounded-lg");
    expect(content).toContain("shadow-md");
    expect(content).toContain("outline-none");
    expect(content).toContain("text-foreground");

    // Transitions `scale`/`translate` (Tailwind v4's standalone properties), not `transform`, or the
    // zoom and the slide would both snap.
    expect(content).toContain("transition-[opacity,scale,translate]");
    expect(content).not.toContain("transition-transform");
    expect(content).toContain("data-entering:opacity-0");
    expect(content).toContain("data-entering:scale-95");
    expect(content).toContain("data-exiting:opacity-0");
    expect(content).toContain("data-exiting:scale-95");
  });

  it("slides in from the trigger and scales out of the edge nearest it, per resolved side", () => {
    const content = popoverRecipe({}).content();

    // Physical on purpose: `data-side` reports where the layer LANDED after `flip` (measured
    // geometry), so the slide and the origin that pair with it are physical too. A popup below the
    // trigger starts a notch higher and grows from its top edge; the other three sides mirror that.
    expect(content).toContain("data-side-bottom:data-entering:-translate-y-1");
    expect(content).toContain("data-side-top:data-entering:translate-y-1");
    expect(content).toContain("data-side-right:data-entering:-translate-x-1");
    expect(content).toContain("data-side-left:data-entering:translate-x-1");

    expect(content).toContain("data-side-bottom:origin-top");
    expect(content).toContain("data-side-top:origin-bottom");
    expect(content).toContain("data-side-right:origin-left");
    expect(content).toContain("data-side-left:origin-right");
  });

  it("agrees with the primitive's pin offset — the arrow declares its size and reads it back", () => {
    const arrow = popoverRecipe({}).arrow();

    // The pin is `calc(var(--popover-arrow-size, 8px) / -2)`: half the arrow, pulled back over the
    // card's edge. Spelling the box size as a second literal (`size-2` + the kernel's `8px` fallback)
    // mispins the arrow by the difference the moment either moves, silently — so the slot declares the
    // property and derives its box FROM it, leaving one source of truth.
    const declaration = arrow.match(/\[(--[\w-]+):([^\]]+)\]/);
    expect(declaration).not.toBeNull();
    const [, property, value] = declaration ?? [];

    expect(property).toBe(ARROW_SIZE_PROPERTY);
    expect(value).toMatch(/^[\d.]+(?:rem|px|em)$/);
    expect(arrow).toContain(`size-(${ARROW_SIZE_PROPERTY})`);
    // No literal box size anywhere — that is exactly the second value this test exists to forbid.
    expect(arrow).not.toMatch(/\bsize-[\d.]/);
    expect(arrow).not.toMatch(/\b[wh]-[\d.]/);
  });

  it("starts the arrow hidden and reveals it once a measurement centres it", () => {
    const arrow = popoverRecipe({}).arrow();

    // `data-uncentered` is present BEFORE the first measurement, by design — an unmeasured arrow reads
    // as clamped. So the recipe must hide on the attribute's PRESENCE (`data-uncentered:invisible`),
    // never reveal on it: the arrow is invisible through the pre-measurement window and appears once
    // `centerOffset` resolves to 0 and the attribute drops, instead of flashing in a centre it will not
    // keep. Nothing in the base may set visibility, or that gate would never apply.
    expect(arrow).toContain("data-uncentered:invisible");
    expect(arrow).not.toMatch(/(?:^|\s)(?:in)?visible(?:\s|$)/);
    // `invisible` (`visibility: hidden`), never `hidden` (`display: none`): the arrow must keep its box
    // so floating-ui's `arrow` middleware has something to measure.
    expect(arrow).not.toMatch(/(?:^|\s)hidden(?:\s|$)/);
  });

  it("leaves the arrow borderless and unpositioned — both are owned elsewhere", () => {
    const arrow = popoverRecipe({}).arrow();
    expect(arrow).toContain("rotate-45");
    expect(arrow).toContain("bg-surface-overlay");
    // Borderless in v1: a rotated square's outward edges are a fact of the rotation, not of reading
    // direction, and `assertLogicalPropertyConformance` takes no allowlist (`popover-arrow.md`).
    expect(arrow).not.toContain("border");
    // `position: absolute` is written inline by `createPopoverArrow` beside the measured offsets, where
    // it always wins. A class here would be dead weight that reads as load-bearing.
    expect(arrow).not.toContain("absolute");
  });

  it("groups the labelled text tighter than the card's own region gap, at every size", () => {
    expect(popoverRecipe({}).header()).toContain("flex-col");

    // The header's rhythm must read tighter than the gap the SAME size puts between the card's
    // regions, or wrapping the title and description in one changes nothing visible.
    const gapOf = (cls: string) => Number(cls.match(/(?<![\w-])gap-([\d.]+)/)?.[1]);
    for (const size of SIZES) {
      const header = popoverRecipe({ size }).header();
      expect(gapOf(header)).toBeLessThan(gapOf(popoverRecipe({ size }).content()));
      // One gap, never two: the density lives in the size variants and the base carries none, the same
      // rule (and the same tailwind-merge hazard) as the `content` slot below.
      expect(header.match(/(?<![\w-])gap-[\w.]+/g)).toHaveLength(1);
    }
  });

  it("mutes the description and underlines links inside it", () => {
    const description = popoverRecipe({}).description();
    expect(description).toContain("text-foreground-muted");
    expect(description).toContain("[&_a]:underline");
  });

  it("pins the close trigger to the trailing-top corner with a logical inset", () => {
    const closeTrigger = popoverRecipe({}).closeTrigger();
    expect(closeTrigger).toContain("absolute");
    expect(closeTrigger).toContain("end-2");
    expect(closeTrigger).toContain("top-2");
  });

  it("scales the card's width, padding and region gap per size", () => {
    expect(popoverRecipe({ size: "sm" }).content()).toContain("max-w-56");
    expect(popoverRecipe({ size: "sm" }).content()).toContain("p-2");
    expect(popoverRecipe({ size: "md" }).content()).toContain("max-w-72");
    expect(popoverRecipe({ size: "md" }).content()).toContain("p-2.5");
    expect(popoverRecipe({ size: "lg" }).content()).toContain("max-w-96");
    expect(popoverRecipe({ size: "lg" }).content()).toContain("p-3");

    expect(popoverRecipe({ size: "sm" }).content()).toContain("gap-2");
    expect(popoverRecipe({ size: "lg" }).content()).toContain("gap-3");
  });

  it("keeps every density value in the size variants, none in the base", () => {
    // The base carries no width/padding/gap, so a size applies additively and nothing depends on
    // tailwind-merge stripping a competing base class (the `dialog.ts` cautionary tale).
    for (const size of SIZES) {
      const content = popoverRecipe({ size }).content();
      expect(content).toMatch(/\bmax-w-\d/);
      expect(content.match(/\bmax-w-[\w.]+/g)).toHaveLength(1);
      expect(content.match(/(?<![\w-])p-[\w.]+/g)).toHaveLength(1);
      expect(content.match(/(?<![\w-])gap-[\w.]+/g)).toHaveLength(1);
    }
  });

  it("defaults to md", () => {
    const content = popoverRecipe({}).content();
    expect(content).toContain("max-w-72");
    expect(content).toContain("p-2.5");
    expect(content).toContain("gap-2.5");
  });

  it("computes no color — no color-mix, alpha modifier, or magic opacity (recipe purity)", () => {
    const cases: PopoverRecipeVariants[] = [{}, ...SIZES.map((size) => ({ size }))];
    for (const variants of cases) {
      const parts = popoverRecipe(variants);
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
    const merged = popoverRecipe({ size: "md" }).content({ class: "rounded-none" });
    expect(merged).toContain("rounded-none");
    expect(merged).not.toContain("rounded-lg");
  });
});
