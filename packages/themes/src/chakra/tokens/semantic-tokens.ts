import { defineSemanticTokens } from "@pandacss/dev";
import type { SemanticColorContract } from "../../base/contracts";

/**
 * hope-ui's "chakra" semantic color layer — a Chakra-UI-v3-like look expressed in hope's own
 * standardized semantic-token vocabulary (the token-axis contract; see the "Semantic token
 * vocabulary" section of `docs/theming.md`). Light (`base`) + dark (`_dark`) over the
 * Chakra-valued palettes (`./tokens.ts`: Zinc-based `gray`, Chakra's hued ramps).
 *
 * This is the **default theme** hope-ui is built and demoed against. Values are chosen to
 * reproduce Chakra's surfaces/foregrounds/borders/fills — mapping Chakra v3's `bg`/`fg`/`border`
 * and its `colorPalette` scales (`solid`/`subtle`/`contrast`/`fg`) onto hope's `surface`/`text`/
 * `icon`/`border` + role-first `fills`. `primary` is Chakra's **teal** accent (`colorPalette`
 * teal — its brand hue) and drives the focus `ring`; `neutral` is the gray filled role; feedback
 * uses green/blue/orange/red. `warning`'s on-solid foreground is white in light / dark in dark,
 * per Chakra's orange contrast.
 *
 * `colors` is typed `satisfies SemanticColorContract` (from `@hope-ui/themes/base`) so chakra — like
 * nova — implements the exact same token shape: a missing, misspelled, or extra token fails `tsc`
 * instead of compiling to a broken `var(--colors-…)`. See `../nova/semantic-tokens.ts` for the
 * shadcn-derived sibling theme and the full vocabulary rationale.
 */
