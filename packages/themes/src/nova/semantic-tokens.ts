import { defineSemanticTokens } from "@pandacss/dev";

/**
 * hope-ui's "nova" semantic color layer — the shadcn-derived **default theme**, expressed in the
 * standardized semantic-token vocabulary (the token-axis contract; see the "Semantic token
 * vocabulary" section of `docs/theming.md`). Light (`base`) + dark (`_dark`), over the raw Tailwind
 * v4 palette (`../base/theme/colors.ts`).
 *
 * Naming follows the Atlassian Design System's `property.role.modifier` shape
 * (https://atlassian.design/foundations/tokens/design-tokens), adapted:
 *
 * - **Surfaces** are an elevation concept, not a background fill: `surface` (default page/card),
 *   `surface.raised` (cards/menus), `surface.overlay` (dialogs), `surface.sunken` (wells),
 *   `surface.inverse` (tooltips). So `bg="surface"` — never a doubled `bg.bg`.
 * - **Foreground splits into `text.*` and `icon.*`** (Atlassian keeps them separate — icons often
 *   want a different tone than body text). Neutral emphasis ramps down `text` → `text.subtle` →
 *   `text.subtlest`; role and inverse foregrounds are property-first (`text.inverse`, `text.danger`,
 *   `icon.success`), so the on-color for any bold fill is `text.inverse` (+ `text.warning.inverse`,
 *   the yellow-fill exception) and role-colored text/links are `text.<role>`.
 * - **Borders** are property-first too: `border` / `border.bold` / `border.disabled` +
 *   `border.<role>`.
 * - **Fills stay role-first and bare** so the common case is short (decision 01): `bg="primary"`,
 *   `bg="danger"`, `bg="danger.subtle"`. Each role is `{ DEFAULT (solid), subtle }`.
 * - **`ring`** (focus) and **`scrim`** (the dimming layer behind modals; distinct from the overlay
 *   *surface*) are systemic singletons.
 *
 * Discrete `.hovered`/`.pressed`/`.bold` states are contract-reserved but omitted: nova derives
 * interaction states with `color-mix` (decision 02); disabled is `text.disabled` / `border.disabled`
 * plus `opacity.disabled` (decision 08). Categorical color (`chart.*`) is out of contract
 * (decision 07). Leaves are camelCase; Panda emits the dashed CSS var (decision 09).
 *
 * nova's brand is monochrome (shadcn default): `primary` / `text.primary` are near-black /
 * near-white. Chromatic feedback uses green / amber / red / blue. First-pass values, tuned to
 * survive AA on the common pairings; expect iteration.
 */
export const semanticTokens = defineSemanticTokens({
  colors: {
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
      primary: { value: { base: "{colors.neutral.900}", _dark: "{colors.neutral.100}" } },
      danger: { value: { base: "{colors.red.600}", _dark: "{colors.red.400}" } },
      warning: {
        DEFAULT: { value: { base: "{colors.amber.700}", _dark: "{colors.amber.400}" } },
        inverse: { value: { base: "{colors.amber.950}", _dark: "{colors.amber.950}" } },
      },
      success: { value: { base: "{colors.green.600}", _dark: "{colors.green.400}" } },
      info: { value: { base: "{colors.blue.600}", _dark: "{colors.blue.400}" } },
    },

    // ── icon ─────────────────────────────────────────────────────────────────────
    icon: {
      DEFAULT: { value: { base: "{colors.neutral.700}", _dark: "{colors.neutral.300}" } },
      subtle: { value: { base: "{colors.neutral.500}", _dark: "{colors.neutral.500}" } },
      disabled: { value: { base: "{colors.neutral.400}", _dark: "{colors.neutral.600}" } },
      inverse: { value: { base: "{colors.neutral.50}", _dark: "{colors.neutral.900}" } },
      primary: { value: { base: "{colors.neutral.900}", _dark: "{colors.neutral.100}" } },
      danger: { value: { base: "{colors.red.600}", _dark: "{colors.red.400}" } },
      warning: { value: { base: "{colors.amber.600}", _dark: "{colors.amber.400}" } },
      success: { value: { base: "{colors.green.600}", _dark: "{colors.green.400}" } },
      info: { value: { base: "{colors.blue.600}", _dark: "{colors.blue.400}" } },
    },

    // ── borders ──────────────────────────────────────────────────────────────────
    border: {
      DEFAULT: { value: { base: "{colors.neutral.200}", _dark: "{colors.neutral.800}" } },
      bold: { value: { base: "{colors.neutral.300}", _dark: "{colors.neutral.700}" } },
      disabled: { value: { base: "{colors.neutral.100}", _dark: "{colors.neutral.900}" } },
      primary: { value: { base: "{colors.neutral.900}", _dark: "{colors.neutral.100}" } },
      danger: { value: { base: "{colors.red.500}", _dark: "{colors.red.500}" } },
      warning: { value: { base: "{colors.amber.500}", _dark: "{colors.amber.500}" } },
      success: { value: { base: "{colors.green.500}", _dark: "{colors.green.500}" } },
      info: { value: { base: "{colors.blue.500}", _dark: "{colors.blue.500}" } },
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
      DEFAULT: { value: { base: "{colors.green.600}", _dark: "{colors.green.500}" } },
      subtle: { value: { base: "{colors.green.100}", _dark: "{colors.green.950}" } },
    },
    warning: {
      DEFAULT: { value: { base: "{colors.amber.500}", _dark: "{colors.amber.400}" } },
      subtle: { value: { base: "{colors.amber.100}", _dark: "{colors.amber.950}" } },
    },
    danger: {
      DEFAULT: { value: { base: "{colors.red.600}", _dark: "{colors.red.500}" } },
      subtle: { value: { base: "{colors.red.100}", _dark: "{colors.red.950}" } },
    },
    info: {
      DEFAULT: { value: { base: "{colors.blue.600}", _dark: "{colors.blue.500}" } },
      subtle: { value: { base: "{colors.blue.100}", _dark: "{colors.blue.950}" } },
    },

    // ── systemic ─────────────────────────────────────────────────────────────────
    ring: { value: { base: "{colors.neutral.400}", _dark: "{colors.neutral.500}" } },
    scrim: { value: { base: "oklch(0% 0 0 / 0.5)", _dark: "oklch(0% 0 0 / 0.6)" } },
  },
});
