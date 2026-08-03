/*
 * @hope-ui/presets/hope — Select slot recipe.
 *
 * A *slot recipe*: `tv` (tailwind-variants) maps variant props to one class string per named part
 * ("slot"), and `@hope-ui/components`' Select reads it through `useRecipe("select")`. Select is two
 * surfaces in one recipe — a form control (the `role="combobox"` trigger) and a floating card holding
 * the option list — both scaled off the single `size` axis, because a `lg` control opening an `md`
 * list is the one way this can look broken. Neutral widget, no color axis: the only accents are the
 * transient highlight and the persistent selection, both token-driven.
 *
 * ── The row half is Listbox's, deliberately ─────────────────────────────────────────────────────
 * `item`/`itemIndicator`/`group`/`groupLabel`/`separator` mirror `listbox.ts` class for class, and
 * `combobox.ts` mirrors both. Select does not *compose* the Listbox component — its Root owns its own
 * `createListbox` — so this is a deliberate parallel rather than reuse, but the three are the same
 * rows and must look identical. **This file is the visual source of truth**: a row change lands here
 * first, then in `listbox.ts` and `combobox.ts` in the same commit. What Select adds on top is exactly
 * the chrome `listbox.ts` leaves out: the elevated surface, border, shadow, radius and panel padding.
 *
 * ── Highlight is `data-active:` ONLY — never `hover:` / bare `:focus` ────────────────────────────
 * Keyboard and pointer share one active index in the primitive (`createListFocus`), so exactly one row
 * carries `data-active` at a time. A `hover:` background would let the cursor's physical position
 * paint a *second* highlight the moment it lagged that index by a frame — and in activedescendant mode
 * no option ever holds DOM focus, so `data-active` is the ONLY signal there is.
 *
 * ── One width and one height cap, so no compound variants ───────────────────────────────────────
 * `popover.ts` spells its two mutually exclusive widths as separate variant *values* plus
 * `compoundVariants` (entries applying only when several variants match), never as an override,
 * because a base `w-max` beaten by a variant `w-*` makes the result depend on declaration order and on
 * tailwind-merge resolving the pair. That machinery is unnecessary here: Select has ONE width — the
 * popup matches the trigger, always, via the `--anchor-width` `createComboboxPositioner` publishes —
 * so `w-(--anchor-width)` sits alone in the positioner base and no variant emits a competing one. The
 * per-size `min-w-*` floor is a different property, applied to trigger and positioner with the *same*
 * value. `max-h-(--available-height)` on `content` is the same deal for height, and `list`'s
 * `overflow-y-auto` also zeroes its automatic minimum size, so it shrinks inside the cap instead of
 * pushing the card past it.
 *
 * ── Recipe purity ───────────────────────────────────────────────────────────────────────────────
 * Every color is a *finished* `--hope-*` design token (`bg-surface-raised`, `border-subtle`,
 * `bg-active`/`text-on-active`, `focus-halo`, `opacity-disabled`…) — never one this recipe computes:
 * no `color-mix`, no alpha modifier (`bg-x/50`), no magic opacity. Derived colors are authored as
 * tokens in the preset's `theme.css` instead. Enforced by `pnpm check:recipe-purity`. Every class is a
 * literal string, because the consumer's Tailwind build only emits utilities it can find by scanning
 * this file (`@source "./recipes"`) — a `bg-${role}` template is invisible to it.
 *
 * ── RTL ─────────────────────────────────────────────────────────────────────────────────────────
 * Every inset is *logical* (`ps-`/`pe-`/`end-`/`text-start`), never the physical `l`/`r` twin, so the
 * indicator gutter is reserved on the side the text *ends* and mirrors with the locale. The two
 * physical utilities are the enter-slide and the scale origin on `content`, both scoped to
 * `data-side-*`: that reports where the layer LANDED after `flip` — measured geometry, not reading
 * direction — so the pair is identical under `dir="rtl"`. Same exemption `popover.ts` documents at
 * length.
 */

import { tv } from "@hope-ui/theming";

/**
 * hope's Select slot recipe — used as-is by the component (`recipe(props).item()`), no adapter.
 * `hopeRecipes` (in `./index`) checks it against the `select` contract in `@hope-ui/theming`.
 */
