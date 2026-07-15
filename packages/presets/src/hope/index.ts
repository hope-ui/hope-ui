/*
 * @hope-ui/presets/hope — the public JS entry for hope-ui's default preset.
 *
 * This is the JS half of the hope preset (the CSS half is `@import "@hope-ui/presets/hope/tailwind.css"`).
 * A SolidJS app passes `hopeRecipes` to `<ThemeProvider theme={hopeRecipes}>`; `@hope-ui/components`
 * then reads each component's recipe out with `useRecipe(...)`. The internal recipe map lives under
 * `./recipes`; this barrel is the stable public subpath consumers import.
 */
export { hopeRecipes } from "./recipes";
