// Everything "recipe" — the shape all recipes take, the registry of which ones a theme must
// provide, and each hope-authored component's recipe contract. One `export *` per component keeps
// the package barrel (`../index.ts`) to a single `export * from "./recipes"` as the catalog grows.
export * from "./button";
export { type RecipeRegistry, THEMING_CONTRACT_VERSION } from "./registry";
export type { SlotClassFn, SlotRecipeFn } from "./slot-recipe";
