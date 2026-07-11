import { definePreset } from "@pandacss/dev";
import { breakpoints } from "./theme/breakpoints";
import { conditions } from "./theme/conditions";
import { keyframes } from "./theme/keyframes";
import { semanticTokens } from "./theme/semantic-tokens";
import { tokens } from "./theme/tokens";
import { textStyles } from "./theme/typography";

/**
 * The hope-ui Panda preset — hope-ui's visual identity as data, owned outright.
 *
 * Minimal setup (https://panda-css.com/docs/guides/minimal-setup): it builds only on
 * `@pandacss/preset-base` (Panda's unopinionated utility engine — the `p`/`bg`/`_hover`/…
 * style props), and defines *every* token itself. Nothing here depends on
 * `@pandacss/preset-panda`, so an upstream theme change can never shift hope's design system.
 *
 * - Non-semantic tokens (colors, spacing, sizes, typography, radii, shadows, …) use
 *   Tailwind v4 values, copied in (see `tokens.ts` / `colors.ts` / `typography.ts`).
 * - The shadcn "nova" semantic layer (`semantic-tokens.ts`) sits on top.
 *
 * Consumers add this to their `panda.config.ts` with `eject: true` (so Panda's own defaults
 * don't merge back in) and run `panda codegen`. hope ships zero CSS.
 */
export const hopePreset = definePreset({
  name: "@hope-ui/preset",
  presets: ["@pandacss/preset-base"],
  conditions: {
    extend: conditions,
  },
  theme: {
    extend: {
      tokens,
      semanticTokens,
      textStyles,
      keyframes,
      breakpoints,
    },
  },
});

export default hopePreset;
