// The @hope-ui/theming contract kernel:
// - the registry contract — the `RecipeRegistry` (+ `THEMING_CONTRACT_VERSION`) and the parallel,
//   type-only `ThemeablePropsRegistry` (from the top-level `./registry` folder);
// - the recipe contract — the `SlotRecipeFn`/`SlotClassFn` shape and each hope-authored component's
//   recipe/themeable-props types (re-exported wholesale from `./recipes`, so this stays short as the
//   component catalog grows);
// - the preset machinery — `definePreset`/`isPreset`, the `Preset` type + the typed component-
//   override vocabulary (from `./preset`). Token *values* are authored in CSS, not here;
// - the styling seam (`tv`/`cn`/`cx`);
// - the semantic color token vocabulary;
// - `ThemeProvider`/`useRecipe` runtime.
//
// The conformance kit is intentionally NOT re-exported here — it lives on the separate
// `@hope-ui/theming/conformance` subpath so it never enters a runtime consumer's bundle.

export * from "./preset";
export * from "./recipes";
export * from "./registry";
export {
  SEMANTIC_COLOR_TOKENS,
  type SemanticColorContract,
  type SemanticColorToken,
} from "./semantic-tokens/semantic-tokens";
export { cn, cx, tv } from "./styling/styling";
export {
  ThemeProvider,
  type ThemeProviderProps,
  type UseDefaultsOptions,
  type UseSlotsOptions,
  useDefaults,
  useRecipe,
  useSlots,
  useTheme,
} from "./theme-context/theme-context";
