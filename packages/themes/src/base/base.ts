import { definePreset } from "@pandacss/dev";
import { breakpoints } from "./theme/breakpoints";
import { conditions } from "./theme/conditions";
import { keyframes } from "./theme/keyframes";
import { tokens } from "./theme/tokens";
import { textStyles } from "./theme/typography";

/**
 * `@hope-ui/themes/base` — the theme-agnostic foundation every hope-ui theme builds on.
 *
 * Minimal setup (https://panda-css.com/docs/guides/minimal-setup): builds only on
 * `@pandacss/preset-base` (Panda's unopinionated utility engine — the `p`/`bg`/`_hover`/… style
 * props) and defines *every* raw token itself (Tailwind v4 values, owned outright — see
 * `theme/tokens.ts`). It carries the shared scales — colors, spacing, sizes, typography, radii,
 * shadows, durations, keyframes, breakpoints — plus the `dark` condition, but **no semantic
 * tokens and no recipes**: those are a theme's own decisions and live in the theme preset that
 * extends this one (e.g. `@hope-ui/themes/nova`).
 *
 * Consumers add a *theme* preset (which pulls this in), not this directly, and run `panda codegen`
 * with `eject: true` so Panda's own defaults don't merge back in. hope ships zero CSS.
 */
export const basePreset = definePreset({
  name: "@hope-ui/themes/base",
  presets: ["@pandacss/preset-base"],
  conditions: {
    extend: conditions,
  },
  theme: {
    extend: {
      tokens,
      textStyles,
      keyframes,
      breakpoints,
    },
  },
});

export default basePreset;
