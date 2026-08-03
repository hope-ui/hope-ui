/*
 * @hope-ui/presets/hope — Dialog slot recipe.
 *
 * A *slot recipe*: `tv` (tailwind-variants) maps variant props to one class string per named part
 * ("slot"), and `@hope-ui/components`' Dialog reads it through `useRecipe("dialog")`. It reproduces
 * the shadcn (style-nova) dialog look through hope's tokens: a portaled scrim plus a positioned card,
 * with structural header/body/footer regions. Neutral container, no color axis — role accents belong
 * on the footer's action `Button`, not the chrome.
 *
 * ── Recipe purity ───────────────────────────────────────────────────────────────────────────────
 * shadcn-nova's own rules use alpha modifiers (`bg-black/10`, `bg-muted/50`) that a hope recipe may
 * not: every color here is a *finished* `--hope-*` design token (`bg-scrim`, `bg-surface-overlay`,
 * `bg-surface-sunken`, `border-subtle`), never one this recipe computes — no `color-mix`, no alpha
 * modifier, no magic opacity. Derived colors are authored as tokens in the preset's `theme.css`
 * instead. Enforced by `pnpm check:recipe-purity`. Enter *and* exit use `opacity-0`/`scale-95` keyed
 * on the `data-entering:`/`data-exiting:` variants (→ `[data-presence="entering"|"exiting"]`, the
 * statuses the parts write to `data-presence`). Every class is a literal string, because the
 * consumer's Tailwind build only emits utilities it can find by scanning this file.
 *
 * ── Positioning lives on the `positioner`, not the card ─────────────────────────────────────────
 * The card is wrapped in a required `Dialog.Positioner` (`Portal > Backdrop + Positioner > Content`,
 * the Base UI / Ark / Chakra shape). The positioner is the `fixed inset-0` full-viewport flex frame
 * *and* the viewport scroll container; `content` is a plain flow child. `placement` positions within
 * that frame; `size`'s `cover`/`full` override the positioner's *padding* (the edge margin).
 *
 * ── Variant ORDER is load-bearing ──────────────────────────────────────────────────────────────
 * `tailwind-variants` appends matched-variant classes in the config's key order, and tailwind-merge
 * resolves conflicts last-wins. Declared `placement` → `scrollBehavior` → `size` so `size` (especially
 * `cover`/`full`) wins: its `my-0` cancels `placement:center`'s `my-auto` (same `my` group), and its
 * `p-0` cancels `placement:top`'s `sm:pt-16`. The base `positioner` carries **no** `overflow`, so
 * `scrollBehavior` owns it with no cross-group collision, and width lives only on the `size` variants,
 * so `cover`/`full`'s `max-w-none` has no base `sm:max-w-*` to fight.
 */

import { tv } from "@hope-ui/theming";

/**
 * hope's Dialog slot recipe — used as-is by the component (`recipe(props).content()`), no adapter.
 * `hopeRecipes` (in `./index`) checks it against the `dialog` contract in `@hope-ui/theming`.
 */
