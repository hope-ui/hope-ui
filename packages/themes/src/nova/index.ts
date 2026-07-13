import { definePreset } from "@pandacss/dev";
import { basePreset } from "../base";
import { semanticTokens } from "./tokens";

/**
 * `@hope-ui/themes/nova` — the shadcn-derived sibling theme (the default is `@hope-ui/themes/chakra`).
 * The base foundation plus the "nova" semantic color layer expressed in hope's standardized
 * vocabulary (`surface`/`text`/`primary`/… over the raw palette, light + `_dark`; see
 * `tokens/semantic-tokens.ts`).
 *
 * A consumer adds this to their `panda.config.ts` (`presets: [novaPreset]`, `eject: true`) instead
 * of `chakra` to opt into the shadcn look. It carries **no recipes yet** — those arrive when
 * components are designed, added here (and in any sibling theme) as slot recipes.
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
