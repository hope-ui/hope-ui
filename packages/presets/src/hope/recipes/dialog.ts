/*
 * @hope-ui/presets/hope — Dialog slot recipe.
 *
 * The `tailwind-variants` slot recipe the `@hope-ui/components` `Dialog` reads through
 * `useRecipe("dialog")`. Reproduces the shadcn (style-nova) `cn-dialog-*` look through hope's finished
 * semantic tokens: a portaled scrim + a positioned card over it, with structural header/body/footer
 * regions. Dialog is a **neutral container** (no color axis) — role accents belong on the footer's
 * action `Button`, not the chrome.
 *
 * ── Recipe purity ───────────────────────────────────────────────────────────────────────────────
 * shadcn-nova's rules use alpha modifiers (`bg-black/10`, `bg-muted/50`, `ring-foreground/10`) that
 * `check:recipe-purity` forbids; each is re-expressed as a finished `--hope-*` token: `bg-scrim`
 * (the dimming layer), `bg-surface-overlay` (the card), `bg-surface-sunken` (the footer bar),
 * `border-subtle` (hairlines). The recipe computes no color — no `color-mix`, no alpha modifier, no
 * magic opacity. Enter *and* exit use `opacity-0`/`scale-95` (both allowed) keyed on the
 * `data-entering:`/`data-exiting:` custom variants (→ `[data-presence="entering"|"exiting"]`, the
 * statuses the parts write to `data-presence`): the card zooms+fades in on open and back out on close.
 * `shadow-lg` is a raw Tailwind utility (unpoliced). Every class is a literal string so the consumer's
 * `@source` scan can see it.
 *
 * ── Positioning lives on the `positioner`, not the card ─────────────────────────────────────────
 * The card is wrapped in a required `Dialog.Positioner` (`Portal > Backdrop + Positioner > Content`,
 * the Base UI / Ark / Chakra shape). The Positioner is the `fixed inset-0` full-viewport flex frame
 * *and* the viewport scroll container; `Content` is a plain flow child (`relative flex flex-col`).
 * `placement` positions within that frame (auto-margin centering vs. top gutter); `size`'s
 * `cover`/`full` override the Positioner *padding* (edge margin) rather than the old content `inset-*`.
 *
 * ── Variant ORDER is load-bearing ──────────────────────────────────────────────────────────────
 * `tailwind-variants` appends matched-variant classes in the config's key order, and tailwind-merge
 * resolves conflicts last-wins. Declared `placement` → `scrollBehavior` → `size` so `size` (esp.
 * `cover`/`full`) wins: its `my-0` cancels `placement:center`'s `my-auto` (same `my` group), and its
 * `sm:p-0`/`p-0` cancels `placement:top`'s `sm:pt-16` on the positioner (edge-to-edge wins). The base
 * `positioner` carries **no** `overflow` (so `scrollBehavior` owns it with no cross-group collision),
 * and width lives only on the `size` variants (so `cover`/`full`'s `max-w-none` fully wins — no
 * residual `sm:max-w-*` in the base to fight).
 */

// The Dialog recipe's variant vocabulary is owned by `@hope-ui/theming` (the contract); this theme
// implements it. `hopeRecipes` (in `./index`) checks the finished recipe against `RecipeRegistry`.
import { tv } from "@hope-ui/theming";

/**
 * hope's Dialog slot recipe — used as-is by the component (`recipe(props).content()`), no adapter.
 * `hopeRecipes` (in `./index`) checks it against the `dialog` contract in `@hope-ui/theming`.
 */
