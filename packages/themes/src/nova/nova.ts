import { definePreset } from "@pandacss/dev";
import { basePreset } from "../base/base";
import { semanticTokens } from "./semantic-tokens";

/**
 * `@hope-ui/themes/nova` — hope-ui's **default theme**. The base foundation plus the shadcn-style
 * "nova" semantic color layer (`background`/`foreground`/`primary`/`muted`/… over the raw palette,
 * light + `_dark`; see `semantic-tokens.ts`).
 *
 * This is the preset a consumer adds to their `panda.config.ts` (`presets: [novaPreset]`,
 * `eject: true`) and the one the dev `@hope-ui/styled-system` codegens against for Storybook/tests.
 * It carries **no recipes yet** — those arrive when components are designed, added here (and in any
 * sibling theme) as slot recipes.
 */
export const novaPreset = definePreset({
  name: "@hope-ui/themes/nova",
  presets: [basePreset],
  theme: {
    extend: {
      semanticTokens,
    },
  },
});

export default novaPreset;
