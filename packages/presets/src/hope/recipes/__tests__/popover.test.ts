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
  // The full cross product, so the conformance asserts cover the `(size × matchAnchorWidth)` compound
  // variants and not just the plain axes.
  ...SIZES.flatMap((size) => [
    { size },
    { size, matchAnchorWidth: false },
    { size, matchAnchorWidth: true },
  ]),
];

/**
 * The custom property `createPopoverArrow`'s pin offset reads —
 * `calc(var(--popover-arrow-size, 8px) / -2)` in `packages/primitives/src/popover/popover-arrow.ts`.
 * The name is the one value the two packages must spell identically (presets does not depend on
 * primitives, so nothing but this constant and the pointer comment on `PIN_OFFSET` ties them).
 */
const ARROW_SIZE_PROPERTY = "--popover-arrow-size";

/**
 * The custom property `createPopoverPositioner` publishes on the positioner's inline style, in
 * `packages/primitives/src/popover/popover-positioner.ts`. Same standing as
 * {@link ARROW_SIZE_PROPERTY}: presets does not depend on primitives, so the spelling is the only
 * thing tying the two packages together, and a rename on either side is silent — the recipe's
 * `width` would resolve to nothing and the card would quietly shrink-wrap.
 */
const ANCHOR_WIDTH_PROPERTY = "--anchor-width";

/**
 * The card's hairline width, declared on `content` and inherited by the arrow (a descendant). Unlike
 * the two above this one is wholly internal to this recipe — but it is the same class of hazard: the
 * arrow cancels the card's border by translating outward by exactly its width, so a hard-coded `1px`
 * on either side would have to *happen* to match the other, and a preset changing one would silently
 * reintroduce the ~0.5px burr at the arrow's base.
 */
