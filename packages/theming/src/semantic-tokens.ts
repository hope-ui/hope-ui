/**
 * The **semantic color vocabulary** — the design-system-agnostic set of role names every
 * `@hope-ui/presets/*` preset implements, so that swapping presets swaps the values behind unchanged
 * names. Recipes reference the names as Tailwind utilities (`bg-primary`, `text-foreground`,
 * `text-on-primary`); a preset supplies the values as `--hope-<token>` CSS variables (see
 * `@hope-ui/presets/hope`). This array is the runtime source of truth, checked against a theme's CSS
 * by `checkSemanticTokenConformance` in `@hope-ui/theming/conformance`.
 *
 * Three rules govern what may be added; the full rationale is in `__internal__/theming.md`
 * § Semantic token vocabulary.
 * - **Name by identity, not context.** A token is `role + variant + state` and says nothing about
 *   where it sits. Every `(role × variant × state)` a recipe paints gets its own flat token — never a
 *   sibling variant's, never a per-component one.
 * - **Foregrounds split three ways.** `foreground*` is standard text on neutral surfaces;
 *   `{role}-emphasis` is a role's own legible content (the soft/outline/ghost/link label); the `on-*`
 *   prefix is reserved for text sitting on a colored fill (`on-primary`, `on-inverse`, `on-selected`).
 *   Icons fold into these same text tokens through `currentColor` — there is no `icon` family.
 * - **Recipes reference finished tokens only** — never `color-mix`, an alpha modifier (`bg-x/50`), or
 *   a magic value. A derived color such as the focus halo or the scrim is itself a token, authored in
 *   the preset's `theme.css` where the preset owns the raw scale.
 */
export const SEMANTIC_COLOR_TOKENS = [
  // Surfaces are an elevation concept, used as `bg-*` — hence `surface`, never a doubled `bg-bg`.
  // `-raised` carries its own hovered/pressed ladder (a `default`-variant button's interaction states).
  "surface",
  "surface-raised",
  "surface-raised-hovered",
  "surface-raised-pressed",
  "surface-overlay",
  "surface-sunken",
  // NOT an elevation rung, and the one surface token that says nothing about depth: a region set
  // apart from the surface it sits *inside* (a dialog footer, a toolbar strip, a table header). It is
  // deliberately direction-free — it darkens its container in a light theme and lightens it in a dark
  // one. `-sunken` cannot serve this: a well is one step below the *page*, and once the page is
  // already near-black there is no step left, so a dark theme paints a hole instead of a region.
  "surface-muted",
  "surface-inverse",

  // Standard text ramp, for neutral surfaces; used as `text-*`.
  "foreground",
  "foreground-muted",
  "foreground-subtle",
  "foreground-disabled",

  // Text that must stay readable on the inverse surface and on the collection-state fills below.
  "on-inverse",
  "on-active",
  "on-selected",

  // Each of the six roles below repeats this exact shape, with a rest/hovered/pressed ladder per
  // variant. `{role}` is the solid fill; `-line` (strong) and `-subtle-line` (soft) are its two border
  // tiers; `-emphasis` is its content color, and `-link-*` the link ladder that starts from it;
  // `on-{role}` is the content sitting on the fill. `{role}-inverted*` is the `inverted` variant's own
  // fill ladder with `on-{role}-inverted` over it — `solid` swapped, on tokens of its own.
  "primary",
  "primary-hovered",
  "primary-pressed",
  "primary-soft",
  "primary-soft-hovered",
  "primary-soft-pressed",
  "primary-outline-hovered",
  "primary-outline-pressed",
  "primary-ghost-hovered",
  "primary-ghost-pressed",
  "primary-inverted",
  "primary-inverted-hovered",
  "primary-inverted-pressed",
  "primary-line",
  "primary-subtle-line",
  "primary-emphasis",
  "primary-link-hovered",
  "primary-link-pressed",
  "on-primary",
  "on-primary-inverted",

  "neutral",
  "neutral-hovered",
  "neutral-pressed",
  "neutral-soft",
  "neutral-soft-hovered",
  "neutral-soft-pressed",
  "neutral-outline-hovered",
  "neutral-outline-pressed",
  "neutral-ghost-hovered",
  "neutral-ghost-pressed",
  "neutral-inverted",
  "neutral-inverted-hovered",
  "neutral-inverted-pressed",
  "neutral-line",
  "neutral-subtle-line",
  "neutral-emphasis",
  "neutral-link-hovered",
  "neutral-link-pressed",
  "on-neutral",
  "on-neutral-inverted",

  "success",
  "success-hovered",
  "success-pressed",
  "success-soft",
  "success-soft-hovered",
  "success-soft-pressed",
  "success-outline-hovered",
  "success-outline-pressed",
  "success-ghost-hovered",
  "success-ghost-pressed",
  "success-inverted",
  "success-inverted-hovered",
  "success-inverted-pressed",
  "success-line",
  "success-subtle-line",
  "success-emphasis",
  "success-link-hovered",
  "success-link-pressed",
  "on-success",
  "on-success-inverted",

  "info",
  "info-hovered",
  "info-pressed",
  "info-soft",
  "info-soft-hovered",
  "info-soft-pressed",
  "info-outline-hovered",
  "info-outline-pressed",
  "info-ghost-hovered",
  "info-ghost-pressed",
  "info-inverted",
  "info-inverted-hovered",
  "info-inverted-pressed",
  "info-line",
  "info-subtle-line",
  "info-emphasis",
  "info-link-hovered",
  "info-link-pressed",
  "on-info",
  "on-info-inverted",

  "warning",
  "warning-hovered",
  "warning-pressed",
  "warning-soft",
  "warning-soft-hovered",
  "warning-soft-pressed",
  "warning-outline-hovered",
  "warning-outline-pressed",
  "warning-ghost-hovered",
  "warning-ghost-pressed",
  "warning-inverted",
  "warning-inverted-hovered",
  "warning-inverted-pressed",
  "warning-line",
  "warning-subtle-line",
  "warning-emphasis",
  "warning-link-hovered",
  "warning-link-pressed",
  "on-warning",
  "on-warning-inverted",

  "danger",
  "danger-hovered",
  "danger-pressed",
  "danger-soft",
  "danger-soft-hovered",
  "danger-soft-pressed",
  "danger-outline-hovered",
  "danger-outline-pressed",
  "danger-ghost-hovered",
  "danger-ghost-pressed",
  "danger-inverted",
  "danger-inverted-hovered",
  "danger-inverted-pressed",
  "danger-line",
  "danger-subtle-line",
  "danger-emphasis",
  "danger-link-hovered",
  "danger-link-pressed",
  "on-danger",
  "on-danger-inverted",

  // Neutral borders, used as `border-*`. Emphasis levels only — a bare `border` token would double up.
  "subtle",
  "strong",

  // Collection-state fills, used as `bg-*`, each paired with its `on-*` text above. `active` is
  // transient (hovered, or the item the keyboard is on); `selected` is persistent (actually chosen).
  "active",
  "selected",

  // There is deliberately no disabled *fill* token: a disabled control is dimmed through the
  // `opacity-disabled` axis (see SEMANTIC_OPACITY_TOKENS), not by swapping its background. Its label
  // still has a text token of its own, `foreground-disabled` in the ramp above.

  // Systemic: the focus indicator (`ring-focus`/`border-focus`), its translucent halo (`ring-focus-halo`,
  // a color the preset derives), and modal dimming (`bg-scrim`).
  "focus",
  "focus-halo",
  "scrim",

  // The hover/press tint a control with no rest background of its own — CloseButton, or Button's
  // `adaptive` variant — lays over whatever surface it sits on. A preset derives these from
  // `currentColor`, so such a control takes its color from its surroundings instead of picking a role.
  "surface-adaptive-hovered",
  "surface-adaptive-pressed",
] as const;

