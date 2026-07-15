// The @hope-ui/theming contract kernel:
// - the styling seam (`tv`/`cn`/`cx`) and the recipe-shape types (`SlotRecipeFn`/`SlotClassFn`);
// - `ThemeProvider`/`useRecipe` runtime;
// - the semantic color token vocabulary;
// - the recipe contract — the `RecipeRegistry` and each hope-authored component's recipe types
//   (re-exported wholesale from `./recipes`, so this stays short as the component catalog grows).
//
// The conformance kit is intentionally NOT re-exported here — it lives on the separate
// `@hope-ui/theming/conformance` subpath so it never enters a runtime consumer's bundle.

export * from "./recipes";
export { type RecipeRegistry, THEMING_CONTRACT_VERSION } from "./registry/registry";
export {
  SEMANTIC_COLOR_TOKENS,
  type SemanticColorContract,
  type SemanticColorToken,
} from "./semantic-tokens/semantic-tokens";
export type { SlotClassFn, SlotRecipeFn } from "./styling/recipe";
export { cn, cx, tv } from "./styling/styling";
export { ThemeProvider, type ThemeProviderProps, useRecipe } from "./theme-context/theme-context";
