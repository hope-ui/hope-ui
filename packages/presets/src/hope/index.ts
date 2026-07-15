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
 * Values ride Tailwind's own palette: a `"--color-*"` value (`"--color-violet-600"`) is wrapped to
 * `var(--color-violet-600)` on emit, so the theme stays in lockstep with Tailwind's scale (see
 * `token-css.ts`). Writing the raw `--color-*` reference — rather than a `"hue.step"` shorthand —
 * also keeps that literal in this build-scanned source, so Tailwind retains the palette var instead
 * of tree-shaking it. `on-warning` is paired with **taupe** and the neutrals with **neutral**;
 * `scrim` is a raw `color-mix(...)`.
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
    surface: { light: "--color-white", dark: "--color-neutral-950" },
    surfaceRaised: { light: "--color-white", dark: "--color-neutral-900" },
    surfaceOverlay: { light: "--color-white", dark: "--color-neutral-900" },
    surfaceSunken: { light: "--color-neutral-50", dark: "--color-black" },
    surfaceInverse: { light: "--color-neutral-900", dark: "--color-neutral-50" },

    // Standard text ramp (on neutral surfaces)
    foreground: { light: "--color-neutral-900", dark: "--color-neutral-50" },
    foregroundMuted: { light: "--color-neutral-600", dark: "--color-neutral-400" },
    foregroundSubtle: { light: "--color-neutral-400", dark: "--color-neutral-500" },
    foregroundDisabled: { light: "--color-neutral-300", dark: "--color-neutral-600" },

    // On-color text (readable on a role fill or the inverse surface)
    onPrimary: { light: "--color-white", dark: "--color-neutral-950" },
    onPrimarySoft: { light: "--color-violet-700", dark: "--color-violet-200" },
    onNeutral: { light: "--color-white", dark: "--color-neutral-950" },
    onNeutralSoft: { light: "--color-neutral-700", dark: "--color-neutral-200" },
    onSuccess: { light: "--color-white", dark: "--color-neutral-950" },
    onSuccessSoft: { light: "--color-green-700", dark: "--color-green-200" },
    onInfo: { light: "--color-white", dark: "--color-neutral-950" },
    onInfoSoft: { light: "--color-sky-700", dark: "--color-sky-200" },
    onWarning: { light: "--color-taupe-900", dark: "--color-neutral-950" },
    onWarningSoft: { light: "--color-amber-800", dark: "--color-amber-200" },
    onDanger: { light: "--color-white", dark: "--color-neutral-950" },
    onDangerSoft: { light: "--color-red-700", dark: "--color-red-200" },
    onInverse: { light: "--color-neutral-50", dark: "--color-neutral-900" },

    // Role fills (bare = solid, -hover = solid hover, -soft = tonal, -outline = soft border tint)
    primary: { light: "--color-violet-600", dark: "--color-violet-400" },
    primaryHover: { light: "--color-violet-700", dark: "--color-violet-300" },
    primarySoft: { light: "--color-violet-100", dark: "--color-violet-950" },
    primaryOutline: { light: "--color-violet-300", dark: "--color-violet-700" },
    neutral: { light: "--color-neutral-700", dark: "--color-neutral-300" },
    neutralHover: { light: "--color-neutral-800", dark: "--color-neutral-200" },
    neutralSoft: { light: "--color-neutral-100", dark: "--color-neutral-800" },
    neutralOutline: { light: "--color-neutral-300", dark: "--color-neutral-700" },
    success: { light: "--color-green-600", dark: "--color-green-400" },
    successHover: { light: "--color-green-700", dark: "--color-green-300" },
    successSoft: { light: "--color-green-100", dark: "--color-green-950" },
    successOutline: { light: "--color-green-300", dark: "--color-green-700" },
    info: { light: "--color-sky-600", dark: "--color-sky-400" },
    infoHover: { light: "--color-sky-700", dark: "--color-sky-300" },
    infoSoft: { light: "--color-sky-100", dark: "--color-sky-950" },
    infoOutline: { light: "--color-sky-300", dark: "--color-sky-700" },
    // warning: amber-300 is too pale to read as a border on white → nudged one step to amber-400.
    warning: { light: "--color-amber-400", dark: "--color-amber-600" },
    warningHover: { light: "--color-amber-500", dark: "--color-amber-500" },
    warningSoft: { light: "--color-amber-100", dark: "--color-amber-950" },
    warningOutline: { light: "--color-amber-400", dark: "--color-amber-600" },
    danger: { light: "--color-red-600", dark: "--color-red-400" },
    dangerHover: { light: "--color-red-700", dark: "--color-red-300" },
    dangerSoft: { light: "--color-red-100", dark: "--color-red-950" },
    dangerOutline: { light: "--color-red-300", dark: "--color-red-700" },

    // Neutral border tints (role borders reuse the role color)
    subtleOutline: { light: "--color-neutral-200", dark: "--color-neutral-800" },
    strongOutline: { light: "--color-neutral-300", dark: "--color-neutral-700" },
    disabledOutline: { light: "--color-neutral-200", dark: "--color-neutral-800" },

    // Disabled control fill — kept ~2 steps from foreground-disabled so the label stays legible.
    disabled: { light: "--color-neutral-50", dark: "--color-neutral-800" },

    // Systemic
    focus: { light: "--color-violet-600", dark: "--color-violet-500" },
    scrim: {
      light: "color-mix(in oklab, var(--color-neutral-900) 50%, transparent)",
      dark: "color-mix(in oklab, var(--color-black) 70%, transparent)",
    },
  },
};

/** The hope preset — pass to `<ThemeProvider preset={hope}>`. Authors its token palette in TS (above). */
export const hope = definePreset(hopeRecipes, { tokens: hopeTokens });