const colors = {
  // ── surfaces (elevation) ─────────────────────────────────────────────────────
  surface: {
    DEFAULT: { value: { base: "{colors.white}", _dark: "{colors.gray.900}" } },
    sunken: { value: { base: "{colors.gray.50}", _dark: "{colors.gray.950}" } },
    raised: { value: { base: "{colors.white}", _dark: "{colors.gray.800}" } },
    overlay: { value: { base: "{colors.white}", _dark: "{colors.gray.800}" } },
    inverse: { value: { base: "{colors.gray.900}", _dark: "{colors.gray.50}" } },
  },

  // ── text (foreground) ────────────────────────────────────────────────────────
  text: {
    DEFAULT: { value: { base: "{colors.black}", _dark: "{colors.gray.50}" } },
    subtle: { value: { base: "{colors.gray.600}", _dark: "{colors.gray.400}" } },
    subtlest: { value: { base: "{colors.gray.400}", _dark: "{colors.gray.500}" } },
    disabled: { value: { base: "{colors.gray.300}", _dark: "{colors.gray.700}" } },
    inverse: { value: { base: "{colors.gray.50}", _dark: "{colors.black}" } },
    primary: {
      DEFAULT: { value: { base: "{colors.teal.600}", _dark: "{colors.teal.300}" } },
      foreground: { value: { base: "{colors.white}", _dark: "{colors.white}" } },
      subtle: {
        foreground: { value: { base: "{colors.teal.700}", _dark: "{colors.teal.300}" } },
      },
    },
    neutral: {
      DEFAULT: { value: { base: "{colors.gray.700}", _dark: "{colors.gray.300}" } },
      foreground: { value: { base: "{colors.gray.900}", _dark: "{colors.gray.50}" } },
      subtle: {
        foreground: { value: { base: "{colors.gray.800}", _dark: "{colors.gray.200}" } },
      },
    },
    success: {
      DEFAULT: { value: { base: "{colors.green.600}", _dark: "{colors.green.300}" } },
      foreground: { value: { base: "{colors.white}", _dark: "{colors.white}" } },
      subtle: {
        foreground: { value: { base: "{colors.green.700}", _dark: "{colors.green.300}" } },
      },
    },
    info: {
      DEFAULT: { value: { base: "{colors.blue.600}", _dark: "{colors.blue.300}" } },
      foreground: { value: { base: "{colors.white}", _dark: "{colors.white}" } },
      subtle: {
        foreground: { value: { base: "{colors.blue.700}", _dark: "{colors.blue.300}" } },
      },
    },
    warning: {
      DEFAULT: { value: { base: "{colors.orange.600}", _dark: "{colors.orange.300}" } },
      foreground: { value: { base: "{colors.white}", _dark: "{colors.black}" } },
      subtle: {
        foreground: { value: { base: "{colors.orange.700}", _dark: "{colors.orange.300}" } },
      },
    },
    destructive: {
      DEFAULT: { value: { base: "{colors.red.500}", _dark: "{colors.red.400}" } },
      foreground: { value: { base: "{colors.white}", _dark: "{colors.white}" } },
      subtle: {
        foreground: { value: { base: "{colors.red.700}", _dark: "{colors.red.300}" } },
      },
    },
  },

  // ── icon (mirrors text, softer neutral ramp) ─────────────────────────────────
  icon: {
    DEFAULT: { value: { base: "{colors.gray.700}", _dark: "{colors.gray.300}" } },
    subtle: { value: { base: "{colors.gray.500}", _dark: "{colors.gray.500}" } },
    disabled: { value: { base: "{colors.gray.400}", _dark: "{colors.gray.600}" } },
    inverse: { value: { base: "{colors.gray.50}", _dark: "{colors.black}" } },
    primary: {
      DEFAULT: { value: { base: "{colors.teal.600}", _dark: "{colors.teal.300}" } },
      foreground: { value: { base: "{colors.white}", _dark: "{colors.white}" } },
      subtle: {
        foreground: { value: { base: "{colors.teal.700}", _dark: "{colors.teal.300}" } },
      },
    },
    neutral: {
      DEFAULT: { value: { base: "{colors.gray.700}", _dark: "{colors.gray.300}" } },
      foreground: { value: { base: "{colors.gray.900}", _dark: "{colors.gray.50}" } },
      subtle: {
        foreground: { value: { base: "{colors.gray.800}", _dark: "{colors.gray.200}" } },
      },
    },
    success: {
      DEFAULT: { value: { base: "{colors.green.600}", _dark: "{colors.green.300}" } },
      foreground: { value: { base: "{colors.white}", _dark: "{colors.white}" } },
      subtle: {
        foreground: { value: { base: "{colors.green.700}", _dark: "{colors.green.300}" } },
      },
    },
    info: {
      DEFAULT: { value: { base: "{colors.blue.600}", _dark: "{colors.blue.300}" } },
      foreground: { value: { base: "{colors.white}", _dark: "{colors.white}" } },
      subtle: {
        foreground: { value: { base: "{colors.blue.700}", _dark: "{colors.blue.300}" } },
      },
    },
    warning: {
      DEFAULT: { value: { base: "{colors.orange.600}", _dark: "{colors.orange.300}" } },
      foreground: { value: { base: "{colors.white}", _dark: "{colors.black}" } },
      subtle: {
        foreground: { value: { base: "{colors.orange.700}", _dark: "{colors.orange.300}" } },
      },
    },
    destructive: {
      DEFAULT: { value: { base: "{colors.red.500}", _dark: "{colors.red.400}" } },
      foreground: { value: { base: "{colors.white}", _dark: "{colors.white}" } },
      subtle: {
        foreground: { value: { base: "{colors.red.700}", _dark: "{colors.red.300}" } },
      },
    },
  },

  // ── borders ──────────────────────────────────────────────────────────────────
  border: {
    DEFAULT: { value: { base: "{colors.gray.200}", _dark: "{colors.gray.800}" } },
    bold: { value: { base: "{colors.gray.300}", _dark: "{colors.gray.700}" } },
    disabled: { value: { base: "{colors.gray.100}", _dark: "{colors.gray.900}" } },
    primary: { value: { base: "{colors.teal.500}", _dark: "{colors.teal.400}" } },
    success: { value: { base: "{colors.green.500}", _dark: "{colors.green.400}" } },
    info: { value: { base: "{colors.blue.500}", _dark: "{colors.blue.400}" } },
    warning: { value: { base: "{colors.orange.500}", _dark: "{colors.orange.400}" } },
    destructive: { value: { base: "{colors.red.500}", _dark: "{colors.red.400}" } },
  },

  // ── fills (role-first; bare = solid, `.subtle` = tonal) ──────────────────────
  primary: {
    DEFAULT: { value: { base: "{colors.teal.600}", _dark: "{colors.teal.600}" } },
    subtle: { value: { base: "{colors.teal.100}", _dark: "{colors.teal.900}" } },
  },
  neutral: {
    DEFAULT: { value: { base: "{colors.gray.100}", _dark: "{colors.gray.800}" } },
    subtle: { value: { base: "{colors.gray.50}", _dark: "{colors.gray.900}" } },
  },
  success: {
    DEFAULT: { value: { base: "{colors.green.600}", _dark: "{colors.green.600}" } },
    subtle: { value: { base: "{colors.green.100}", _dark: "{colors.green.900}" } },
  },
  info: {
    DEFAULT: { value: { base: "{colors.blue.600}", _dark: "{colors.blue.600}" } },
    subtle: { value: { base: "{colors.blue.100}", _dark: "{colors.blue.900}" } },
  },
  warning: {
    DEFAULT: { value: { base: "{colors.orange.600}", _dark: "{colors.orange.500}" } },
    subtle: { value: { base: "{colors.orange.100}", _dark: "{colors.orange.900}" } },
  },
  destructive: {
    DEFAULT: { value: { base: "{colors.red.600}", _dark: "{colors.red.600}" } },
    subtle: { value: { base: "{colors.red.100}", _dark: "{colors.red.900}" } },
  },

  // ── systemic ─────────────────────────────────────────────────────────────────
  ring: { value: { base: "{colors.teal.500}", _dark: "{colors.teal.400}" } },
  scrim: { value: { base: "rgba(0, 0, 0, 0.48)", _dark: "rgba(0, 0, 0, 0.64)" } },
} satisfies SemanticColorContract;

export const semanticTokens = defineSemanticTokens({ colors });
