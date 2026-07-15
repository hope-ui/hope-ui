// The @hope-ui/theming contract kernel:
// - the recipe contract — the `SlotRecipeFn`/`SlotClassFn` shape, the `RecipeRegistry`, and each
//   hope-authored component's recipe types (re-exported wholesale from `./recipes`, so this stays
//   short as the component catalog grows);
// - the styling seam (`tv`/`cn`/`cx`);
// - the semantic color token vocabulary;
// - `ThemeProvider`/`useRecipe` runtime.
//
// The conformance kit is intentionally NOT re-exported here — it lives on the separate
// `@hope-ui/theming/conformance` subpath so it never enters a runtime consumer's bundle.

export * from "./recipes";
export {
  SEMANTIC_COLOR_TOKENS,
  type SemanticColorContract,
  type SemanticColorToken,
} from "./semantic-tokens/semantic-tokens";
export { cn, cx, tv } from "./styling/styling";
export { ThemeProvider, type ThemeProviderProps, useRecipe } from "./theme-context/theme-context";
