// The @hope-ui/theming contract kernel. Runtime: ThemeProvider + useRecipe. Types: the
// (empty, augmentable) ThemeRecipes registry + the SlotRecipeFn shape every recipe takes. Plus
// the contract-version constant.
//
// The conformance kit is intentionally NOT re-exported here — it lives on the separate
// `@hope-ui/theming/conformance` subpath so it never enters a runtime consumer's bundle.
export { ThemeProvider, type ThemeProviderProps, useRecipe } from "./theme-context/theme-context";
export {
  type SlotRecipeFn,
  THEMING_CONTRACT_VERSION,
  type ThemeRecipes,
} from "./theme-recipes/theme-recipes";
