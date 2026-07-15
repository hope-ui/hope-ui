/**
 * The **semantic color vocabulary** — the design-system-agnostic set of role names every
 * `@hope-ui/presets/*` preset implements, so a preset is a different set of values behind the same
 * tokens. Components and recipes reference these names (as Tailwind utilities like `bg-primary`,
 * `text-foreground`, `text-on-primary`); a preset supplies the values as `--hope-<token>` CSS
 * variables (see `@hope-ui/presets/hope`).
 *
 * **Tailwind-ergonomic naming.** The names read cleanly *after* a Tailwind property prefix and no
 * token is ever a bare CSS property — so there is no `text-text`, `border-border`, or `ring-ring`
 * doubling. Two conventions carry the foreground:
 * - **Standard text** on neutral surfaces uses the `foreground*` ramp → `text-foreground`,
 *   `text-foreground-muted`, …
 * - **On-color text** that must stay readable on a colored fill or the inverse surface uses the
 *   `on-*` prefix → `text-on-primary`, `text-on-danger-soft`, `text-on-inverse`.
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

  // On-color text: readable on a role's fill (solid + soft) or the inverse surface. `text-on-*`.
  "on-primary",
  "on-primary-soft",
  "on-neutral",
  "on-neutral-soft",
  "on-success",
  "on-success-soft",
  "on-info",
  "on-info-soft",
  "on-warning",
  "on-warning-soft",
  "on-danger",
  "on-danger-soft",
  "on-inverse",

  // Role fills (role-first, bare = solid; `-hover` = solid hover state; `-soft` = tonal), used as
  // `bg-*`. The solid fill doubles as the solid border color (`border-primary`); the softer
  // outline-button border has its own token (`-outline` = a light role tint, distinct from the fill).
  "primary",
  "primary-hover",
  "primary-soft",
  "primary-outline",
  "neutral",
  "neutral-hover",
  "neutral-soft",
  "neutral-outline",
  "success",
  "success-hover",
  "success-soft",
  "success-outline",
  "info",
  "info-hover",
  "info-soft",
  "info-outline",
  "warning",
  "warning-hover",
  "warning-soft",
  "warning-outline",
  "danger",
  "danger-hover",
  "danger-soft",
  "danger-outline",

  // Neutral border tints, used as `border-*`. The `-outline` suffix marks them as border tints, so
  // `bg-subtle-outline` reads as the mistake it is — they must never be used as fills. Emphasis
  // levels + the disabled-border tint; no bare `border` token.
  "subtle-outline",
  "strong-outline",
  "disabled-outline",

  // Disabled control fill — a real background (`bg-disabled`), NOT a border tint. Kept a legible
  // step away from `foreground-disabled` (the disabled label text) so text still reads on it; this
  // is the token the `-outline` rename above frees up from being misused as a fill.
  "disabled",

  // Systemic: focus indicator (`ring-focus` / `outline-focus`) and modal dimming (`bg-scrim`).
  "focus",
  "scrim",
] as const;

/** One semantic color token name (e.g. `"primary"`, `"on-primary"`, `"foreground-muted"`). */
export type SemanticColorToken = (typeof SEMANTIC_COLOR_TOKENS)[number];

/**
 * hope's CSS custom-property namespace. Every semantic token is delivered as a `--hope-<name>`
 * variable the base `tailwind.css` layer reads (`bg-primary` → `var(--hope-primary)`). This is the
 * single source of truth for that prefix, shared by the conformance check that asserts a theme
 * declares each var and the preset renderer that emits token overrides — so the namespace can never
 * drift between "what we require" and "what we emit".
 */
export const HOPE_VAR_PREFIX = "--hope-";

/** Build a hope custom-property name — `hopeVar("primary")` → `"--hope-primary"`. */
export function hopeVar(name: string): string {
  return `${HOPE_VAR_PREFIX}${name}`;
}

/**
 * The shape a theme's color values satisfy: every semantic token mapped to a value. Themes ship
 * these as `--hope-<token>` CSS variables rather than a JS object, but the type stays the canonical
 * description of the vocabulary (and lets a JS tool assert completeness against it).
 */
export type SemanticColorContract = Record<SemanticColorToken, string>;
