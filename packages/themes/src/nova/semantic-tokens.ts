import { defineSemanticTokens } from "@pandacss/dev";
import type { SemanticColorContract } from "../base/semantic-contract";

/**
 * hope-ui's "nova" semantic color layer — the shadcn-derived **default theme**, expressed in the
 * standardized semantic-token vocabulary (the token-axis contract; see the "Semantic token
 * vocabulary" section of `docs/theming.md`). Light (`base`) + dark (`_dark`), over the raw Tailwind
 * v4 palette (`../base/theme/colors.ts`).
 *
 * `colors` is typed `satisfies SemanticColorContract` (from `@hope-ui/themes/base`) so this — and
 * every other theme — must implement the exact same token shape: a missing, misspelled, or extra
 * token fails `tsc` instead of compiling to a broken `var(--colors-…)` at runtime.
 *
 * Naming follows the Atlassian Design System's `property.role.modifier` shape
 * (https://atlassian.design/foundations/tokens/design-tokens), adapted:
 *
 * - **Surfaces** are an elevation concept, not a fill: `surface` (default page/card),
 *   `surface.raised` (cards/menus), `surface.overlay` (dialogs), `surface.sunken` (wells),
 *   `surface.inverse` (tooltips). So `bg="surface"` — never a doubled `bg.bg`.
 * - **Foreground splits into `text.*` and `icon.*`.** Neutral emphasis ramps down `text` →
 *   `text.subtle` → `text.subtlest`; `text.inverse` is text on the inverse *surface*. Each role has
 *   a group: `text.<role>` (the role color as standalone text on a neutral surface),
 *   `text.<role>.foreground` (text on the role's SOLID fill), `text.<role>.subtle.foreground` (text
 *   on the role's SUBTLE fill). `icon.*` mirrors it. So a primary button is `bg="primary"` +
 *   `color="text.primary.foreground"`; a soft error alert is `bg="destructive.subtle"` +
 *   `color="text.destructive.subtle.foreground"`.
 * - **Borders**: `border` / `border.bold` / `border.disabled` + `border.<role>`.
 * - **Fills stay role-first and bare** (decision 01): `bg="primary"`, `bg="destructive"`,
 *   `bg="destructive.subtle"`. Each role is `{ DEFAULT (solid), subtle (tonal) }`.
 * - **`ring`** (focus) and **`scrim`** (modal dimming; distinct from the overlay *surface*).
 *
 * Discrete `.hovered`/`.pressed`/`.bold` states are contract-reserved but omitted: nova derives
 * interaction states with `color-mix` (decision 02); disabled is `text.disabled`/`border.disabled`
 * + `opacity.disabled` (decision 08). Categorical color (`chart.*`) is out of contract (decision
 * 07). Leaves are camelCase; Panda emits the dashed CSS var (decision 09).
 *
 * nova's brand is monochrome (shadcn default): `primary` / `text.primary` are near-black /
 * near-white. Feedback uses green (success) / blue (info) / amber (warning) / red (destructive).
 * `warning`'s on-solid foreground is dark in both themes (white fails on amber). First-pass values,
 * tuned to survive AA on the common pairings; expect iteration.
 */
