// Theme Creator — the generator (pure).
//
// Ports hope's exact token-derivation ladder from `packages/presets/src/hope/tokens.css`. Given a
// `ThemeConfig` (one family per role + a radius) it produces the full 144-color + close/opacity/
// radius token set for `:root` and `.dark`. Two exports:
//   - `deriveTokens(config)` → { light, dark } maps (bare token name → CSS value). Used to paint the
//     live preview via inline style, and by `toCss`.
//   - `toCss(config)` → the paste-ready `theme.css` string (`:root {…}` + `.dark {…}`), values as
//     `var(--color-<family>-<shade>)`, grouped/commented to mirror `tokens.css`.
//
// **Correctness anchor:** `toCss(HOPE_DEFAULT_CONFIG)` reproduces the shipped `tokens.css` — with one
// intentional, enumerated deviation: hope tints `warning`'s on-color/inverted fill with the bespoke
// `taupe` family in *light* mode (`taupe-900`/`taupe-800`); the generator, which only knows the
// chosen neutral family, uses `neutral-900`/`neutral-800` there. Everything else is byte-identical
// (validated against `tokens.css` — feeding `HOPE_DEFAULT_CONFIG` diffs to exactly those 4 tokens).

import { fillOf } from "./palette";
import type { Family, Role, ThemeConfig } from "./theme-config";

// ---------------------------------------------------------------------------
// Color references — an abstract shade in the role family (F), the neutral family (N), or a literal
// (white/black). Resolved to a Tailwind palette var against the concrete families.
// ---------------------------------------------------------------------------

type Ref = { k: "F"; s: number } | { k: "N"; s: number } | { k: "lit"; name: "white" | "black" };

const f = (s: number): Ref => ({ k: "F", s });
const n = (s: number): Ref => ({ k: "N", s });
const WHITE: Ref = { k: "lit", name: "white" };
const BLACK: Ref = { k: "lit", name: "black" };

function colorVar(family: string, shade: number): string {
  return `var(--color-${family}-${shade})`;
}

/** Resolve a `Ref` to a `var(--color-*)` string against role family `F` and neutral family `N`. */
function resolve(ref: Ref, F: Family, N: Family): string {
  if (ref.k === "lit") {
    return `var(--color-${ref.name})`;
  }
  return colorVar(ref.k === "F" ? F : N, ref.s);
}

/** A derived color that is a `color-mix` of a palette var (the focus halo). */
function mix(family: string, shade: number, pct: number): string {
  return `color-mix(in oklab, ${colorVar(family, shade)} ${pct}%, transparent)`;
}

// ---------------------------------------------------------------------------
// Role ladder — the 20 tokens of one role, in `tokens.css` order.
// ---------------------------------------------------------------------------

type RungId =
  | "rest"
  | "hovered"
  | "pressed"
  | "soft"
  | "softHovered"
  | "softPressed"
  | "outlineHovered"
  | "outlinePressed"
  | "ghostHovered"
  | "ghostPressed"
  | "inverted"
  | "invertedHovered"
  | "invertedPressed"
  | "line"
  | "subtleLine"
  | "emphasis"
  | "linkHovered"
  | "linkPressed"
  | "on"
  | "onInverted";

/** Ordered rungs → the `--hope-*` token name they produce for a given role. */
const ROLE_RUNGS: ReadonlyArray<{ id: RungId; token: (role: Role) => string }> = [
  { id: "rest", token: (r) => r },
  { id: "hovered", token: (r) => `${r}-hovered` },
  { id: "pressed", token: (r) => `${r}-pressed` },
  { id: "soft", token: (r) => `${r}-soft` },
  { id: "softHovered", token: (r) => `${r}-soft-hovered` },
  { id: "softPressed", token: (r) => `${r}-soft-pressed` },
  { id: "outlineHovered", token: (r) => `${r}-outline-hovered` },
  { id: "outlinePressed", token: (r) => `${r}-outline-pressed` },
  { id: "ghostHovered", token: (r) => `${r}-ghost-hovered` },
  { id: "ghostPressed", token: (r) => `${r}-ghost-pressed` },
  { id: "inverted", token: (r) => `${r}-inverted` },
  { id: "invertedHovered", token: (r) => `${r}-inverted-hovered` },
  { id: "invertedPressed", token: (r) => `${r}-inverted-pressed` },
  { id: "line", token: (r) => `${r}-line` },
  { id: "subtleLine", token: (r) => `${r}-subtle-line` },
  { id: "emphasis", token: (r) => `${r}-emphasis` },
  { id: "linkHovered", token: (r) => `${r}-link-hovered` },
  { id: "linkPressed", token: (r) => `${r}-link-pressed` },
  { id: "on", token: (r) => `on-${r}` },
  { id: "onInverted", token: (r) => `on-${r}-inverted` },
];

