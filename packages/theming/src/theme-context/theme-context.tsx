import { createComponentContext } from "@hope-ui/primitives/internal";
import type { JSX } from "@solidjs/web";
import type { ThemeRecipes } from "../theme-recipes/theme-recipes";

/**
 * The theme context: a map of recipe name → pure recipe function. Built on the kernel's
 * `createComponentContext` (isomorphic `solid-js` `createContext`/`useContext`), so it resolves
 * through the owner graph `renderToStringAsync` establishes on the server — a `<ThemeProvider>`
 * wrapping the server render is server-readable, which is what "works in SolidStart" needs.
 * `useThemeContext` rethrows the generic missing-provider error with a friendlier message.
 */
const [ThemeContext, useThemeContext] = createComponentContext<ThemeRecipes>("ThemeProvider");

export interface ThemeProviderProps {
  /**
   * The theme — a map of recipe name → pure recipe function (props → className). Injected as
   * *functions*, never imported at build time: the recipe CSS is emitted by the consumer's own
   * `panda codegen` over the theme's preset, while these functions (with `hash: false`) produce
   * the matching class names at runtime. Theme is chosen at codegen time; this value is static.
   */
  theme: ThemeRecipes;
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
 * styling: `@hope-ui/components` calls `const recipe = useRecipe("button")` and computes its
 * `class` from `recipe(variantProps)` in a getter (the `box.tsx` pattern). The returned function
 * is a pure prop→className mapper, so it is byte-stable across server and client.
 *
 * @throws if called outside a `<ThemeProvider>` (friendly message), or if the mounted theme
 * provides no recipe for `key` (a theme built against an older contract, or a JS consumer
 * bypassing the types) — surfaced as a clear error rather than a downstream "undefined is not a
 * function".
 */
export function useRecipe<K extends keyof ThemeRecipes>(key: K): ThemeRecipes[K] {
  const theme = useThemeContext();
  const recipe = theme[key];
  if (recipe === undefined) {
    throw new Error(
      `useRecipe("${String(key)}"): the current theme provides no "${String(key)}" recipe. ` +
        "A hope-ui theme must implement every recipe in the ThemeRecipes contract.",
    );
  }
  return recipe;
}
