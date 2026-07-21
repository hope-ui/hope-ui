// Theme Creator — configuration vocabulary.
//
// A whole hope-ui theme (144 `--hope-*` color tokens + the radius knob) is a pure function of a
// handful of choices: one Tailwind color family per semantic *role* plus a corner radius. This
// module is the small, serializable shape those choices take (`ThemeConfig`), the hope defaults
// that config reproduces (`HOPE_DEFAULT_CONFIG` — the generator's correctness anchor, see
// `generator.ts`), and the presentation metadata the pickers render from. The actual family lists
// and the dark-fill/light-fill classification live in `palette.ts`; the derivation ladder in
// `generator.ts`.

// ---------------------------------------------------------------------------
// Families
// ---------------------------------------------------------------------------

/**
 * A gray family the *neutral* role can use. Neutral drives every surface, the foreground ramp, and
 * the borders, so it is restricted to low-chroma families (verified `< 0.05` oklch chroma in
 * `tailwindcss/theme.css`) — a chromatic "neutral" would tint the entire UI. This is the single
 * source of the gray keys; {@link Family} composes it.
 */
export type NeutralFamily =
  | "slate"
  | "gray"
  | "zinc"
  | "neutral"
  | "stone"
  | "mauve"
  | "taupe"
  | "mist"
  | "olive";

/**
 * A Tailwind color family a role can be painted from — the chromatic *brand* families (primary +
 * status pickers) plus the gray {@link NeutralFamily} set (the neutral picker; hope's four custom
 * low-chroma neutrals — mauve/taupe/mist/olive — live there). Keyed by the `var(--color-<family>-*)`
 * name. `palette.ts` orders each group and classifies the brand ones as dark- or light-fill.
 */
export type Family =
  // chromatic (brand) — hue order around the wheel
  | "red"
  | "orange"
  | "amber"
  | "yellow"
  | "lime"
  | "green"
  | "emerald"
  | "teal"
  | "cyan"
  | "sky"
  | "blue"
  | "indigo"
  | "violet"
  | "purple"
  | "fuchsia"
  | "pink"
  | "rose"
  // gray (neutral) — the full NeutralFamily set, written once above
  | NeutralFamily;

// ---------------------------------------------------------------------------
// Roles + config
// ---------------------------------------------------------------------------

/** The six semantic roles, each painted from one family. `neutral` is special (gray-only). */
export type Role = "primary" | "neutral" | "success" | "info" | "warning" | "danger";

/** The four *status* roles, grouped under the "Advanced" disclosure so the default UI stays small. */
export const STATUS_ROLES = [
  "success",
  "info",
  "warning",
  "danger",
] as const satisfies readonly Role[];

/**
 * A complete theme choice: one family per role plus the corner radius (a CSS length, e.g.
 * `"0.625rem"`). `deriveTokens`/`toCss` in `generator.ts` turn this into the full token set.
 */
export interface ThemeConfig {
  primary: Family;
  neutral: NeutralFamily;
  success: Family;
  info: Family;
  warning: Family;
  danger: Family;
  /** Corner radius — the `--hope-radius` knob that drives the whole `--radius-*` scale. */
  radius: string;
}

/**
 * hope's own family map + radius. Feeding this through the generator reproduces the shipped
 * `packages/presets/src/hope/theme.css` (the one intentional deviation: hope tints `warning`'s
 * on-color with `taupe`, while the generator uses the chosen neutral family — see `generator.ts`).
 * Every `config` signal initialises here so the prerendered (SSG) markup is deterministic.
 */
export const HOPE_DEFAULT_CONFIG: ThemeConfig = {
  primary: "violet",
  neutral: "neutral",
  success: "green",
  info: "sky",
  warning: "amber",
  danger: "red",
  radius: "0.625rem",
};

// ---------------------------------------------------------------------------
// Radius presets
// ---------------------------------------------------------------------------

/**
 * The segmented radius choices. `md` (shadcn's `0.625rem` base) is hope's default. Values are the
 * `--hope-radius` knob; the preset's `@theme` derives the `xs…4xl` scale from it as px offsets.
 */
export const RADIUS_PRESETS = [
  { label: "None", value: "0rem" },
  { label: "SM", value: "0.375rem" },
  { label: "MD", value: "0.625rem" },
  { label: "LG", value: "0.875rem" },
  { label: "XL", value: "1.25rem" },
] as const;

// ---------------------------------------------------------------------------
// Picker presentation
// ---------------------------------------------------------------------------

/** Label + one-line purpose for each role's picker. */
export const ROLE_META: Record<Role, { label: string; hint: string }> = {
  primary: { label: "Primary", hint: "Brand color — buttons, links, focus." },
  neutral: { label: "Neutral", hint: "Grays — surfaces, text, borders." },
  success: { label: "Success", hint: "Positive / confirmation." },
  info: { label: "Info", hint: "Neutral information." },
  warning: { label: "Warning", hint: "Caution / needs attention." },
  danger: { label: "Danger", hint: "Errors / destructive actions." },
};
