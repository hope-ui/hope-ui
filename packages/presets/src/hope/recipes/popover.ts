/*
 * @hope-ui/presets/hope — Popover slot recipe.
 *
 * A *slot recipe*: `tv` (tailwind-variants) maps variant props to one class string per named part
 * ("slot"), and `@hope-ui/components`' Popover reads it through `useRecipe("popover")`. The surface
 * is a measured floating card anchored to a trigger, with an optional arrow. No color axis — role
 * accents belong to whatever the consumer puts inside it.
 *
 * ── The positioner carries NOTHING positional ───────────────────────────────────────────────────
 * `createFloating` writes the layer's `position`/`left`/`top`/`transform` — and its pre-measurement
 * `visibility: hidden` — as an inline style, so a positional class here fights a value only the
 * kernel can know. The enter/exit `translate` lives on `content` one level down for the same reason:
 * on the positioner it would animate against the `translate()` that positions it.
 *
 * ── Every width class is additive; none is an override ──────────────────────────────────────────
 * The card is sized one of two mutually exclusive ways: shrink-wrapped and capped (`w-max` +
 * `max-w-72`), or pinned to the anchor (`w-(--anchor-width)`, uncapped). Spelling the second as an
 * override of the first would make the painted result depend on variant declaration order inside `tv`
 * and on tailwind-merge resolving the pair — silent breakage the moment either changes. So no
 * competing class is emitted at all: the two widths are the two *values* of `matchAnchorWidth` (the
 * base carries none), and `max-w-*` lives in `(size × matchAnchorWidth: false)` *compound variants*
 * — entries that apply only when several variants match at once — so a width-matched card never
 * receives one. Same rule as `button.ts`'s `px-*`. `__tests__/popover.test.ts` asserts the ABSENCE of
 * a `max-w-*`, which an override-based recipe would fail while rendering identically in a browser.
 *
 * ── Recipe purity ───────────────────────────────────────────────────────────────────────────────
 * Every color is a *finished* `--hope-*` design token (`bg-surface-overlay`, `border-subtle`,
 * `text-foreground`…) — never one this recipe computes: no `color-mix`, no alpha modifier
 * (`bg-x/50`), no magic opacity. Derived colors are authored as tokens in the preset's `theme.css`
 * instead, so redefining a shade changes the painted result predictably. `opacity-0` is full
 * transparency, hence layout rather than a computed color. Enforced by `pnpm check:recipe-purity`.
 * Every class is a literal string, because the consumer's Tailwind build only emits utilities it can
 * find by scanning this file (`@source "./recipes"`) — a `bg-${role}` template is invisible to it.
 *
 * ── The hairline continues around the arrow ─────────────────────────────────────────────────────
 * The arrow is opaque and absolutely positioned, so it paints above the card's own border: an
 * unbordered arrow stops the hairline dead for ~11px and reads as a detached tab. Two consequences:
 *   - The arrow borders its two OUTWARD edges. `border-subtle` sets the colour unconditionally and
 *     only the *width* utilities are keyed per side, because Tailwind's preflight is `border: 0
 *     solid` — a bare `border-t` would paint in `currentColor`, here the inherited `text-foreground`.
 *   - `content` takes `drop-shadow-md`, not `shadow-md`. A `box-shadow` paints in the card's own
 *     background layer, beneath its positioned descendants, so the arrow covers it and casts none of
 *     its own; `filter: drop-shadow()` derives from the rendered subtree's alpha and so traces the
 *     card ∪ arrow silhouette. An arrow hidden by `data-uncentered:invisible` contributes no alpha,
 *     so an unmeasured arrow correctly casts nothing.
 *
 * ── The arrow sits on the OUTER border edge, which costs one translate ─────────────────────────
 * The kernel's `PIN_OFFSET` centres the arrow on the popup's *padding-box* edge, since it cannot know
 * a border width it does not author — right for a borderless consumer, one hairline short here. The
 * card's 1px band protrudes past the arrow's base, leaving a ~1px burr per side. So the arrow is
 * nudged outward by exactly that width, putting its widest point on the hairline's outer edge. The
 * width is single-sourced as `--popover-card-border` on `content` and inherited by the arrow: a
 * hard-coded `1px` would have to *happen* to match the `border` beside it, and a preset changing one
 * would silently restore the burr. `box-sizing: border-box` keeps the outer box at
 * `--popover-arrow-size` with or without a border, so the rotated silhouette is unchanged.
 *
 * ── The arrow's size is a two-value agreement, spelled once ─────────────────────────────────────
 * `createPopoverArrow` pins the square with `calc(var(--popover-arrow-size, 8px) / -2)`, so a second
 * literal box size here (`size-2`) would mispin the arrow by the difference the moment either moves,
 * with no error anywhere. The slot therefore declares the property and sizes itself FROM it. The
 * property is deliberately unprefixed: `--hope-*` is the semantic *token* vocabulary, and
 * `check:recipe-purity` rejects a bracketed value naming it. Pinned by `__tests__/popover.test.ts`.
 *
 * `position: absolute` is NOT in the `arrow` slot — the primitive writes it inline beside the
 * measured offsets, where it always wins. A class here would be dead weight that reads as load-bearing.
 *
 * ── The physical utilities on `content` and `arrow` are correct ────────────────────────────────
 * Directional classes are normally required to be *logical* (`ps-`/`pe-`/`start-`/`end-`…) so they
 * mirror under `dir="rtl"`; this recipe is the worked example behind the `data-side` exemption in
 * `__internal__/theming.md`. Both RTL gates skip a `data-side-*`-scoped utility
 * (`MEASURED_SIDE_SCOPED`), so the arrow's border needs no `rtl-ok` escape comment and no
 * per-call-site opt-out: `data-side` reports where the layer LANDED after `flip`, and which two edges
 * of a rotated square face outward follows from that geometry, identically in `ltr` and `rtl`.
 */

