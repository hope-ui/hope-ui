/*
 * @hope-ui/presets/hope — Badge slot recipe.
 *
 * The `tailwind-variants` slot recipe the `@hope-ui/components` `Badge` reads through
 * `useRecipe("badge")`. Badge is a **static, non-interactive** inline label (a styled `<span>`), so
 * this recipe carries no interaction states — no `hover:`, no `data-pressed`, no `focus-visible:` —
 * only the visual axes (variant × colorScheme × size × shape × fullWidth).
 *
 * ── Why every class is a literal string ─────────────────────────────────────────────────────────
 * The consumer's Tailwind build discovers which utilities to generate by scanning this file
 * (`@source "./recipes"` in `tailwind.css`). A scanner only sees *literal* candidates, so the
 * per-color utilities cannot be built with `bg-${role}` template strings — they are written out in
 * `COLOR_CLASSES` / `DOT_CLASSES` and assembled into `compoundVariants`. The literals are what makes
 * `bg-primary`, `bg-on-primary`, `text-primary-emphasis`, `border-danger-subtle-line`, etc. actually
 * exist in the emitted CSS.
 *
 * ── Where the semantic tokens come from ─────────────────────────────────────────────────────────
 * `bg-primary` → `var(--color-primary)` → `var(--hope-primary)` (via `_base/theme-map.css`). Every
 * fill is a *finished* token; the recipe computes no color: no `color-mix`, no alpha modifier
 * (`bg-x/50`), no magic opacity, so a preset that redefines a shade changes the painted result
 * predictably (the recipe-purity rule — enforced by `pnpm check:recipe-purity`).
 *
 * ── The six variants ────────────────────────────────────────────────────────────────────────────
 *  - solid    : `bg-{role}` + `text-on-{role}` + a fill-matched `border-{role}`.
 *  - inverted : the swap of solid on its own dedicated tokens — `bg-{role}-inverted` +
 *               `text-on-{role}-inverted` + `border-{role}-inverted`. The hope defaults reproduce the
 *               on-color/role swap (so it stays legible, and warning defaults to a dark chip) but as
 *               independent, tunable knobs rather than borrowing solid's `on-{role}`/`{role}`.
 *  - soft     : `bg-{role}-soft` + `text-{role}-emphasis` + a fill-matched `border-{role}-soft`.
 *  - subtle   : soft plus the darker soft role border `border-{role}-subtle-line`.
 *  - outline  : transparent fill + `text-{role}-emphasis` + `border-{role}-subtle-line`.
 *  - dot      : neutral chrome (`bg-transparent text-foreground border-neutral-subtle-line`) with a
 *               role-colored `dot` slot (`bg-{role}`).
 * The filled variants (solid/inverted/soft) carry a border matching their own fill, so the reserved
 * 1px edge is a clean continuation of the fill rather than a transparent gap to the page background.
 * The soft/subtle/outline label is `{role}-emphasis` — the role's legible *content* color — so
 * neutral & warning read correctly in both themes.
 */

import type { BadgeColorScheme } from "@hope-ui/theming";
// The Badge recipe's variant vocabulary is owned by `@hope-ui/theming` (the contract); this theme
// implements it. `hopeRecipes` (in `./index`) checks the finished recipe against `RecipeRegistry`.
import { tv } from "@hope-ui/theming";

/** The colored variants that vary per role (dot is handled separately — its chrome is role-neutral). */
type ColoredBadgeVariant = "solid" | "inverted" | "soft" | "subtle" | "outline";

/*
 * Per-color, per-variant fills on the `root` slot — literal so Tailwind's `@source` scan emits them.
 * Every (role × variant) is its own finished token; nothing is computed and nothing is borrowed from
 * a sibling variant. Every variant carries an explicit border color (filled variants match their own
 * fill; subtle/outline/dot use the darker `-subtle-line` edge), so the `root` base's reserved 1px
 * border is a real, fill-matched line rather than a transparent gap — and its constant width keeps
 * bordered and unbordered variants aligned to the pixel.
 */
