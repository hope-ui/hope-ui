/*
 * @hope-ui/presets/hope — the public JS entry for hope-ui's default preset.
 *
 * This is the JS half; the CSS half is `@import "@hope-ui/presets/hope/tailwind.css"`. An app passes
 * `hope` to `<ThemeProvider preset={hope}>`, and `@hope-ui/components` reads each component's recipe
 * out with `useRecipe(...)`. `hopeRecipes` is the same map before `definePreset` wraps it, exported
 * for bootstrapping and for the conformance tests.
 *
 * hope is a **zero-DOM preset**: its semantic token *values* are authored in CSS (`./theme.css`, as
 * `--hope-*` custom properties), not in TypeScript, so `<ThemeProvider preset={hope}>` renders no
 * markup at all — no runtime token `<style>`. `_base/_theme-map.css` then maps those `--hope-*` names
 * onto plain Tailwind utilities (`bg-primary`, …).
 */
import { definePreset } from "@hope-ui/theming";
import { hopeRecipes } from "./recipes";

export { hopeRecipes } from "./recipes";

/** The hope preset — pass to `<ThemeProvider preset={hope}>`. Its token values live in `./theme.css`. */
export const hope = definePreset(hopeRecipes);
