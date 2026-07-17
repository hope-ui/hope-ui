/**
 * The **semantic color vocabulary** — the design-system-agnostic set of role names every
 * `@hope-ui/presets/*` preset implements, so a preset is a different set of values behind the same
 * tokens. Components and recipes reference these names (as Tailwind utilities like `bg-primary`,
 * `text-foreground`, `text-on-primary`); a preset supplies the values as `--hope-<token>` CSS
 * variables (see `@hope-ui/presets/hope`).
 *
 * **Name by identity, not context.** A token carries `role + variant + state` and nothing about
 * *where* it happens to sit. Every `(role × variant × state)` a recipe paints is its own **flat**
 * token — no borrowing a sibling variant's token, no `--hope-{component}-*` tokens. The interaction
 * ladder is explicit: `-hovered` / `-pressed` per variant (press is a colorable state). This is why
 * the label color of the soft/outline/ghost/link variants is `{role}-emphasis` (the role's legible
 * *content* color) rather than the old `on-{role}-soft` (which named a fill context those variants
 * don't render).
 *
 * **Tailwind-ergonomic naming.** The names read cleanly *after* a Tailwind property prefix and no
 * token is ever a bare CSS property — so there is no `text-text`, `border-border`, or `ring-ring`
 * doubling. The foreground is carried by three conventions:
 * - **Standard text** on neutral surfaces uses the `foreground*` ramp → `text-foreground`,
 *   `text-foreground-muted`, …
 * - **Role content** (soft/outline/ghost/link label, inline role text) uses `{role}-emphasis` →
 *   `text-primary-emphasis`, and its interactive link ladder `text-{role}-link-hovered/-pressed`.
 * - **On-color text** that must stay readable on a colored solid fill, the inverse surface, or a
 *   collection state uses the `on-*` prefix → `text-on-primary`, `text-on-inverse`, `text-on-selected`.
 *
 * Icons fold into these same text tokens (currentColor) — there is no separate `icon` family.
 *
 * **Recipe purity.** Recipes reference *finished* tokens only — never `color-mix`, an alpha modifier
 * (`bg-x/50`), or a magic value. A derived color (e.g. the focus halo, the scrim) is authored as its
 * own token in the preset's `tokens.css`, where the preset owns the raw scale.
 *
 * `SEMANTIC_COLOR_TOKENS` is the runtime source of truth (used by `checkSemanticTokenConformance`
 * in `@hope-ui/theming/conformance` to prove a theme's CSS defines every `--hope-<token>` var).
 */
export const SEMANTIC_COLOR_TOKENS = [
  // ── Surfaces (elevation), used as `bg-*`. Never a doubled `bg-bg`. `-raised` carries its own
  // hovered/pressed ladder (the `default`-variant button's interaction states).
  "surface",
  "surface-raised",
  "surface-raised-hovered",
  "surface-raised-pressed",
  "surface-overlay",
  "surface-sunken",
  "surface-inverse",

  // ── Standard text ramp (on neutral surfaces), used as `text-*`.
  "foreground",
  "foreground-muted",
  "foreground-subtle",
  "foreground-disabled",

  // ── On-state text: readable on the inverse surface and on the collection-state fills. `text-on-*`.
  "on-inverse",
  "on-active",
  "on-selected",

  // ── primary — full rest/hovered/pressed ladder per variant. `{role}` is both the solid fill and
  // the full-strength role border; `-line` is the outline-variant border; `-emphasis` is the role's
  // content color; `-link-*` is the link text ladder (rest = `-emphasis`); `on-{role}` sits on the fill.
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
  "primary-line",
  "primary-emphasis",
  "primary-link-hovered",
  "primary-link-pressed",
  "on-primary",

  // ── neutral — no `-line` (the outline variant uses `border-strong`); otherwise identical in shape.
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
  "neutral-emphasis",
  "neutral-link-hovered",
  "neutral-link-pressed",
  "on-neutral",

  // ── success
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
  "success-line",
  "success-emphasis",
  "success-link-hovered",
  "success-link-pressed",
  "on-success",

  // ── info
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
  "info-line",
  "info-emphasis",
  "info-link-hovered",
  "info-link-pressed",
  "on-info",

  // ── warning
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
  "warning-line",
  "warning-emphasis",
  "warning-link-hovered",
  "warning-link-pressed",
  "on-warning",

  // ── danger
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
  "danger-line",
  "danger-emphasis",
  "danger-link-hovered",
  "danger-link-pressed",
  "on-danger",

  // ── Neutral borders, used as `border-*`. Emphasis levels only; no bare `border` token.
  "subtle",
  "strong",

  // ── Collection-state fills, used as `bg-*`. `active` = transient (hover / roving / activedescendant);
  // `selected` = persistent (chosen). Each pairs with its `on-*` text above.
  "active",
  "selected",

  // ── Disabled state has no fill token: hope-ui dims a disabled control via the `opacity-disabled`
  // axis (see SEMANTIC_OPACITY_TOKENS) rather than swapping to a dedicated background color. The
  // disabled *label* still has its own text token (`foreground-disabled`, in the ramp above).

  // ── Systemic: focus indicator (`ring-focus` / `border-focus`), its translucent halo
  // (`ring-focus-halo`, a preset-authored derived color), and modal dimming (`bg-scrim`).
  "focus",
  "focus-halo",
  "scrim",
] as const;

/** One semantic color token name (e.g. `"primary"`, `"on-primary"`, `"primary-emphasis"`). */
export type SemanticColorToken = (typeof SEMANTIC_COLOR_TOKENS)[number];

/**
 * The **opacity axis** — a separate contract from the color vocabulary. Tailwind v4.3.2 has no
 * `--opacity-*` theme namespace, so these are not exposed via `@theme inline` like colors are;
 * a preset defines the `--hope-opacity-*` variable and the shared `_base/opacity.css` layer wires
 * each to a custom `@utility` (`opacity-disabled` → `opacity: var(--hope-opacity-disabled)`). They
 * exist so a recipe never hardcodes a magic opacity (`opacity-90`): the dim is a knob the preset owns.
 */
export const SEMANTIC_OPACITY_TOKENS = ["opacity-disabled", "opacity-loading"] as const;

/** One semantic opacity token name (`"opacity-disabled"` | `"opacity-loading"`). */
export type SemanticOpacityToken = (typeof SEMANTIC_OPACITY_TOKENS)[number];

/**
 * hope's CSS custom-property namespace. Every semantic token (color *and* opacity) is delivered as
 * a `--hope-<name>` variable the base layers read (`bg-primary` → `var(--hope-primary)`;
 * `opacity-disabled` → `var(--hope-opacity-disabled)`). This is the single source of truth for that
 * prefix, shared by the conformance checks that assert a theme declares each var and the preset
 * renderer that emits token overrides — so the namespace can never drift between "what we require"
 * and "what we emit".
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

/**
 * The shape a theme's opacity values satisfy: every opacity token mapped to a value (e.g. `"0.4"`).
 * The opacity-axis analogue of {@link SemanticColorContract}.
 */
export type SemanticOpacityContract = Record<SemanticOpacityToken, string>;
