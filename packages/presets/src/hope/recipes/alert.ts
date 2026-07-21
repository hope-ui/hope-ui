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
 * Every variant carries an explicit border color so the `root` base's reserved 1px border is never a
 * transparent gap to the page background: `solid`/`soft` match their own fill (`border-{role}` /
 * `border-{role}-soft`), and `subtle`/`outline` carry the darker `-subtle-line` as a visible edge.
 * (This is where Alert diverges from Badge, which still rides a transparent reserved border.) The 1px
 * width is constant across every variant, so bordered and unbordered ones never shift a pixel.
 */
const COLOR_CLASSES: Record<AlertColorScheme, Record<ColoredAlertVariant, string>> = {
  primary: {
    solid: "bg-primary text-on-primary border-primary",
    soft: "bg-primary-soft text-primary-emphasis border-primary-soft",
    subtle: "bg-primary-soft text-primary-emphasis border-primary-subtle-line",
    outline: "bg-transparent text-primary-emphasis border-primary-subtle-line",
  },
  neutral: {
    solid: "bg-neutral text-on-neutral border-neutral",
    soft: "bg-neutral-soft text-neutral-emphasis border-neutral-soft",
    subtle: "bg-neutral-soft text-neutral-emphasis border-neutral-subtle-line",
    outline: "bg-transparent text-neutral-emphasis border-neutral-subtle-line",
  },
  success: {
    solid: "bg-success text-on-success border-success",
    soft: "bg-success-soft text-success-emphasis border-success-soft",
    subtle: "bg-success-soft text-success-emphasis border-success-subtle-line",
    outline: "bg-transparent text-success-emphasis border-success-subtle-line",
  },
  info: {
    solid: "bg-info text-on-info border-info",
    soft: "bg-info-soft text-info-emphasis border-info-soft",
    subtle: "bg-info-soft text-info-emphasis border-info-subtle-line",
    outline: "bg-transparent text-info-emphasis border-info-subtle-line",
  },
  warning: {
    solid: "bg-warning text-on-warning border-warning",
    soft: "bg-warning-soft text-warning-emphasis border-warning-soft",
    subtle: "bg-warning-soft text-warning-emphasis border-warning-subtle-line",
    outline: "bg-transparent text-warning-emphasis border-warning-subtle-line",
  },
  danger: {
    solid: "bg-danger text-on-danger border-danger",
    soft: "bg-danger-soft text-danger-emphasis border-danger-soft",
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
    // with the first line of text. The bare `border` reserves a 1px border WIDTH so bordered and
    // unbordered variants never shift a pixel; the border COLOR is supplied by every variant (see
    // `COLOR_CLASSES` and the `default` variant), so the reserved edge is a real, fill-matched line
    // rather than a transparent gap to the page background — no `bg-clip-padding` needed. The exit
    // fade+slide is keyed on the `data-exiting:` custom variant (→ `[data-presence="exiting"]`, the
    // presence status the component writes to `data-presence`); `motion-reduce` drops it. Transition
    // `opacity` + `translate`, NOT `transform`: Tailwind v4 compiles `-translate-y-1` to the standalone
    // `translate` CSS property (not `transform`), so `transition-transform` would never animate the 4px
    // slide — only the fade. `opacity-0` is full-transparent (allowed); only magic `opacity-1..99`
    // violates recipe purity.
    root: [
      "relative flex w-full items-start rounded-lg border",
      "transition-[opacity,translate] duration-200 ease-out motion-reduce:transition-none",
      "data-exiting:opacity-0 data-exiting:-translate-y-1",
    ],
    // The host `<span>` wrapping the glyph (keeps the hydration-keyed root's first child a host
    // element). Its color comes from the variant (role-emphasis in `default`, inherited otherwise);
    // its glyph size from `size`.
    icon: "inline-flex shrink-0 items-center justify-center",
    content: "flex min-w-0 flex-1 flex-col",
    title: "font-medium",
    // Intentionally unstyled by default: the description inherits the root's content color and the
    // body font metrics; consumers restyle it via `slotClasses.description`. An empty base is the
    // tailwind-variants idiom for a slot with no default classes — the slot stays present/callable so
    // the component can read `ctx.slots.description()` and consumers can target it.
    description: "",
    actions: "flex flex-wrap items-center mt-2 gap-2",
    // Placement only (pulled into the padding, pushed to the trailing edge, never shrinks); the button
    // chrome comes from CloseButton's own recipe, merged under this via its `class` prop.
    closeTrigger: "-me-1 -mt-1 ms-auto shrink-0",
  },
  variants: {
    size: {
      sm: {
        root: "gap-2 p-2 text-xs",
        icon: "[&_svg]:size-4",
        content: "gap-0.5",
      },
      md: {
        root: "gap-2.5 p-3 text-sm",
        icon: "[&_svg]:size-5",
        content: "gap-0.5",
      },
      lg: {
        root: "gap-3.5 p-4 text-base",
        icon: "[&_svg]:size-6",
        content: "gap-0.5",
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
