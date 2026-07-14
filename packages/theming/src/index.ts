// The @hope-ui/theming contract kernel. Runtime: ThemeProvider + useRecipe. Types: the
// (empty, augmentable) ThemeRecipes registry + the SlotRecipeFn shape every recipe takes. Plus
// the contract-version constant.
//
// The conformance kit is intentionally NOT re-exported here — it lives on the separate
// `@hope-ui/theming/conformance` subpath so it never enters a runtime consumer's bundle.

export {
  SEMANTIC_COLOR_TOKENS,
  type SemanticColorContract,
  type SemanticColorToken,
} from "./semantic-tokens/semantic-tokens";
// The Tailwind styling seam — recipe engine (`tv`) + class-merge helpers (`cn`/`cx`), all from
// tailwind-variants. See `docs/usage/theming/styling/styling.md`.
export { cn, cx, tv } from "./styling/styling";
export { ThemeProvider, type ThemeProviderProps, useRecipe } from "./theme-context/theme-context";
export {
  type SlotRecipeFn,
  THEMING_CONTRACT_VERSION,
  type ThemeRecipes,
} from "./theme-recipes/theme-recipes";
