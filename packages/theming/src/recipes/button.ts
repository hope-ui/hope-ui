/**
 * The **Button** recipe contract — its variant vocabulary, slots, and the resulting `ButtonRecipe`
 * type.
 *
 * Owned by `@hope-ui/theming` (the look-&-feel authority), not the component or a preset: the
 * `@hope-ui/components` `Button` consumes it via `useRecipe("button")`, and each preset
 * (`@hope-ui/presets/*`) implements a `tailwind-variants` recipe against it. One file per component
 * keeps the registry (`./registry`) a flat list of named recipe types with no shape logic of its own.
 */
import type { SlotRecipeFn } from "./slot-recipe";

/** Visual style. `default` is neutral chrome (shadcn's outline) and ignores `color`. */
export type ButtonVariant = "default" | "solid" | "soft" | "outline" | "ghost" | "link";

/** Semantic role color. Ignored by the `default` variant. */
export type ButtonColor = "primary" | "neutral" | "success" | "warning" | "danger" | "info";

/** Density/scale — heights 28 / 32 / 36 / 40 / 44px for xs→xl. */
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Where the loader sits while the button is loading: `center` (overlay — hides the label,
 * preserves width), or `start`/`end` (inline). **Layout only** — mounting/unmounting the loader
 * slot is the component's job (it wraps the loader in `<Show when={isLoading()}>`), so this axis
 * never has a "hidden"/"none" member. Shared by the recipe variant and the component's public
 * `loaderPlacement` prop.
 */
export type ButtonLoaderPlacement = "start" | "center" | "end";

/** The Button recipe's variant props. */
export interface ButtonRecipeVariants {
  variant?: ButtonVariant;
  color?: ButtonColor;
  size?: ButtonSize;
  fullWidth?: boolean;
  loaderPlacement?: ButtonLoaderPlacement;
}

/** The Button recipe's slots. */
export type ButtonSlot = "root" | "label" | "startDecorator" | "endDecorator" | "loader";

/** The Button recipe: variant props → one class function per slot. The registry entry for `button`. */
export type ButtonRecipe = SlotRecipeFn<ButtonRecipeVariants, ButtonSlot>;
