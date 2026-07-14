/**
 * The **semantic color vocabulary** — the design-system-agnostic set of role names every
 * `@hope-ui/themes/*` theme implements, so a theme is a different set of values behind the same
 * tokens. Components and recipes reference these names (as Tailwind utilities like `bg-primary`,
 * `text-foreground`, `text-on-primary`); a theme supplies the values as `--hope-<token>` CSS
 * variables (see `@hope-ui/themes/hope`).
 *
 * **Tailwind-ergonomic naming.** The names read cleanly *after* a Tailwind property prefix and no
 * token is ever a bare CSS property — so there is no `text-text`, `border-border`, or `ring-ring`
 * doubling. Two conventions carry the foreground:
 * - **Standard text** on neutral surfaces uses the `foreground*` ramp → `text-foreground`,
 *   `text-foreground-muted`, …
 * - **On-color text** that must stay readable on a colored fill or the inverse surface uses the
 *   `on-*` prefix → `text-on-primary`, `text-on-danger-subtle`, `text-on-inverse`.
 *
 * Icons fold into these same text tokens (currentColor) — there is no separate `icon` family.
 *
 * `SEMANTIC_COLOR_TOKENS` is the runtime source of truth (used by `checkSemanticTokenConformance`
 * in `@hope-ui/theming/conformance` to prove a theme's CSS defines every `--hope-<token>` var).
 */
export const SEMANTIC_COLOR_TOKENS = [
  // Surfaces (elevation), used as `bg-*`. Never a doubled `bg-bg`.
  "surface",
  "surface-raised",
  "surface-overlay",
  "surface-sunken",
  "surface-inverse",

  // Standard text ramp (on neutral surfaces), used as `text-*`.
  "foreground",
  "foreground-muted",
  "foreground-subtle",
  "foreground-disabled",

  // On-color text: readable on a role's fill (solid + subtle) or the inverse surface. `text-on-*`.
  "on-primary",
  "on-primary-subtle",
  "on-neutral",
  "on-neutral-subtle",
  "on-success",
  "on-success-subtle",
  "on-info",
  "on-info-subtle",
  "on-warning",
  "on-warning-subtle",
  "on-danger",
  "on-danger-subtle",
  "on-inverse",

  // Role fills (role-first, bare = solid; `-subtle` = tonal), used as `bg-*`. Role borders reuse
  // these same colors (`border-primary`), so they need no dedicated token.
  "primary",
  "primary-subtle",
  "neutral",
  "neutral-subtle",
  "success",
  "success-subtle",
  "info",
  "info-subtle",
  "warning",
  "warning-subtle",
  "danger",
  "danger-subtle",

  // Neutral borders, used as `border-*`. Emphasis levels + disabled; no bare `border` token.
  "subtle",
  "strong",
  "disabled",

  // Systemic: focus indicator (`ring-focus` / `outline-focus`) and modal dimming (`bg-scrim`).
  "focus",
  "scrim",
] as const;

/** One semantic color token name (e.g. `"primary"`, `"on-primary"`, `"foreground-muted"`). */
export type SemanticColorToken = (typeof SEMANTIC_COLOR_TOKENS)[number];

/**
 * The shape a theme's color values satisfy: every semantic token mapped to a value. Themes ship
 * these as `--hope-<token>` CSS variables rather than a JS object, but the type stays the canonical
 * description of the vocabulary (and lets a JS tool assert completeness against it).
 */
export type SemanticColorContract = Record<SemanticColorToken, string>;
