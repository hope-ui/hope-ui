/*
 * @hope-ui/presets/hope — Alert slot recipe.
 *
 * The `tailwind-variants` slot recipe the `@hope-ui/components` `Alert` reads through
 * `useRecipe("alert")`. Alert is a **static, non-interactive** status surface (a compound `<div>`), so
 * this recipe carries no interaction states — no `hover:`, no `data-pressed`, no `focus-visible:` —
 * only the visual axes (variant × colorScheme × size) plus the exit-transition chrome.
 *
 * ── Why every class is a literal string ─────────────────────────────────────────────────────────
 * The consumer's Tailwind build discovers which utilities to generate by scanning this file
 * (`@source "./recipes"` in `tailwind.css`). A scanner only sees *literal* candidates, so the
 * per-color utilities cannot be built with `bg-${role}` template strings — they are written out in
 * `COLOR_CLASSES` / `ROLE_TEXT` and assembled into `compoundVariants`.
 *
 * ── The one thing Badge doesn't have: the `default` variant ─────────────────────────────────────
 * `default` is a role-neutral raised surface (`bg-surface-raised` + `border-subtle`, body
 * `text-foreground`, **no shadow** — Button's default carries `shadow-xs`, Alert does not). It colors
 * only the *icon* + *title* per role, so those live in a dedicated `compoundVariants` block on the
 * `icon`/`title` slots, leaving the `default` `root` color-independent. The `solid`/`soft`/`subtle`/
 * `outline` fills are Badge's, on the `root` slot.
 *
 * ── Recipe purity ───────────────────────────────────────────────────────────────────────────────
 * Every fill is a *finished* `--hope-*` token (`bg-primary` → `var(--color-primary)` →
 * `var(--hope-primary)`); the recipe computes no color — no `color-mix`, no alpha modifier, no magic
 * opacity. The exit fade uses `opacity-0` (full transparent — allowed; only magic `opacity-1..99` is
 * not) keyed on the `data-exiting:` variant (→ `[data-presence="exiting"]`), the presence status the
 * component writes to `data-presence`.
 * (`pnpm check:recipe-purity` enforces this.)
 */

import type { AlertColorScheme } from "@hope-ui/theming";
// The Alert recipe's variant vocabulary is owned by `@hope-ui/theming` (the contract); this theme
// implements it. `hopeRecipes` (in `./index`) checks the finished recipe against `RecipeRegistry`.
import { tv } from "@hope-ui/theming";

/** The colored variants that vary per role on the `root` slot (`default` colors icon/title instead). */
type ColoredAlertVariant = "solid" | "soft" | "subtle" | "outline";

/*
 * Per-color, per-variant fills on the `root` slot — literal so Tailwind's `@source` scan emits them.
 * Identical to Badge's solid/soft/subtle/outline fills. The reserved 1px transparent border in the
 * `root` base means the bordered variants (subtle/outline) never shift a pixel relative to the others.
 */
const COLOR_CLASSES: Record<AlertColorScheme, Record<ColoredAlertVariant, string>> = {
  primary: {
    solid: "bg-primary text-on-primary",
    soft: "bg-primary-soft text-primary-emphasis",
    subtle: "bg-primary-soft text-primary-emphasis border-primary-subtle-line",
    outline: "bg-transparent text-primary-emphasis border-primary-subtle-line",
  },
  neutral: {
    solid: "bg-neutral text-on-neutral",
    soft: "bg-neutral-soft text-neutral-emphasis",
    subtle: "bg-neutral-soft text-neutral-emphasis border-neutral-subtle-line",
    outline: "bg-transparent text-neutral-emphasis border-neutral-subtle-line",
  },
  success: {
    solid: "bg-success text-on-success",
    soft: "bg-success-soft text-success-emphasis",
    subtle: "bg-success-soft text-success-emphasis border-success-subtle-line",
    outline: "bg-transparent text-success-emphasis border-success-subtle-line",
  },
  info: {
    solid: "bg-info text-on-info",
    soft: "bg-info-soft text-info-emphasis",
    subtle: "bg-info-soft text-info-emphasis border-info-subtle-line",
    outline: "bg-transparent text-info-emphasis border-info-subtle-line",
  },
  warning: {
    solid: "bg-warning text-on-warning",
    soft: "bg-warning-soft text-warning-emphasis",
    subtle: "bg-warning-soft text-warning-emphasis border-warning-subtle-line",
    outline: "bg-transparent text-warning-emphasis border-warning-subtle-line",
  },
  danger: {
    solid: "bg-danger text-on-danger",
    soft: "bg-danger-soft text-danger-emphasis",
    subtle: "bg-danger-soft text-danger-emphasis border-danger-subtle-line",
    outline: "bg-transparent text-danger-emphasis border-danger-subtle-line",
  },
};

/** The role's legible content color — carried by the `icon` + `title` slots in the `default` variant. */
const ROLE_TEXT: Record<AlertColorScheme, string> = {
  primary: "text-primary-emphasis",
  neutral: "text-neutral-emphasis",
  success: "text-success-emphasis",
  info: "text-info-emphasis",
  warning: "text-warning-emphasis",
  danger: "text-danger-emphasis",
};

