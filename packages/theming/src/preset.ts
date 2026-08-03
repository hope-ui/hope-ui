/**
 * The **preset machinery** — the pure, DOM-free core of hope-ui's preset theming API.
 *
 * A `Preset` is the single object `ThemeProvider` consumes: the `recipes` map (a
 * {@link RecipeRegistry}) plus typed per-component overrides. Consumers derive one with
 * {@link definePreset} — extending an existing preset (normally `hope`), or bootstrapping a *root*
 * preset from a raw recipe map.
 *
 * Semantic token *values* are **not** part of this API: a preset authors them in CSS as `--hope-*`
 * custom properties (see `@hope-ui/presets/hope`'s `theme.css`), which is why `ThemeProvider` renders
 * no DOM. This module is types plus two pure functions — no DOM, no Solid runtime (that is
 * `./theme-context`).
 *
 * Nothing here holds state at module scope. A consumer can end up with two installed copies of this
 * package, and two copies of one mutable value each believing it is the only one is an unreproducible
 * bug. The single constant is the brand symbol, taken from `Symbol.for` so both copies resolve to the
 * *same* symbol.
 */
import type { ClassValue } from "tailwind-variants";
import type { RecipeRegistry } from "./recipe-registry";
import type { ThemeablePropsRegistry } from "./themeable-props-registry";

/**
 * The variant props a registered recipe accepts, read straight off the recipe's own signature —
 * `NonNullable` drops the `| undefined` its optional first parameter carries. This is what the recipe
 * function itself understands, and the variants-only floor for {@link ThemeablePropsOf}.
 */
export type RecipeVariantsOf<K extends keyof RecipeRegistry> = NonNullable<
  Parameters<RecipeRegistry[K]>[0]
>;

/**
 * {@link RecipeVariantsOf} with **every key required to be present**, though a value may still be
 * `undefined` (Button's `loaderPlacement` while it is not loading). `useSlots` demands this shape, and
 * a `slotClasses` function receives it, so that forgetting a variant is a compile error at the
 * `useSlots` call site rather than a silent fallback to the recipe's `defaultVariants`.
 *
 * Mapping over `keyof Required<…>` rather than using `Required<…>` itself is deliberate: it makes
 * every key present without also stripping `undefined` from the values.
 */
export type CompleteVariantsOf<K extends keyof RecipeRegistry> = {
  [P in keyof Required<RecipeVariantsOf<K>>]: RecipeVariantsOf<K>[P];
};

/**
 * The props a preset may default app-wide for component `K` via `ComponentOverride.defaultProps`: its
 * opted-in themeable props if it registers a {@link ThemeablePropsRegistry} entry (recipe variants +
 * durable behavioral policy + chrome content), otherwise just its recipe variants. Always a superset
 * of {@link RecipeVariantsOf}, since a registered `…ThemeableProps` type extends its `…RecipeVariants`.
 *
 * The fallback arm is load-bearing: `ThemeablePropsRegistry` is deliberately non-exhaustive, so a
 * component that hasn't opted in still resolves to a valid variants-only surface.
 */
export type ThemeablePropsOf<K extends keyof RecipeRegistry> =
  K extends keyof ThemeablePropsRegistry ? ThemeablePropsRegistry[K] : RecipeVariantsOf<K>;

/** The slot names a registered recipe returns — the keys of its per-slot class-function record. */
export type RecipeSlotsOf<K extends keyof RecipeRegistry> = keyof ReturnType<RecipeRegistry[K]> &
  string;

/** A per-slot class record for a component, each slot typed to that recipe's slot union. */
export type SlotClasses<K extends keyof RecipeRegistry> = Partial<
  Record<RecipeSlotsOf<K>, ClassValue>
>;

/**
 * A preset's global `slotClasses` for a component: either a static per-slot record (the common case,
 * and the one Tailwind can scan whole) or a function of the component's {@link CompleteVariantsOf}.
 * Variants are the only axis worth branching on — runtime state such as `disabled`/`loading` is
 * handled by the recipe's own `data-*`/`aria-*` Tailwind variants inside the class strings.
 *
 * Either way, Tailwind only generates CSS for class names it can find as **literal substrings**, so a
 * constructed name (`` `px-${n}` ``) yields no CSS at all.
 */
export type SlotClassesInput<K extends keyof RecipeRegistry> =
  | SlotClasses<K>
  | ((props: CompleteVariantsOf<K>) => SlotClasses<K>);

