/*
 * @hope-ui/presets/hope — CloseButton slot recipe.
 *
 * A *slot recipe*: `tv` (tailwind-variants) maps variant props to one class string per named part
 * ("slot"), and `@hope-ui/components`' CloseButton reads it through `useRecipe("closeButton")`.
 * CloseButton is an **always-icon-only** button shipping a built-in X, and its defining trait is that
 * it is **surface-adaptive, never colored**: no `variant`/`colorScheme` axis, only `size`.
 *
 * ── currentColor, not a role token ──────────────────────────────────────────────────────────────
 * The glyph sets **no** text-color class, so it inherits `currentColor` from whatever surface it sits
 * on, and the hover/press wash is the shared `surface-adaptive-*` token — itself *finished*, derived
 * from `currentColor` once in hope's `theme.css`. So a close button reads correctly on solid, soft,
 * light and dark surfaces with zero configuration while this recipe still computes no color of its own
 * (no `color-mix`, no alpha modifier, no magic opacity — recipe purity, enforced by `pnpm
 * check:recipe-purity`). Focus is the shared `focus-halo` ring, not a bespoke close ring. Interaction
 * *triggers* are Tailwind's own `hover:`/`focus-visible:` plus the `data-pressed`/`data-disabled`
 * attributes the `createButton` primitive emits.
 *
 * Every class is a literal string, because the consumer's Tailwind build only emits utilities it can
 * find by scanning this file (`@source "./recipes"`) — a `size-${n}` template is invisible to it.
 */

import type { CloseButtonSize } from "@hope-ui/theming";
import { tv } from "@hope-ui/theming";

/** Per-size box metrics on `root`, plus glyph sizing on the `icon` slot. */
const SIZE: Record<CloseButtonSize, { root: string; icon: string }> = {
  sm: { root: "size-6 rounded-md", icon: "[&_svg]:size-4" },
  md: { root: "size-7 rounded-md", icon: "[&_svg]:size-4.5" },
  lg: { root: "size-8 rounded-lg", icon: "[&_svg]:size-5" },
};

/**
 * hope's CloseButton slot recipe — used as-is by the component (`recipe(props).root()`), no adapter.
 * `hopeRecipes` (in `./index`) checks it against the `closeButton` contract in `@hope-ui/theming`.
 */
export const closeButtonRecipe = tv({
  slots: {
    root: [
      "relative inline-flex shrink-0 items-center justify-center select-none outline-none",
      "transition-[background-color,box-shadow] duration-150 ease-out",
      // The wash is guarded against the pressed state so the two never fight.
      "hover:not-data-pressed:bg-surface-adaptive-hovered data-pressed:bg-surface-adaptive-pressed",
      "focus-visible:ring-3 focus-visible:ring-focus-halo",
      // Dim-only disabled axis, mirroring Button: `createButton` emits `data-disabled` for both native
      // (`:disabled`) and non-native (`aria-disabled`) buttons. No color swap — just neutralised chrome
      // and a finished `opacity-disabled` token, never a magic `opacity-90`.
      "data-disabled:cursor-not-allowed data-disabled:pointer-events-none data-disabled:opacity-disabled",
    ],
    // A host `<span>` wrapping the glyph, so the hydration-keyed `<button>`'s first child is a host
    // element rather than a component. `pointer-events-none` keeps the glyph from becoming the pointer
    // target over its own button.
    icon: "pointer-events-none inline-flex items-center justify-center",
  },
  variants: {
    size: {
      sm: { root: SIZE.sm.root, icon: SIZE.sm.icon },
      md: { root: SIZE.md.root, icon: SIZE.md.icon },
      lg: { root: SIZE.lg.root, icon: SIZE.lg.icon },
    },
  },
  defaultVariants: {
    size: "sm",
  },
});