export const selectRecipe = tv({
  slots: {
    // The `role="combobox"` button. `cursor-default` because it opens a listbox rather than
    // navigating. Height, padding, text, gap and min width are density values and live per `size`.
    trigger: [
      "relative inline-flex items-center justify-between select-none cursor-default",
      "rounded-lg border border-subtle bg-surface-raised text-foreground outline-none",
      "transition-[background-color,border-color,box-shadow] duration-150 ease-out",
      // The shared focus indicator every hope control uses. `focus-halo` is a finished translucent
      // token, never an alpha modifier over `focus`.
      "focus-visible:border-focus focus-visible:ring-3 focus-visible:ring-focus-halo",
      "data-disabled:cursor-not-allowed data-disabled:pointer-events-none data-disabled:opacity-disabled",
    ],
    // `min-w-0` + `flex-1` is what lets `truncate` engage inside the flex row — without it the text
    // would push the chevron out instead of ellipsizing. The empty state is this slot's
    // `data-placeholder:` variant (written by `createComboboxValue`), hence no `placeholder` slot.
    value: "min-w-0 flex-1 truncate text-start data-placeholder:text-foreground-subtle",
    // `pointer-events-none` so the glyph is never the pointer target over the button. The glyph box is
    // a density value and lives per `size`.
    icon: "pointer-events-none inline-flex shrink-0 items-center justify-center text-foreground-muted",
    // The measured layer: stacking and the anchor-matched width only. Nothing positional — the kernel
    // writes `position`/`left`/`top`/`transform` (and a pre-measurement `visibility: hidden`) as an
    // inline style, which a class here would fight.
    positioner: "z-50 w-(--anchor-width)",
    // `overflow-hidden` keeps the rounded corners over the scrolling list; the cap comes from the
    // kernel's measured `--available-height`, so the popup shrinks near the viewport edge instead of
    // running off it. Padding is a density value and lives per `size`.
    content: [
      "flex flex-col overflow-hidden max-h-(--available-height)",
      "rounded-lg border border-subtle bg-surface-overlay text-foreground shadow-md outline-none",
      // Transition `opacity`/`scale`/`translate`, NOT `transform`: Tailwind v4 compiles `scale-*` and
      // `-translate-y-*` to the standalone `scale`/`translate` CSS properties, so
      // `transition-transform` would animate neither.
      "transition-[opacity,scale,translate] duration-150 ease-out motion-reduce:transition-none",
      // `createPresence` paints the `entering` frame, then flips `data-presence` to `entered` a frame
      // later — that attribute change is what fires the transition, in both directions.
      "data-entering:opacity-0 data-entering:scale-95 data-exiting:opacity-0 data-exiting:scale-95",
      // PHYSICAL ON PURPOSE — see the header's RTL note. Select is vertical-only in practice (a
      // listbox popup flips top↔bottom, never left↔right), so only that pair is spelled.
      "data-side-bottom:data-entering:-translate-y-1 data-side-top:data-entering:translate-y-1",
      "data-side-bottom:origin-top data-side-top:origin-bottom",
    ],
    // The `role="listbox"` scroll container. `overscroll-contain` stops a scroll that reaches the end
    // of the list from chaining to the page behind it; `overflow-y-auto` also zeroes this flex child's
    // automatic minimum size, so it shrinks inside the card's `max-h` cap rather than pushing past it.
    list: "overflow-y-auto overscroll-contain outline-none",
    // No horizontal inset, so grouped rows stay aligned with ungrouped ones.
    group: "not-last:pb-1",
    groupLabel: "px-1.5 py-1 text-xs text-foreground-muted",
    separator: "my-1 h-px bg-subtle pointer-events-none",
    // A `role="option"` row. `relative` anchors the absolute `itemIndicator`, `pe-8` reserves the
    // trailing glyph gutter, and the highlight is `data-active:` ONLY (header note).
    item: "relative flex cursor-default items-center pe-8 outline-none select-none data-active:bg-active data-active:text-on-active data-disabled:pointer-events-none data-disabled:opacity-disabled",
    // Same `min-w-0` + `flex-1` reason as `value`: truncate needs a shrinkable box.
    itemText: "min-w-0 flex-1 truncate",
    // Pinned in the reserved `pe-8` gutter, inheriting the row's color. Its inset and glyph box scale
    // with the row, so both live per `size`.
    itemIndicator: "absolute flex items-center justify-center",
  },
  variants: {
    // `size` owns the density set on BOTH surfaces. Each size is self-contained — no base carries a
    // competing density class — so a size applies additively and nothing relies on tailwind-merge
    // resolution. The trigger and the positioner take the SAME `min-w-*`, so a narrow trigger and its
    // popup never disagree.
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
