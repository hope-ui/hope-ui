/*
 * @hope-ui/presets/hope — Popover slot recipe.
 *
 * The `tailwind-variants` slot recipe the `@hope-ui/components` `Popover` reads through
 * `useRecipe("popover")`: a measured floating card — a small elevated surface anchored to a trigger,
 * with an optional arrow pointing back at it. Popover is a **neutral surface** (no color axis); role
 * accents belong on whatever the consumer puts inside it.
 *
 * ── The positioner carries NOTHING positional ───────────────────────────────────────────────────
 * `createFloating` writes the layer's `position`/`left`/`top`/`transform` — and its pre-measurement
 * `visibility: hidden` — as an **inline style** on the positioner. A `position`/`inset`/`translate`
 * class here would fight a value only the kernel can know, so the `positioner` slot is stacking
 * (`z-50`) plus a width, and nothing else. The enter/exit `translate` lives on `content`, one level
 * down, for the same reason — a transition on the positioner would animate against the `translate()`
 * that positions it.
 *
 * ── Every width class is additive; none of them is an override ──────────────────────────────────
 * The card is sized one of two ways, and they are mutually exclusive: shrink-wrapped to its content
 * and capped by the size (`w-max` + `max-w-72`), or pinned to the anchor (`w-(--anchor-width)`, no
 * cap at all). Spelling the second as an override of the first — a base `w-max` beaten by a variant
 * `w-*`, a size's `max-w-72` beaten by a `max-w-none` — would make the rendered result depend on
 * variant declaration order inside `tv` and on tailwind-merge resolving the pair, which is a silent
 * failure the moment either changes. So neither competing class is ever emitted:
 *
 *   - `w-max` / `w-(--anchor-width)` are the two values of the `matchAnchorWidth` variant. The
 *     positioner base carries no width.
 *   - `max-w-*` lives in `(size × matchAnchorWidth: false)` compound variants, so a width-matched
 *     card simply never receives one. The `size` variant carries no width.
 *
 * This is `button.ts`'s rule (`px-*` in `(size × iconOnly)` compounds, never on the size base),
 * applied to the same problem. Pinned by `__tests__/popover.test.ts` — the width-matched cases assert
 * the ABSENCE of a `max-w-*`, which an override-based recipe would fail while looking identical.
 *
 * ── Recipe purity ───────────────────────────────────────────────────────────────────────────────
 * Every color is a finished `--hope-*` token: `bg-surface-overlay` (the card and the arrow),
 * `border-subtle` (the hairline — on the card AND on the arrow's outward edges), `text-foreground`/
 * `text-foreground-muted`. No `color-mix`, no alpha modifier, no magic opacity (`opacity-0` is full
 * transparency — legitimate layout). `drop-shadow-md` and `rotate-45` are raw Tailwind utilities
 * (unpoliced). Every class is a literal string for the consumer's `@source` scan.
 *
 * ── The hairline continues around the arrow ─────────────────────────────────────────────────────
 * The arrow is opaque and absolutely positioned, so it paints ABOVE the card's own border (a
 * positioned descendant paints over its parent's background and border): an unbordered arrow stops the
 * card's hairline dead for ~11px and reads as a detached tab. So the arrow borders its two OUTWARD
 * edges, and the card's elevation is a FILTER rather than a box-shadow:
 *
 *   - `border-subtle` is on the arrow's base, unconditionally, with only the two *width* utilities
 *     keyed per side. Tailwind's preflight is `border: 0 solid`, so a bare `border-t` would paint in
 *     `currentColor` — the card's inherited `text-foreground`. `button.ts:310` names the same hazard.
 *   - `drop-shadow-md` replaces `shadow-md` on `content`. A `box-shadow` paints in the card's own
 *     background layer, *beneath* its positioned descendants, so the arrow covers it and casts none of
 *     its own; `filter: drop-shadow()` derives from the rendered subtree's alpha, so it traces the
 *     **card ∪ arrow** silhouette automatically. One token from Tailwind's scale — no hand-maintained
 *     copy of `shadow-md`'s numbers, no per-side classes. An arrow hidden by `data-uncentered:invisible`
 *     contributes no alpha, so an unmeasured arrow correctly casts nothing.
 *
 * ── The arrow sits on the OUTER border edge, which costs one translate ─────────────────────────
 * `PIN_OFFSET` centres the arrow on the popup's **padding-box** edge — the *inner* edge of whatever
 * border a preset draws — because the kernel cannot know a border width it does not author. For a
 * borderless consumer that is exactly right. Here it is one hairline short: the rotated square is
 * widest at its side vertices, so with those on the border's inner edge the card's 1px band still
 * protrudes past the arrow's outward edges at the base, leaving a ~1px burr on each side (it
 * antialiases to a ~0.5px sliver at 1:1 — the whole defect this recipe otherwise fixes, in miniature).
 *
 * So the arrow is nudged **outward by exactly the card's border width**, putting its widest point on
 * the hairline's outer edge, where the composite outline hands off from straight to diagonal with no
 * step. The width is single-sourced as `--popover-card-border` on `content` and inherited by the
 * arrow, for the same reason `--popover-arrow-size` is a property rather than two literals: a
 * hard-coded `1px` here would have to *happen* to match the `border` beside it, and a preset changing
 * one would silently reintroduce the burr. `PIN_OFFSET` itself is untouched, and stays
 * border-width-agnostic for every headless consumer.
 *
 * `box-sizing: border-box` keeps the outer box at `--popover-arrow-size` with or without a border, so
 * the rotated silhouette stays bit-identical.
 *
 * ── The arrow's size is a two-value agreement, spelled once ─────────────────────────────────────
 * `createPopoverArrow` pins the square half-way over the card's edge with
 * `calc(var(--popover-arrow-size, 8px) / -2)`, and the *box* is this slot's. Spelling the two numbers
 * separately (`size-2` + the kernel's `8px` fallback) mispins the arrow by their difference the moment
 * either moves, with no error anywhere — so the slot **sets the property and sizes itself from it**,
 * making the box the single source of truth. The property is unprefixed on purpose: `--hope-*` is the
 * semantic *token* vocabulary, and `check:recipe-purity` rejects any bracketed value naming it. Pinned
 * by `__tests__/popover.test.ts` ("agrees with the primitive's pin offset").
 *
 * `position: absolute` is NOT in the `arrow` slot: the primitive writes it inline alongside the
 * measured offsets, where it always wins. A class here would be dead weight that reads as load-bearing.
 *
 * ── The physical utilities on `content` and `arrow` are correct ────────────────────────────────
 * See the comments beside them — this recipe is the worked example behind the `data-side` rule in
 * `__internal__/theming.md`. Both halves of the gate exempt a `data-side-*`-scoped utility
 * (`MEASURED_SIDE_SCOPED`), so the arrow's border needs no `rtl-ok` escape comment and no per-call-site
 * opt-out: `data-side` reports where the layer LANDED after `flip`, and which two edges of a rotated
 * square face outward follows from that geometry, identically in `ltr` and `rtl`.
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
    // The measured layer. Stacking ONLY — the kernel owns everything positional (header note), and the
    // width belongs to `matchAnchorWidth`, never here: a base `w-max` under a variant `w-*` is exactly
    // the tailwind-merge race the compound structure exists to avoid.
    positioner: "z-50",
    // The card. `relative` so the arrow's absolute pin resolves against it; `flex flex-col` + a per-size
    // `gap` gives the title/description the same rhythm Dialog's content gives its own regions. Width
    // and padding are density values and live per `size`, not here.
    content: [
      // `drop-shadow-md`, NOT `shadow-md` — see the header note. The elevation has to include the arrow,
      // and only a filter derives from the subtree's alpha.
      //
      // The hairline's width is a PROPERTY, not the bare `border` keyword, because the arrow has to
      // cancel it (header note § The arrow sits on the OUTER border edge). It inherits to the arrow,
      // which is a descendant — so the two can never disagree.
      "[--popover-card-border:1px] border-(length:--popover-card-border) border-subtle",
      "relative flex flex-col rounded-lg bg-surface-overlay drop-shadow-md outline-none",
      "text-sm text-foreground",
      // Transition `opacity` + `scale` + `translate`, NOT `transform`: Tailwind v4 compiles `scale-*`
      // and `-translate-y-*` to the standalone `scale`/`translate` properties, so `transition-transform`
      // would never animate either. Faster than Dialog's 200ms — a popover is a light, local surface.
      "transition-[opacity,scale,translate] duration-150 ease-out motion-reduce:transition-none",
      // `createPresence` paints the `entering` frame, then flips to `entered` a frame later — that
      // attribute change is what fires the transition, in both directions. Exit is fade+scale only; the
      // directional slide is an entrance gesture (it reads as "coming from the trigger").
      "data-entering:opacity-0 data-entering:scale-95 data-exiting:opacity-0 data-exiting:scale-95",
      // PHYSICAL ON PURPOSE — the worked example behind the `data-side` rule (`theming.md`). These are
      // keyed on `data-side-*`, which reports where the layer LANDED after `flip`: measured geometry, a
      // physical fact. So a physical slide and a physical origin are the matching answers — a logical
      // variant would need `ltr:`/`rtl:` scoping on every line just to pick the sign back. Neither is a
      // rule-table entry (`transform-origin` has no logical keyword; `translate-*` has no logical form),
      // so both pass `check:rtl-safety` and `assertLogicalPropertyConformance` unmodified. The card
      // slides in from the trigger's direction and scales out of the edge nearest it.
      "data-side-bottom:data-entering:-translate-y-1 data-side-top:data-entering:translate-y-1",
      "data-side-right:data-entering:-translate-x-1 data-side-left:data-entering:translate-x-1",
      "data-side-bottom:origin-top data-side-top:origin-bottom",
      "data-side-right:origin-left data-side-left:origin-right",
    ],
    // A 45°-rotated square straddling the card's edge, carrying the card's hairline around its two
    // OUTWARD edges so the border does not stop dead at the arrow. `data-uncentered` is present until a
    // measurement resolves `centerOffset` to 0, so the arrow starts hidden rather than flashing in a
    // centre it will not keep.
    arrow: [
      "[--popover-arrow-size:0.5rem] size-(--popover-arrow-size)",
      // `border-subtle` sets the COLOUR unconditionally — the inverse of button/badge/alert, which put
      // the width in the base and the colour per variant. Tailwind's preflight is `border: 0 solid`, so
      // a bare width utility falls back to `currentColor` — here the card's inherited `text-foreground`
      // (`button.ts:310` names the same hazard).
      "rotate-45 bg-surface-overlay border-subtle data-uncentered:invisible",
      // PHYSICAL ON PURPOSE, same rule as `content`'s slide/origin below: keyed on `data-side-*`, which
      // reports where the layer landed after `flip`. Which two edges face outward is a fact of the 45°
      // rotation (TL→top, TR→right, BR→bottom, BL→left), not of reading direction — so the pair is
      // IDENTICAL under `dir="rtl"`. See `popover-arrow.md` § The bordered arrow.
      "data-side-bottom:border-t data-side-bottom:border-l",
      "data-side-top:border-b data-side-top:border-r",
      "data-side-right:border-l data-side-right:border-b",
      "data-side-left:border-t data-side-left:border-r",
      // Nudge OUTWARD by exactly the card's border width, so the diamond's widest point lands on the
      // hairline's OUTER edge instead of its inner one — header note § The arrow sits on the OUTER
      // border edge. Same `data-side-*` scope, and `translate-*` is not a rule-table entry either.
      // `translate` composes BEFORE `rotate` (CSS applies translate → rotate → scale) and in the
      // unrotated axes, so these move the arrow straight along the screen axis despite the 45° turn.
      "data-side-bottom:-translate-y-(--popover-card-border)",
      "data-side-top:translate-y-(--popover-card-border)",
      "data-side-right:-translate-x-(--popover-card-border)",
      "data-side-left:translate-x-(--popover-card-border)",
    ],
    // The optional column grouping the title and the description. Layout only — its `gap` is a density
    // value and lives per `size`, tighter there than the same size's region gap on `content`: that is
    // the whole point, since wrapped, the two lines must read as one block set apart from whatever else
    // the card holds. Nothing `shrink-0` like Dialog's twin — that exists to keep a header pinned while
    // the body scrolls, and a popover never scrolls itself.
    header: "flex flex-col",
    title: "font-medium leading-none text-foreground",
    // Prose, muted; a link inside gets the shadcn underline treatment and brightens on hover.
    description: [
      "text-foreground-muted",
      "[&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-foreground",
    ],
    // Placement only — pinned to the trailing-top corner (logical, so it mirrors in `rtl`). The button
    // chrome comes from CloseButton's own recipe, merged under this via its `class` prop.
    closeTrigger: "absolute end-2 top-2",
  },
  variants: {
    // The density axis: the card's padding, the gap between its regions and the tighter one inside the
    // header. Each value is self-contained, so a size applies additively and nothing depends on
    // tailwind-merge stripping a competing base class (neither base `content` nor base `header` carries
    // padding or gap). Anchored to a trigger, so the scale stays narrow: a viewport-filling popover
    // would be a Dialog.
    //
    // The card's MAX WIDTH is not here — it lives in `MAX_WIDTH_COMPOUND_VARIANTS`, keyed by
    // (size × matchAnchorWidth), for the header's reason.
    size: {
      sm: { content: "gap-2 p-2", header: "gap-0.5" },
      md: { content: "gap-2.5 p-2.5", header: "gap-0.5" },
      lg: { content: "gap-3 p-3", header: "gap-1" },
    },
    // Whether the card is pinned to the anchor's measured width. `--anchor-width` is published on the
    // positioner by `createPopoverPositioner` for every popover, measured and device-pixel snapped by
    // `createFloating`'s `size` middleware — this variant only decides whether to spend it.
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