const colors = {
  // ── surfaces (elevation) ─────────────────────────────────────────────────────
  surface: {
    DEFAULT: { value: { base: "{colors.white}", _dark: "{colors.neutral.900}" } },
    sunken: { value: { base: "{colors.neutral.50}", _dark: "{colors.neutral.950}" } },
    raised: { value: { base: "{colors.white}", _dark: "{colors.neutral.800}" } },
    overlay: { value: { base: "{colors.white}", _dark: "{colors.neutral.800}" } },
    inverse: { value: { base: "{colors.neutral.900}", _dark: "{colors.neutral.100}" } },
  },

  // ── text (foreground) ────────────────────────────────────────────────────────
  text: {
    DEFAULT: { value: { base: "{colors.neutral.950}", _dark: "{colors.neutral.50}" } },
    subtle: { value: { base: "{colors.neutral.600}", _dark: "{colors.neutral.400}" } },
    subtlest: { value: { base: "{colors.neutral.500}", _dark: "{colors.neutral.500}" } },
    disabled: { value: { base: "{colors.neutral.400}", _dark: "{colors.neutral.600}" } },
    inverse: { value: { base: "{colors.neutral.50}", _dark: "{colors.neutral.900}" } },
    primary: {
      DEFAULT: { value: { base: "{colors.neutral.900}", _dark: "{colors.neutral.100}" } },
      foreground: { value: { base: "{colors.neutral.50}", _dark: "{colors.neutral.900}" } },
      subtle: {
        foreground: { value: { base: "{colors.neutral.900}", _dark: "{colors.neutral.100}" } },
      },
    },
    neutral: {
      DEFAULT: { value: { base: "{colors.neutral.700}", _dark: "{colors.neutral.300}" } },
      foreground: { value: { base: "{colors.neutral.900}", _dark: "{colors.neutral.50}" } },
      subtle: {
        foreground: { value: { base: "{colors.neutral.900}", _dark: "{colors.neutral.100}" } },
      },
    },
    success: {
      DEFAULT: { value: { base: "{colors.green.600}", _dark: "{colors.green.400}" } },
      foreground: { value: { base: "{colors.white}", _dark: "{colors.green.950}" } },
      subtle: {
        foreground: { value: { base: "{colors.green.800}", _dark: "{colors.green.200}" } },
      },
    },
    info: {
      DEFAULT: { value: { base: "{colors.blue.600}", _dark: "{colors.blue.400}" } },
      foreground: { value: { base: "{colors.white}", _dark: "{colors.blue.950}" } },
      subtle: { foreground: { value: { base: "{colors.blue.800}", _dark: "{colors.blue.200}" } } },
    },
    warning: {
      DEFAULT: { value: { base: "{colors.amber.700}", _dark: "{colors.amber.400}" } },
      foreground: { value: { base: "{colors.amber.950}", _dark: "{colors.amber.950}" } },
      subtle: {
        foreground: { value: { base: "{colors.amber.800}", _dark: "{colors.amber.200}" } },
      },
    },
    destructive: {
      DEFAULT: { value: { base: "{colors.red.600}", _dark: "{colors.red.400}" } },
      foreground: { value: { base: "{colors.white}", _dark: "{colors.red.950}" } },
      subtle: { foreground: { value: { base: "{colors.red.800}", _dark: "{colors.red.200}" } } },
    },
  },

  // ── icon (mirrors text) ──────────────────────────────────────────────────────
  icon: {
    DEFAULT: { value: { base: "{colors.neutral.700}", _dark: "{colors.neutral.300}" } },
    subtle: { value: { base: "{colors.neutral.500}", _dark: "{colors.neutral.500}" } },
    disabled: { value: { base: "{colors.neutral.400}", _dark: "{colors.neutral.600}" } },
    inverse: { value: { base: "{colors.neutral.50}", _dark: "{colors.neutral.900}" } },
    primary: {
      DEFAULT: { value: { base: "{colors.neutral.900}", _dark: "{colors.neutral.100}" } },
      foreground: { value: { base: "{colors.neutral.50}", _dark: "{colors.neutral.900}" } },
      subtle: {
        foreground: { value: { base: "{colors.neutral.900}", _dark: "{colors.neutral.100}" } },
      },
    },
    neutral: {
      DEFAULT: { value: { base: "{colors.neutral.700}", _dark: "{colors.neutral.300}" } },
      foreground: { value: { base: "{colors.neutral.900}", _dark: "{colors.neutral.50}" } },
      subtle: {
        foreground: { value: { base: "{colors.neutral.900}", _dark: "{colors.neutral.100}" } },
      },
    },
    success: {
      DEFAULT: { value: { base: "{colors.green.600}", _dark: "{colors.green.400}" } },
      foreground: { value: { base: "{colors.white}", _dark: "{colors.green.950}" } },
      subtle: {
        foreground: { value: { base: "{colors.green.800}", _dark: "{colors.green.200}" } },
      },
    },
    info: {
      DEFAULT: { value: { base: "{colors.blue.600}", _dark: "{colors.blue.400}" } },
      foreground: { value: { base: "{colors.white}", _dark: "{colors.blue.950}" } },
      subtle: { foreground: { value: { base: "{colors.blue.800}", _dark: "{colors.blue.200}" } } },
    },
    warning: {
      DEFAULT: { value: { base: "{colors.amber.600}", _dark: "{colors.amber.400}" } },
      foreground: { value: { base: "{colors.amber.950}", _dark: "{colors.amber.950}" } },
      subtle: {
        foreground: { value: { base: "{colors.amber.800}", _dark: "{colors.amber.200}" } },
      },
    },
    destructive: {
      DEFAULT: { value: { base: "{colors.red.600}", _dark: "{colors.red.400}" } },
      foreground: { value: { base: "{colors.white}", _dark: "{colors.red.950}" } },
      subtle: { foreground: { value: { base: "{colors.red.800}", _dark: "{colors.red.200}" } } },
    },
  },

  // ── borders ──────────────────────────────────────────────────────────────────
  border: {
    DEFAULT: { value: { base: "{colors.neutral.200}", _dark: "{colors.neutral.800}" } },
    bold: { value: { base: "{colors.neutral.300}", _dark: "{colors.neutral.700}" } },
    disabled: { value: { base: "{colors.neutral.100}", _dark: "{colors.neutral.900}" } },
    primary: { value: { base: "{colors.neutral.900}", _dark: "{colors.neutral.100}" } },
    success: { value: { base: "{colors.green.500}", _dark: "{colors.green.500}" } },
    info: { value: { base: "{colors.blue.500}", _dark: "{colors.blue.500}" } },
    warning: { value: { base: "{colors.amber.500}", _dark: "{colors.amber.500}" } },
    destructive: { value: { base: "{colors.red.500}", _dark: "{colors.red.500}" } },
  },

  // ── fills (role-first; bare = solid, `.subtle` = tonal) ──────────────────────
  primary: {
    DEFAULT: { value: { base: "{colors.neutral.900}", _dark: "{colors.neutral.100}" } },
    subtle: { value: { base: "{colors.neutral.100}", _dark: "{colors.neutral.800}" } },
  },
  neutral: {
    DEFAULT: { value: { base: "{colors.neutral.100}", _dark: "{colors.neutral.800}" } },
    subtle: { value: { base: "{colors.neutral.50}", _dark: "{colors.neutral.900}" } },
  },
  success: {
    DEFAULT: { value: { base: "{colors.green.600}", _dark: "{colors.green.400}" } },
    subtle: { value: { base: "{colors.green.100}", _dark: "{colors.green.900}" } },
  },
  info: {
    DEFAULT: { value: { base: "{colors.blue.600}", _dark: "{colors.blue.400}" } },
    subtle: { value: { base: "{colors.blue.100}", _dark: "{colors.blue.900}" } },
  },
  warning: {
    DEFAULT: { value: { base: "{colors.amber.500}", _dark: "{colors.amber.400}" } },
    subtle: { value: { base: "{colors.amber.100}", _dark: "{colors.amber.900}" } },
  },
  destructive: {
    DEFAULT: { value: { base: "{colors.red.600}", _dark: "{colors.red.400}" } },
    subtle: { value: { base: "{colors.red.100}", _dark: "{colors.red.900}" } },
  },

  // ── systemic ─────────────────────────────────────────────────────────────────
  ring: { value: { base: "{colors.neutral.400}", _dark: "{colors.neutral.500}" } },
  scrim: { value: { base: "oklch(0% 0 0 / 0.5)", _dark: "oklch(0% 0 0 / 0.6)" } },
} satisfies SemanticColorContract;

export const semanticTokens = defineSemanticTokens({ colors });
