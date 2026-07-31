/*
 * @hope-ui/presets/hope — Combobox slot recipe.
 *
 * The `tailwind-variants` slot recipe the `@hope-ui/components` `Combobox` reads through
 * `useRecipe("combobox")`. Combobox is Select's sibling over the same kernel, so it is the same
 * **two surfaces in one recipe**: a form control (here a text field) and a floating card (the popup
 * holding the filtered option list). Both scale off the single `size` axis, because a `lg` field
 * opening an `md` list is the one way this can look broken. Combobox is a **neutral** widget (no
 * color axis) — the only accents are the transient highlight and the persistent selection, both
 * token-driven.
 *
 * ── The control half is Select's trigger, taken apart ───────────────────────────────────────────
 * On Select the focusable element IS the box, so one slot carries the border, the background and the
 * `focus-visible:` ring. Here the element that takes DOM focus is the `<input>` *inside* the box, so
 * the same chrome splits three ways and the ring moves with focus:
 *
 * - `control` keeps Select's trigger chrome (rounded, `border-subtle`, `bg-surface-raised`, the
 *   transition) and draws the focus indicator with **`focus-within:`** — the only spelling that
 *   lights the shell when its input is focused.
 * - `input` is deliberately chrome-free: `border-0`, `bg-transparent`, `outline-none`. A height, a
 *   border or a background here would fight the control's, and the resulting double box is the exact
 *   defect this split exists to avoid.
 * - `trigger` is the chevron's hit area and nothing else — no border, no background. `clear` is the
 *   one control-half slot with no Select counterpart: a Select always holds a value once chosen,
 *   while a Combobox's text is erasable.
 *
 * **Neither button gets a focus ring**, and that is not an omission: `createComboboxToggle` and
 * `createComboboxClear` both set `tabindex="-1"`, because the input is the widget's single tab stop.
 * A `focus-visible:` rule on either would be a promise the keyboard can never keep — the whole
 * control-half focus story is the shell's one `focus-within:` ring.
 *
 * `control` carries no hover/press wash, unlike Select's trigger: it is a `<div>`, not a button —
 * the kernel writes `data-pressed` on the chevron button only — and a text field's affordance is the
 * caret, not a wash. It also sets no `select-none`, which would reach the input's own text.
 *
 * ── The popup half is Select's, class for class ─────────────────────────────────────────────────
 * `positioner` / `content` / `list` / `item` / `itemIndicator` / `group` / `groupLabel` /
 * `separator` mirror `select.ts` (which in turn mirrors `listbox.ts`). Combobox does not *compose*
 * Select, so this is a deliberate parallel rather than reuse — but the two must look identical,
 * since they are the same rows on the same card.
 *
 * What Combobox adds is the pair `select.ts` documents as belonging here: `empty` (the no-results
 * message) and `status` (the `role="status"` result count). A `role="listbox"` may only contain
 * options and groups, so both sit in the card **beside** the list — which is exactly why `content`
 * and `list` are separate slots in the first place.
 *
 * ── Highlight is `data-active:` ONLY — never `hover:` / bare `:focus` ────────────────────────────
 * Keyboard navigation and the pointer share a single active index in the primitive
 * (`createListFocus`), so exactly one row carries `data-active` at any time. A `hover:` background
 * would let the cursor's physical position paint a *second* highlight the moment it lagged the
 * active index by a frame. It matters more here than anywhere: a Combobox is activedescendant by
 * construction — focus never leaves the input — so `data-active` is the ONLY signal there is.
 *
 * ── The popup's width is not an axis, so there are no compound variants ─────────────────────────
 * Combobox has **one** width: the popup matches the control, always, via the `--anchor-width`
 * `createComboboxPositioner` publishes. So `w-(--anchor-width)` sits in the positioner base, alone,
 * and no variant ever emits a competing width — the ordering hazard `popover.ts` spends
 * `compoundVariants` to avoid never arises. The `min-w-*` floor per size is a different property,
 * applied to the control and the positioner with the *same* value, so a narrow control and its popup
 * stay in step.
 *
 * `max-h-(--available-height)` on `content` is the same deal for height: the kernel measures the gap
 * to the viewport edge, the card caps itself there, and `list` scrolls inside it. `overflow-y-auto`
 * on a column flex child is also what zeroes its automatic minimum size, so the list actually shrinks
 * instead of pushing the card past the cap — and `shrink-0` on `status` is what keeps the pinned
 * result count from being the thing that collapses instead.
 *
 * ── Recipe purity ───────────────────────────────────────────────────────────────────────────────
 * Every color is a finished `--hope-*` token: `bg-surface-raised` + its `-hovered`/`-pressed` twins
 * (the clear button's wash), `border-subtle` (the hairlines), `bg-surface-overlay` (the card),
 * `bg-active`/`text-on-active` (the highlight), `focus`/`focus-halo` (the ring), `text-foreground`/
 * `-muted`/`-subtle` (content, group labels, the placeholder), `opacity-disabled` (the disabled dim
 * — an opacity *token*, not a magic number). No `color-mix`, no alpha modifier, no magic opacity.
 * Every class is a literal string so the consumer's `@source` scan can see it.
 *
 * ── RTL ─────────────────────────────────────────────────────────────────────────────────────────
 * Every inset is logical (`ps-*`, `pe-8`, `end-2`, `px-*`, `text-start`) — the indicator gutter is
 * reserved on the side the text *ends*, so it mirrors with the locale. The two physical utilities
 * are the enter-slide and the scale origin on `content`, both scoped to `data-side-*`: that reports
 * where the layer LANDED after `flip`, which is measured geometry rather than reading direction, so
 * the pair is identical under `dir="rtl"`. Same exemption `select.ts` and `popover.ts` document.
 */