type Ladder = Record<RungId, { light: Ref; dark: Ref }>;

// Dark-fill role (violet/green/sky/red/… — white text on a `-600` fill). The general case.
const DARK_FILL: Ladder = {
  rest: { light: f(600), dark: f(400) },
  hovered: { light: f(700), dark: f(300) },
  pressed: { light: f(700), dark: f(300) },
  soft: { light: f(100), dark: f(950) },
  softHovered: { light: f(200), dark: f(900) },
  softPressed: { light: f(200), dark: f(900) },
  outlineHovered: { light: f(100), dark: f(950) },
  outlinePressed: { light: f(100), dark: f(950) },
  ghostHovered: { light: f(100), dark: f(950) },
  ghostPressed: { light: f(100), dark: f(950) },
  inverted: { light: WHITE, dark: n(950) },
  invertedHovered: { light: n(100), dark: n(900) },
  invertedPressed: { light: n(100), dark: n(900) },
  line: { light: f(300), dark: f(700) },
  subtleLine: { light: f(200), dark: f(800) },
  emphasis: { light: f(700), dark: f(200) },
  linkHovered: { light: f(800), dark: f(100) },
  linkPressed: { light: f(800), dark: f(100) },
  on: { light: WHITE, dark: n(950) },
  onInverted: { light: f(600), dark: f(400) },
};

// Neutral role (gray ramp). Its solid sits at `-700` (light) / `-300` (dark), and its soft/border
// rungs stay in the gray scale — distinct from dark-fill in *both* modes (not just a tweak).
const NEUTRAL: Ladder = {
  rest: { light: n(700), dark: n(300) },
  hovered: { light: n(800), dark: n(200) },
  pressed: { light: n(800), dark: n(200) },
  soft: { light: n(100), dark: n(800) },
  softHovered: { light: n(200), dark: n(700) },
  softPressed: { light: n(200), dark: n(700) },
  outlineHovered: { light: n(100), dark: n(800) },
  outlinePressed: { light: n(100), dark: n(800) },
  ghostHovered: { light: n(100), dark: n(800) },
  ghostPressed: { light: n(100), dark: n(800) },
  inverted: { light: WHITE, dark: n(950) },
  invertedHovered: { light: n(100), dark: n(900) },
  invertedPressed: { light: n(100), dark: n(900) },
  line: { light: n(300), dark: n(700) },
  subtleLine: { light: n(200), dark: n(800) },
  emphasis: { light: n(700), dark: n(200) },
  linkHovered: { light: n(800), dark: n(100) },
  linkPressed: { light: n(800), dark: n(100) },
  on: { light: WHITE, dark: n(950) },
  onInverted: { light: n(700), dark: n(300) },
};

