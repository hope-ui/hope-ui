import { defineSemanticTokens } from "@pandacss/dev";

/**
 * hope-ui's "nova" semantic color layer — shadcn-style, light (`base`) + dark (`_dark`),
 * layered on top of the raw Tailwind v4 palette (`colors.ts`).
 *
 * All colors reference the Tailwind palette: neutral surfaces → `neutral`/`white`; status →
 * green/blue/yellow/red/violet (DEFAULT 600/400, foreground 800/200). Only the translucent
 * dark `border`/`input` stay raw (alpha, no exact token).
 *
 * Paired foreground tokens are nested, so `bg="primary"` + `color="primary.foreground"` compose.
 */
export const semanticTokens = defineSemanticTokens({
  colors: {
    background: { value: { base: "{colors.white}", _dark: "{colors.neutral.950}" } },
    foreground: { value: { base: "{colors.neutral.950}", _dark: "{colors.neutral.50}" } },
    card: {
      DEFAULT: { value: { base: "{colors.white}", _dark: "{colors.neutral.900}" } },
      foreground: { value: { base: "{colors.neutral.950}", _dark: "{colors.neutral.50}" } },
    },
    popover: {
      DEFAULT: { value: { base: "{colors.white}", _dark: "{colors.neutral.900}" } },
      foreground: { value: { base: "{colors.neutral.950}", _dark: "{colors.neutral.50}" } },
    },
    primary: {
      DEFAULT: { value: { base: "{colors.neutral.900}", _dark: "{colors.neutral.200}" } },
      foreground: { value: { base: "{colors.neutral.50}", _dark: "{colors.neutral.900}" } },
    },
    secondary: {
      DEFAULT: { value: { base: "{colors.neutral.100}", _dark: "{colors.neutral.800}" } },
      foreground: { value: { base: "{colors.neutral.900}", _dark: "{colors.neutral.50}" } },
    },
    muted: {
      DEFAULT: { value: { base: "{colors.neutral.100}", _dark: "{colors.neutral.800}" } },
      foreground: { value: { base: "{colors.neutral.500}", _dark: "{colors.neutral.400}" } },
    },
    accent: {
      DEFAULT: { value: { base: "{colors.neutral.100}", _dark: "{colors.neutral.800}" } },
      foreground: { value: { base: "{colors.neutral.900}", _dark: "{colors.neutral.50}" } },
    },
    success: {
      DEFAULT: { value: { base: "{colors.green.600}", _dark: "{colors.green.400}" } },
      foreground: { value: { base: "{colors.green.800}", _dark: "{colors.green.200}" } },
    },
    info: {
      DEFAULT: { value: { base: "{colors.blue.600}", _dark: "{colors.blue.400}" } },
      foreground: { value: { base: "{colors.blue.800}", _dark: "{colors.blue.200}" } },
    },
    warning: {
      DEFAULT: { value: { base: "{colors.yellow.600}", _dark: "{colors.yellow.400}" } },
      foreground: { value: { base: "{colors.yellow.800}", _dark: "{colors.yellow.200}" } },
    },
    destructive: {
      DEFAULT: { value: { base: "{colors.red.600}", _dark: "{colors.red.400}" } },
      foreground: { value: { base: "{colors.red.800}", _dark: "{colors.red.200}" } },
    },
    discovery: {
      DEFAULT: { value: { base: "{colors.violet.600}", _dark: "{colors.violet.400}" } },
      foreground: { value: { base: "{colors.violet.800}", _dark: "{colors.violet.200}" } },
    },
    border: { value: { base: "{colors.neutral.200}", _dark: "oklch(1 0 0 / 10%)" } },
    input: { value: { base: "{colors.neutral.200}", _dark: "oklch(1 0 0 / 15%)" } },
    ring: { value: { base: "{colors.neutral.400}", _dark: "{colors.neutral.500}" } },
  },
});
