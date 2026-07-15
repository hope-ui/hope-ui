/*
 * @hope-ui/presets/hope — the public JS entry for hope-ui's default preset.
 *
 * This is the JS half of the hope preset (the CSS half is `@import "@hope-ui/presets/hope/tailwind.css"`).
 * Two things are exported:
 *   - `hope` — the `Preset` a SolidJS app passes to `<ThemeProvider preset={hope}>`; `@hope-ui/components`
 *     then reads each component's recipe out with `useRecipe(...)`. Built with `definePreset` over the
 *     raw recipe map plus hope's token palette (`hopeTokens` below).
 *   - `hopeRecipes` — the raw `RecipeRegistry` map, kept for bootstrapping (it's what `definePreset`
 *     derives `hope` from) and for the conformance tests. The internal recipe map lives under `./recipes`.
 *
 * hope authors its **token values in TypeScript** (right here), exactly like a user-defined preset —
 * typed against the closed `ColorTokenKey` union (a typo is a compile error) and IntelliSense'd. So
 * `<ThemeProvider preset={hope}>` inlines a deterministic token `<style>` (`renderPresetStyle`, before
 * first paint / in the SSR stream) declaring the `--hope-*` custom properties. The shared
 * `_base/theme-map.css` maps those `--hope-*` names into clean Tailwind utilities (`bg-primary`, …).
 *
 * Values ride Tailwind's own palette: the `"hue.step"` shorthand (`"violet.600"`) normalizes to
 * `var(--color-violet-600)`, so the theme stays in lockstep with Tailwind's scale (see `token-css.ts`).
 * `on-warning` is paired with **taupe** and the neutrals with **mauve** — Tailwind v4's violet-tinted
 * grays — so the chrome echoes the brand hue. `scrim` is a raw `color-mix(...)` (no shorthand form).
 */
import { definePreset, type PresetTokens } from "@hope-ui/theming";
import { hopeRecipes } from "./recipes";

export { hopeRecipes } from "./recipes";

/**
 * hope's semantic token palette — the single source of truth for its `--hope-*` values. Every token
 * carries an explicit light + dark value (hope mirrors its scale across modes). `renderPresetStyle`
 * emits these in the fixed `SEMANTIC_COLOR_TOKENS` order, so the output is deterministic regardless of
 * the key order here.
 */
const hopeTokens: PresetTokens = {
  colors: {
    // Surfaces (elevation)
    surface: { light: "white", dark: "mauve.950" },
    surfaceRaised: { light: "white", dark: "mauve.900" },
    surfaceOverlay: { light: "white", dark: "mauve.900" },
    surfaceSunken: { light: "mauve.50", dark: "black" },
    surfaceInverse: { light: "mauve.900", dark: "mauve.50" },

    // Standard text ramp (on neutral surfaces)
    foreground: { light: "mauve.900", dark: "mauve.50" },
    foregroundMuted: { light: "mauve.600", dark: "mauve.400" },
    foregroundSubtle: { light: "mauve.400", dark: "mauve.500" },
    foregroundDisabled: { light: "mauve.300", dark: "mauve.600" },

    // On-color text (readable on a role fill or the inverse surface)
    onPrimary: { light: "white", dark: "mauve.950" },
    onPrimarySoft: { light: "violet.700", dark: "violet.200" },
    onNeutral: { light: "white", dark: "mauve.950" },
    onNeutralSoft: { light: "mauve.700", dark: "mauve.200" },
    onSuccess: { light: "white", dark: "mauve.950" },
    onSuccessSoft: { light: "green.700", dark: "green.200" },
    onInfo: { light: "white", dark: "mauve.950" },
    onInfoSoft: { light: "sky.700", dark: "sky.200" },
    onWarning: { light: "taupe.900", dark: "mauve.950" },
    onWarningSoft: { light: "amber.800", dark: "amber.200" },
    onDanger: { light: "white", dark: "mauve.950" },
    onDangerSoft: { light: "red.700", dark: "red.200" },
    onInverse: { light: "mauve.50", dark: "mauve.900" },

    // Role fills (bare = solid, -hover = solid hover, -soft = tonal, -outline = soft border tint)
    primary: { light: "violet.600", dark: "violet.400" },
    primaryHover: { light: "violet.700", dark: "violet.300" },
    primarySoft: { light: "violet.100", dark: "violet.950" },
    primaryOutline: { light: "violet.300", dark: "violet.700" },
    neutral: { light: "mauve.700", dark: "mauve.300" },
    neutralHover: { light: "mauve.800", dark: "mauve.200" },
    neutralSoft: { light: "mauve.100", dark: "mauve.800" },
    neutralOutline: { light: "mauve.300", dark: "mauve.700" },
    success: { light: "green.600", dark: "green.400" },
    successHover: { light: "green.700", dark: "green.300" },
    successSoft: { light: "green.100", dark: "green.950" },
    successOutline: { light: "green.300", dark: "green.700" },
    info: { light: "sky.600", dark: "sky.400" },
    infoHover: { light: "sky.700", dark: "sky.300" },
    infoSoft: { light: "sky.100", dark: "sky.950" },
    infoOutline: { light: "sky.300", dark: "sky.700" },
    // warning: amber-300 is too pale to read as a border on white → nudged one step to amber-400.
    warning: { light: "amber.400", dark: "amber.600" },
    warningHover: { light: "amber.500", dark: "amber.500" },
    warningSoft: { light: "amber.100", dark: "amber.950" },
    warningOutline: { light: "amber.400", dark: "amber.600" },
    danger: { light: "red.600", dark: "red.400" },
    dangerHover: { light: "red.700", dark: "red.300" },
    dangerSoft: { light: "red.100", dark: "red.950" },
    dangerOutline: { light: "red.300", dark: "red.700" },

    // Neutral border tints (role borders reuse the role color)
    subtleOutline: { light: "mauve.200", dark: "mauve.800" },
    strongOutline: { light: "mauve.300", dark: "mauve.700" },
    disabledOutline: { light: "mauve.200", dark: "mauve.800" },

    // Disabled control fill — kept ~2 steps from foreground-disabled so the label stays legible.
    disabled: { light: "mauve.100", dark: "mauve.800" },

    // Systemic
    focus: { light: "violet.600", dark: "violet.500" },
    scrim: {
      light: "color-mix(in oklab, var(--color-mauve-900) 50%, transparent)",
      dark: "color-mix(in oklab, var(--color-black) 70%, transparent)",
    },
  },
};

/** The hope preset — pass to `<ThemeProvider preset={hope}>`. Authors its token palette in TS (above). */
export const hope = definePreset(hopeRecipes, { tokens: hopeTokens });