// Light-fill role (amber/yellow/lime — dark text on a bright `-400` fill). hope's `warning`
// treatment, generalized. The inverted fill + on-color are dark *neutral* chips (in light mode hope
// uses bespoke `taupe`; the generator uses the chosen neutral family — the one documented deviation).
const LIGHT_FILL: Ladder = {
  rest: { light: f(400), dark: f(600) },
  hovered: { light: f(500), dark: f(500) },
  pressed: { light: f(500), dark: f(500) },
  soft: { light: f(100), dark: f(950) },
  softHovered: { light: f(200), dark: f(900) },
  softPressed: { light: f(200), dark: f(900) },
  outlineHovered: { light: f(100), dark: f(950) },
  outlinePressed: { light: f(100), dark: f(950) },
  ghostHovered: { light: f(100), dark: f(950) },
  ghostPressed: { light: f(100), dark: f(950) },
  inverted: { light: n(900), dark: n(950) },
  invertedHovered: { light: n(800), dark: n(900) },
  invertedPressed: { light: n(800), dark: n(900) },
  line: { light: f(400), dark: f(600) },
  subtleLine: { light: f(300), dark: f(700) },
  emphasis: { light: f(800), dark: f(200) },
  linkHovered: { light: f(900), dark: f(100) },
  linkPressed: { light: f(900), dark: f(100) },
  on: { light: n(900), dark: n(950) },
  onInverted: { light: f(400), dark: f(600) },
};

/** The ladder a role uses: neutral role → NEUTRAL; else by the family's fill archetype. */
function ladderFor(role: Role, family: Family): Ladder {
  if (role === "neutral") {
    return NEUTRAL;
  }
  return fillOf(family) === "light" ? LIGHT_FILL : DARK_FILL;
}

// ---------------------------------------------------------------------------
// Sections — the whole token set as ordered, commented groups (mirrors tokens.css).
// A row's `dark: null` means the token is `:root`-only (close / opacity / radius).
// ---------------------------------------------------------------------------

interface TokenRow {
  name: string;
  light: string;
  dark: string | null;
}
interface Section {
  comment: string;
  rows: TokenRow[];
}

const ROLE_ORDER: readonly Role[] = ["primary", "neutral", "success", "info", "warning", "danger"];

const ROLE_COMMENTS: Record<Role, (family: Family) => string> = {
  primary: (fam) => `primary (${fam})`,
  neutral: (fam) => `neutral (${fam}) — surfaces/text/borders all derive from this family`,
  success: (fam) => `success (${fam})`,
  info: (fam) => `info (${fam})`,
  warning: (fam) => `warning (${fam})`,
  danger: (fam) => `danger (${fam})`,
};

