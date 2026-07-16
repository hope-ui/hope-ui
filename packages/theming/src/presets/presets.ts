/**
 * The **preset machinery** — the pure, DOM-free core of hope-ui's preset theming API.
 *
 * A `Preset` is the single object `ThemeProvider` consumes: it owns everything the runtime needs —
 * the `recipes` (a {@link RecipeRegistry}) **plus** typed `components` overrides. `RecipeRegistry`
 * is demoted to an internal building block (the type of a preset's `recipes` field). Consumers
 * derive a preset with {@link definePreset}: extend an existing preset (normally `hope`) with typed
 * overrides, or bootstrap a *root* preset from a raw recipe map.
 *
 * Semantic token *values* are **not** part of this API — a preset authors them in CSS (as `--hope-*`
 * custom properties; see `@hope-ui/presets/hope`'s `tokens.css`), so `ThemeProvider` renders no DOM.
 * This module is types + two pure functions (`definePreset`, `isPreset`) only — no DOM, no Solid
 * runtime (that is `../theme-context`).
 *
 * **No module-scope state** (constraint #6): the only module constant is the brand symbol, resolved
 * through the cross-realm global registry (`Symbol.for`), so a preset built by one installed copy of
 * `@hope-ui/theming` is recognized by another.
 */
import type { ClassValue } from "tailwind-variants";
import type { RecipeRegistry } from "../recipes/registry";

/**
 * The variant props a registered recipe accepts — extracted straight from the recipe's own
 * signature, so a preset's per-component `defaultVariants` (and the `slotClasses` function form) are
 * typed exactly to what the recipe understands. `NonNullable` drops the `| undefined` from the
 * optional first parameter.
 */
export type RecipeVariantsOf<K extends keyof RecipeRegistry> = NonNullable<
  Parameters<RecipeRegistry[K]>[0]
>;

/** The slot names a registered recipe returns — the keys of its per-slot class-function record. */
export type RecipeSlotsOf<K extends keyof RecipeRegistry> = keyof ReturnType<RecipeRegistry[K]> &
  string;

/** A per-slot class record for a component, each slot typed to that recipe's slot union. */
export type SlotClasses<K extends keyof RecipeRegistry> = Partial<
  Record<RecipeSlotsOf<K>, ClassValue>
>;

/**
 * A preset's global `slotClasses` for a component: either a static per-slot record (the common,
 * fully-Tailwind-scannable case) or a function of the recipe's variant props. **Only the function
 * form's literal class *substrings* are Tailwind-scannable** — a constructed string (`` `px-${n}` ``)
 * is never generated.
 */
export type SlotClassesInput<K extends keyof RecipeRegistry> =
  | SlotClasses<K>
  | ((variants: RecipeVariantsOf<K>) => SlotClasses<K>);

/** A preset's per-component overrides: app-wide default variants and global slot classes. */
export interface ComponentOverride<K extends keyof RecipeRegistry> {
  /** Overrides the recipe's own `defaultVariants` app-wide — typed to the recipe's variant props. */
  defaultVariants?: Partial<RecipeVariantsOf<K>>;
  /** Global per-slot classes, folded in before per-instance `slotClasses` (see the provider phase). */
  slotClasses?: SlotClassesInput<K>;
}

/** Per-component overrides keyed by registry name. */
export type PresetComponentOverrides = { [K in keyof RecipeRegistry]?: ComponentOverride<K> };

/** The authoring shape passed to {@link definePreset} — every field optional, deep-merged over the base. */
export interface PresetConfig {
  components?: PresetComponentOverrides;
}

/**
 * The brand key. Runtime value is `Symbol.for("hope-ui.preset")` — resolved through the cross-realm
 * global symbol registry, so two installed copies of `@hope-ui/theming` agree on it (constraint #6).
 * A `const` initialized directly from `Symbol.for` has type `unique symbol`, which is what lets it be
 * an interface property key while staying nominal.
 */
const PRESET_BRAND = Symbol.for("hope-ui.preset");

/**
 * A resolved preset — the object `ThemeProvider` consumes. Branded (see {@link PRESET_BRAND}) so it
 * is distinguishable at runtime from a bare `RecipeRegistry`. `components` is always a present object
 * (possibly empty). Token *values* are not carried here — a preset authors them in CSS.
 */
export interface Preset {
  readonly [PRESET_BRAND]: true;
  readonly recipes: RecipeRegistry;
  readonly components: PresetComponentOverrides;
}

/** A component override at the widest key — internal merge machinery over the open registry. */
type AnyComponentOverride = ComponentOverride<keyof RecipeRegistry>;

/**
 * Merge two component-override maps **per component, per field** (config wins): `defaultVariants` is
 * deep-merged per variant key (so overriding one default keeps the base's others), while
 * `slotClasses` is replaced wholesale (config's if present, else base's — the function form cannot be
 * deep-merged, so both forms follow one predictable rule).
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
      const defaultVariants = { ...b.defaultVariants, ...o.defaultVariants };
      if (Object.keys(defaultVariants).length > 0) {
        merged.defaultVariants = defaultVariants;
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
 * Derive a preset. `base` is normally a `Preset` (e.g. `hope`); theme authors bootstrap a **root**
 * preset by passing a raw `RecipeRegistry` (the one place a registry is passed directly). `config`
 * deep-merges over the base, config winning **per component, per field**. Recipes always come from
 * `base` (a config never carries recipes). Token *values* are not part of the config — a preset
 * authors them in CSS (`--hope-*` custom properties; see `@hope-ui/presets/hope`).
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

/** Whether `value` is a `Preset` — checks the cross-realm brand (constraint #6). */
export function isPreset(value: unknown): value is Preset {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as Record<symbol, unknown>)[PRESET_BRAND] === true
  );
}
