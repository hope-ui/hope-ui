/**
 * The **CloseButton** recipe contract — its variant vocabulary, slots, and the resulting
 * `CloseButtonRecipe` type.
 *
 * Owned by `@hope-ui/theming` (the look-&-feel authority), not the component or a preset: the
 * `@hope-ui/components` `CloseButton` consumes it via `useRecipe("closeButton")`, and each preset
 * (`@hope-ui/presets/*`) implements a `tailwind-variants` recipe against it. One file per component
 * keeps the registry (`./registry`) a flat list of named recipe types with no shape logic of its own.
 *
 * CloseButton is an **always-icon-only** button that ships a built-in X and self-labels. It is
 * deliberately **surface-adaptive rather than colored**: it has **no `variant` and no `colorScheme`**
 * axis. A close affordance should never assert its own semantic color — it defers to whatever surface
 * it sits on, so its glyph inherits `currentColor` and its hover/press wash + focus ring are derived
 * from `currentColor` (finished tokens the preset authors). Its only axis is `size`.
 */
import type { JSX } from "@solidjs/web";
import type { SlotRecipeFn } from "../slot-recipe";

/** Density/scale — a compact corner affordance. */
export type CloseButtonSize = "sm" | "md" | "lg";

/** The CloseButton recipe's variant props — also the visual axes a preset may default app-wide. */
export interface CloseButtonRecipeVariants {
  /** Density/scale. Default `sm`. */
  size?: CloseButtonSize;
}

/**
 * The curated CloseButton props a preset may default app-wide via `ComponentOverride.defaultProps`:
 * the recipe variants **plus** the glyph. A superset of {@link CloseButtonRecipeVariants} by
 * construction (`extends`), so it registers in `ThemeablePropsRegistry` and
 * `ThemeablePropsOf<"closeButton">` widens the variants-only surface without dropping anything.
 *
 * The glyph is a **factory** (`() => JSX.Element`), never a bare `JSX.Element`: a preset value is one
 * object shared by every instance, and a Solid `JSX.Element` is an already-built node that would
 * *move* if reused, so a factory (called per instance) is what lets a preset swap the app-wide close
 * icon without two close buttons fighting over one node. Mirrors Button's `loader` and is resolved
 * through `runIfFunction`. (The per-instance `icon` prop on the component also accepts a bare element.)
 */
export interface CloseButtonThemeableProps extends CloseButtonRecipeVariants {
  /** App-wide default glyph, as a factory (called per instance). Falls back to hope's built-in X. */
  icon?: () => JSX.Element;
}

/**
 * The CloseButton recipe's slots. `root` is the `<button>`; `icon` is the host `<span>` wrapping the
 * glyph — a wrapper (rather than the glyph as the button's direct child) keeps the hydration-keyed
 * `<button>`'s first child a host element, never a component.
 */
export type CloseButtonSlot = "root" | "icon";

/** The CloseButton recipe: variant props → one class function per slot. The registry entry for `closeButton`. */
export type CloseButtonRecipe = SlotRecipeFn<CloseButtonRecipeVariants, CloseButtonSlot>;
