/*
 * @hope-ui/presets/hope — Combobox slot recipe.
 *
 * A *slot recipe*: `tv` (tailwind-variants) maps variant props to one class string per named part
 * ("slot"), and `@hope-ui/components`' Combobox reads it through `useRecipe("combobox")`. Like its
 * sibling Select it is two surfaces in one recipe — a form control (here a text field) and a floating
 * card holding the filtered option list — both scaled off the single `size` axis, because a `lg` field
 * opening an `md` list is the one way this can look broken. Neutral widget, no color axis: the only
 * accents are the transient highlight and the persistent selection, both token-driven.
 *
 * ── The control half is Select's trigger, taken apart ───────────────────────────────────────────
 * On Select the focusable element IS the box, so one slot carries the border, background and ring.
 * Here the element taking DOM focus is the `<input>` inside the box, so the chrome splits:
 *
 * - `control` keeps Select's trigger chrome but draws its focus indicator with **`focus-within:`** —
 *   the only spelling that lights a shell when a descendant is focused. It carries no wash (it is a
 *   `<div>`, not a button, and a text field's affordance is the caret) and no `select-none`, which
 *   would reach the input's own text.
 * - `input` is deliberately chrome-free: a height, border or background here would fight the
 *   control's, and the resulting double box is the defect this split exists to avoid.
 * - `trigger` and `clear` are the two gutter buttons, styled identically down to the per-size box:
 *   they share one gutter, so a difference between them would read as a difference in kind rather
 *   than in purpose. `clear` has no Select counterpart — a Select always holds a value once chosen,
 *   while a Combobox's text is erasable.
 *
 * **Neither button gets a focus ring**, and that is not an omission: `createComboboxToggle` and
 * `createComboboxClear` both set `tabindex="-1"` because the input is the widget's single tab stop,
 * so a `focus-visible:` rule on either would be a promise the keyboard can never keep.
 *
 * ── The popup half is Select's, class for class ─────────────────────────────────────────────────
 * `positioner`/`content`/`list`/`item`/`itemIndicator`/`group`/`groupLabel`/`separator` mirror
 * `select.ts` (which mirrors `listbox.ts`) down to the per-size row density. Combobox does not
 * *compose* Select, so this is a deliberate parallel rather than reuse — but they are the same rows on
 * the same card and must look identical. **Select is the visual source of truth**: a change made here
 * alone is the bug. What Combobox adds is `empty` and `status`; a `role="listbox"` may hold only
 * options and groups, so both sit in the card *beside* the list — the reason `content` and `list` are
 * separate slots at all.
 *
 * ── Highlight is `data-active:` ONLY — never `hover:` / bare `:focus` ────────────────────────────
 * Keyboard and pointer share one active index in the primitive (`createListFocus`), so exactly one row
 * carries `data-active` at a time. A `hover:` background would let the cursor's physical position
 * paint a *second* highlight the moment it lagged that index by a frame. It matters most here: a
 * Combobox is activedescendant by construction — focus never leaves the input — so `data-active` is
 * the ONLY signal there is.
 *
 * ── One width and one height cap, so no compound variants ───────────────────────────────────────
 * The popup matches the control, always, via the `--anchor-width` `createComboboxPositioner`
 * publishes, so `w-(--anchor-width)` sits alone in the positioner base and no variant emits a
 * competing width — the declaration-order hazard `popover.ts` spends `compoundVariants` to avoid never
 * arises here. The per-size `min-w-*` floor is a different property, applied to control and positioner
 * with the *same* value. `max-h-(--available-height)` on `content` is the same deal for height, and
 * `list`'s `overflow-y-auto` also zeroes its automatic minimum size, so it shrinks inside the cap
 * instead of pushing the card past it — with `shrink-0` on `status` keeping the pinned result count
 * from collapsing in its place.
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
 * direction — so the pair is identical under `dir="rtl"`. Same exemption `select.ts` and `popover.ts`
 * document at length.
 */

import { tv } from "@hope-ui/theming";

/**
 * hope's Combobox slot recipe — used as-is by the component (`recipe(props).item()`), no adapter.
 * `hopeRecipes` (in `./index`) checks it against the `combobox` contract in `@hope-ui/theming`.
 */
