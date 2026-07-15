/**
 * The **preset machinery** — the pure, DOM-free core of hope-ui's preset theming API.
 *
 * A `Preset` is the single object `ThemeProvider` consumes: it owns everything the runtime needs —
 * the `recipes` (a {@link RecipeRegistry}) **plus** typed overrides (`tokens`, `components`,
 * `darkMode`). `RecipeRegistry` is demoted to an internal building block (the type of a preset's
 * `recipes` field). Consumers derive a preset with {@link definePreset}: extend an existing preset
 * (normally `hope`) with typed overrides, or bootstrap a *root* preset from a raw recipe map.
 *
 * This module is types + two pure functions (`definePreset`, `isPreset`) only — no DOM, no CSS
 * emission (that is `./token-css`), no Solid runtime (that is `../theme-context`). The CSS-value
 * transforms (camelCase→kebab, Tailwind shorthand→`var()`) live entirely in `./token-css`; here a
 * preset's `tokens` are stored **exactly as authored** (camelCase keys, shorthand/raw values) so the
 * renderer is the one place those transforms happen.
 *
 * **No module-scope state** (constraint #6): the only module constant is the brand symbol, resolved
 * through the cross-realm global registry (`Symbol.for`), so a preset built by one installed copy of
 * `@hope-ui/theming` is recognized by another.
 */
import type { ClassValue } from "tailwind-variants";
import type { RecipeRegistry } from "../recipes/registry";
import type { SemanticColorToken } from "../semantic-tokens/semantic-tokens";

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

/**
 * camelCase of a kebab string — `"on-primary-soft"` → `"onPrimarySoft"`. Used to derive the
 * ergonomic {@link ColorTokenKey} vocabulary from the fixed kebab `SemanticColorToken` names while
 * keeping it a **closed union** (a typo is a compile error, so `checkSemanticTokenConformance` stays
 * meaningful — constraint #3).
 */
type KebabToCamel<S extends string> = S extends `${infer Head}-${infer Tail}`
  ? `${Head}${Capitalize<KebabToCamel<Tail>>}`
  : S;

/**
 * The ergonomic, type-safe color-token keys a preset overrides: the camelCase spelling of the fixed
 * kebab `SemanticColorToken` vocabulary (`"warningSoft"`, `"onPrimary"`, `"foregroundMuted"`, …).
 * Still a closed union — an unknown key is a compile error — normalized back to `--hope-<kebab>` on
 * emit by `./token-css`.
 */
export type ColorTokenKey = KebabToCamel<SemanticColorToken>;

/**
 * One token's value: a bare string (used for **both** light and dark), or a per-mode
 * `{ light, dark? }`. `dark` omitted → no `.dark` override emitted for that token → it inherits the
 * base theme's dark value. Values are either a Tailwind color shorthand (`"violet.500"`, normalized
 * to `var(--color-violet-500)` on emit) or a raw CSS color (`"#fff"`, `"var(--x)"`, `"oklch(…)"`).
 */
export type TokenValue = string | { light: string; dark?: string };

/** A preset's typed token overrides — semantic colors (per-mode). */
export interface PresetTokens {
  colors?: Partial<Record<ColorTokenKey, TokenValue>>;
}

/**
 * How dark mode is delivered: a **selector** the base theme's dark variant matches (default
 * `".dark"`), `"media"` (a `prefers-color-scheme: dark` query), or `"none"` (never emit a dark
 * override block).
 */
export type DarkMode = string | "media" | "none";

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
  darkMode?: DarkMode;
  tokens?: PresetTokens;
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
 * is distinguishable at runtime from a bare `RecipeRegistry`. All fields are normalized:
 * `tokens`/`components` are always present objects (possibly empty), `darkMode` always resolved.
 */
export interface Preset {
  readonly [PRESET_BRAND]: true;
  readonly recipes: RecipeRegistry;
  readonly tokens: PresetTokens;
  readonly components: PresetComponentOverrides;
  readonly darkMode: DarkMode;
}

/** Merge two token maps, config winning **per token** (a token value is replaced, not deep-merged). */
function mergeTokens(base: PresetTokens, override: PresetTokens | undefined): PresetTokens {
  const colors: Partial<Record<ColorTokenKey, TokenValue>> = {
    ...base.colors,
    ...override?.colors,
  };
  const result: PresetTokens = {};
  if (Object.keys(colors).length > 0) {
    result.colors = colors;
  }
  return result;
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
 * deep-merges over the base, config winning: **tokens per-token**, **components per-component-per-
 * field**, and `darkMode = config ?? base ?? ".dark"`. Recipes always come from `base` (a config
 * never carries recipes). Token values are stored as authored — CSS normalization is `./token-css`'s
 * job.
 */
export function definePreset(base: Preset | RecipeRegistry, config?: PresetConfig): Preset {
  const baseIsPreset = isPreset(base);
  const baseRecipes = baseIsPreset ? base.recipes : base;
  const baseTokens = baseIsPreset ? base.tokens : {};
  const baseComponents = baseIsPreset ? base.components : {};
  const baseDarkMode = baseIsPreset ? base.darkMode : undefined;

  return {
    [PRESET_BRAND]: true,
    recipes: baseRecipes,
    tokens: mergeTokens(baseTokens, config?.tokens),
    components: mergeComponentOverrides(baseComponents, config?.components),
    darkMode: config?.darkMode ?? baseDarkMode ?? ".dark",
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
