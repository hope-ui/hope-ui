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
  // The full cross product, so the conformance asserts reach the `(size × matchAnchorWidth)` compound
  // variants — entries that apply only when several variants match — and not just the plain axes.
  ...SIZES.flatMap((size) => [
    { size },
    { size, matchAnchorWidth: false },
    { size, matchAnchorWidth: true },
  ]),
];

/**
 * The property `createPopoverArrow`'s pin offset reads, in
 * `packages/primitives/src/popover/popover-arrow.ts`. `@hope-ui/presets` does not depend on
 * `@hope-ui/primitives`, so spelling it identically is the only thing tying the two packages
 * together — a rename on either side is silent.
 */
const ARROW_SIZE_PROPERTY = "--popover-arrow-size";

/**
 * The property `createPopoverPositioner` publishes on the positioner's inline style. Same standing as
 * {@link ARROW_SIZE_PROPERTY}, and the same silent failure: the recipe's `width` would resolve to
 * nothing and the card would quietly shrink-wrap.
 */
const ANCHOR_WIDTH_PROPERTY = "--anchor-width";

/**
 * The card's hairline width, declared on `content` and inherited by the arrow. Internal to this recipe,
 * but the same class of hazard: the arrow cancels the card's border by translating outward by exactly
 * that width, so a hard-coded `1px` on either side would have to *happen* to match the other, silently
 * reintroducing the ~0.5px burr at the arrow's base.
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
    // Shrink-wrap so floating-ui measures the card's real width. It comes from `matchAnchorWidth`'s
    // `false` branch, never the base — see the recipe's "every width class is additive" note.
    expect(positioner).toContain("w-max");

    // `createFloating` owns position/left/top/transform (and the pre-measurement `visibility`) as an
    // inline style here, so a class would fight a value only the kernel can know.
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

    // The hairline's WIDTH is a property, not the bare `border` keyword, because the arrow reads it
    // back to nudge itself onto the border's outer edge. A bare `border` would still render 1px and
    // still look right on the card, while leaving the arrow's compensation reading an undefined
    // property — which resolves to no translate and silently restores the burr.
    expect(content).toContain(`[${CARD_BORDER_PROPERTY}:1px]`);
    expect(content).toContain(`border-(length:${CARD_BORDER_PROPERTY})`);
    expect(content).not.toMatch(/(?:^|\s)border(?:\s|$)/);
    // A FILTER, not a box-shadow: the elevation has to trace the card ∪ arrow silhouette, and a
    // `box-shadow` paints in the card's own background layer — beneath the absolutely-positioned arrow,
    // which then covers it and casts none of its own.
    expect(content).toContain("drop-shadow-md");
    expect(content).not.toMatch(/(?<![\w-])shadow-md/);
    expect(content).toContain("outline-none");
    expect(content).toContain("text-foreground");

    // Tailwind v4 compiles `scale-*`/`-translate-*` to the standalone `scale`/`translate` CSS
    // properties, so a `transition-transform` here would make the zoom and the slide both snap.
    expect(content).toContain("transition-[opacity,scale,translate]");
    expect(content).not.toContain("transition-transform");
    expect(content).toContain("data-entering:opacity-0");
    expect(content).toContain("data-entering:scale-95");
    expect(content).toContain("data-exiting:opacity-0");
    expect(content).toContain("data-exiting:scale-95");
  });

  it("slides in from the trigger and scales out of the edge nearest it, per resolved side", () => {
    const content = popoverRecipe({}).content();

    // Physical on purpose, so identical under `dir="rtl"`: `data-side` reports where the layer LANDED
    // after `flip` — measured geometry, not reading direction. A popup below the trigger starts a notch
    // higher and grows from its top edge; the other three sides mirror that.
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
    // card's edge. A second literal box size here would mispin the arrow by the difference the moment
    // either moves, silently — so the slot declares the property and derives its box FROM it.
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

    // `data-uncentered` is present BEFORE the first measurement, by design. So the recipe must hide on
    // the attribute's PRESENCE, never reveal on it: the arrow stays invisible through the
    // pre-measurement window and appears once `centerOffset` resolves to 0 and the attribute drops,
    // instead of flashing in a centre it will not keep. Nothing in the base may set visibility, or that
    // gate would never apply.
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
    // upper-RIGHT one, and `data-side` is the POPUP's side, so the arrow points the other way. A
    // swapped pair paints a chevron pointing back INTO the card — visible in Storybook's `Sides` story
    // but invisible to every automated check here, since the browser project compiles no Tailwind.
    // Hence a pinned table rather than a spot check.
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

    // Nudged OUTWARD by exactly the card's border width, per side. Without it the diamond's widest
    // point sits on the hairline's INNER edge and the card's 1px band protrudes past the arrow's base —
    // a ~1px burr per side. Direction follows the same "arrow points away from the popup" mapping.
    const OUTWARD_NUDGE = {
      bottom: "-translate-y",
      top: "translate-y",
      right: "-translate-x",
      left: "translate-x",
    } as const;
    for (const [side, axis] of Object.entries(OUTWARD_NUDGE)) {
      expect(arrow).toContain(`data-side-${side}:${axis}-(${CARD_BORDER_PROPERTY})`);
    }
    // Read from the property the card declares, never a second literal `1px` that must happen to match
    // the border beside it — the same single-source rule as `--popover-arrow-size` above.
    expect(arrow).not.toMatch(/translate-[xy]-px/);
    // `createPopoverArrow` writes `position: absolute` inline beside the measured offsets, where it
    // always wins. A class here would be dead weight that reads as load-bearing.
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
      // One gap, never two: density lives in the size variants and the base carries none — the same
      // tailwind-merge hazard the `content` slot below is checked for.
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
    // Nothing depends on tailwind-merge stripping a competing class (the `dialog.ts` cautionary tale):
    // padding and gap come only from `size`, the max width only from the compound.
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
    // Not "the variant out-orders the base" — the base carries no width at all, so there is no second
    // `w-*` for tailwind-merge to resolve and no declaration order to depend on.
    expect(matched).not.toContain("w-max");
    expect(matched.match(/(?<![\w-])w-[\w(.-]+/g)).toHaveLength(1);
  });

  it("gives a width-matched card NO max width, rather than one cancelled by max-w-none", () => {
    // The whole point of routing the cap through the compound. An override-based recipe
    // (`matchAnchorWidth: { true: { content: "max-w-none" } }`) renders identically in a browser and
    // fails here — it silently depends on `matchAnchorWidth` being declared after `size` inside `tv`.
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
