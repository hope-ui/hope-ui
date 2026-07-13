import { definePreset } from "@pandacss/dev";
import { basePreset } from "../base";
import { semanticTokens, tokens } from "./tokens";

/**
 * `@hope-ui/themes/chakra` — hope-ui's **default theme**: a Chakra-UI-v3-like visual style, built
 * on the shared `@hope-ui/themes/base` foundation and expressed through hope's own semantic-token
 * vocabulary (see `./tokens/semantic-tokens.ts`).
 *
 * Composition mirrors `nova`: extend `base` with a `semanticTokens` color layer. chakra adds one
 * raw override — Chakra's palette hex values (`./tokens/colors.ts`) — replacing base's
 * Tailwind-OKLCH ramps for the ten hues Chakra ships. It introduces **no new token keys**: per the
 * swap-safety rule (`../base/contracts/token-contract.ts`), Chakra-only tokens (the `2xs` rung,
 * `label`/`none` textStyles, the `heading` font) live in `base` so every theme shares them, and a
 * theme only overrides values of existing keys.
 *
 * Recipes are deferred: like nova, chakra ships tokens only until components consume `useRecipe`.
 */
export const chakraPreset = definePreset({
  name: "@hope-ui/themes/chakra",
  presets: [basePreset],
  theme: {
    extend: {
      tokens,
      semanticTokens,
    },
  },
});

export default chakraPreset;