import { tv } from "@hope-ui/theming";

/**
 * hope's Combobox slot recipe — used as-is by the component (`recipe(props).item()`), no adapter.
 * `hopeRecipes` (in `./index`) checks it against the `combobox` contract in `@hope-ui/theming`.
 */
export const comboboxRecipe = tv({
  slots: {
    // The bordered shell holding the input, the clear button and the chevron trigger. Select's
    // trigger chrome, minus the wash (see the header note), with the focus indicator drawn on
    // `focus-within:` because the element that takes DOM focus is a descendant. Height / padding /
    // gap / min width are density values and live per `size`, not here.
    control: [
      "relative inline-flex items-center",
      "rounded-md border border-subtle bg-surface-raised text-foreground",
      "transition-[background-color,border-color,box-shadow] duration-150 ease-out",
      // The shared focus indicator every hope control uses — the border takes the focus color and
      // the halo is the finished translucent token, never an alpha modifier over `focus`.
      "focus-within:border-focus focus-within:ring-3 focus-within:ring-focus-halo",
      // The whole widget dims and stops taking the pointer as one; the component writes
      // `data-disabled` here rather than on each descendant.
      "data-disabled:cursor-not-allowed data-disabled:pointer-events-none data-disabled:opacity-disabled",
    ],
    // The `role="combobox"` text field. Chrome-free by design: the control owns the box, so a border,
    // a background or a ring here would draw a second one inside it. `min-w-0` + `flex-1` is what
    // lets it shrink inside the flex row instead of pushing the buttons out. The empty state is the
    // native `placeholder:` pseudo-element, which is why there is no placeholder slot.
    input: [
      "min-w-0 flex-1 cursor-text border-0 bg-transparent outline-none",
      "text-foreground placeholder:text-foreground-subtle",
    ],
    // The reset button (Combobox's text is erasable, unlike a Select's chosen value). It is the one
    // control-half slot with a wash — guarded against the pressed state so the two never fight,
    // exactly as CloseButton spells it — since it is the only pointer target here that *changes* the
    // value rather than opening the popup. Its glyph is a touch smaller than the chevron's: of the
    // two affordances in the gutter, this is the secondary one.
    //
    // NO focus ring, for the same reason the chevron has none: `createComboboxClear` gives it
    // `tabindex="-1"`, because the input is the widget's single tab stop. A `focus-visible:` rule
    // here would be a promise the keyboard can never keep.
    clear: [
      "inline-flex shrink-0 items-center justify-center rounded-sm outline-none",
      "text-foreground-muted transition-[background-color,color] duration-150 ease-out",
      "hover:not-data-pressed:bg-surface-raised-hovered data-pressed:bg-surface-raised-pressed",
      "[&_svg]:size-3.5",
    ],
    // The chevron button — the glyph's hit area and nothing else: the control draws the border, the
    // background and the ring. `cursor-default` because it opens a listbox rather than navigating,
    // and no wash, so the gutter's two buttons don't both light up under one cursor sweep.
    trigger:
      "inline-flex shrink-0 cursor-default items-center justify-center rounded-sm select-none outline-none text-foreground-muted",
    // The chevron's box. `pointer-events-none` so the glyph is never the pointer target over the
    // button. Size-independent chrome, so it stays here.
    icon: "pointer-events-none inline-flex shrink-0 items-center justify-center text-foreground-muted [&_svg]:size-4",
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
      // `flip`, so a physical slide and origin are the matching answers. Combobox is vertical-only in
      // practice (a listbox popup flips top↔bottom, never left↔right), so only that pair is spelled.
      "data-side-bottom:data-entering:-translate-y-1 data-side-top:data-entering:translate-y-1",
      "data-side-bottom:origin-top data-side-top:origin-bottom",
    ],
    // The `role="listbox"` scroll container. `overscroll-contain` stops a scroll that reaches the end
    // of the list from chaining to the page behind it. Its `overflow-y-auto` is also what zeroes the
    // automatic minimum size of this flex child, so it shrinks inside the card's `max-h` cap rather
    // than pushing past it. Padding is a density value and lives per `size`.
    list: "overflow-y-auto overscroll-contain outline-none",
    // The no-results message — a sibling of the list, never a child of it, because `role="listbox"`
    // admits only options and groups. Centred and muted: it is an explanation, not a row. Padding
    // and text are density values and live per `size`.
    empty: "text-center text-foreground-muted",
    // The `role="status"` result count, pinned under the list. Not visually hidden — a live region a
    // sighted user reads too — so it takes a top hairline to separate it from the rows. `shrink-0`
    // keeps the card's `max-h` cap collapsing the scrolling list rather than this.
    status: "shrink-0 border-t border-subtle text-foreground-muted",
    // A `role="group"` section — vertical rhythm around each labelled section; no horizontal inset,
    // so grouped rows stay aligned with ungrouped ones.
    group: "not-last:pb-1",
    // The group's label — small, muted, non-interactive.
    groupLabel: "px-1.5 py-1 text-xs text-foreground-muted",
    // A hairline divider between sections; it never takes the pointer.
    separator: "my-1 h-px bg-subtle pointer-events-none",
    // An `role="option"` row. `relative` anchors the absolute `itemIndicator`; `pe-8` reserves the
    // trailing glyph gutter. Highlight is `data-active:` ONLY (header note). Text / padding / gap are
    // density values and live per `size`.
    item: "relative flex cursor-default items-center rounded-md pe-8 outline-none select-none data-active:bg-active data-active:text-on-active data-disabled:pointer-events-none data-disabled:opacity-disabled [&_svg]:size-4",
    // The row's label. `min-w-0` + `flex-1` is what lets `truncate` engage inside the flex row —
    // without it the text would push the indicator out instead of ellipsizing.
    itemText: "min-w-0 flex-1 truncate",
    // The chosen-row check glyph — pinned in the reserved `pe-8` gutter, inheriting the row's color.
    itemIndicator: "absolute end-2 flex items-center justify-center [&_svg]:size-4",
  },
  variants: {
    // `size` owns the full density set on BOTH surfaces — the control's height/padding/gap and its
    // min width, the input's text, the popup's matching min width and padding, the row's
    // text/padding/gap, and the two card-level messages. Each size is self-contained (no base carries
    // a competing density class), so a size applies additively and nothing relies on tailwind-merge
    // resolution. The control and the positioner take the SAME `min-w-*`, so a narrow control and its
    // popup never disagree.
    size: {
      sm: {
        control: "h-8 gap-1.5 px-2 min-w-32",
        input: "text-xs",
        positioner: "min-w-32",
        list: "p-1",
        empty: "px-2 py-4 text-xs",
        status: "px-2 py-1 text-xs",
        item: "gap-1 py-0.5 ps-1 text-xs",
      },
      md: {
        control: "h-9 gap-2 px-2.5 min-w-36",
        input: "text-sm",
        positioner: "min-w-36",
        list: "p-1",
        empty: "px-3 py-6 text-sm",
        status: "px-3 py-1.5 text-xs",
        item: "gap-1.5 py-1 ps-1.5 text-sm",
      },
      lg: {
        control: "h-10 gap-2 px-3 min-w-40",
        input: "text-base",
        positioner: "min-w-40",
        list: "p-1.5",
        empty: "px-3 py-8 text-base",
        status: "px-3 py-2 text-sm",
        item: "gap-2 py-1.5 ps-2 text-base",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