const COLOR_CLASSES: Record<BadgeColorScheme, Record<ColoredBadgeVariant, string>> = {
  primary: {
    solid: "bg-primary text-on-primary border-primary",
    inverted: "bg-primary-inverted text-on-primary-inverted border-primary-inverted",
    soft: "bg-primary-soft text-primary-emphasis border-primary-soft",
    subtle: "bg-primary-soft text-primary-emphasis border-primary-subtle-line",
    outline: "bg-transparent text-primary-emphasis border-primary-subtle-line",
  },
  neutral: {
    solid: "bg-neutral text-on-neutral border-neutral",
    inverted: "bg-neutral-inverted text-on-neutral-inverted border-neutral-inverted",
    soft: "bg-neutral-soft text-neutral-emphasis border-neutral-soft",
    subtle: "bg-neutral-soft text-neutral-emphasis border-neutral-subtle-line",
    outline: "bg-transparent text-neutral-emphasis border-neutral-subtle-line",
  },
  success: {
    solid: "bg-success text-on-success border-success",
    inverted: "bg-success-inverted text-on-success-inverted border-success-inverted",
    soft: "bg-success-soft text-success-emphasis border-success-soft",
    subtle: "bg-success-soft text-success-emphasis border-success-subtle-line",
    outline: "bg-transparent text-success-emphasis border-success-subtle-line",
  },
  info: {
    solid: "bg-info text-on-info border-info",
    inverted: "bg-info-inverted text-on-info-inverted border-info-inverted",
    soft: "bg-info-soft text-info-emphasis border-info-soft",
    subtle: "bg-info-soft text-info-emphasis border-info-subtle-line",
    outline: "bg-transparent text-info-emphasis border-info-subtle-line",
  },
  warning: {
    solid: "bg-warning text-on-warning border-warning",
    inverted: "bg-warning-inverted text-on-warning-inverted border-warning-inverted",
    soft: "bg-warning-soft text-warning-emphasis border-warning-soft",
    subtle: "bg-warning-soft text-warning-emphasis border-warning-subtle-line",
    outline: "bg-transparent text-warning-emphasis border-warning-subtle-line",
  },
  danger: {
    solid: "bg-danger text-on-danger border-danger",
    inverted: "bg-danger-inverted text-on-danger-inverted border-danger-inverted",
    soft: "bg-danger-soft text-danger-emphasis border-danger-soft",
    subtle: "bg-danger-soft text-danger-emphasis border-danger-subtle-line",
    outline: "bg-transparent text-danger-emphasis border-danger-subtle-line",
  },
};

/** The role-colored fill for the `dot` slot, per colorScheme — literal so the scan emits them. */
const DOT_CLASSES: Record<BadgeColorScheme, string> = {
  primary: "bg-primary",
  neutral: "bg-neutral",
  success: "bg-success",
  info: "bg-info",
  warning: "bg-warning",
  danger: "bg-danger",
};

const COLORED_VARIANTS: ColoredBadgeVariant[] = ["solid", "inverted", "soft", "subtle", "outline"];

/** variant × colorScheme → the literal fill on the `root` slot (dot's root chrome is role-neutral). */
const colorCompoundVariants = (Object.keys(COLOR_CLASSES) as BadgeColorScheme[]).flatMap(
  (colorScheme) =>
    COLORED_VARIANTS.map((variant) => ({
      variant,
      colorScheme,
      class: { root: COLOR_CLASSES[colorScheme][variant] },
    })),
);

/** dot variant × colorScheme → the role-colored `dot` slot (the root chrome comes from `variant.dot`). */
const dotCompoundVariants = (Object.keys(DOT_CLASSES) as BadgeColorScheme[]).map((colorScheme) => ({
  variant: "dot" as const,
  colorScheme,
  class: { dot: DOT_CLASSES[colorScheme] },
}));

/**
 * hope's Badge slot recipe — used as-is by the component (`recipe(props).root()`), no adapter.
 * `hopeRecipes` (in `./index`) checks it against the `badge` contract in `@hope-ui/theming`.
 */
