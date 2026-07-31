/*
 * @hope-ui/presets/hope — Select slot recipe.
 *
 * The `tailwind-variants` slot recipe the `@hope-ui/components` `Select` reads through
 * `useRecipe("select")`. Select is **two surfaces in one recipe**: a form control (the
 * `role="combobox"` trigger showing the current value and a chevron) and a floating card (the popup
 * holding the option list). Both scale off the single `size` axis, because a `lg` control opening an
 * `md` list is the one way this can look broken. Select is a **neutral** widget (no color axis) —
 * the only accents are the transient highlight and the persistent selection, both token-driven.
 *
 * ── The row half is Listbox's, deliberately ─────────────────────────────────────────────────────
 * `item` / `itemIndicator` / `group` / `groupLabel` / `separator` mirror `listbox.ts` class for
 * class — and `combobox.ts` mirrors both. Select does not *compose* the Listbox component (its Root
 * owns its own `createListbox`, and its recipe is standalone-first with no popup chrome), so this is
 * a deliberate parallel rather than reuse — but the three must look identical, since they are the
 * same rows. **This file is the visual source of truth**: a row change lands here first, then in
 * `listbox.ts` and `combobox.ts` in the same commit.
 *
 * What Select adds on top is exactly the chrome `listbox.ts` leaves out and documents as belonging
 * here: the elevated surface, the border, the shadow, the rounded corners and the panel padding.
 *
 * ── Highlight is `data-active:` ONLY — never `hover:` / bare `:focus` ────────────────────────────
 * Keyboard navigation and the pointer share a single active index in the primitive
 * (`createListFocus`), so exactly one row carries `data-active` at any time. A `hover:` background
 * would let the cursor's physical position paint a *second* highlight the moment it lagged the
 * active index by a frame. The same reasoning as `listbox.ts`, and it matters more here: in
 * activedescendant mode no option ever holds DOM focus, so `data-active` is the ONLY signal there is.
 *
 * ── The popup's width is not an axis, so there are no compound variants ─────────────────────────
 * `popover.ts` spells its two mutually exclusive widths as separate variant *values* plus
 * `compoundVariants`, never as an override, because a base `w-max` beaten by a variant `w-*` makes
 * the result depend on declaration order and on tailwind-merge resolving the pair. That machinery is
 * unnecessary here because Select has **one** width: the popup matches the trigger, always, via the
 * `--anchor-width` `createComboboxPositioner` publishes. So `w-(--anchor-width)` sits in the
 * positioner base, alone, and no variant ever emits a competing width. The `min-w-*` floor per size
 * is a different property, applied to the trigger and the positioner with the *same* value, so a
 * narrow trigger and its popup stay in step.
 *
 * `max-h-(--available-height)` on `content` is the same deal for height: the kernel measures the gap
 * to the viewport edge, the card caps itself there, and `list` scrolls inside it. `overflow-y-auto`
 * on a column flex child is also what zeroes its automatic minimum size, so the list actually shrinks
 * instead of pushing the card past the cap.
 *
 * ── Recipe purity ───────────────────────────────────────────────────────────────────────────────
 * Every color is a finished `--hope-*` token: `bg-surface-raised` (the control), `border-subtle`
 * (the hairlines), `bg-surface-overlay` (the card), `bg-active`/`text-on-active` (the highlight),
 * `focus`/`focus-halo` (the ring), `text-foreground`/`-muted`/`-subtle` (content, group labels, the
 * placeholder), `opacity-disabled` (the disabled dim — an opacity *token*, not a magic number). No
 * `color-mix`, no alpha modifier, no magic opacity. Every class is a literal string so the
 * consumer's `@source` scan can see it.
 *
 * ── RTL ─────────────────────────────────────────────────────────────────────────────────────────
 * Every inset is logical (`ps-*`, `pe-*`, `end-1`, `text-start`) — the indicator gutter is
 * reserved on the side the text *ends*, so it mirrors with the locale. The two physical utilities
 * are the enter-slide and the scale origin on `content`, both scoped to `data-side-*`: that reports
 * where the layer LANDED after `flip`, which is measured geometry rather than reading direction, so
 * the pair is identical under `dir="rtl"`. Same exemption `popover.ts` documents at length.
 */

import { tv } from "@hope-ui/theming";

/**
 * hope's Select slot recipe — used as-is by the component (`recipe(props).item()`), no adapter.
 * `hopeRecipes` (in `./index`) checks it against the `select` contract in `@hope-ui/theming`.
 */
