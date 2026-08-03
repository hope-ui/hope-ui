// The @hope-ui/theming contract kernel: the two registries, the recipe/slot shape and each
// component's recipe types, the preset machinery, the styling seam, the semantic token vocabulary,
// and the `ThemeProvider`/`useRecipe` runtime. Token *values* are authored in CSS, never here.
//
// The conformance kit is deliberately NOT re-exported: it lives on the separate
// `@hope-ui/theming/conformance` subpath so it never enters a runtime consumer's bundle.

export * from "./preset";
export * from "./recipe-registry";
export * from "./recipes";
export {
  SEMANTIC_COLOR_TOKENS,
  SEMANTIC_OPACITY_TOKENS,
  type SemanticColorContract,
  type SemanticColorToken,
  type SemanticOpacityContract,
  type SemanticOpacityToken,
} from "./semantic-tokens";
export { cn, cx, tv } from "./styling";
export {
  type SlotClassAccessor,
  ThemeProvider,
  type ThemeProviderProps,
  type UseDefaultsOptions,
  type UseSlotsOptions,
  useDefaults,
  useRecipe,
  useSlots,
  useTheme,
} from "./theme-context";
export type * from "./themeable-props-registry";