import { type PopoverSize, tv } from "@hope-ui/theming";

const MAX_WIDTH: Record<PopoverSize, string> = {
  sm: "max-w-56",
  md: "max-w-72",
  lg: "max-w-96",
};

/**
 * The card's max width, per size, **only when it is not matching its anchor**. A width-matched card
 * therefore carries no `max-w-*` at all rather than one cancelled by a `max-w-none` — see the header
 * note. Same shape as `button.ts`'s `paddingCompoundVariants`.
 */
const MAX_WIDTH_COMPOUND_VARIANTS = (Object.keys(MAX_WIDTH) as PopoverSize[]).map((size) => ({
  size,
  matchAnchorWidth: false as const,
  class: { content: MAX_WIDTH[size] },
}));

/**
 * hope's Popover slot recipe — used as-is by the component (`recipe(props).content()`), no adapter.
 * `hopeRecipes` (in `./index`) checks it against the `popover` contract in `@hope-ui/theming`.
 */
export const popoverRecipe = tv({
  slots: {
    // Stacking ONLY — the kernel owns everything positional, and the width belongs to
    // `matchAnchorWidth` (both header notes).
    positioner: "z-50",
    // `relative` so the arrow's absolute pin resolves against this card. Width and padding are density
    // values and live per `size`.
    content: [
      // The hairline's width is a PROPERTY, not the bare `border` keyword, so the arrow can read it
      // back and cancel it — it inherits to the arrow, so the two can never disagree. `drop-shadow-md`
      // rather than `shadow-md` so the elevation includes the arrow. Both: header notes.
      "[--popover-card-border:1px] border-(length:--popover-card-border) border-subtle",
      "relative flex flex-col rounded-lg bg-surface-overlay drop-shadow-md outline-none",
      "text-sm text-foreground",
      // Transition `opacity`/`scale`/`translate`, NOT `transform`: Tailwind v4 compiles `scale-*` and
      // `-translate-y-*` to the standalone `scale`/`translate` CSS properties, so
      // `transition-transform` would animate neither. Faster than Dialog — a popover is a light surface.
      "transition-[opacity,scale,translate] duration-150 ease-out motion-reduce:transition-none",
      // `createPresence` paints the `entering` frame, then flips `data-presence` to `entered` a frame
      // later — that attribute change is what fires the transition, in both directions. Exit is
      // fade+scale only; the directional slide reads as an entrance ("coming from the trigger").
      "data-entering:opacity-0 data-entering:scale-95 data-exiting:opacity-0 data-exiting:scale-95",
      // PHYSICAL ON PURPOSE (header note): keyed on `data-side-*`, which reports measured post-`flip`
      // geometry, so a physical slide and origin are the matching answers — a logical variant would
      // need `ltr:`/`rtl:` scoping on every line just to pick the sign back. Neither utility is on the
      // RTL rule table (`transform-origin` has no logical keyword, `translate-*` no logical form), so
      // both pass `check:rtl-safety` and `assertLogicalPropertyConformance` — the resolved-recipe half
      // of the same gate — unmodified.
      "data-side-bottom:data-entering:-translate-y-1 data-side-top:data-entering:translate-y-1",
      "data-side-right:data-entering:-translate-x-1 data-side-left:data-entering:translate-x-1",
      "data-side-bottom:origin-top data-side-top:origin-bottom",
      "data-side-right:origin-left data-side-left:origin-right",
    ],
    // A 45°-rotated square straddling the card's edge. `data-uncentered` is present until a measurement
    // resolves `centerOffset` to 0, so the arrow starts hidden rather than flashing in a centre it will
    // not keep.
    arrow: [
      "[--popover-arrow-size:0.5rem] size-(--popover-arrow-size)",
      // `border-subtle` sets the COLOUR unconditionally, with only the per-side widths below — the
      // inverse of button/badge/alert. Tailwind's preflight is `border: 0 solid`, so a bare width
      // utility would fall back to `currentColor` (header note).
      "rotate-45 bg-surface-overlay border-subtle data-uncentered:invisible",
      // Which two edges face outward is a fact of the 45° rotation (TL→top, TR→right, BR→bottom,
      // BL→left) and of where the layer landed, never of reading direction — so this pair is IDENTICAL
      // under `dir="rtl"`. See `popover-arrow.md` § The bordered arrow.
      "data-side-bottom:border-t data-side-bottom:border-l",
      "data-side-top:border-b data-side-top:border-r",
      "data-side-right:border-l data-side-right:border-b",
      "data-side-left:border-t data-side-left:border-r",
      // Nudge OUTWARD by exactly the card's border width, landing the diamond's widest point on the
      // hairline's outer edge (header note). `translate` composes BEFORE `rotate` (CSS applies
      // translate → rotate → scale) and in the unrotated axes, so these move the arrow straight along
      // the screen axis despite the 45° turn.
      "data-side-bottom:-translate-y-(--popover-card-border)",
      "data-side-top:translate-y-(--popover-card-border)",
      "data-side-right:-translate-x-(--popover-card-border)",
      "data-side-left:translate-x-(--popover-card-border)",
    ],
    // Its `gap` lives per `size`, tighter there than the same size's region gap on `content` — that is
    // the whole point: the title and description have to read as one block set apart from whatever else
    // the card holds. No `shrink-0` twin like Dialog's, which exists to pin a header while the body
    // scrolls; a popover never scrolls itself.
    header: "flex flex-col",
    title: "font-medium leading-none text-foreground",
    description: [
      "text-foreground-muted",
      "[&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-foreground",
    ],
    // Placement only, on a logical inset so it mirrors under `dir="rtl"`. The button chrome comes from
    // CloseButton's own recipe, merged under this via its `class` prop.
    closeTrigger: "absolute end-2 top-2",
  },
  variants: {
    // Each size is self-contained — neither base `content` nor base `header` carries padding or gap —
    // so a size applies additively and nothing depends on tailwind-merge stripping a competing class.
    // The scale stays narrow because the card is anchored: a viewport-filling popover would be a
    // Dialog. Max width is not here; it is in `MAX_WIDTH_COMPOUND_VARIANTS`, for the header's reason.
    size: {
      sm: { content: "gap-2 p-2", header: "gap-0.5" },
      md: { content: "gap-2.5 p-2.5", header: "gap-0.5" },
      lg: { content: "gap-3 p-3", header: "gap-1" },
    },
    // `--anchor-width` is published on the positioner for every popover, measured and device-pixel
    // snapped by `createFloating`'s `size` middleware; this variant only decides whether to spend it.
    matchAnchorWidth: {
      true: { positioner: "w-(--anchor-width)" },
      false: { positioner: "w-max" },
    },
  },
  compoundVariants: MAX_WIDTH_COMPOUND_VARIANTS,
  defaultVariants: {
    size: "md",
    matchAnchorWidth: false,
  },
});