export const dialogRecipe = tv({
  slots: {
    // `bg-scrim` is a finished token — the preset authors its `color-mix` in `theme.css`, and this
    // recipe only references the result.
    backdrop: [
      "fixed inset-0 z-50 bg-scrim supports-[backdrop-filter]:backdrop-blur-xs",
      "transition-opacity duration-200 ease-out motion-reduce:transition-none",
      // Symmetric fade: hidden on `entering`, visible once `entered` (the class stops matching and it
      // falls back to the base opacity), hidden again on `exiting`.
      "data-entering:opacity-0 data-exiting:opacity-0",
    ],
    // The fixed, full-viewport flex frame; its `overflow` is set per `scrollBehavior`, never here
    // (header note). `items-start` plus `placement`'s `my-auto` do the centering: auto margins collapse
    // when the card is taller than the viewport, so a tall card stays top-reachable instead of
    // clipping. `overscroll-contain` stops scroll chaining to the page behind.
    positioner: "fixed inset-0 z-50 flex items-start justify-center overscroll-contain p-4 sm:p-6",
    // `relative` so the absolute `closeTrigger` anchors here. `flex flex-col` drives the inside-scroll
    // mechanics (header/footer `shrink-0`, body `flex-1 min-h-0`).
    content: [
      "relative flex w-full flex-col gap-4 rounded-xl border border-subtle bg-surface-overlay p-4",
      "text-sm text-foreground shadow-lg outline-none",
      // Transition `opacity`/`scale`, NOT `transform`: Tailwind v4 compiles `scale-*` to the standalone
      // `scale` CSS property, so `transition-transform` would never animate the zoom.
      "transition-[opacity,scale] duration-200 ease-out motion-reduce:transition-none",
      // `createPresence` paints the `entering` frame, then flips `data-presence` to `entered` a frame
      // later — that attribute change is what fires the transition, in both directions.
      "data-entering:opacity-0 data-entering:scale-95 data-exiting:opacity-0 data-exiting:scale-95",
    ],
    // `shrink-0` so only the body absorbs the height cap under `scrollBehavior=inside`.
    header: "flex shrink-0 flex-col gap-2",
    // `flex-1` takes the slack; `min-h-0` removes the default `min-height: auto` floor so the item
    // can shrink below its content and `scrollBehavior=inside`'s `overflow-y-auto` actually produces
    // a scrollbar.
    body: "min-h-0 flex-1",
    // Pulled back out into the card's own padding with negative margins, so the tinted bar reaches the
    // card's edges.
    footer: [
      "-mx-4 -mb-4 flex shrink-0 flex-col-reverse gap-2 rounded-b-xl border-t border-subtle bg-surface-sunken p-4",
      "sm:flex-row sm:justify-end",
    ],
    title: "text-base font-medium leading-none text-foreground",
    description: [
      "text-sm text-foreground-muted",
      "[&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-foreground",
    ],
    // Placement only, on a logical inset so it mirrors under `dir="rtl"`. The button chrome comes from
    // CloseButton's own recipe, merged under this via its `class` prop.
    closeTrigger: "absolute end-2 top-2",
  },
  // Declared placement → scrollBehavior → size so `size` wins (header note). Layout only.
  variants: {
    placement: {
      // `my-auto` centers a short card in the `items-start` frame but collapses to `0` when the card
      // is taller than the viewport (flexbox spec), so it top-anchors and stays scroll-reachable.
      center: { content: "my-auto" },
      // `items-start` already top-anchors; this nudges it down on ≥sm. Base `p-4` is the mobile gutter.
      top: { positioner: "sm:pt-16" },
    },
    scrollBehavior: {
      // Cap the card against the fixed positioner's definite height so the body scrolls and
      // header/footer stay pinned; `overflow-hidden` on the positioner stops it double-scrolling.
      // `no-scrollbar` (a preset `@utility`) keeps the body scrollable without a bar breaking the
      // card's padding symmetry.
      inside: {
        positioner: "overflow-hidden",
        content: "max-h-full",
        body: "overflow-y-auto no-scrollbar",
      },
      // The positioner (the fixed frame) scrolls; the card keeps its natural height.
      outside: { positioner: "overflow-y-auto" },
    },
    size: {
      xs: { content: "sm:max-w-xs" },
      sm: { content: "sm:max-w-sm" },
      md: { content: "sm:max-w-lg" },
      lg: { content: "sm:max-w-xl" },
      xl: { content: "sm:max-w-2xl" },
      // Pseudo-fullscreen: fills the viewport minus a margin, KEEPS the radius. `my-0` cancels
      // `placement:center`. The body scrolls its own overflow so the card can't overrun.
      cover: {
        positioner: "sm:p-8",
        content: "h-full max-w-none my-0",
        body: "overflow-y-auto",
      },
      // True fullscreen: edge-to-edge, NO radius/margin. `p-0` drops the positioner gutter and beats
      // `placement:top`'s `sm:pt-16`.
      full: {
        positioner: "p-0 sm:p-0",
        content: "h-full max-w-none rounded-none my-0",
        body: "overflow-y-auto",
      },
    },
  },
  defaultVariants: {
    size: "md",
    placement: "center",
    scrollBehavior: "inside",
  },
});
