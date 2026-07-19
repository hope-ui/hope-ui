/**
 * The **Badge** recipe contract — its variant vocabulary, slots, and the resulting `BadgeRecipe`
 * type.
 *
 * Owned by `@hope-ui/theming` (the look-&-feel authority), not the component or a preset: the
 * `@hope-ui/components` `Badge` consumes it via `useRecipe("badge")`, and each preset
 * (`@hope-ui/presets/*`) implements a `tailwind-variants` recipe against it. One file per component
 * keeps the registry (`./registry`) a flat list of named recipe types with no shape logic of its own.
 *
 * Badge is a **static, non-interactive** inline label (a styled `<span>`), so — unlike Button — its
 * recipe has no interaction ladder, no loader, and no chrome content. Its axes are purely visual.
 */
import type { SlotRecipeFn } from "./slot-recipe";

/**
 * Visual style. `inverted` is the literal swap of the `solid` pair (the on-color as fill, the role
 * as text); `subtle` is `soft` plus a soft role border; `dot` is neutral chrome with a role-colored
 * dot. Every variant honors `colorScheme`.
 */
export type BadgeVariant = "solid" | "inverted" | "soft" | "subtle" | "outline" | "dot";

/** Semantic role color scheme. */
export type BadgeColorScheme = "primary" | "neutral" | "success" | "info" | "warning" | "danger";

/** Density/scale. */
export type BadgeSize = "xs" | "sm" | "md" | "lg";

/**
 * Corner treatment. `sharp` (no radius), `rounded` (the default chip radius), `pill` (fully
 * rounded), `circle` (fully rounded + square aspect, for a single glyph/count).
 */
export type BadgeShape = "sharp" | "rounded" | "pill" | "circle";

/** The Badge recipe's variant props — also the visual axes a preset may default app-wide. */
export interface BadgeRecipeVariants {
  /** Visual style. Default `soft`. */
  variant?: BadgeVariant;
  /** Semantic role color scheme. Default `neutral`. */
  colorScheme?: BadgeColorScheme;
  /** Density/scale. Default `sm`. */
  size?: BadgeSize;
  /** Corner treatment. Default `rounded`. */
  shape?: BadgeShape;
  /** Stretches the badge to the full width of its container. */
  fullWidth?: boolean;
}

/**
 * The curated Badge props a preset may default app-wide via `ComponentOverride.defaultProps`. Badge
 * has **no** non-variant themeable props (no chrome content, no durable behavioral policy), so this
 * is an exact, empty extension of {@link BadgeRecipeVariants}. It exists for **contract uniformity**
 * with Button: every component's contract file exports a `…ThemeableProps` that the components layer
 * can `extends`, and the [`themeable-props-registry`](../registry/themeable-props-registry.md)
 * carries a `badge` entry — so the mechanism stays identical across components even where the
 * curated surface happens to equal the recipe variants.
 */
export interface BadgeThemeableProps extends BadgeRecipeVariants {}

/** The Badge recipe's slots. */
export type BadgeSlot = "root" | "label" | "startDecorator" | "endDecorator" | "dot";

/** The Badge recipe: variant props → one class function per slot. The registry entry for `badge`. */
export type BadgeRecipe = SlotRecipeFn<BadgeRecipeVariants, BadgeSlot>;
