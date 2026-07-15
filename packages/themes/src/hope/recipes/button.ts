/*
 * @hope-ui/themes/hope — Button slot recipe.
 *
 * The `tailwind-variants` slot recipe the `@hope-ui/components` `Button` reads through
 * `useRecipe("button")`. It encodes hope's "vega on your tokens" look & feel: shadcn/ui's vega
 * button metrics (reserved 1px transparent border, 1px press nudge, 3px translucent focus ring,
 * uniform 8px radius) painted entirely through hope's semantic `--hope-*` tokens.
 *
 * ── Why every class is a literal string ─────────────────────────────────────────────────────────
 * The consumer's Tailwind build discovers which utilities to generate by scanning this file
 * (`@source "./recipes"` in `theme.css`). A scanner only sees *literal* candidates, so the
 * per-color utilities cannot be built with `bg-${role}` template strings — they are written out in
 * `COLOR_CLASSES` and assembled into `compoundVariants`. The literals are what makes `bg-primary`,
 * `text-on-danger-soft`, `border-warning-outline`, etc. actually exist in the emitted CSS.
 *
 * ── Where the semantic tokens come from ─────────────────────────────────────────────────────────
 * `bg-primary` → `var(--color-primary)` → `var(--hope-primary)` (via `_base/theme-map.css`). The
 * soft-hover mix references the raw `--hope-*` custom properties directly because `@theme inline`
 * does not emit the `--color-*` names as usable variables. Interaction states use Tailwind's own
 * `hover:`/`active:`/`disabled:`/`aria-disabled:` and hope's `data-pressed` variant — no dedicated
 * state tokens (theming decision 02).
 */

import type { ButtonColor, ButtonVariant } from "@hope-ui/theming";
// The Button recipe's variant vocabulary is owned by `@hope-ui/theming` (the contract); this theme
// implements it. `hopeRecipes` (in `./index`) checks the finished recipe against `RecipeRegistry`.
import { tv } from "@hope-ui/theming";

/*
 * Per-color, per-variant fills — literal so Tailwind's `@source` scan emits them.
 *  - solid   : `bg-{role}` + `text-on-{role}`, hover → the real `bg-{role}-hover` token.
 *  - soft    : `bg-{role}-soft` + `text-on-{role}-soft`, hover → soft mixed 12% toward the fill.
 *  - outline : transparent bg + `text-on-{role}-soft` + the dedicated `border-{role}-outline` tint,
 *              hover fills with `bg-{role}-soft`.
 *  - ghost   : like outline without the border.
 *  - link    : `text-on-{role}-soft`, underline on hover (layout handled in the `variant` axis).
 * outline/ghost/link use `on-{role}-soft` (surface-legible) rather than the fill, so neutral &
 * warning stay readable in both themes instead of looking disabled.
 */