export const comboboxRecipe = tv({
  slots: {
    // The bordered shell holding the input, the clear button and the chevron trigger. Height,
    // padding, gap and min width are density values and live per `size`.
    control: [
      "relative inline-flex items-center",
      "rounded-lg border border-subtle bg-surface-raised text-foreground",
      "transition-[background-color,border-color,box-shadow] duration-150 ease-out",
      // The shared focus indicator every hope control uses, spelled `focus-within:` because the
      // focused element is a descendant. `focus-halo` is a finished translucent token, never an alpha
      // modifier over `focus`.
      "focus-within:border-focus focus-within:ring-3 focus-within:ring-focus-halo",
      // The whole widget dims and stops taking the pointer as one, so the component writes
      // `data-disabled` here rather than on each descendant.
      "data-disabled:cursor-not-allowed data-disabled:pointer-events-none data-disabled:opacity-disabled",
    ],
    // The `role="combobox"` text field, chrome-free so it cannot draw a second box inside the control.
    // `min-w-0` + `flex-1` is what lets it shrink in the flex row instead of pushing the buttons out.
    // Height is the one metric it does take, and it takes the *control's* (per `size`): a bare line box
    // would leave a dead strip where a click lands on the shell, and a click there must place the caret.
    input: [
      "min-w-0 flex-1 cursor-text border-0 bg-transparent outline-none",
      "text-foreground placeholder:text-foreground-subtle",
    ],
    // The reset button — the only pointer target here that *changes* the value rather than opening the
    // popup. `aspect-square` over the per-size height makes it square with no second width class to
    // keep in step, and the wash is guarded against the pressed state so the two never fight.
    clear: [
      "aspect-square inline-flex shrink-0 items-center justify-center outline-none",
      "text-foreground-muted transition-[background-color,color] duration-150 ease-out",
      "hover:not-data-pressed:bg-surface-raised-hovered data-pressed:bg-surface-raised-pressed",
    ],
    // `clear`'s twin, deliberately identical: the two sit side by side in one gutter, so a button that
    // lit up differently from its neighbour would read as a different kind of control.
    trigger: [
      "aspect-square inline-flex shrink-0 items-center justify-center select-none outline-none",
      "text-foreground-muted transition-[background-color,color] duration-150 ease-out",
      "hover:not-data-pressed:bg-surface-raised-hovered data-pressed:bg-surface-raised-pressed",
    ],
    // `pointer-events-none` so the glyph is never the pointer target over its button. The glyph box
    // is a density value and lives per `size`.
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
      // PHYSICAL ON PURPOSE — see the header's RTL note. Combobox is vertical-only in practice (a
      // listbox popup flips top↔bottom, never left↔right), so only that pair is spelled.
      "data-side-bottom:data-entering:-translate-y-1 data-side-top:data-entering:translate-y-1",
      "data-side-bottom:origin-top data-side-top:origin-bottom",
    ],
    // The `role="listbox"` scroll container. `overscroll-contain` stops a scroll that reaches the end
    // of the list from chaining to the page behind it; `overflow-y-auto` also zeroes this flex child's
    // automatic minimum size, so it shrinks inside the card's `max-h` cap rather than pushing past it.
    list: "overflow-y-auto overscroll-contain outline-none",
    // The no-results message — a sibling of the list, never a child, because `role="listbox"` admits
    // only options and groups. Padding and text are density values and live per `size`.
    empty: "text-center text-foreground-muted",
    // The `role="status"` result count. Not visually hidden — a live region a sighted user reads too —
    // so it takes a top hairline. `shrink-0` makes the card's `max-h` cap collapse the list, not this.
    status: "shrink-0 border-t border-subtle text-foreground-muted",
    // No horizontal inset, so grouped rows stay aligned with ungrouped ones.
    group: "not-last:pb-1",
    groupLabel: "px-1.5 py-1 text-xs text-foreground-muted",
    separator: "my-1 h-px bg-subtle pointer-events-none",
    // A `role="option"` row. `relative` anchors the absolute `itemIndicator`, `pe-8` reserves the
    // trailing glyph gutter, and the highlight is `data-active:` ONLY (header note).
    item: "relative flex cursor-default items-center pe-8 outline-none select-none data-active:bg-active data-active:text-on-active data-disabled:pointer-events-none data-disabled:opacity-disabled",
    // `min-w-0` + `flex-1` is what lets `truncate` engage inside the flex row — without it the text
    // would push the indicator out instead of ellipsizing.
    itemText: "min-w-0 flex-1 truncate",
    // Pinned in the reserved `pe-8` gutter, inheriting the row's color. Its inset and glyph box scale
    // with the row, so both live per `size`.
    itemIndicator: "absolute flex items-center justify-center",
  },
  variants: {
    // `size` owns the density set on BOTH surfaces. Each size is self-contained — no base carries a
    // competing density class — so a size applies additively and nothing relies on tailwind-merge
    // resolution. The control and the positioner take the SAME `min-w-*`, so a narrow control and its
    // popup never disagree, and the control's height matches Select's trigger so the two widgets sit
    // level in a form. The end gutter is `pe-1` rather than Select's `pe-2` because what sits there is
    // a *button* whose own wash needs room to read as a box, not a bare chevron; keeping the button one
    // size step under the control is what leaves that room symmetric.
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
