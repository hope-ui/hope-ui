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
 * - `trigger` and `clear` are the two buttons in the end gutter — square hit areas with their own
 *   wash and radius, but no border and no background of their own. `clear` is the one with no Select
 *   counterpart: a Select always holds a value once chosen, while a Combobox's text is erasable.
 *
 * **Neither button gets a focus ring**, and that is not an omission: `createComboboxToggle` and
 * `createComboboxClear` both set `tabindex="-1"`, because the input is the widget's single tab stop.
 * A `focus-visible:` rule on either would be a promise the keyboard can never keep — the whole
 * control-half focus story is the shell's one `focus-within:` ring.
 *
 * The two buttons are styled **identically** — same square box, same wash, same per-size height,
 * radius and glyph. They share one gutter, so a difference between them reads as a difference in
 * kind rather than in purpose, and the wash is what tells a pointer user which of the two it is over.
 *
 * `control` itself carries no wash — like Select's trigger, and for a reason of its own on top: it is
 * a `<div>`, not a button (the kernel writes `data-pressed` on the buttons), and a text field's
 * affordance is the caret. It also sets no `select-none`, which would reach the input's own text.
 *
 * ── The popup half is Select's, class for class ─────────────────────────────────────────────────
 * `positioner` / `content` / `list` / `item` / `itemIndicator` / `group` / `groupLabel` /
 * `separator` mirror `select.ts` (which in turn mirrors `listbox.ts`) — down to the per-size row
 * density and glyph box. Combobox does not *compose* Select, so this is a deliberate parallel rather
 * than reuse — but the two must look identical, since they are the same rows on the same card.
 * **Select is the visual source of truth**: a change made here alone is the bug.
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
 * Every inset is logical (`ps-*`, `pe-*`, `end-1`, `text-start`) — the indicator gutter is
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
      "rounded-lg border border-subtle bg-surface-raised text-foreground",
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
    //
    // Height is the one metric it does take, and it takes the *control's* (per `size`): a bare line
    // box would leave a dead strip above and below the text where a click lands on the shell instead
    // of the field, and a click there must put the caret in the input.
    input: [
      "min-w-0 flex-1 cursor-text border-0 bg-transparent outline-none",
      "text-foreground placeholder:text-foreground-subtle",
    ],
    // The reset button (Combobox's text is erasable, unlike a Select's chosen value) — the only
    // pointer target here that *changes* the value rather than opening the popup. `aspect-square`
    // over the per-size height is what makes it a square tap target without a second width class to
    // keep in step; the wash is guarded against the pressed state so the two never fight, exactly as
    // CloseButton spells it. Height / radius / glyph box are density values and live per `size`.
    //
    // NO focus ring, for the same reason the chevron has none: `createComboboxClear` gives it
    // `tabindex="-1"`, because the input is the widget's single tab stop. A `focus-visible:` rule
    // here would be a promise the keyboard can never keep.
    clear: [
      "aspect-square inline-flex shrink-0 items-center justify-center outline-none",
      "text-foreground-muted transition-[background-color,color] duration-150 ease-out",
      "hover:not-data-pressed:bg-surface-raised-hovered data-pressed:bg-surface-raised-pressed",
    ],
    // The chevron button — the glyph's hit area, drawn as `clear`'s twin: same square box, same wash,
    // same per-size height / radius / glyph box. The two sit side by side in one gutter, so a button
    // that lit up differently from its neighbour would read as a different kind of control. The
    // control still draws the border, the background and the ring; neither button draws its own.
    trigger: [
      "aspect-square inline-flex shrink-0 items-center justify-center select-none outline-none",
      "text-foreground-muted transition-[background-color,color] duration-150 ease-out",
      "hover:not-data-pressed:bg-surface-raised-hovered data-pressed:bg-surface-raised-pressed",
    ],
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
    // trailing glyph gutter. Highlight is `data-active:` ONLY (header note). Text / padding / gap /
    // radius / glyph box are density values and live per `size`.
    item: "relative flex cursor-default items-center pe-8 outline-none select-none data-active:bg-active data-active:text-on-active data-disabled:pointer-events-none data-disabled:opacity-disabled",
    // The row's label. `min-w-0` + `flex-1` is what lets `truncate` engage inside the flex row —
    // without it the text would push the indicator out instead of ellipsizing.
    itemText: "min-w-0 flex-1 truncate",
    // The chosen-row check glyph — pinned in the reserved `pe-8` gutter, inheriting the row's color.
    // Its inset and glyph box scale with the row, so both live per `size`.
    itemIndicator: "absolute flex items-center justify-center",
  },
  variants: {
    // `size` owns the full density set on BOTH surfaces — the control's height/padding/gap and its
    // min width, the input's height and text, both gutter buttons' height/radius/glyph box, the
    // popup's matching min width and padding, the row's text/padding/gap/radius/glyph box, the
    // indicator's inset and glyph box, and the two card-level messages. Each size is self-contained
    // (no base carries a competing density class), so a size applies additively and nothing relies on
    // tailwind-merge resolution. The control and the positioner take the SAME `min-w-*`, so a narrow
    // control and its popup never disagree.
    //
    // The control's height matches Select's trigger and the popup half matches Select's rows — the
    // two widgets sit side by side in a form. The end gutter is `pe-1` rather than Select's `pe-2`
    // because what sits in it is a *button* whose own wash needs room to read as a box, not a bare
    // chevron; the button is one size step under the control (`h-5`/`h-6`/`h-7` inside
    // `h-7`/`h-8`/`h-9`), which is what leaves that room symmetric.
    size: {
      sm: {
        control: "h-7 gap-0.5 ps-2.5 pe-1 min-w-32",
        input: "h-7 text-xs",
        clear: "h-5 rounded-sm [&_svg]:size-3.5",
        trigger: "h-5 rounded-sm",
        icon: "[&_svg]:size-3.5",
        positioner: "min-w-32",
        list: "p-1",
        empty: "px-2 py-4 text-xs",
        status: "px-2 py-1 text-xs",
        item: "text-xs gap-1 py-1.5 ps-1.5 rounded-sm [&_svg]:size-3.5",
        itemIndicator: "end-1 [&_svg]:size-3.5",
      },
      md: {
        control: "h-8 gap-1 ps-2.5 pe-1 min-w-36",
        input: "h-8 text-sm",
        clear: "h-6 rounded-md [&_svg]:size-4",
        trigger: "h-6 rounded-md",
        icon: "[&_svg]:size-4",
        positioner: "min-w-36",
        list: "p-1",
        empty: "px-3 py-6 text-sm",
        status: "px-3 py-1.5 text-xs",
        item: "text-sm gap-1.5 py-1.5 ps-1.5 rounded-md [&_svg]:size-4",
        itemIndicator: "end-1 [&_svg]:size-4",
      },
      lg: {
        control: "h-9 gap-1 ps-2.5 pe-1 min-w-40",
        input: "h-9 text-base",
        clear: "h-7 rounded-md [&_svg]:size-4.5",
        trigger: "h-7 rounded-md",
        icon: "[&_svg]:size-4.5",
        positioner: "min-w-40",
        list: "p-1",
        empty: "px-3 py-8 text-base",
        status: "px-3 py-2 text-sm",
        item: "text-base gap-2 py-1.5 ps-1.5 rounded-md [&_svg]:size-4.5",
        itemIndicator: "end-1 [&_svg]:size-4.5",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