/** One semantic color token name (e.g. `"primary"`, `"on-primary"`, `"primary-emphasis"`). */
export type SemanticColorToken = (typeof SEMANTIC_COLOR_TOKENS)[number];

/**
 * The **opacity axis** — a separate contract from the color vocabulary only because Tailwind v4 has no
 * `--opacity-*` theme namespace: a preset defines `--hope-opacity-*` and a shared base layer wires
 * each to a custom `@utility` (`opacity-disabled` → `opacity: var(--hope-opacity-disabled)`), instead
 * of the `@theme inline` route colors take. They exist so a recipe never hardcodes a magic opacity
 * such as `opacity-90` — how far to dim is a knob the preset owns.
 */
export const SEMANTIC_OPACITY_TOKENS = ["opacity-disabled", "opacity-loading"] as const;

/** One semantic opacity token name (`"opacity-disabled"` | `"opacity-loading"`). */
export type SemanticOpacityToken = (typeof SEMANTIC_OPACITY_TOKENS)[number];

/**
 * hope's CSS custom-property namespace. Every semantic token, color and opacity alike, ships as a
 * `--hope-<name>` variable (`bg-primary` → `var(--hope-primary)`). Both the conformance checks that
 * require a variable and the code that emits one read the prefix from here, so "what we require" and
 * "what we emit" cannot drift apart.
 */
export const HOPE_VAR_PREFIX = "--hope-";

/** Build a hope custom-property name — `hopeVar("primary")` → `"--hope-primary"`. */
export function hopeVar(name: string): string {
  return `${HOPE_VAR_PREFIX}${name}`;
}

/**
 * The shape a theme's color values satisfy: every semantic token mapped to a value. Themes ship these
 * as CSS variables rather than a JS object, but the type remains the canonical description of the
 * vocabulary, and lets a JS tool assert completeness against it.
 */
export type SemanticColorContract = Record<SemanticColorToken, string>;

/**
 * The shape a theme's opacity values satisfy: every opacity token mapped to a value (e.g. `"0.4"`).
 * The opacity-axis analogue of {@link SemanticColorContract}.
 */
export type SemanticOpacityContract = Record<SemanticOpacityToken, string>;
