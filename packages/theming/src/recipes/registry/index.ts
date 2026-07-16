// The registry barrel: the two closed, hand-declared contracts a preset is typed against — the
// `RecipeRegistry` (recipe/slot shape + the contract-version constant) and the parallel, type-only
// `ThemeablePropsRegistry` (per-component behavioral/chrome default vocabulary). The specifier
// `../registry` resolves here, unchanged from when this was a single `registry.ts`.
export * from "./recipe-registry";
export type * from "./themeable-props-registry";
