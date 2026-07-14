import { definePreset } from "@pandacss/dev";
import { breakpoints, conditions, keyframes, textStyles, tokens } from "./tokens";

/**
 * `@hope-ui/themes/base` — the theme-agnostic foundation every hope-ui theme builds on.
 *
 * Minimal setup (https://panda-css.com/docs/guides/minimal-setup): builds only on
 * `@pandacss/preset-base` (Panda's unopinionated utility engine — the `p`/`bg`/`_hover`/… style
 * props) and defines *every* raw token itself (Tailwind v4 values, owned outright — see
 * `tokens/`). It carries the shared scales — colors, spacing, sizes, typography, radii,
 * shadows, durations, keyframes, breakpoints — plus the `dark` condition, but **no semantic
 * tokens and no recipes**: those are a theme's own decisions and live in the theme preset that
 * extends this one (e.g. `@hope-ui/themes/chakra`, the default, or `@hope-ui/themes/nova`).
 *
 * Layout: `tokens/` (one file per category + the aggregate barrel), `contracts/` (the
 * `SemanticColorContract` / `BaseTokenContract` swap-safety types), and this barrel (the preset +
 * the contract re-exports).
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
  // Some display values are set by component runtime logic, not by a literal a consumer writes —
  // so Panda's usage scan never sees them and would emit no rule. `Flex`'s `inline` prop toggles
  // `display: inline-flex` at runtime; `d_inline-flex`/`d_flex` must therefore be pre-generated for
  // every consumer. Kept in `base` so every theme (chakra/nova) inherits it. Not a token, so the
  // swap-safety token contract does not apply.
  staticCss: {
    css: [{ properties: { display: ["flex", "inline-flex"] } }],
  },
});

export default basePreset;

/**
 * The theme contracts. `SemanticColorContract` — the semantic color vocabulary every theme's
 * `semanticTokens.colors` implements. `BaseTokenContract` + `ThemeTokenOverride` — the shared
 * raw-token key surface and the type a theme's raw-token overrides must satisfy (so a theme can
 * override values but never add a theme-local key). See `./contracts/`.
 */
export type {
  BaseTokenContract,
  SemanticColorContract,
  ThemeTextStylesOverride,
  ThemeTokenOverride,
} from "./contracts";
