// Everything "recipe" — the shape all recipes take, plus each component's recipe contract. One
// `export *` per component keeps the package barrel (`../index.ts`) to a single line as the catalog
// grows. The registries sit in `../registry` instead, re-exported by the root barrel directly: they
// are the contract *of* the recipes, not a recipe.

export type { SlotClassFn, SlotRecipeFn } from "../slot-recipe";
export * from "./alert";
export * from "./badge";
export * from "./button";
export * from "./calendar";
export * from "./close-button";
export * from "./combobox";
export * from "./dialog";
export * from "./listbox";
export * from "./popover";
export * from "./select";
