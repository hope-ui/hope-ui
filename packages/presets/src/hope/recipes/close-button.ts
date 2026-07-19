/*
 * @hope-ui/presets/hope — CloseButton slot recipe.
 *
 * The `tailwind-variants` slot recipe the `@hope-ui/components` `CloseButton` reads through
 * `useRecipe("closeButton")`. CloseButton is an **always-icon-only** button that ships a built-in X
 * and self-labels; its defining trait is that it is **surface-adaptive, never colored** — it has no
 * `variant` / `colorScheme` axis, only `size`.
 *
 * ── Why every class is a literal string ─────────────────────────────────────────────────────────
 * The consumer's Tailwind build discovers which utilities to generate by scanning this file
 * (`@source "./recipes"` in `tailwind.css`). A scanner only sees *literal* candidates, so the
 * per-size utilities are written out (`SIZE`), not built from `size-${n}` template strings.
 *
 * ── currentColor, not a role token ──────────────────────────────────────────────────────────────
 * The glyph sets **no** text-color class, so it inherits `currentColor` from the surface it sits on.
 * The hover/press wash and focus ring are *finished* tokens derived from `currentColor` in hope's
 * `tokens.css` (`--hope-close-overlay-hovered/-pressed`, `--hope-close-focus` → `bg-close-overlay-*`
 * / `ring-close-focus` via `_base/theme-map.css`). So a close button reads correctly on solid / soft
 * / light / dark surfaces with zero configuration, and the recipe still computes no color: no
 * `color-mix`, no alpha modifier, no magic opacity (the recipe-purity rule — `pnpm check:recipe-purity`).
 * Interaction *triggers* are Tailwind's own `hover:`/`focus-visible:` and hope's `data-pressed`/
 * `data-disabled` variants (emitted by the `createButton` primitive).
 */

import type { CloseButtonSize } from "@hope-ui/theming";
// The CloseButton recipe's variant vocabulary is owned by `@hope-ui/theming` (the contract); this
// theme implements it. `hopeRecipes` (in `./index`) checks it against `RecipeRegistry`.
import { tv } from "@hope-ui/theming";

/** Per-size box metrics on `root` + glyph sizing on the `icon` slot — literal so the scan emits them. */
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
      // Surface-adaptive wash — guarded against the pressed state so it never fights the press color.
      // Both are finished currentColor-derived tokens (never an alpha modifier — recipe-purity).
      "hover:not-data-pressed:bg-close-overlay-hovered data-pressed:bg-close-overlay-pressed",
      // Focus ring is the finished, currentColor-derived `close-focus` token (not the violet
      // `focus-halo`, which would clash on a colored/solid surface).
      "focus-visible:ring-3 focus-visible:ring-close-focus",
      // Dim-only disabled axis (mirrors Button): `createButton` emits `data-disabled` for both native
      // (`:disabled`) and non-native (`aria-disabled`) buttons. No color swap — just neutralise chrome
      // and dim via the finished `opacity-disabled` token, never a magic `opacity-90`.
      "data-disabled:cursor-not-allowed data-disabled:pointer-events-none data-disabled:opacity-disabled",
    ],
    // The host `<span>` wrapping the glyph (keeps the hydration-keyed `<button>`'s first child a host
    // element). `pointer-events-none` so the glyph never becomes the pointer target over the button.
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
