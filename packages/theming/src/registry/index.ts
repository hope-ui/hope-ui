// The registry barrel: the two closed, hand-declared contracts a preset is typed against — the
// `RecipeRegistry` (recipe/slot shape + the contract-version constant) and the parallel, type-only
// `ThemeablePropsRegistry` (per-component chrome-content default vocabulary). A top-level `src/`
// folder (the contract seam, sibling to `recipes`/`preset`/`theme-context`), re-exported by the root
// barrel; the specifier `../registry` resolves here.
export * from "./recipe-registry";
export type * from "./themeable-props-registry";
