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
 * magic opacity. Enter/exit uses `opacity-0`/`scale-95` (both allowed) keyed on the `data-exiting:`
 * custom variant (→ `[data-presence="exiting"]`, the status the parts write to `data-presence`).
 * `shadow-lg` is a raw Tailwind utility (unpoliced). Every class is a literal string so the consumer's
 * `@source` scan can see it.
 *
 * ── Variant ORDER is load-bearing ──────────────────────────────────────────────────────────────
 * `tailwind-variants` appends matched-variant classes in the config's key order, and tailwind-merge
 * resolves conflicts last-wins. `size` is declared **after** `placement` on purpose: the two edge
 * sizes (`cover`/`full`) must cancel the centered positioning `placement` sets — their `inset-*`
 * overrides `placement`'s `left-1/2`/`top-1/2` (tailwind-merge treats `inset` as conflicting with
 * `left`/`top`/…), and their `translate-x-0`/`translate-y-0` override `placement`'s
 * `-translate-x-1/2`/`-translate-y-1/2`. Positioning is therefore owned entirely by the `placement`
 * and `size` variants; the `content` base carries none, and width lives only on the `size` variants
 * (so `cover`/`full`'s `max-w-none` fully wins — no residual `sm:max-w-*` in the base to fight).
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
      "data-exiting:opacity-0",
    ],
    // The card. Positioning (left/top/translate) is intentionally NOT here — it is owned by the
    // `placement` + `size` variants so the edge sizes can cancel it cleanly (see the header note).
    // Width lives only on the `size` variants for the same reason. `p-4 gap-4 grid` is the shadcn
    // layout; `max-w-[calc(100%-2rem)]` is the mobile cap.
    content: [
      "fixed z-50 grid gap-4 rounded-xl border border-subtle bg-surface-overlay p-4",
      "text-sm text-foreground shadow-lg outline-none max-w-[calc(100%-2rem)]",
      "transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
      "data-exiting:opacity-0 data-exiting:scale-95",
    ],
    header: "flex flex-col gap-2",
    // The main region. `flex-1` lets it take the slack; `scrollBehavior=inside` adds its own scroll.
    body: "flex-1",
    // The action bar: pulled into the card's padding, a sunken tinted footer with a top hairline.
    footer: [
      "-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t border-subtle bg-surface-sunken p-4",
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
      // Dead-centered — the common modal position.
      center: { content: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" },
      // Horizontally centered, anchored near the top (Chakra `top` placement).
      top: { content: "left-1/2 top-4 -translate-x-1/2 sm:top-16" },
    },
    scrollBehavior: {
      // Cap the card; the body scrolls, so header/footer stay pinned. The common case.
      inside: { content: "max-h-[calc(100dvh-2rem)]", body: "overflow-y-auto" },
      // The whole card scrolls within the viewport (no Positioner in v1).
      outside: { content: "max-h-[calc(100dvh-2rem)] overflow-y-auto" },
    },
    size: {
      xs: { content: "sm:max-w-xs" },
      sm: { content: "sm:max-w-sm" },
      md: { content: "sm:max-w-lg" },
      lg: { content: "sm:max-w-xl" },
      xl: { content: "sm:max-w-2xl" },
      // Pseudo-fullscreen: fills the viewport minus a margin, KEEPS the radius + padding. `inset-*`
      // cancels `placement`'s centering; `translate-*-0` cancels its translate; `max-w-none` drops
      // the width cap.
      cover: {
        content:
          "inset-4 w-auto h-auto max-w-none translate-x-0 translate-y-0 rounded-xl sm:inset-8",
      },
      // True fullscreen: edge-to-edge, NO radius/margin. `max-h-none` also drops `scrollBehavior`'s
      // height cap so it truly fills the viewport.
      full: {
        content:
          "inset-0 w-screen h-dvh max-w-none max-h-none translate-x-0 translate-y-0 rounded-none",
      },
    },
  },
  defaultVariants: {
    size: "md",
    placement: "center",
    scrollBehavior: "inside",
  },
});
