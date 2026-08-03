/**
 * The **Button** recipe contract — its variant vocabulary, slots, and the resulting `ButtonRecipe`
 * type.
 *
 * A *slot recipe* maps variant props to one class string per named part ("slot"). This file owns only
 * that shape: `@hope-ui/components`' Button consumes it via `useRecipe("button")` and each preset
 * implements a `tailwind-variants` recipe against it, so neither layer knows the other.
 */
import type { JSX } from "@solidjs/web";
import type { SlotRecipeFn } from "../slot-recipe";

/**
 * Visual style. `default` is neutral chrome (shadcn's outline) and ignores `colorScheme`. `inverted`
 * is the on-color/role swap of `solid` — a light fill with role-colored text — on its own dedicated
 * `{role}-inverted` tokens, meant to sit on a solid/colored/dark surface (a toolbar, a banner).
 */
export type ButtonVariant =
  | "default"
  | "solid"
  | "inverted"
  | "soft"
  | "outline"
  | "ghost"
  | "link";

/** Semantic role color scheme. Ignored by the `default` variant. */
export type ButtonColorScheme = "primary" | "neutral" | "success" | "info" | "warning" | "danger";

/** Density/scale — heights 28 / 32 / 36 / 40 / 44px for xs→xl. */
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

/**
 * Where the loader sits while the button is loading: `center` (overlay — hides the label, preserves
 * width) or `start`/`end` (inline). **Layout only** — mounting the loader is the component's job, so
 * this axis has no "hidden"/"none" member.
 */
export type ButtonLoaderPlacement = "start" | "center" | "end";

/** The Button recipe's variant props — also the visual axes a preset may default app-wide. */
export interface ButtonRecipeVariants {
  /** Visual style. `default` is the neutral chrome button (shadcn's outline) and ignores `colorScheme`. */
  variant?: ButtonVariant;
  /** Semantic role color scheme. Ignored by the `default` variant. */
  colorScheme?: ButtonColorScheme;
  /** Density/scale. Heights 28/32/36/40/44px for xs→xl. */
  size?: ButtonSize;
  /** Stretches the button to the full width of its container. */
  fullWidth?: boolean;
  /**
   * Renders a **square, icon-only** button: the icon (passed as `children`) is sized per `size` and
   * centered, horizontal padding is dropped, and the width is locked to the `size`'s height. Requires
   * an `aria-label` (or `aria-labelledby`) for an accessible name — the component dev-warns if missing.
   * Intended for the chrome variants (`default`/`solid`/`inverted`/`soft`/`outline`/`ghost`);
   * combining it with `fullWidth` or `link` is unsupported (they fight the square metrics).
   */
  iconOnly?: boolean;
  /** Where the loader sits. `center` (default) overlays it and hides the label, preserving width. */
  loaderPlacement?: ButtonLoaderPlacement;
}

/**
 * The curated Button props a preset may default app-wide via `ComponentOverride.defaultProps`: the
 * recipe variants **plus** component chrome content (`loader`/`loadingText`).
 *
 * It deliberately excludes per-instance payload (`children`, decorators), transient UI state
 * (`loading`/`disabled` — defaulting those app-wide is a footgun), and **per-usage behavioral props**
 * (`nativeButton`/`type`), which describe *what a given button is* rather than a design-system-wide
 * policy: a preset setting `nativeButton: false` would break every plain `<button>` under it.
 *
 * Chrome content is a **factory** (`() => JSX.Element`), never a bare `JSX.Element`. A preset value is
 * one object shared by every instance, and a Solid `JSX.Element` is an already-built DOM node that
 * would *move* if reused — so calling a factory per instance is what keeps two simultaneously-loading
 * buttons from fighting over one loader node. Resolved through `runIfFunction`.
 */
export interface ButtonThemeableProps extends ButtonRecipeVariants {
  /** Brand loader content, as a factory (called per instance). Falls back to hope's built-in loader. */
  loader?: () => JSX.Element;
  /** Loading-state message, as a factory (called per instance). */
  loadingText?: () => JSX.Element;
}

/** The Button recipe's slots. */
export type ButtonSlot = "root" | "label" | "startDecorator" | "endDecorator" | "loader";

/** The Button recipe: variant props → one class function per slot. The registry entry for `button`. */
export type ButtonRecipe = SlotRecipeFn<ButtonRecipeVariants, ButtonSlot>;