export const selectRecipe = tv({
  slots: {
    // The `role="combobox"` button. A raised control on the page surface, with the value pushed to
    // the start and the chevron to the end once a consumer widens it. `cursor-default` because it
    // opens a listbox rather than navigating. Height / padding / text / gap / min width are density
    // values and live per `size`, not here.
    trigger: [
      "relative inline-flex items-center justify-between select-none cursor-default",
      "rounded-lg border border-subtle bg-surface-raised text-foreground outline-none",
      "transition-[background-color,border-color,box-shadow] duration-150 ease-out",
      // The shared focus indicator every hope control uses: the border takes the focus color and the
      // halo is the finished translucent token, never an alpha modifier over `focus`.
      "focus-visible:border-focus focus-visible:ring-3 focus-visible:ring-focus-halo",
      "data-disabled:cursor-not-allowed data-disabled:pointer-events-none data-disabled:opacity-disabled",
    ],
    // The current selection's text. `min-w-0` + `flex-1` is what lets `truncate` engage inside the
    // flex row — without it the text would push the chevron out instead of ellipsizing. The empty
    // state is this slot's `data-placeholder:` variant (written by `createComboboxValue`), which is
    // why there is no `placeholder` slot.
    value: "min-w-0 flex-1 truncate text-start data-placeholder:text-foreground-subtle",
    // The chevron's box. `pointer-events-none` so the glyph is never the pointer target over the
    // button. The glyph box itself is a density value and lives per `size`.
    icon: "pointer-events-none inline-flex shrink-0 items-center justify-center text-foreground-muted",
    // The measured layer. Stacking + the anchor-matched width, and NOTHING positional: the kernel
    // writes `position`/`left`/`top`/`transform` (and the pre-measurement `visibility: hidden`) as an
    // inline style, which a class here would fight.
    positioner: "z-50 w-(--anchor-width)",
    // The card. `overflow-hidden` keeps the rounded corners over the scrolling list; the cap comes
    // from the kernel's measured `--available-height`, so the popup shrinks near the viewport edge
    // instead of running off it. Padding is a density value and lives per `size`, not here.
    content: [
      "flex flex-col overflow-hidden max-h-(--available-height)",
      "rounded-lg border border-subtle bg-surface-overlay text-foreground shadow-md outline-none",
      // Transition `opacity` + `scale` + `translate`, NOT `transform`: Tailwind v4 compiles `scale-*`
      // and `-translate-y-*` to the standalone `scale`/`translate` properties, so
      // `transition-transform` would never animate either.
      "transition-[opacity,scale,translate] duration-150 ease-out motion-reduce:transition-none",
      // `createPresence` paints the `entering` frame, then flips to `entered` a frame later — that
      // attribute change is what fires the transition, in both directions.
      "data-entering:opacity-0 data-entering:scale-95 data-exiting:opacity-0 data-exiting:scale-95",
      // PHYSICAL ON PURPOSE — see the header note. `data-side` reports where the layer landed after
      // `flip`, so a physical slide and origin are the matching answers. Select is vertical-only in
      // practice (a listbox popup flips top↔bottom, never left↔right), so only that pair is spelled.
      "data-side-bottom:data-entering:-translate-y-1 data-side-top:data-entering:translate-y-1",
      "data-side-bottom:origin-top data-side-top:origin-bottom",
    ],
    // The `role="listbox"` scroll container. `overscroll-contain` stops a scroll that reaches the end
    // of the list from chaining to the page behind it. Its `overflow-y-auto` is also what zeroes the
    // automatic minimum size of this flex child, so it shrinks inside the card's `max-h` cap rather
    // than pushing past it. Padding is a density value and lives per `size`.
    list: "overflow-y-auto overscroll-contain outline-none",
    // A `role="group"` section — vertical rhythm around each labelled section; no horizontal inset,
    // so grouped rows stay aligned with ungrouped ones.
    group: "not-last:pb-1",
    // The group's label — small, muted, non-interactive.
    groupLabel: "px-1.5 py-1 text-xs text-foreground-muted",
    // A hairline divider between sections; it never takes the pointer.
    separator: "my-1 h-px bg-subtle pointer-events-none",
    // An `role="option"` row. `relative` anchors the absolute `itemIndicator`; `pe-8` reserves the
    // trailing glyph gutter. Highlight is `data-active:` ONLY (header note). Text / padding / gap /
    // radius / glyph box are density values and live per `size`.
    item: "relative flex cursor-default items-center pe-8 outline-none select-none data-active:bg-active data-active:text-on-active data-disabled:pointer-events-none data-disabled:opacity-disabled",
    // The row's label. Same `min-w-0` + `flex-1` reason as `value`: truncate needs a shrinkable box.
    itemText: "min-w-0 flex-1 truncate",
    // The chosen-row check glyph — pinned in the reserved `pe-8` gutter, inheriting the row's color.
    // Its inset and glyph box scale with the row, so both live per `size`.
    itemIndicator: "absolute flex items-center justify-center",
  },
  variants: {
    // `size` owns the full density set on BOTH surfaces — the control's height/padding/text/gap, its
    // min width and its chevron glyph box, the popup's matching min width and padding, the row's
    // text/padding/gap/radius/glyph box, and the indicator's inset and glyph box. Each size is
    // self-contained (no base carries a competing density class), so a size applies additively and
    // nothing relies on tailwind-merge resolution. The trigger and the positioner take the SAME
    // `min-w-*`, so a narrow trigger and its popup never disagree.
    //
    // The row's *vertical* padding is deliberately constant (`py-1.5`) — the type scale and the glyph
    // box carry the density, and a second size-varying term made `sm` rows read as cramped.
    size: {
      sm: {
        trigger: "h-7 gap-1.5 ps-2.5 pe-2 text-xs min-w-32",
        icon: "[&_svg]:size-3.5",
        positioner: "min-w-32",
        list: "p-1",
        item: "text-xs gap-1 py-1.5 ps-1.5 rounded-sm [&_svg]:size-3.5",
        itemIndicator: "end-1 [&_svg]:size-3.5",
      },
      md: {
        trigger: "h-8 gap-2 ps-2.5 pe-2 text-sm min-w-36",
        icon: "[&_svg]:size-4",
        positioner: "min-w-36",
        list: "p-1",
        item: "text-sm gap-1.5 py-1.5 ps-1.5 rounded-md [&_svg]:size-4",
        itemIndicator: "end-1 [&_svg]:size-4",
      },
      lg: {
        trigger: "h-9 gap-2 ps-2.5 pe-2 text-base min-w-40",
        icon: "[&_svg]:size-4.5",
        positioner: "min-w-40",
        list: "p-1",
        item: "text-base gap-2 py-1.5 ps-1.5 rounded-md [&_svg]:size-4.5",
        itemIndicator: "end-1 [&_svg]:size-4.5",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
