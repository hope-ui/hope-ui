import { createComponentContext } from "@hope-ui/primitives/internal";
import { type WithDefaults, withDefaults } from "@hope-ui/primitives/utils";
import type { JSX } from "@solidjs/web";
import { type Accessor, untrack } from "solid-js";
import {
  isPreset,
  type Preset,
  type RecipeSlotsOf,
  type RecipeVariantsOf,
  renderPresetStyle,
  type SlotClasses,
} from "../presets";
import type { RecipeRegistry } from "../recipes/registry";
import type { SlotClassFn } from "../recipes/slot-recipe";
import { cx } from "../styling/styling";

/**
 * The theme context: the current {@link Preset}. Built on the kernel's `createComponentContext`
 * (isomorphic `solid-js` `createContext`/`useContext`), so it resolves through the owner graph
 * `renderToStringAsync` establishes on the server — a `<ThemeProvider>` wrapping the server render
 * is server-readable, which is what "works in SolidStart" needs. `useThemeContext` rethrows the
 * generic missing-provider error with a friendlier message.
 */
const [ThemeContext, useThemeContext] = createComponentContext<Preset>("ThemeProvider");

export interface ThemeProviderProps {
  /**
   * The preset — the single object the runtime consumes (see {@link Preset}): the `recipes` map
   * **plus** the typed token/component overrides. Author it with `definePreset` (extend `hope`, or
   * bootstrap from a raw recipe map). The preset is chosen at build time; this value is static.
   */
  preset: Preset;
  children?: JSX.Element;
}

/**
 * Provides a preset to everything below it, and — when the preset carries token overrides — inlines
 * a deterministic `<style>` (D3) so the `--hope-*` custom properties are present before first paint
 * and in the SSR stream (no FOUC). `ThemeContext` is the Provider component directly (SolidJS 2.0).
 *
 * The `<style>` decision is made **once, on the static preset**, so the server and client always
 * take the same branch and produce identical markup:
 * - **No token overrides** (e.g. `hope`, whose values live in CSS) → `renderPresetStyle` returns
 *   `""` and this returns the *exact* bare-provider tree — no fragment, no `<style>`. Existing
 *   component hydration fixtures (whose presets have empty tokens) are therefore byte-identical to
 *   before this phase; their hydration keys (`_hk`) do not shift.
 * - **Token overrides** → a `<style>` is rendered before `children`, inside the provider.
 *
 * Wrapping a subtree in `<ThemeProvider>` shifts that subtree's hydration keys either way (keys are
 * a path through the component tree), so a component's SSR and hydration fixtures must both include
 * it identically.
 */
export function ThemeProvider(props: ThemeProviderProps): JSX.Element {
  // D7: a JS consumer bypassing the types (or forwarding a raw recipe map) gets a clear error here,
  // rather than a downstream "cannot read properties of undefined (reading 'recipes')".
  if (!isPreset(props.preset)) {
    throw new Error(
      "ThemeProvider: `preset` must be a Preset created by `definePreset` (from @hope-ui/theming), " +
        "not a bare recipe map or arbitrary object. Wrap your recipes — `definePreset(recipes)` — " +
        "and pass the result as `preset={…}`.",
    );
  }

  // Computed from the *static* preset in the render body (not an effect): present before first
  // paint, and — being a static value — the branch below is identical on server and client.
  const css = renderPresetStyle(props.preset.tokens, props.preset.darkMode);

  // Zero-DOM branch (D3): the exact today tree, structurally unchanged, so nothing downstream shifts.
  if (css === "") {
    return <ThemeContext value={props.preset}>{props.children}</ThemeContext>;
  }

  return (
    <ThemeContext value={props.preset}>
      <style>{css}</style>
      {props.children}
    </ThemeContext>
  );
}

/**
 * Returns the current preset — the advanced escape hatch for reading the whole {@link Preset}
 * (recipes + token/component overrides). Most components should reach for {@link useDefaults} /
 * {@link useSlots} / {@link useRecipe} instead.
 *
 * @throws if called outside a `<ThemeProvider>` (friendly, provider-naming message).
 */
export function useTheme(): Preset {
  return useThemeContext();
}

/**
 * Reads one recipe from the current preset. The low-level styling seam: `@hope-ui/components` calls
 * `const recipe = useRecipe("button")` (or, more commonly, lets {@link useSlots} do it) and computes
 * each slot's `class` from `recipe(variantProps).<slot>()` in a getter. The returned function is a
 * pure prop→className mapper, so it is byte-stable across server and client.
 *
 * @throws if called outside a `<ThemeProvider>` (friendly message), or if the mounted preset
 * provides no recipe for `key` (a preset built against an older contract, or a JS consumer bypassing
 * the types) — surfaced as a clear error rather than a downstream "undefined is not a function".
 */
