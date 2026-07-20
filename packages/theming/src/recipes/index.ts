// Everything "recipe" — the shape all recipes take and each hope-authored component's recipe
// contract. One `export *` per component keeps the package barrel (`../index.ts`) to a single
// `export * from "./recipes"` as the catalog grows. (The registries live in the top-level
// `../registry` folder, re-exported by the root barrel directly — they are the contract *of* the
// recipes, not a recipe.)

export type { SlotClassFn, SlotRecipeFn } from "../slot-recipe";
export * from "./alert";
export * from "./badge";
export * from "./button";
export * from "./close-button";
export * from "./dialog";
