/**
 * The **Button** recipe contract — its variant vocabulary, slots, and the resulting `ButtonRecipe`
 * type.
 *
 * Owned by `@hope-ui/theming` (the look-&-feel authority), not the component or a preset: the
 * `@hope-ui/components` `Button` consumes it via `useRecipe("button")`, and each preset
 * (`@hope-ui/presets/*`) implements a `tailwind-variants` recipe against it. One file per component
 * keeps the registry (`./registry`) a flat list of named recipe types with no shape logic of its own.
 */
import type { ButtonType } from "@hope-ui/primitives/internal"; // theming → primitives is allowed
import type { JSX } from "@solidjs/web";
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

/**
 * The curated Button props a preset may default app-wide via `ComponentOverride.defaultProps`: the
 * recipe variants **plus** durable behavioral policy (`nativeButton`/`type`) **plus** component
 * chrome content (`loader`/`loadingText`). A superset of {@link ButtonRecipeVariants} by construction
 * (`extends`), so it registers in `ThemeablePropsRegistry` and `ThemeablePropsOf<"button">` widens
 * the old variants-only surface without dropping anything.
 *
 * Deliberately excludes per-instance payload content (`children`, decorators), transient UI state
 * (`loading`/`disabled` — defaulting these app-wide is a footgun), controlled/identity state,
 * styling channels, events, and raw DOM attributes.
 *
 * Chrome content is a **factory** (`() => JSX.Element`), never a bare `JSX.Element`: a preset value
 * is one object shared by every instance, and a Solid `JSX.Element` is an already-built node that
 * would *move* if reused, so a factory (called per instance) is what keeps two simultaneously-loading
 * buttons from fighting over one loader node. Mirrors the `RenderProp` rule
 * (`@hope-ui/primitives/utils` render) and is resolved through `runIfFunction`.
 */
export interface ButtonThemeableProps extends ButtonRecipeVariants {
  /** Element-awareness policy: render a native `<button>` (`true`) vs `role="button"` on another element. */
  nativeButton?: boolean;
  /** Native button `type`. */
  type?: ButtonType;
  /** Brand loader content, as a factory (called per instance). Falls back to hope's built-in loader. */
  loader?: () => JSX.Element;
  /** Loading-state message, as a factory (called per instance). */
  loadingText?: () => JSX.Element;
}

/** The Button recipe's slots. */
export type ButtonSlot = "root" | "label" | "startDecorator" | "endDecorator" | "loader";

/** The Button recipe: variant props → one class function per slot. The registry entry for `button`. */
export type ButtonRecipe = SlotRecipeFn<ButtonRecipeVariants, ButtonSlot>;
