// Theme Creator — palette data.
//
// The ordered family lists the pickers render, and the one piece of derivation-relevant *data*: a
// family's fill archetype (dark-fill vs light-fill). The generator's ladder (`generator.ts`) reads
// `fillOf()`; everything else here is presentation ordering.

import type { Family, NeutralFamily } from "./theme-config";

// ---------------------------------------------------------------------------
// Family lists (ordered for the pickers)
// ---------------------------------------------------------------------------

/**
 * Chromatic families, in hue order (red → rose around the wheel). These fill the `primary` and the
 * four `status` roles. Excludes hope's custom grays (mauve/taupe/mist/olive), which are neutrals.
 */
export const BRAND_FAMILIES: readonly Family[] = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
];

/**
 * Gray families for the `neutral` role — Tailwind's five (cool → warm) then hope's four custom
 * low-chroma tints. All verified `< 0.05` oklch chroma, so they read as grays across the UI.
 */
export const NEUTRAL_FAMILIES: readonly NeutralFamily[] = [
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "mauve",
  "taupe",
  "mist",
  "olive",
];

/** Every family, for the palette keepalive (see `styles/palette-keepalive.css`) and completeness. */
export const ALL_FAMILIES: readonly Family[] = [...BRAND_FAMILIES, ...NEUTRAL_FAMILIES];

// ---------------------------------------------------------------------------
// Fill archetype (dark-fill vs light-fill) — WCAG-derived, stored as data
// ---------------------------------------------------------------------------

/**
 * The **light-fill** families: `amber`, `yellow`, `lime`. This is not eyeballed — it is decided by
 * WCAG contrast against the boundary hope itself set, verified from the oklch values in
 * `tailwindcss/theme.css` (which match the official Tailwind v4 reference):
 *
 * hope's effective UI-contrast bar is **3:1** (large-text / non-text), not 4.5 — it ships
 * `on-success`/`on-info` = white on `green-600` (white contrast 3.22) and `sky-600` (4.02). Amber,
 * yellow and lime are the only families whose white-on-600 contrast (2.93 / 2.93 / 3.06) falls
 * *below* green-600's 3.22 — the white-side boundary — while dark text wins decisively. So on a
 * `-600` fill they need **dark** text, exactly hope's shipped `warning = amber + dark on-color`.
 * Orange (white-on-600 = 3.59), green, emerald, teal, cyan, sky and every other family clear the
 * bar with white text and stay **dark-fill**. Light-fill roles also drop their rest fill to the
 * brighter `-400` shade (the expected warm-light look) — see the `lightFill` ladder in
 * `generator.ts`.
 */
export const LIGHT_FILL_FAMILIES: ReadonlySet<Family> = new Set<Family>([
  "amber",
  "yellow",
  "lime",
]);

/** A family's fill archetype. `neutral` families use their own ladder (handled per-role, not here). */
export function fillOf(family: Family): "dark" | "light" {
  return LIGHT_FILL_FAMILIES.has(family) ? "light" : "dark";
}
