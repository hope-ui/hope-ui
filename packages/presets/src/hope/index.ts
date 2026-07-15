/*
 * @hope-ui/presets/hope — the public JS entry for hope-ui's default preset.
 *
 * This is the JS half of the hope preset (the CSS half is `@import "@hope-ui/presets/hope/tailwind.css"`).
 * Two things are exported:
 *   - `hope` — the `Preset` a SolidJS app passes to `<ThemeProvider preset={hope}>`; `@hope-ui/components`
 *     then reads each component's recipe out with `useRecipe(...)`. Built with `definePreset` over the
 *     raw recipe map, it carries **empty token overrides** (hope's token values live in CSS, not JS), so
 *     `renderPresetStyle(hope.tokens, …) === ""` and the provider stays on its zero-DOM branch.
 *   - `hopeRecipes` — the raw `RecipeRegistry` map, kept for bootstrapping (it's what `definePreset`
 *     derives `hope` from) and for the conformance tests. The internal recipe map lives under `./recipes`.
 */
import { definePreset } from "@hope-ui/theming";
import { hopeRecipes } from "./recipes";

export { hopeRecipes } from "./recipes";

/** The hope preset — pass to `<ThemeProvider preset={hope}>`. Empty token overrides (values live in CSS). */
export const hope = definePreset(hopeRecipes);