function buildSections(config: ThemeConfig): Section[] {
  const N = config.neutral;
  const P = config.primary;
  const rn = (ref: Ref, F: Family): TokenRow["light"] => resolve(ref, F, N);

  // A non-role row from a light/dark Ref pair (neutral- or primary-family driven).
  const row = (name: string, light: Ref, dark: Ref): TokenRow => ({
    name,
    light: resolve(light, P, N),
    dark: resolve(dark, P, N),
  });

  const sections: Section[] = [];

  sections.push({
    comment: "Surfaces (elevation)",
    rows: [
      row("surface", WHITE, n(950)),
      row("surface-raised", WHITE, n(900)),
      row("surface-raised-hovered", n(100), n(800)),
      row("surface-raised-pressed", n(100), n(800)),
      row("surface-overlay", WHITE, n(900)),
      row("surface-sunken", n(50), BLACK),
      row("surface-inverse", n(900), n(50)),
    ],
  });

  sections.push({
    comment: "Standard text ramp (on neutral surfaces)",
    rows: [
      row("foreground", n(900), n(50)),
      row("foreground-muted", n(600), n(400)),
      row("foreground-subtle", n(400), n(500)),
      row("foreground-disabled", n(300), n(600)),
    ],
  });

  sections.push({
    comment: "On-state text (inverse surface + collection states)",
    rows: [
      row("on-inverse", n(50), n(900)),
      row("on-active", n(900), n(50)),
      // on-selected is primary-tinted (the selected-item content color).
      row("on-selected", { k: "F", s: 700 }, { k: "F", s: 200 }),
    ],
  });

  // The six roles, each 20 tokens from its ladder.
  for (const role of ROLE_ORDER) {
    const family = config[role];
    const ladder = ladderFor(role, family);
    sections.push({
      comment: ROLE_COMMENTS[role](family),
      rows: ROLE_RUNGS.map(({ id, token }) => ({
        name: token(role),
        light: rn(ladder[id].light, family),
        dark: rn(ladder[id].dark, family),
      })),
    });
  }

  sections.push({
    comment: "Neutral borders",
    rows: [row("subtle", n(200), n(800)), row("strong", n(300), n(700))],
  });

  sections.push({
    comment: "Collection-state fills (active = transient; selected = persistent)",
    rows: [row("active", n(100), n(800)), row("selected", { k: "F", s: 100 }, { k: "F", s: 950 })],
  });

  sections.push({
    comment: "Systemic",
    rows: [
      row("focus", { k: "F", s: 600 }, { k: "F", s: 500 }),
      { name: "focus-halo", light: mix(P, 600, 50), dark: mix(P, 500, 50) },
      {
        name: "scrim",
        light: mix(N, 900, 50),
        dark: `color-mix(in oklab, var(--color-black) 70%, transparent)`,
      },
    ],
  });

  // Surface-adaptive close affordance — currentColor-derived, so no `.dark` counterpart.
  sections.push({
    comment: "Surface-adaptive close affordance (currentColor-derived — no .dark needed)",
    rows: [
      {
        name: "close-overlay-hovered",
        light: "color-mix(in oklab, currentColor 10%, transparent)",
        dark: null,
      },
      {
        name: "close-overlay-pressed",
        light: "color-mix(in oklab, currentColor 15%, transparent)",
        dark: null,
      },
      {
        name: "close-focus",
        light: "color-mix(in oklab, currentColor 40%, transparent)",
        dark: null,
      },
    ],
  });

  sections.push({
    comment: "Opacity axis",
    rows: [
      { name: "opacity-disabled", light: "0.4", dark: null },
      { name: "opacity-loading", light: "1", dark: null },
    ],
  });

  sections.push({
    comment: "Radius knob — drives the whole --radius-* scale",
    rows: [{ name: "radius", light: config.radius, dark: null }],
  });

  return sections;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Bare token name (no `--hope-` prefix) → CSS value. */
export type TokenMap = Record<string, string>;

/**
 * Derive the complete light and dark token maps. Both maps are *complete* — the dark map reuses the
 * light value for `:root`-only tokens (close/opacity/radius), so applying `dark` as inline style
 * fully re-themes a subtree regardless of the ambient mode. Keys are bare names (`primary`,
 * `on-primary`, `radius`); prefix with `--hope-` for CSS.
 */
export function deriveTokens(config: ThemeConfig): { light: TokenMap; dark: TokenMap } {
  const light: TokenMap = {};
  const dark: TokenMap = {};
  for (const section of buildSections(config)) {
    for (const r of section.rows) {
      light[r.name] = r.light;
      dark[r.name] = r.dark ?? r.light;
    }
  }
  return { light, dark };
}

const HEADER = `/*
 * hope-ui theme — generated by the Theme Creator.
 *
 * Redefines every hope-ui semantic token (--hope-*). Import it AFTER the preset so these win:
 *
 *   @import "tailwindcss";
 *   @import "@hope-ui/presets/hope/tailwind.css";
 *   @import "./theme.css";   (this file)
 *
 * Values reference Tailwind palette vars (var(--color-<family>-<shade>)), which keeps those shades
 * in your build. The .dark overrides apply under a .dark ancestor (the preset's dark variant).
 */`;

function block(
  selector: string,
  sections: Section[],
  pick: (r: TokenRow) => string | null,
): string {
  const groups = sections
    .map((s) => ({ comment: s.comment, rows: s.rows.filter((r) => pick(r) !== null) }))
    .filter((s) => s.rows.length > 0);
  const body = groups
    .map(
      (s) =>
        `  /* ${s.comment} */\n${s.rows.map((r) => `  --hope-${r.name}: ${pick(r)};`).join("\n")}`,
    )
    .join("\n\n");
  return `${selector} {\n${body}\n}`;
}

/** The paste-ready `theme.css`: header + `:root {…}` (all tokens) + `.dark {…}` (mode-varying only). */
export function toCss(config: ThemeConfig): string {
  const sections = buildSections(config);
  const root = block(":root", sections, (r) => r.light);
  const dark = block(".dark", sections, (r) => r.dark);
  return `${HEADER}\n\n${root}\n\n${dark}\n`;
}