export const dialogRecipe = tv({
  slots: {
    // The scrim: a fixed dimming layer under the card, keyed to fade out on exit. `bg-scrim` is a
    // finished token (a preset-authored `color-mix`, but the recipe only references it).
    backdrop: [
      "fixed inset-0 z-50 bg-scrim supports-[backdrop-filter]:backdrop-blur-xs",
      "transition-opacity duration-200 ease-out motion-reduce:transition-none",
      // Symmetric fade: hidden on the `entering` frame, visible once `entered` (the class no longer
      // matches, so it falls back to the base opacity) — and back to hidden on `exiting`.
      "data-entering:opacity-0 data-exiting:opacity-0",
    ],
    // The fixed, full-viewport flex frame that positions the card and is the viewport scroll
    // container (its `overflow` is set per `scrollBehavior`, never in the base — see the header note).
    // `items-start` + `placement`'s `my-auto` do the centering (auto margins collapse when the card is
    // taller than the viewport, so a tall card stays top-reachable — the classic centered-overflow
    // clip this avoids). `overscroll-contain` stops scroll chaining to the page behind.
    positioner: "fixed inset-0 z-50 flex items-start justify-center overscroll-contain p-4 sm:p-6",
    // The card — now a plain flow child (`relative`, not `fixed`; `relative` anchors the absolute
    // `closeTrigger` to the card). `flex flex-col` is the inside-scroll fix: header/footer `shrink-0`,
    // body `flex-1 min-h-0`. Positioning/width live on the `positioner`/`size` variants, not here.
    content: [
      "relative flex w-full flex-col gap-4 rounded-xl border border-subtle bg-surface-overlay p-4",
      "text-sm text-foreground shadow-lg outline-none",
      // Transition `opacity` + `scale`, NOT `transform`: Tailwind v4 compiles `scale-*` to the
      // standalone `scale` CSS property (not `transform`), so `transition-transform` would never
      // animate the zoom.
      "transition-[opacity,scale] duration-200 ease-out motion-reduce:transition-none",
      // The zoom+fade runs both ways: `createPresence` paints the `entering` frame (opacity-0
      // scale-95), then flips to `entered` (base opacity-100 scale-100) a frame later — that attribute
      // change is what fires the transition.
      "data-entering:opacity-0 data-entering:scale-95 data-exiting:opacity-0 data-exiting:scale-95",
    ],
    // `shrink-0` so only the body absorbs the height cap under `scrollBehavior=inside`.
    header: "flex shrink-0 flex-col gap-2",
    // The main region. `flex-1` takes the slack; `min-h-0` removes the default `min-height: auto`
    // floor so the item can shrink below its content and `scrollBehavior=inside`'s `overflow-y-auto`
    // (added by the variant) actually produces a scrollbar.
    body: "min-h-0 flex-1",
    // The action bar: pulled into the card's padding, a sunken tinted footer with a top hairline.
    footer: [
      "-mx-4 -mb-4 flex shrink-0 flex-col-reverse gap-2 rounded-b-xl border-t border-subtle bg-surface-sunken p-4",
      "sm:flex-row sm:justify-end",
    ],
    title: "text-base font-medium leading-none text-foreground",
    // Prose, muted; a link inside gets the shadcn underline treatment and brightens on hover.
    description: [
      "text-sm text-foreground-muted",
      "[&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-foreground",
    ],
    // Placement only — pinned to the trailing-top corner. The button chrome comes from CloseButton's
    // own recipe, merged under this via its `class` prop.
    closeTrigger: "absolute end-2 top-2",
  },
  // Declared placement → scrollBehavior → size so `size` wins (see the header note). Nothing here
  // touches color; every axis is layout only.
  variants: {
    placement: {
      // Centered via auto margins: `my-auto` centers a short card in the `items-start` frame, but
      // collapses to `0` when the card is taller than the viewport (flexbox spec), so it top-anchors
      // and the whole card stays scroll-reachable — no top-clip.
      center: { content: "my-auto" },
      // Top-anchored (`items-start` already does this); the extra top gutter on the positioner nudges
      // it down on ≥sm. Base `p-4` is the mobile top gutter.
      top: { positioner: "sm:pt-16" },
    },
    scrollBehavior: {
      // Cap the card against the fixed positioner's definite height; the body scrolls, so
      // header/footer stay pinned. `overflow-hidden` on the positioner stops it double-scrolling.
      // `no-scrollbar` hides the body's scrollbar (still scrollable) so it doesn't break the card's
      // padding symmetry — the base `no-scrollbar` @utility from the preset.
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
      // Pseudo-fullscreen: fills the viewport minus a margin, KEEPS the radius. `h-full` fills the
      // padded positioner; `max-w-none` drops the width cap; `my-0` cancels `placement:center`. The
      // body scrolls its own overflow so the card can't overrun.
      cover: { positioner: "sm:p-8", content: "h-full max-w-none my-0", body: "overflow-y-auto" },
      // True fullscreen: edge-to-edge, NO radius/margin. `p-0` drops the positioner gutter (and beats
      // `placement:top`'s `sm:pt-16`); `rounded-none` + `h-full` + `max-w-none` fill it edge-to-edge.
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
