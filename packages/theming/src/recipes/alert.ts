/**
 * The **Alert** recipe contract — its variant vocabulary, slots, and the resulting `AlertRecipe`
 * type.
 *
 * A *slot recipe* maps variant props to one class string per named part ("slot"). This file owns only
 * that shape: `@hope-ui/components`' Alert consumes it via `useRecipe("alert")` and each preset
 * implements a `tailwind-variants` recipe against it, so neither layer knows the other.
 *
 * Alert is a **static, non-interactive** status surface, so — like Badge — its recipe carries no
 * interaction ladder (no `hover:`/`data-pressed`/`focus-visible:`). Its axes are variant × colorScheme
 * × size, plus the one structural quirk Badge lacks: the `default` variant colors the `icon` and
 * `title` slots per role rather than the `root`.
 */
import type { JSX } from "@solidjs/web";
import type { SlotRecipeFn } from "../slot-recipe";

/**
 * Visual style. `default` is a role-neutral raised surface whose *icon + title* carry the role color;
 * `solid`/`soft`/`subtle`/`outline` are the Badge fills (minus `dot`/`inverted`). Every colored
 * variant honors `colorScheme`.
 */
export type AlertVariant = "default" | "solid" | "soft" | "subtle" | "outline";

/**
 * The roles that carry a status glyph — the ones for which a preset-overridable `{role}Icon` factory
 * exists. **The single source of truth:** {@link AlertColorScheme} is composed from it (plus the two
 * glyph-less roles), {@link AlertStatusIconKey} and the `AlertThemeableProps` icon factories are
 * *constructed* from it, and the component's status-icon maps key off it — so renaming a role updates
 * the color schemes, the factory props, their key type, and the runtime maps together.
 */
export type AlertStatusRole = "info" | "success" | "warning" | "danger";

/** Semantic role color scheme — the {@link AlertStatusRole}s plus the two roles that ship no glyph. */
export type AlertColorScheme = AlertStatusRole | "primary" | "neutral";

/** The `{role}Icon` preset default-glyph factory keys, one per {@link AlertStatusRole}. */
export type AlertStatusIconKey = `${AlertStatusRole}Icon`;

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
 * One preset-overridable default-glyph factory per {@link AlertStatusRole}, keyed `{role}Icon`, and
 * constructed from {@link AlertStatusIconKey} so the key set cannot drift from the roles.
 *
 * The glyphs are **flat, discrete keys**, never a nested `statusIcons` map, because
 * `mergeComponentOverrides` merges `defaultProps` shallowly per key — a nested map would drop a
 * partial override. Each is a **factory** (`() => JSX.Element`), never a bare `JSX.Element`: a preset
 * value is one object shared by every instance, and a Solid `JSX.Element` is an already-built DOM node
 * that would *move* if reused. Called per instance through `runIfFunction`.
 */
type AlertStatusGlyphs = { [Key in AlertStatusIconKey]?: () => JSX.Element };

/**
 * The curated Alert props a preset may default app-wide via `ComponentOverride.defaultProps`: the
 * recipe variants **plus** the per-role status glyphs ({@link AlertStatusGlyphs}). Only the status
 * roles carry a built-in glyph; `primary`/`neutral` ship none and need an explicit `icon`.
 */
export interface AlertThemeableProps extends AlertRecipeVariants, AlertStatusGlyphs {}

/** The Alert recipe's slots. */
export type AlertSlot =
  | "root"
  | "icon"
  | "content"
  | "title"
  | "description"
  | "actions"
  | "closeTrigger";

/** The Alert recipe: variant props → one class function per slot. The registry entry for `alert`. */
export type AlertRecipe = SlotRecipeFn<AlertRecipeVariants, AlertSlot>;