/** A preset's per-component overrides: app-wide default props and global slot classes. */
export interface ComponentOverride<K extends keyof RecipeRegistry> {
  /**
   * Overrides the component's props app-wide, typed to its {@link ThemeablePropsOf}. `useDefaults`
   * merges these at `instance ?? preset ?? builtin` precedence.
   */
  defaultProps?: Partial<ThemeablePropsOf<K>>;
  /** Global per-slot classes, folded in before a per-instance `slotClasses` (see `useSlots`). */
  slotClasses?: SlotClassesInput<K>;
}

/** Per-component overrides keyed by registry name. */
export type PresetComponentOverrides = { [K in keyof RecipeRegistry]?: ComponentOverride<K> };

/** The authoring shape passed to {@link definePreset} — every field optional, deep-merged over the base. */
export interface PresetConfig {
  components?: PresetComponentOverrides;
}

/**
 * The brand key. `Symbol.for` looks the symbol up in a process-global registry instead of minting a
 * fresh one, so two installed copies of `@hope-ui/theming` brand with the same symbol and each
 * recognizes the other's presets. A `const` initialized directly from `Symbol.for` gets the type
 * `unique symbol`, which is what lets it be an interface property key while staying nominal.
 */
const PRESET_BRAND = Symbol.for("hope-ui.preset");

/**
 * A resolved preset — the object `ThemeProvider` consumes. Branded (see {@link PRESET_BRAND}) so it is
 * distinguishable at runtime from a bare `RecipeRegistry`. `components` is always present, possibly
 * empty. Token *values* are not carried here; a preset authors them in CSS.
 */
export interface Preset {
  readonly [PRESET_BRAND]: true;
  readonly recipes: RecipeRegistry;
  readonly components: PresetComponentOverrides;
}

/** A component override at the widest key — internal merge machinery over the open registry. */
type AnyComponentOverride = ComponentOverride<keyof RecipeRegistry>;

/**
 * Merge two component-override maps **per component, per field**, the override winning. `defaultProps`
 * merges key by key, so overriding one default keeps the base's others; a shallow spread suffices
 * because every themeable prop is a top-level value (primitive or factory function), never a nested
 * object. `slotClasses` is replaced wholesale — its function form can't be merged, and one predictable
 * rule for both forms beats two.
 */
function mergeComponentOverrides(
  base: PresetComponentOverrides,
  override: PresetComponentOverrides | undefined,
): PresetComponentOverrides {
  if (!override) {
    return { ...base };
  }
  const baseMap = base as Record<string, AnyComponentOverride | undefined>;
  const overrideMap = override as Record<string, AnyComponentOverride | undefined>;
  const result: Record<string, AnyComponentOverride> = {};
  for (const key of new Set([...Object.keys(baseMap), ...Object.keys(overrideMap)])) {
    const b = baseMap[key];
    const o = overrideMap[key];
    if (b && o) {
      const merged: AnyComponentOverride = {};
      const defaultProps = { ...b.defaultProps, ...o.defaultProps };
      if (Object.keys(defaultProps).length > 0) {
        merged.defaultProps = defaultProps;
      }
      const slotClasses = o.slotClasses ?? b.slotClasses;
      if (slotClasses !== undefined) {
        merged.slotClasses = slotClasses;
      }
      result[key] = merged;
    } else {
      // Exactly one side is present (the Set guarantees at least one).
      result[key] = (o ?? b) as AnyComponentOverride;
    }
  }
  return result as PresetComponentOverrides;
}

/**
 * Derive a preset. `base` is normally an existing `Preset` such as `hope`; passing a raw
 * `RecipeRegistry` bootstraps a **root** preset, and is the one place a registry is passed directly.
 * `config` merges over the base per component and per field. Recipes always come from `base` — a
 * config never carries recipes, and never carries token values (those are authored in CSS).
 */
export function definePreset(base: Preset | RecipeRegistry, config?: PresetConfig): Preset {
  const baseIsPreset = isPreset(base);
  const baseRecipes = baseIsPreset ? base.recipes : base;
  const baseComponents = baseIsPreset ? base.components : {};

  return {
    [PRESET_BRAND]: true,
    recipes: baseRecipes,
    components: mergeComponentOverrides(baseComponents, config?.components),
  };
}

/**
 * Whether `value` is a `Preset`. Checks the {@link PRESET_BRAND} key, so a preset built by another
 * installed copy of this package still passes.
 */
export function isPreset(value: unknown): value is Preset {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as Record<symbol, unknown>)[PRESET_BRAND] === true
  );
}
