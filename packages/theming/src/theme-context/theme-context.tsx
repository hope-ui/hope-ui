import { createComponentContext } from "@hope-ui/primitives/internal";
import { type WithDefaults, withDefaults } from "@hope-ui/primitives/utils";
import type { JSX } from "@solidjs/web";
import type { Accessor } from "solid-js";
import {
  type CompleteVariantsOf,
  isPreset,
  type Preset,
  type RecipeSlotsOf,
  type RecipeVariantsOf,
  type SlotClasses,
} from "../preset";
import type { SlotRecipeFn } from "../recipes/slot-recipe";
import type { RecipeRegistry } from "../registry";
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
   * **plus** the typed `components` overrides. Author it with `definePreset` (extend `hope`, or
   * bootstrap from a raw recipe map). The preset is chosen at build time; this value is static.
   */
  preset: Preset;
  children?: JSX.Element;
}

/**
 * Provides a preset to everything below it. **Zero-DOM**: it renders no markup of its own — token
 * *values* live in the preset's CSS (`--hope-*` custom properties; see `@hope-ui/presets/hope`), not
 * in a runtime `<style>`. `ThemeContext` is the Provider component directly (SolidJS 2.0), so it is
 * server-readable during `renderToStringAsync` (the whole of "works in SolidStart" for theming).
 *
 * Wrapping a subtree in `<ThemeProvider>` still shifts that subtree's hydration keys (`_hk` is a path
 * through the component tree), so a component's SSR and hydration fixtures must both include it
 * identically — but the provider itself contributes no node, so SSR output is exactly `children`.
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

  return <ThemeContext value={props.preset}>{props.children}</ThemeContext>;
}

/**
 * Returns the current preset — the advanced escape hatch for reading the whole {@link Preset}
 * (recipes + component overrides). Most components should reach for {@link useDefaults} /
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
  /** The recipe key whose preset `defaultProps` are the middle layer of the merge. */
  recipe: K;
  /** The component's own props (the highest-precedence layer). */
  props: P;
  /** The component's built-in defaults (the lowest-precedence layer). */
  defaults: D;
}

/**
 * Applies the preset's per-component `defaultProps` then the component's built-in defaults in one
 * call. Precedence is **instance ?? preset ?? builtin**: `withDefaults` (never `merge`) resolves each
 * key with `??`, so only a genuinely present, non-nullish value wins, and the layers nest —
 * `withDefaults(withDefaults(props, presetDefaults), builtins)`. Reads stay lazy (getters), so this is
 * safe to call once in a component body and read from anywhere.
 *
 * `defaultProps` is typed to a curated themeable surface (variants + behavioral policy + chrome
 * content — see `ThemeablePropsOf`), but it is merged into the component's *full* props `P`: the
 * `as Partial<P>` cast is what lets a behavioral default flow through unchanged. The keys present in
 * `defaults` become required on the result (see {@link WithDefaults}).
 */
export function useDefaults<K extends keyof RecipeRegistry, P extends object, D extends Partial<P>>(
  options: UseDefaultsOptions<K, P, D>,
): WithDefaults<P, D> {
  const presetDefaults = (useTheme().components[options.recipe]?.defaultProps ?? {}) as Partial<P>;
  // instance ?? preset first, then ?? builtin. The inner result carries every P key as a getter, so
  // it stands in for `P` on the outer call, whose return type is the declared `WithDefaults<P, D>`.
  const withPreset = withDefaults(options.props, presetDefaults) as unknown as P;
  return withDefaults(withPreset, options.defaults);
}

/** Options for {@link useSlots}. Reactive inputs are accessors so each slot fn recomputes on change. */
export interface UseSlotsOptions<K extends keyof RecipeRegistry> {
  /** The recipe key whose base classes and preset `slotClasses` seed every slot. */
  recipe: K;
  /**
   * The recipe's variant props, re-read on every slot-fn call so a variant change flows through. These
   * are the only styling inputs, and both consumers take exactly them: the recipe is a
   * `tailwind-variants` function that understands variant props and nothing else, and the preset's
   * `slotClasses` function form receives the same object (the one thing a global slot class can branch
   * on). The wider *themeable* surface (`ThemeablePropsOf` — variants + chrome content) is a
   * preset-`defaultProps` concept only; chrome content never affects classes, and runtime state
   * (`disabled`/`loading`) is reached through the recipe's `data-*`/`aria-*` Tailwind variants, so
   * neither is accepted here.
   *
   * Typed {@link CompleteVariantsOf} (every variant key **required to be present**; values may be
   * `undefined`), not the all-optional `RecipeVariantsOf` — so a component can't silently omit a
   * variant, which would make the recipe fall back to its `defaultVariants` and hand a preset's
   * `slotClasses` function `undefined` for that key. The omission is a compile error here instead.
   */
  variantsProps: Accessor<CompleteVariantsOf<K>>;
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
 * `slotClasses` is resolved per call — its function form is invoked with the current `variantsProps()`.
 *
 * Each returned fn reads `variantsProps()`/`slotClasses()`/`class()` when called, so calling it
 * inside a `class={slots.root()}` binding tracks exactly those inputs.
 */
export function useSlots<K extends keyof RecipeRegistry>(
  options: UseSlotsOptions<K>,
): Record<RecipeSlotsOf<K>, () => string> {
  const preset = useTheme();
  // Cast to the concrete callable shape: `RecipeRegistry[K]` for a generic `K` is an indexed-access
  // type TS won't treat as callable, but every registry entry is exactly a `SlotRecipeFn`. A recipe
  // built with `tailwind-variants` also carries its declared slots on an optional `.slots` property
  // (see tailwind-variants' `TVReturnType`) — typed here so slot names are readable without invoking
  // it. It is called with the recipe's variant props — the only input a `tailwind-variants` recipe reads.
  const recipe = useRecipe(options.recipe) as unknown as SlotRecipeFn<
    RecipeVariantsOf<K>,
    RecipeSlotsOf<K>
  > & { readonly slots?: Record<RecipeSlotsOf<K>, unknown> };

  // Slot names are static for a recipe (tv slots don't depend on variant *values*), so read them off
  // the recipe's `.slots` metadata rather than invoking it just to enumerate keys. `.slots` is a
  // tailwind-variants convenience, so fall back to one invocation for a hand-rolled `SlotRecipeFn` that
  // exposes no metadata. Either branch reads nothing reactive — so, unlike a `variantsProps()` read in
  // this non-tracking body, there is no STRICT_READ risk and no untrack is needed.
  const slotNames = Object.keys(recipe.slots ?? recipe()) as RecipeSlotsOf<K>[];

  const resolvePresetSlotClasses = (): SlotClasses<K> | undefined => {
    const input = preset.components[options.recipe]?.slotClasses;
    return typeof input === "function" ? input(options.variantsProps()) : input;
  };

  const slots = {} as Record<RecipeSlotsOf<K>, () => string>;
  for (const slot of slotNames) {
    slots[slot] = () => {
      const presetSlot = resolvePresetSlotClasses()?.[slot];
      const instanceSlot = options.slotClasses?.()?.[slot];
      const rootClass = slot === "root" ? options.class?.() : undefined;
      return recipe(options.variantsProps())[slot]({
        class: cx(presetSlot, instanceSlot, rootClass),
      });
    };
  }
  return slots;
}
