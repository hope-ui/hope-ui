/*
 * @hope-ui/presets/hope — the public JS entry for hope-ui's default preset.
 *
 * This is the JS half of the hope preset (the CSS half is `@import "@hope-ui/presets/hope/tailwind.css"`).
 * Two things are exported:
 *   - `hope` — the `Preset` a SolidJS app passes to `<ThemeProvider preset={hope}>`; `@hope-ui/components`
 *     then reads each component's recipe out with `useRecipe(...)`. Built with `definePreset` over the
 *     raw recipe map.
 *   - `hopeRecipes` — the raw `RecipeRegistry` map, kept for bootstrapping (it's what `definePreset`
 *     derives `hope` from) and for the conformance tests. The internal recipe map lives under `./recipes`.
 *
 * hope is a **zero-DOM preset**: its semantic token *values* are authored in CSS (`./tokens.css` —
 * `--hope-*` custom properties as `var(--color-*)` references, imported by `./tailwind.css`), not in
 * TypeScript. So `<ThemeProvider preset={hope}>` renders no markup of its own — no runtime token
 * `<style>`. The shared `_base/theme-map.css` maps those `--hope-*` names into clean Tailwind
 * utilities (`bg-primary`, …).
 */
import { definePreset } from "@hope-ui/theming";
import { hopeRecipes } from "./recipes";

export { hopeRecipes } from "./recipes";

/** The hope preset — pass to `<ThemeProvider preset={hope}>`. Its token values live in `./tokens.css`. */
export const hope = definePreset(hopeRecipes);