const CARD_BORDER_PROPERTY = "--popover-card-border";

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
    // Shrink-wrap the card so floating-ui measures its real width — from the `matchAnchorWidth`
    // variant's `false` branch (the default), not the base.
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

    // The hairline's WIDTH is a property, not the bare `border` keyword: the arrow reads it back to
    // nudge itself onto the border's outer edge (see the arrow test). A bare `border` would still
    // render 1px and still look right on the card — while leaving the arrow's compensation reading an
    // undefined property, which resolves to no translate and silently restores the burr.
    expect(content).toContain(`[${CARD_BORDER_PROPERTY}:1px]`);
    expect(content).toContain(`border-(length:${CARD_BORDER_PROPERTY})`);
    expect(content).not.toMatch(/(?:^|\s)border(?:\s|$)/);
    // A FILTER, not a box-shadow: the elevation has to trace the card ∪ arrow silhouette, and a
    // `box-shadow` paints in the card's own background layer — beneath the absolutely-positioned
    // arrow, which then covers it and casts none of its own. `drop-shadow` derives from the rendered
    // subtree's alpha, so the arrow is included automatically.
    expect(content).toContain("drop-shadow-md");
    expect(content).not.toMatch(/(?<![\w-])shadow-md/);
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

  it("borders the arrow's two OUTWARD edges per resolved side, continuing the card's hairline", () => {
    const arrow = popoverRecipe({}).arrow();
    expect(arrow).toContain("rotate-45");
    expect(arrow).toContain("bg-surface-overlay");

    // A clockwise 45° turn maps TL→top, TR→right, BR→bottom, BL→left, so the box's `top` edge is the
    // upper-RIGHT one. `data-side` is the POPUP's side, so the arrow points the other way. A swapped
    // pair paints a chevron pointing back INTO the card — visible in Storybook's `Sides` story, and
    // invisible to every automated check here (the browser project compiles no Tailwind), which is
    // why the mapping is pinned as a table rather than spot-checked.
    const OUTWARD_EDGES = {
      bottom: ["border-t", "border-l"], // points UP
      top: ["border-b", "border-r"], // points DOWN
      right: ["border-l", "border-b"], // points LEFT
      left: ["border-t", "border-r"], // points RIGHT
    } as const;

    for (const [side, edges] of Object.entries(OUTWARD_EDGES)) {
      for (const edge of edges) {
        expect(arrow).toContain(`data-side-${side}:${edge}`);
      }
      // Exactly two — a third would border an edge facing into the card.
      expect(arrow.match(new RegExp(`data-side-${side}:border-[tblr]\\b`, "g"))).toHaveLength(2);
    }

    // Unconditional colour: without it the width utilities fall back to `currentColor`.
    expect(arrow).toContain("border-subtle");
    // No all-round `border` — it would paint the two edges facing into the card.
    expect(arrow).not.toMatch(/(?:^|\s)border(?:\s|$)/);

    // Nudged OUTWARD by exactly the card's border width, per side. Without this the diamond's widest
    // point sits on the hairline's INNER edge and the card's 1px band protrudes past the arrow's
    // outward edges at the base — a ~1px burr on each side that antialiases to a ~0.5px sliver.
    // Direction per side is the same "arrow points away from the popup" mapping as the borders.
    const OUTWARD_NUDGE = {
      bottom: "-translate-y",
      top: "translate-y",
      right: "-translate-x",
      left: "translate-x",
    } as const;
    for (const [side, axis] of Object.entries(OUTWARD_NUDGE)) {
      expect(arrow).toContain(`data-side-${side}:${axis}-(${CARD_BORDER_PROPERTY})`);
    }
    // Read from the property the card declares, never a second literal `1px` that must happen to
    // match the border beside it — the same single-source rule as `--popover-arrow-size` above.
    expect(arrow).not.toMatch(/translate-[xy]-px/);
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

  it("emits each density value exactly once, never a base class an override has to beat", () => {
    // Nothing depends on tailwind-merge stripping a competing class (the `dialog.ts` cautionary
    // tale): padding and gap come only from the `size` variant, the max width only from the
    // `(size × matchAnchorWidth: false)` compound.
    for (const size of SIZES) {
      const content = popoverRecipe({ size }).content();
      expect(content).toMatch(/\bmax-w-\d/);
      expect(content.match(/\bmax-w-[\w.]+/g)).toHaveLength(1);
      expect(content.match(/(?<![\w-])p-[\w.]+/g)).toHaveLength(1);
      expect(content.match(/(?<![\w-])gap-[\w.]+/g)).toHaveLength(1);
    }
  });

  it("swaps the positioner's width between shrink-wrap and the anchor's measured width", () => {
    const shrinkWrapped = popoverRecipe({ matchAnchorWidth: false }).positioner();
    expect(shrinkWrapped).toContain("w-max");
    expect(shrinkWrapped).not.toContain(ANCHOR_WIDTH_PROPERTY);

    const matched = popoverRecipe({ matchAnchorWidth: true }).positioner();
    expect(matched).toContain(`w-(${ANCHOR_WIDTH_PROPERTY})`);
    // Not "the variant out-orders the base" — the base carries no width at all, so there is no
    // second `w-*` for tailwind-merge to resolve and no declaration order to depend on.
    expect(matched).not.toContain("w-max");
    expect(matched.match(/(?<![\w-])w-[\w(.-]+/g)).toHaveLength(1);
  });

  it("gives a width-matched card NO max width, rather than one cancelled by max-w-none", () => {
    // The point of routing the cap through `(size × matchAnchorWidth: false)` compounds. An
    // override-based recipe (`matchAnchorWidth: { true: { content: "max-w-none" } }`) renders
    // identically in a browser and fails here — which is the regression this test exists to catch,
    // because it silently depends on `matchAnchorWidth` being declared after `size` inside `tv`.
    for (const size of SIZES) {
      const content = popoverRecipe({ size, matchAnchorWidth: true }).content();
      expect(content).not.toMatch(/\bmax-w-/);
      // The density values are untouched by the axis — only the cap is conditional.
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
    for (const variants of CASES) {
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
