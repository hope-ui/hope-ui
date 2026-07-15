import { createComponentContext } from "@hope-ui/primitives/internal";
import type { JSX } from "@solidjs/web";
import type { RecipeRegistry } from "../registry/registry";

/**
 * The theme context: a map of recipe name → recipe function. Built on the kernel's
 * `createComponentContext` (isomorphic `solid-js` `createContext`/`useContext`), so it resolves
 * through the owner graph `renderToStringAsync` establishes on the server — a `<ThemeProvider>`
 * wrapping the server render is server-readable, which is what "works in SolidStart" needs.
 * `useThemeContext` rethrows the generic missing-provider error with a friendlier message.
 */
const [ThemeContext, useThemeContext] = createComponentContext<RecipeRegistry>("ThemeProvider");

export interface ThemeProviderProps {
  /**
   * The theme — a map of recipe name → recipe function (variant props → per-slot class functions).
   * Injected as *functions*, never imported at build time: the recipe CSS is emitted by the
   * consumer's own Tailwind build over the theme's `recipes/`, while these functions produce the
   * matching class names at runtime. Theme is chosen at build time; this value is static.
   */
  theme: RecipeRegistry;
  children?: JSX.Element;
}

/**
 * Provides a theme to everything below it. `ThemeContext` is the Provider component directly
 * (SolidJS 2.0). Renders no DOM of its own, so it never affects hydration markup — but note that
 * *wrapping* a subtree in `<ThemeProvider>` shifts that subtree's hydration keys (`_hk`), so a
 * component's SSR and hydration fixtures must both include it identically.
 */
export function ThemeProvider(props: ThemeProviderProps): JSX.Element {
  return <ThemeContext value={props.theme}>{props.children}</ThemeContext>;
}

/**
 * Reads one recipe from the current theme. This is the single seam between a component and its
 * styling: `@hope-ui/components` calls `const recipe = useRecipe("button")` and computes each
 * slot's `class` from `recipe(variantProps).<slot>()` in a getter. The returned function is a pure
 * prop→className mapper, so it is byte-stable across server and client.
 *
 * @throws if called outside a `<ThemeProvider>` (friendly message), or if the mounted theme
 * provides no recipe for `key` (a theme built against an older contract, or a JS consumer
 * bypassing the types) — surfaced as a clear error rather than a downstream "undefined is not a
 * function".
 */
export function useRecipe<K extends keyof RecipeRegistry>(key: K): RecipeRegistry[K] {
  const theme = useThemeContext();
  const recipe = theme[key];
  if (recipe === undefined) {
    throw new Error(
      `useRecipe("${String(key)}"): the current theme provides no "${String(key)}" recipe. ` +
        "A hope-ui theme must implement every recipe in the RecipeRegistry contract.",
    );
  }
  return recipe;
}