const COLORED_VARIANTS: ColoredAlertVariant[] = ["solid", "soft", "subtle", "outline"];
const COLOR_SCHEMES = Object.keys(COLOR_CLASSES) as AlertColorScheme[];

/** solid/soft/subtle/outline × colorScheme → the literal fill on the `root` slot. */
const colorCompoundVariants = COLOR_SCHEMES.flatMap((colorScheme) =>
  COLORED_VARIANTS.map((variant) => ({
    variant,
    colorScheme,
    class: { root: COLOR_CLASSES[colorScheme][variant] },
  })),
);

/**
 * default × colorScheme → the role color on the `icon` + `title` slots (the `default` `root` stays a
 * color-independent raised surface, and the body/`description` keep `text-foreground`).
 */
const defaultRoleCompoundVariants = COLOR_SCHEMES.map((colorScheme) => ({
  variant: "default" as const,
  colorScheme,
  class: { icon: ROLE_TEXT[colorScheme], title: ROLE_TEXT[colorScheme] },
}));

/**
 * hope's Alert slot recipe — used as-is by the component (`recipe(props).root()`), no adapter.
 * `hopeRecipes` (in `./index`) checks it against the `alert` contract in `@hope-ui/theming`.
 */
export const alertRecipe = tv({
  slots: {
    // A horizontal flex row: icon, content (flex-1), close trigger. `items-start` top-aligns the icon
    // with the first line of text. `border border-transparent bg-clip-padding` reserves a 1px border so
    // the bordered variants never shift a pixel. The exit fade+slide is keyed on the `data-exiting:`
    // custom variant (→ `[data-presence="exiting"]`, the presence status the component writes to
    // `data-presence`); `motion-reduce` drops it. Transition `opacity` + `translate`, NOT `transform`:
    // Tailwind v4 compiles `-translate-y-1` to the standalone `translate` CSS property (not `transform`),
    // so `transition-transform` would never animate the 4px slide — only the fade. `opacity-0` is
    // full-transparent (allowed); only magic `opacity-1..99` violates recipe purity.
    root: [
      "relative flex w-full items-start rounded-xl",
      "border border-transparent bg-clip-padding",
      "transition-[opacity,translate] duration-200 ease-out motion-reduce:transition-none",
      "data-exiting:opacity-0 data-exiting:-translate-y-1",
    ],
    // The host `<span>` wrapping the glyph (keeps the hydration-keyed root's first child a host
    // element). Its color comes from the variant (role-emphasis in `default`, inherited otherwise);
    // its glyph size from `size`.
    icon: "inline-flex shrink-0 items-center justify-center",
    content: "flex min-w-0 flex-1 flex-col",
    title: "font-medium",
    // The body prose. A comfortable line height for multi-line text — deliberately **color-neutral**
    // (no `text-*`) so it inherits the root's content color: `text-foreground` in `default`, and the
    // role/on-color the colored variants set on the root (`text-success-emphasis`, `text-on-success`, …).
    description: "leading-relaxed",
    actions: "flex flex-wrap items-center",
    // Placement only (pulled into the padding, pushed to the trailing edge, never shrinks); the button
    // chrome comes from CloseButton's own recipe, merged under this via its `class` prop.
    closeTrigger: "-me-1 -mt-1 ms-auto shrink-0",
  },
  variants: {
    size: {
      sm: {
        root: "gap-2 p-3 text-sm",
        icon: "[&_svg]:size-4 mt-0.5",
        content: "gap-0.5",
        actions: "mt-2 gap-2",
      },
      md: {
        root: "gap-3 p-4 text-sm",
        icon: "[&_svg]:size-5",
        content: "gap-1",
        actions: "mt-3 gap-3",
      },
      lg: {
        root: "gap-4 p-5 text-base",
        icon: "[&_svg]:size-6",
        content: "gap-1",
        actions: "mt-4 gap-4",
      },
    },
    variant: {
      // `default`: role-neutral raised surface, no shadow. The role color rides the icon/title slots
      // (per-role compound variants), never the root.
      default: { root: "bg-surface-raised text-foreground border-subtle" },
      // The colored fills live per-role in `COLOR_CLASSES` (via `compoundVariants`); these carry only
      // the variant-wide, color-independent chrome. (Slot recipes need `{ root }` objects, not bare
      // strings.)
      solid: { root: "" },
      soft: { root: "" },
      subtle: { root: "" },
      outline: { root: "bg-transparent" },
    },
    // `colorScheme` carries no base classes of its own — every fill is variant×colorScheme-specific and
    // lives in `compoundVariants`. Declared here (with empty slots) so the compound entries can match on
    // it as a real, typed variant.
    colorScheme: {
      primary: {},
      neutral: {},
      success: {},
      info: {},
      warning: {},
      danger: {},
    },
  },
  compoundVariants: [...colorCompoundVariants, ...defaultRoleCompoundVariants],
  defaultVariants: {
    variant: "default",
    colorScheme: "neutral",
    size: "md",
  },
});
