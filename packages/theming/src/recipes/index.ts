// Per-component recipe contracts — the variant vocabulary, slots, and `…Recipe` type each
// hope-authored component owns. One `export *` per component keeps the package barrel (`../index.ts`)
// to a single `export * from "./recipes"` as the catalog grows. The registry that lists which of
// these a theme must provide lives in `../registry`.
export * from "./button";
