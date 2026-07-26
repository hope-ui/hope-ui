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
 * `border-subtle` (the hairline), `text-foreground`/`text-foreground-muted`. No `color-mix`, no alpha
 * modifier, no magic opacity (`opacity-0` is full transparency — legitimate layout). `shadow-md` and
 * `rotate-45` are raw Tailwind utilities (unpoliced). Every class is a literal string for the
 * consumer's `@source` scan.
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
 * ── The physical utilities on `content` are correct ─────────────────────────────────────────────
 * See the comment beside them — this slot is the worked example behind the `data-side` rule in
 * `__internal__/theming.md`.
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
      "relative flex flex-col rounded-lg border border-subtle bg-surface-overlay shadow-md outline-none",
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
    // A 45°-rotated square straddling the card's edge. Borderless in v1: the outward two edges of a
    // rotated square are a fact of the rotation, not of reading direction, and
    // `assertLogicalPropertyConformance` takes no allowlist — so a direction-invariant border would have
    // to be spelled `ltr:`+`rtl:` twice per side to pass a check whose premise does not apply to it
    // (`popover-arrow.md` § Borderless in v1). `data-uncentered` is present until a measurement resolves
    // `centerOffset` to 0, so the arrow starts hidden rather than flashing in a centre it will not keep.
    arrow: [
      "[--popover-arrow-size:0.5rem] size-(--popover-arrow-size)",
      "rotate-45 bg-surface-overlay data-uncentered:invisible",
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
