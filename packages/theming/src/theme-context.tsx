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
} from "./preset";
import type { RecipeRegistry } from "./recipe-registry";
import type { SlotRecipeFn } from "./slot-recipe";
import { cx } from "./styling";

/**
 * The theme context: the current {@link Preset}. `createComponentContext` wraps Solid's own
 * `createContext`/`useContext`, so the preset is readable during a server render too, not just in the
 * browser. `useThemeContext` rethrows the missing-provider error with a friendlier message.
 */
const [ThemeContext, useThemeContext] = createComponentContext<Preset>("ThemeProvider");

export interface ThemeProviderProps {
  /**
   * The preset — the one object the runtime consumes (see {@link Preset}): the `recipes` map plus the
   * typed per-component overrides. Build it with `definePreset` (extend `hope`, or start from a raw
   * recipe map). A preset is chosen at build time, so this value is static rather than reactive.
   */
  preset: Preset;
  children?: JSX.Element;
}

/**
 * Provides a preset to everything below it. **Zero-DOM**: it renders no markup of its own — token
 * *values* live in the preset's CSS as `--hope-*` custom properties (see `@hope-ui/presets/hope`), not
 * in a runtime `<style>`.
 *
 * Solid pairs server-rendered and client nodes by their position in the component tree (its `_hk`
 * hydration key), so wrapping a subtree in `<ThemeProvider>` shifts every key inside it: a component's
 * server-render and hydration fixtures must both include it, identically. The provider itself
 * contributes no node, so its server output is exactly `children`.
 */