export const badgeRecipe = tv({
  slots: {
    // The bare `border` reserves a 1px border WIDTH so bordered↔borderless variants never shift by a
    // pixel; the border COLOR is supplied by every variant (see `COLOR_CLASSES` and the `dot` variant),
    // so the reserved edge is a real, fill-matched line rather than a transparent gap to the page
    // background — no `bg-clip-padding` needed. `align-middle` sits it on the text baseline.
    root: [
      "inline-flex items-center justify-center whitespace-nowrap align-middle",
      "font-medium leading-none select-none",
      "border",
    ],
    label: "inline-flex items-center",
    startDecorator: "inline-flex shrink-0 items-center justify-center",
    endDecorator: "inline-flex shrink-0 items-center justify-center",
    // The role dot (rendered by the component only for the `dot` variant). Its color comes from the
    // dot compound variants; its size from the `size` variant. Base is chrome only.
    dot: "inline-block shrink-0 rounded-full",
  },
  variants: {
    // `size` before `shape` so `shape` wins the radius/padding tailwind-merge conflict — `circle`'s
    // `px-0` must beat the size padding, and `shape` owns the radius entirely (size sets none).
    // Optical padding (matching Button): when a decorator is present on a side, tighten that side's
    // padding one 2px step below the text-edge `px`, so an icon doesn't look over-spaced against the
    // chip edge. `has-data-[slot=badge-{start,end}-decorator]:` only fires when the part is mounted;
    // a plain (decorator-less) badge keeps the symmetric `px`.
    size: {
      xs: {
        root: [
          "h-4 gap-1 px-1.5 text-[0.625rem]",
          "has-data-[slot=badge-start-decorator]:ps-1 has-data-[slot=badge-end-decorator]:pe-1",
        ],
        startDecorator: "[&_svg]:size-3",
        endDecorator: "[&_svg]:size-3",
        dot: "size-1.5",
      },
      sm: {
        root: [
          "h-5 gap-1 px-2 text-xs",
          "has-data-[slot=badge-start-decorator]:ps-1.5 has-data-[slot=badge-end-decorator]:pe-1.5",
        ],
        startDecorator: "[&_svg]:size-3.5",
        endDecorator: "[&_svg]:size-3.5",
        dot: "size-1.5",
      },
      md: {
        root: [
          "h-6 gap-1.5 px-2.5 text-sm",
          "has-data-[slot=badge-start-decorator]:ps-2 has-data-[slot=badge-end-decorator]:pe-2",
        ],
        startDecorator: "[&_svg]:size-4",
        endDecorator: "[&_svg]:size-4",
        dot: "size-2",
      },
      lg: {
        root: [
          "h-7 gap-1.5 px-3 text-sm",
          "has-data-[slot=badge-start-decorator]:ps-2.5 has-data-[slot=badge-end-decorator]:pe-2.5",
        ],
        startDecorator: "[&_svg]:size-4.5",
        endDecorator: "[&_svg]:size-4.5",
        dot: "size-2",
      },
    },
    // `shape` owns the radius; declared after `size` so it wins the merge. `circle` also squares the
    // aspect and drops the horizontal padding (for a single glyph/count).
    shape: {
      sharp: { root: "rounded-none" },
      rounded: { root: "rounded-md" },
      pill: { root: "rounded-full" },
      circle: { root: "rounded-full aspect-square justify-center px-0" },
    },
    fullWidth: {
      true: { root: "w-full" },
      false: { root: "" },
    },
    variant: {
      // The colored fills live per-role in `COLOR_CLASSES` (via `compoundVariants`); these carry only
      // the variant-wide, color-independent chrome. (Slot recipes need `{ root }` objects, not bare
      // strings — a bare string applies to no slot.)
      solid: { root: "" },
      inverted: { root: "" },
      soft: { root: "" },
      subtle: { root: "" },
      outline: { root: "bg-transparent" },
      // dot: neutral chrome; the role color is on the `dot` slot (per-role compound variants).
      dot: { root: "bg-transparent text-foreground border-neutral-subtle-line" },
    },
    // `colorScheme` carries no base classes of its own — every fill is variant×colorScheme-specific
    // and lives in `compoundVariants`. It's declared here (with empty slots) so it's a real, typed
    // variant the compound entries can match on, rather than an untyped prop.
    colorScheme: {
      primary: {},
      neutral: {},
      success: {},
      info: {},
      warning: {},
      danger: {},
    },
  },
  compoundVariants: [...colorCompoundVariants, ...dotCompoundVariants],
  defaultVariants: {
    variant: "soft",
    colorScheme: "neutral",
    size: "sm",
    shape: "rounded",
    fullWidth: false,
  },
});