const COLOR_CLASSES: Record<ButtonColor, Record<Exclude<ButtonVariant, "default">, string>> = {
  primary: {
    solid: "bg-primary text-on-primary hover:bg-primary-hover",
    soft: "bg-primary-soft text-on-primary-soft hover:bg-[color-mix(in_oklch,var(--hope-primary-soft),var(--hope-primary)_12%)]",
    outline: "text-on-primary-soft border-primary-outline hover:bg-primary-soft",
    ghost: "text-on-primary-soft hover:bg-primary-soft",
    link: "text-on-primary-soft",
  },
  neutral: {
    solid: "bg-neutral text-on-neutral hover:bg-neutral-hover",
    soft: "bg-neutral-soft text-on-neutral-soft hover:bg-[color-mix(in_oklch,var(--hope-neutral-soft),var(--hope-neutral)_12%)]",
    outline: "text-on-neutral-soft border-neutral-outline hover:bg-neutral-soft",
    ghost: "text-on-neutral-soft hover:bg-neutral-soft",
    link: "text-on-neutral-soft",
  },
  success: {
    solid: "bg-success text-on-success hover:bg-success-hover",
    soft: "bg-success-soft text-on-success-soft hover:bg-[color-mix(in_oklch,var(--hope-success-soft),var(--hope-success)_12%)]",
    outline: "text-on-success-soft border-success-outline hover:bg-success-soft",
    ghost: "text-on-success-soft hover:bg-success-soft",
    link: "text-on-success-soft",
  },
  warning: {
    solid: "bg-warning text-on-warning hover:bg-warning-hover",
    soft: "bg-warning-soft text-on-warning-soft hover:bg-[color-mix(in_oklch,var(--hope-warning-soft),var(--hope-warning)_12%)]",
    outline: "text-on-warning-soft border-warning-outline hover:bg-warning-soft",
    ghost: "text-on-warning-soft hover:bg-warning-soft",
    link: "text-on-warning-soft",
  },
  danger: {
    solid: "bg-danger text-on-danger hover:bg-danger-hover",
    soft: "bg-danger-soft text-on-danger-soft hover:bg-[color-mix(in_oklch,var(--hope-danger-soft),var(--hope-danger)_12%)]",
    outline: "text-on-danger-soft border-danger-outline hover:bg-danger-soft",
    ghost: "text-on-danger-soft hover:bg-danger-soft",
    link: "text-on-danger-soft",
  },
  info: {
    solid: "bg-info text-on-info hover:bg-info-hover",
    soft: "bg-info-soft text-on-info-soft hover:bg-[color-mix(in_oklch,var(--hope-info-soft),var(--hope-info)_12%)]",
    outline: "text-on-info-soft border-info-outline hover:bg-info-soft",
    ghost: "text-on-info-soft hover:bg-info-soft",
    link: "text-on-info-soft",
  },
};

const COLOR_VARIANTS: Array<Exclude<ButtonVariant, "default">> = [
  "solid",
  "soft",
  "outline",
  "ghost",
  "link",
];

/** variant × color → the literal fill on the `root` slot (default variant is color-independent). */
const colorCompoundVariants = (Object.keys(COLOR_CLASSES) as ButtonColor[]).flatMap((color) =>
  COLOR_VARIANTS.map((variant) => ({
    variant,
    color,
    class: { root: COLOR_CLASSES[color][variant] },
  })),
);

/**
 * hope's Button slot recipe — used as-is by the component (`recipe(props).root()`), no adapter.
 * `hopeRecipes` (in `./index`) checks it against the `button` contract in `@hope-ui/theming`.
 */