export function ThemeProvider(props: ThemeProviderProps): JSX.Element {
  // A JS consumer bypassing the types (or forwarding a raw recipe map) gets a clear error here rather
  // than a downstream "cannot read properties of undefined (reading 'recipes')".
  // Decision D7 in `__internal__/preset-api.md`.
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
 * Reads one recipe — a pure props-to-class-names function — from the current preset. The low-level
 * styling seam: a component calls `useRecipe("button")` (usually via {@link useSlots}) and computes
 * each slot's `class` from `recipe(variantProps).<slot>()` in a getter. Being pure, a recipe returns
 * the same string on the server and in the browser, so it can never cause a hydration mismatch.
 *
 * @throws if called outside a `<ThemeProvider>`, or if the mounted preset provides no recipe for
 * `key` — a clear error rather than a downstream "undefined is not a function".
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
 * Applies the preset's per-component `defaultProps`, then the component's built-in defaults, in one
 * call. Precedence is **instance ?? preset ?? builtin**: `withDefaults` resolves each key with `??`,
 * so only a present, non-nullish value wins — Solid's `merge` resolves by key *presence* instead, and
 * would let an explicit `undefined` beat the default. Reads stay lazy getters, so calling this once at
 * the top of a component body and reading from anywhere is safe.
 *
 * `defaultProps` is typed to a curated themeable surface (`ThemeablePropsOf`) but merged into the
 * component's *full* props `P`; the `as Partial<P>` cast is what lets a non-styling default through.
 * Keys present in `defaults` become required on the result (see {@link WithDefaults}).
 */
export function useDefaults<K extends keyof RecipeRegistry, P extends object, D extends Partial<P>>(
  options: UseDefaultsOptions<K, P, D>,
): WithDefaults<P, D> {
  const presetDefaults = (useTheme().components[options.recipe]?.defaultProps ?? {}) as Partial<P>;
  // The inner result exposes every `P` key as a getter, so it stands in for a real `P` on the outer
  // call, whose return type is the declared `WithDefaults<P, D>`.
  const withPreset = withDefaults(options.props, presetDefaults) as unknown as P;
  return withDefaults(withPreset, options.defaults);
}

/** Options for {@link useSlots}. Reactive inputs are accessors so each slot fn recomputes on change. */
export interface UseSlotsOptions<K extends keyof RecipeRegistry> {
  /** The recipe key whose base classes and preset `slotClasses` seed every slot. */
  recipe: K;
  /**
   * The recipe's variant props, re-read on every slot-fn call so a variant change flows through.
   * Variants are the only styling input: a recipe understands nothing else, and the preset's
   * `slotClasses` function form receives this same object. Runtime state (`disabled`, `loading`) is
   * styled through the recipe's `data-*`/`aria-*` Tailwind variants instead, never passed here.
   *
   * Typed {@link CompleteVariantsOf} — every variant key must be *present*, though its value may be
   * `undefined` — rather than the all-optional `RecipeVariantsOf`, so omitting one is a compile error
   * here instead of a silent fallback to the recipe's `defaultVariants` (which would also hand a
   * preset's `slotClasses` function `undefined` for that key).
   */
  variantsProps: Accessor<CompleteVariantsOf<K>>;
  /** Per-instance slot overrides, folded in after the preset's global `slotClasses`. */
  slotClasses?: Accessor<SlotClasses<K> | undefined>;
}

/**
 * One slot's ready-to-call class function. The argument is that element's **consumer `class`** — what
 * a part receives as `props.class`, passed as `class={ctx.slots.item(props.class)}`. It is folded in
 * *inside* the recipe's own `{ class }` seam, which is where tailwind-merge runs, so a consumer's
 * `p-8` replaces the recipe's `p-4`. Appending it outside the seam
 * (`cx(ctx.slots.item(), props.class)`) instead ships both conflicting utilities and lets stylesheet
 * order pick the winner.
 *
 * Typed `JSX.ClassValue`, not `string`, because that is what a part actually holds: Solid's `class`
 * attribute accepts the clsx-style union (`string | number | boolean | Record<string, boolean> | …`).
 * Narrowing would push a cast onto every part that forwards a native `class`.
 */
export type SlotClassAccessor = (consumerClass?: JSX.ClassValue) => string;

/**
 * Returns one {@link SlotClassAccessor} per slot, each folding the full override chain in order:
 * **recipe base → preset `slotClasses` → instance `slotClasses` → the slot's own `class` argument**.
 * Later wins, because the final tailwind-merge happens inside the recipe's `{ class }` seam. The
 * preset's global `slotClasses` is resolved per call, so its function form sees the current variants.
 *
 * Each returned fn reads `variantsProps()`/`slotClasses()` when called, so a
 * `class={slots.root(props.class)}` binding tracks exactly those inputs plus the `class` it reads.
 */
export function useSlots<K extends keyof RecipeRegistry>(
  options: UseSlotsOptions<K>,
): Record<RecipeSlotsOf<K>, SlotClassAccessor> {
  const preset = useTheme();
  // For a generic `K`, `RecipeRegistry[K]` is an indexed-access type TS won't treat as callable, even
  // though every registry entry is exactly a `SlotRecipeFn`. The optional `.slots` is metadata that
  // tailwind-variants attaches (its `TVReturnType`), typed here so the slot names below can be read
  // without invoking the recipe.
  const recipe = useRecipe(options.recipe) as unknown as SlotRecipeFn<
    RecipeVariantsOf<K>,
    RecipeSlotsOf<K>
  > & { readonly slots?: Record<RecipeSlotsOf<K>, unknown> };

  // A recipe's slot names never depend on its variant *values*, so read the metadata instead of
  // invoking it just to enumerate keys; the fallback covers a hand-rolled recipe that exposes none.
  // Neither branch reads a signal, so this non-tracking body can't trip Solid's STRICT_READ_UNTRACKED
  // warning — a `variantsProps()` read here would, which is why that one stays inside the slot fns.
  const slotNames = Object.keys(recipe.slots ?? recipe()) as RecipeSlotsOf<K>[];

  const resolvePresetSlotClasses = (): SlotClasses<K> | undefined => {
    const input = preset.components[options.recipe]?.slotClasses;
    return typeof input === "function" ? input(options.variantsProps()) : input;
  };

  const slots = {} as Record<RecipeSlotsOf<K>, SlotClassAccessor>;
  for (const slot of slotNames) {
    slots[slot] = (consumerClass) => {
      const presetSlot = resolvePresetSlotClasses()?.[slot];
      const instanceSlot = options.slotClasses?.()?.[slot];
      // `CompleteVariantsOf<K>` is always a valid recipe argument; the cast only bridges the generic
      // indexed access, whose per-`K` variant unions TS can't prove line up across a multi-recipe
      // registry. The runtime call is unaffected.
      return recipe(options.variantsProps() as RecipeVariantsOf<K>)[slot]({
        class: cx(presetSlot, instanceSlot, consumerClass),
      });
    };
  }
  return slots;
}
