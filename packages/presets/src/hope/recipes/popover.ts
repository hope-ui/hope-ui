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
 * class here would fight a value only the kernel can know, so the `positioner` slot is stacking and
 * sizing only (`z-50 w-max`: shrink-wrap the card so floating-ui measures its real width). The
 * enter/exit `translate` lives on `content`, one level down, for the same reason — a transition on the
 * positioner would animate against the `translate()` that positions it.
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

import { tv } from "@hope-ui/theming";

/**
 * hope's Popover slot recipe — used as-is by the component (`recipe(props).content()`), no adapter.
 * `hopeRecipes` (in `./index`) checks it against the `popover` contract in `@hope-ui/theming`.
 */
export const popoverRecipe = tv({
  slots: {
    // The measured layer. Stacking + sizing ONLY — the kernel owns everything positional (header note).
    positioner: "z-50 w-max",
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
    title: "text-base font-medium leading-none text-foreground",
    // Prose, muted; a link inside gets the shadcn underline treatment and brightens on hover.
    description: [
      "text-sm text-foreground-muted",
      "[&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-foreground",
    ],
    // Placement only — pinned to the trailing-top corner (logical, so it mirrors in `rtl`). The button
    // chrome comes from CloseButton's own recipe, merged under this via its `class` prop.
    closeTrigger: "absolute end-2 top-2",
  },
  variants: {
    // The single axis. `size` owns the full density set — the card's max width, its padding, and the
    // gap between its regions — and each value is self-contained, so a size applies additively and
    // nothing depends on tailwind-merge stripping a competing base class (the base `content` carries no
    // width, padding or gap). Anchored to a trigger, so the scale stays narrow: a viewport-filling
    // popover would be a Dialog.
    size: {
      sm: { content: "max-w-56 gap-1 p-2.5" },
      md: { content: "max-w-72 gap-1.5 p-3" },
      lg: { content: "max-w-96 gap-2 p-4" },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