export const buttonRecipe = tv({
  slots: {
    // `--hope-button-px` (set per size) is the horizontal padding; the icon-inset trims it ×0.72 on the
    // side a decorator sits (vega's `has-icon` rule). `bg-clip-padding` keeps the reserved 1px
    // transparent border from painting the fill under it, so solid↔outline never shifts by a pixel.
    root: [
      "relative inline-flex items-center justify-center whitespace-nowrap font-medium leading-none",
      "cursor-pointer select-none border border-transparent bg-clip-padding outline-none",
      "px-[var(--hope-button-px)]",
      "transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out",
      "has-[>[data-slot=start-decorator]]:ps-[calc(var(--hope-button-px)*0.72)]",
      "has-[>[data-slot=end-decorator]]:pe-[calc(var(--hope-button-px)*0.72)]",
      "focus-visible:border-focus focus-visible:ring-3 focus-visible:ring-focus/50",
      "active:translate-y-px data-pressed:translate-y-px",
      "disabled:cursor-not-allowed disabled:pointer-events-none disabled:shadow-none disabled:border-transparent disabled:text-foreground-disabled",
      "aria-disabled:cursor-not-allowed aria-disabled:shadow-none aria-disabled:border-transparent aria-disabled:text-foreground-disabled",
    ].join(" "),
    label: "inline-flex items-center",
    startDecorator: "inline-flex shrink-0 items-center justify-center",
    endDecorator: "inline-flex shrink-0 items-center justify-center",
    // Spinner styling lives here (not in the component JSX) so the utilities are scanned: the
    // component's default loader marks its two SVG parts `.hope-spinner-track` / `.hope-spinner-head`.
    loader: [
      "pointer-events-none inline-flex items-center justify-center",
      "[&_.hope-spinner-track]:opacity-25",
      "[&_.hope-spinner-head]:origin-center [&_.hope-spinner-head]:animate-spin [&_.hope-spinner-head]:opacity-90",
      "motion-reduce:[&_.hope-spinner-head]:animate-none",
    ].join(" "),
  },
  variants: {
    // `size` before `variant` so `link`'s `h-auto` / `px-0.5` win the tailwind-merge conflict over
    // the fixed height / `--hope-button-px` padding. Heights step an even +4 (28/32/36/40/44); padding is
    // vega-exact (8/10/10/10/12); radius is a uniform 8px (`rounded-md` = `--radius-md`), with vega's
    // `min()` caps kept on xs/sm so a larger theme `--radius` can't pill them.
    size: {
      xs: {
        root: "h-7 gap-1 text-xs rounded-[min(var(--radius-md),8px)] [--hope-button-px:8px]",
        startDecorator: "[&_svg]:size-3",
        endDecorator: "[&_svg]:size-3",
        loader: "[&_svg]:size-3",
      },
      sm: {
        root: "h-8 gap-1 text-sm rounded-[min(var(--radius-md),10px)] [--hope-button-px:10px]",
        startDecorator: "[&_svg]:size-4",
        endDecorator: "[&_svg]:size-4",
        loader: "[&_svg]:size-4",
      },
      md: {
        root: "h-9 gap-1.5 text-sm rounded-md [--hope-button-px:10px]",
        startDecorator: "[&_svg]:size-4",
        endDecorator: "[&_svg]:size-4",
        loader: "[&_svg]:size-4",
      },
      lg: {
        root: "h-10 gap-1.5 text-sm rounded-md [--hope-button-px:10px]",
        startDecorator: "[&_svg]:size-4",
        endDecorator: "[&_svg]:size-4",
        loader: "[&_svg]:size-4",
      },
      xl: {
        root: "h-11 gap-2 text-base rounded-md [--hope-button-px:12px]",
        startDecorator: "[&_svg]:size-5",
        endDecorator: "[&_svg]:size-5",
        loader: "[&_svg]:size-5",
      },
    },
    fullWidth: {
      true: { root: "w-full" },
      false: { root: "" },
    },
    variant: {
      // shadcn's outline button: surface fill, subtle gray border, faint shadow — color-independent
      // (ignores `color`), hover fills neutral. (Slot recipes need `{ root }` objects, not bare
      // strings — a bare string applies to no slot.)
      default: {
        root: "bg-surface-raised text-foreground border-subtle shadow-xs hover:bg-neutral-soft disabled:bg-disabled aria-disabled:bg-disabled",
      },
      // Colored fills come from `compoundVariants`; the disabled gray is color-independent so it lives
      // here for the fill-bearing variants (ghost/link stay transparent when disabled — muted text only).
      solid: { root: "disabled:bg-disabled aria-disabled:bg-disabled" },
      soft: { root: "disabled:bg-disabled aria-disabled:bg-disabled" },
      outline: { root: "bg-transparent disabled:bg-disabled aria-disabled:bg-disabled" },
      ghost: { root: "bg-transparent" },
      link: {
        root: "h-auto bg-transparent border-transparent px-0.5 py-0.5 hover:underline underline-offset-4",
      },
    },
    // `color` carries no base classes of its own — every fill is variant×color-specific and lives in
    // `compoundVariants`. It's declared here (with empty slots) so it's a real, typed variant the
    // compound entries can match on, rather than an untyped prop.
    color: {
      primary: {},
      neutral: {},
      success: {},
      warning: {},
      danger: {},
      info: {},
    },
    loading: {
      none: { loader: "hidden" },
      // center = overlay: label + decorators keep their width but go invisible, loader fills & centers.
      center: {
        label: "opacity-0",
        startDecorator: "opacity-0",
        endDecorator: "opacity-0",
        loader: "absolute inset-0 flex",
      },
      start: { loader: "order-first" },
      end: { loader: "order-last" },
    },
  },
  compoundVariants: colorCompoundVariants,
  defaultVariants: {
    variant: "default",
    color: "primary",
    size: "md",
    fullWidth: false,
    loading: "none",
  },
});
