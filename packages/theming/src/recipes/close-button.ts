/**
 * The **CloseButton** recipe contract — its variant vocabulary, slots, and the resulting
 * `CloseButtonRecipe` type.
 *
 * A *slot recipe* maps variant props to one class string per named part ("slot"). This file owns only
 * that shape: `@hope-ui/components`' CloseButton consumes it via `useRecipe("closeButton")` and each
 * preset implements a `tailwind-variants` recipe against it, so neither layer knows the other.
 *
 * CloseButton is an **always-icon-only** button that ships a built-in X and self-labels, and it is
 * deliberately **surface-adaptive rather than colored**: no `variant`, no `colorScheme`, only `size`.
 * A close affordance should never assert its own semantic color — it defers to whatever surface it
 * sits on, so its glyph inherits `currentColor` and its wash and focus ring come from finished
 * currentColor-derived tokens the preset authors.
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
 * the recipe variants **plus** the glyph.
 *
 * The glyph is a **factory** (`() => JSX.Element`), never a bare `JSX.Element`: a preset value is one
 * object shared by every instance, and a Solid `JSX.Element` is an already-built DOM node that would
 * *move* if reused, so calling a factory per instance is what keeps two close buttons from fighting
 * over one node. Resolved through `runIfFunction`. (The component's per-instance `icon` prop does
 * accept a bare element — it is not shared.)
 */
export interface CloseButtonThemeableProps extends CloseButtonRecipeVariants {
  /** App-wide default glyph, as a factory (called per instance). Falls back to hope's built-in X. */
  icon?: () => JSX.Element;
}

/**
 * The CloseButton recipe's slots. `root` is the `<button>`; `icon` is a host `<span>` wrapping the
 * glyph. The wrapper exists so the hydration-keyed `<button>`'s first child is a host element rather
 * than a component, which would shift the keys Solid matches server and client nodes by.
 */
export type CloseButtonSlot = "root" | "icon";

/** The CloseButton recipe: variant props → one class function per slot. The registry entry for `closeButton`. */
export type CloseButtonRecipe = SlotRecipeFn<CloseButtonRecipeVariants, CloseButtonSlot>;
