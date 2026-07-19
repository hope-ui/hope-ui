/**
 * The **Alert** recipe contract — its variant vocabulary, slots, and the resulting `AlertRecipe`
 * type.
 *
 * Owned by `@hope-ui/theming` (the look-&-feel authority), not the component or a preset: the
 * `@hope-ui/components` `Alert` consumes it via `useRecipe("alert")`, and each preset
 * (`@hope-ui/presets/*`) implements a `tailwind-variants` recipe against it. One file per component
 * keeps the registry (`./registry`) a flat list of named recipe types with no shape logic of its own.
 *
 * Alert is a **static, non-interactive** status surface (a styled `<div>` with a compound anatomy),
 * so — like Badge — its recipe carries no interaction ladder (no `hover:`/`data-pressed`/
 * `focus-visible:`). Its axes are the visual variant × colorScheme × size, plus the one structural
 * quirk Badge lacks: the `default` variant colors the `icon` + `title` slots per role rather than the
 * `root` (see the preset recipe's `compoundVariants`).
 */
import type { JSX } from "@solidjs/web";
import type { SlotRecipeFn } from "./slot-recipe";

/**
 * Visual style. `default` is a role-neutral raised surface whose *icon + title* carry the role color;
 * `solid`/`soft`/`subtle`/`outline` are the Badge fills (minus `dot`/`inverted`). Every colored
 * variant honors `colorScheme`.
 */
export type AlertVariant = "default" | "solid" | "soft" | "subtle" | "outline";

/** Semantic role color scheme. */
export type AlertColorScheme = "primary" | "neutral" | "success" | "info" | "warning" | "danger";

/** Density/scale. */
export type AlertSize = "sm" | "md" | "lg";

/** The Alert recipe's variant props — also the visual axes a preset may default app-wide. */
export interface AlertRecipeVariants {
  /** Visual style. Default `default`. */
  variant?: AlertVariant;
  /** Semantic role color scheme. Default `neutral`. */
  colorScheme?: AlertColorScheme;
  /** Density/scale. Default `md`. */
  size?: AlertSize;
}

/**
 * The curated Alert props a preset may default app-wide via `ComponentOverride.defaultProps`: the
 * recipe variants **plus** the four preset-overridable default status glyphs. A superset of
 * {@link AlertRecipeVariants} by construction (`extends`), so it registers in `ThemeablePropsRegistry`
 * and `ThemeablePropsOf<"alert">` widens the variants-only surface without dropping anything.
 *
 * The status glyphs are **flat, discrete factory keys** (`infoIcon`/…), never a nested `statusIcons`
 * map: `mergeComponentOverrides` merges `defaultProps` shallowly per key, so a nested map would drop a
 * partial override. Each is a **factory** (`() => JSX.Element`), never a bare `JSX.Element`: a preset
 * value is one object shared by every instance, and a Solid `JSX.Element` is an already-built node that
 * would *move* if reused — so a factory (called per instance, via `runIfFunction`) is what lets a
 * preset swap the app-wide default icon for a role. Only the four status roles carry a built-in glyph;
 * `primary`/`neutral` ship none (they need an explicit `icon`).
 */
export interface AlertThemeableProps extends AlertRecipeVariants {
  /** App-wide default glyph for the `info` role, as a factory. Falls back to hope's built-in. */
  infoIcon?: () => JSX.Element;
  /** App-wide default glyph for the `success` role, as a factory. Falls back to hope's built-in. */
  successIcon?: () => JSX.Element;
  /** App-wide default glyph for the `warning` role, as a factory. Falls back to hope's built-in. */
  warningIcon?: () => JSX.Element;
  /** App-wide default glyph for the `danger` role, as a factory. Falls back to hope's built-in. */
  dangerIcon?: () => JSX.Element;
}

/** The Alert recipe's slots. */
export type AlertSlot = "root" | "icon" | "content" | "title" | "description" | "actions" | "close";

/** The Alert recipe: variant props → one class function per slot. The registry entry for `alert`. */
export type AlertRecipe = SlotRecipeFn<AlertRecipeVariants, AlertSlot>;