export function useRecipe<K extends keyof RecipeRegistry>(key: K): RecipeRegistry[K] {
  const recipe = useTheme().recipes[key];
  if (recipe === undefined) {
    throw new Error(
      `useRecipe("${String(key)}"): the current preset provides no "${String(key)}" recipe. ` +
        "A hope-ui preset must implement every recipe in the RecipeRegistry contract.",
    );
  }
  return recipe;
}

/** Options for {@link useDefaults}. Accessor-free — `props`/`defaults` are read lazily via getters. */
export interface UseDefaultsOptions<
  K extends keyof RecipeRegistry,
  P extends object,
  D extends Partial<P>,
> {
  /** The recipe key whose preset `defaultVariants` are the middle layer of the merge. */
  recipe: K;
  /** The component's own props (the highest-precedence layer). */
  props: P;
  /** The component's built-in defaults (the lowest-precedence layer). */
  defaults: D;
}

/**
 * Applies the preset's per-component `defaultVariants` then the component's built-in defaults in one
 * call. Precedence is **instance ?? preset ?? builtin**: `withDefaults` (never `merge`) resolves each
 * key with `??`, so only a genuinely present, non-nullish value wins, and the layers nest —
 * `withDefaults(withDefaults(props, presetDefaultVariants), builtins)`. Reads stay lazy (getters), so
 * this is safe to call once in a component body and read from anywhere.
 *
 * The keys present in `defaults` become required on the result (see {@link WithDefaults}).
 */
export function useDefaults<K extends keyof RecipeRegistry, P extends object, D extends Partial<P>>(
  options: UseDefaultsOptions<K, P, D>,
): WithDefaults<P, D> {
  const presetDefaultVariants = (useTheme().components[options.recipe]?.defaultVariants ??
    {}) as Partial<P>;
  // instance ?? preset first, then ?? builtin. The inner result carries every P key as a getter, so
  // it stands in for `P` on the outer call, whose return type is the declared `WithDefaults<P, D>`.
  const withPreset = withDefaults(options.props, presetDefaultVariants) as unknown as P;
  return withDefaults(withPreset, options.defaults);
}

/** Options for {@link useSlots}. Reactive inputs are accessors so each slot fn recomputes on change. */
export interface UseSlotsOptions<K extends keyof RecipeRegistry> {
  /** The recipe key whose base classes and preset `slotClasses` seed every slot. */
  recipe: K;
  /** The recipe's variant props — re-read on every slot-fn call, so variant changes flow through. */
  variants: Accessor<RecipeVariantsOf<K>>;
  /** Per-instance slot overrides, folded in after the preset's global `slotClasses`. */
  slotClasses?: Accessor<SlotClasses<K> | undefined>;
  /** The consumer's root `class`, applied **last** and to the `root` slot only. */
  class?: Accessor<string | undefined>;
}

/**
 * Returns one ready-to-call class function per slot, each folding the full override chain in order:
 * **recipe base → preset `slotClasses` → instance `slotClasses` → `class` (root slot only)**. `cx`
 * orders the overrides (later wins); the final tailwind-merge happens inside the recipe's own
 * `{ class }` seam, so a later utility beats an earlier conflicting one. The preset's global
 * `slotClasses` is resolved per call — its function form is invoked with the current `variants()`.
 *
 * Each returned fn reads `variants()`/`slotClasses()`/`class()` when called, so calling it inside a
 * `class={slots.root()}` binding tracks exactly those inputs.
 */
export function useSlots<K extends keyof RecipeRegistry>(
  options: UseSlotsOptions<K>,
): Record<RecipeSlotsOf<K>, () => string> {
  const preset = useTheme();
  // Cast to the concrete callable shape: `RecipeRegistry[K]` for a generic `K` is an indexed-access
  // type TS won't treat as callable, but every registry entry is exactly this `SlotRecipeFn` shape.
  const recipe = useRecipe(options.recipe) as unknown as (
    variants: RecipeVariantsOf<K>,
  ) => Record<RecipeSlotsOf<K>, SlotClassFn>;

  // Slot names are static for a recipe (tv slots don't depend on variant *values*), so read them
  // once, untracked — a plain `variants()` read in this non-tracking body would trip STRICT_READ.
  const slotNames = Object.keys(untrack(() => recipe(options.variants()))) as RecipeSlotsOf<K>[];

  const resolvePresetSlotClasses = (): SlotClasses<K> | undefined => {
    const input = preset.components[options.recipe]?.slotClasses;
    return typeof input === "function" ? input(options.variants()) : input;
  };

  const slots = {} as Record<RecipeSlotsOf<K>, () => string>;
  for (const slot of slotNames) {
    slots[slot] = () => {
      const presetSlot = resolvePresetSlotClasses()?.[slot];
      const instanceSlot = options.slotClasses?.()?.[slot];
      const rootClass = slot === "root" ? options.class?.() : undefined;
      return recipe(options.variants())[slot]({
        class: cx(presetSlot, instanceSlot, rootClass),
      });
    };
  }
  return slots;
}
