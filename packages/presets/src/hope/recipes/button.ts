/*
 * @hope-ui/presets/hope — Button slot recipe.
 *
 * The `tailwind-variants` slot recipe the `@hope-ui/components` `Button` reads through
 * `useRecipe("button")`. It encodes hope's "vega on your tokens" look & feel: shadcn/ui's vega
 * button metrics (reserved 1px transparent border, 1px press nudge, 3px translucent focus ring,
 * uniform 8px radius) painted entirely through hope's semantic `--hope-*` tokens.
 *
 * ── Why every class is a literal string ─────────────────────────────────────────────────────────
 * The consumer's Tailwind build discovers which utilities to generate by scanning this file
 * (`@source "./recipes"` in `tailwind.css`). A scanner only sees *literal* candidates, so the
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

import type { ButtonColorScheme, ButtonVariant } from "@hope-ui/theming";
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
const COLOR_CLASSES: Record<
  ButtonColorScheme,
  Record<Exclude<ButtonVariant, "default">, string>
> = {
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

/** variant × colorScheme → the literal fill on the `root` slot (default variant is color-independent). */
const colorCompoundVariants = (Object.keys(COLOR_CLASSES) as ButtonColorScheme[]).flatMap(
  (colorScheme) =>
    COLOR_VARIANTS.map((variant) => ({
      variant,
      colorScheme,
      class: { root: COLOR_CLASSES[colorScheme][variant] },
    })),
);

/**
 * hope's Button slot recipe — used as-is by the component (`recipe(props).root()`), no adapter.
 * `hopeRecipes` (in `./index`) checks it against the `button` contract in `@hope-ui/theming`.
 */
export const buttonRecipe = tv({
  slots: {
    // `bg-clip-padding` keeps the reserved 1px transparent border from painting the fill under it, so
    // solid↔outline never shifts by a pixel.
    root: [
      "relative inline-flex items-center justify-center whitespace-nowrap font-medium leading-none rounded-sm",
      "cursor-pointer select-none border border-transparent bg-clip-padding outline-none",
      "transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out",
      "focus-visible:border-focus focus-visible:ring-3 focus-visible:ring-focus/50",
      "active:translate-y-px data-pressed:translate-y-px",
      // One disabled axis: `createButton` emits `data-disabled` for both native (`:disabled`) and
      // non-native (`aria-disabled`) buttons, so the recipe styles this single variant.
      "data-disabled:cursor-not-allowed data-disabled:pointer-events-none data-disabled:shadow-none data-disabled:border-transparent data-disabled:text-foreground-disabled data-disabled:opacity-90",
    ],
    label: "inline-flex items-center",
    startDecorator: "inline-flex shrink-0 items-center justify-center",
    endDecorator: "inline-flex shrink-0 items-center justify-center",
    // Loader styling lives here (not in the component JSX) so the utilities are scanned. The default
    // loader is a single Lucide arc, targeted as the `svg` inside this slot — no per-part hooks.
    loader: [
      "pointer-events-none inline-flex items-center justify-center",
      "[&_svg]:origin-center [&_svg]:animate-spin",
      "motion-reduce:[&_svg]:animate-none",
    ],
  },
  variants: {
    // `size` before `variant` so `link`'s `h-auto` / `px-0.5` win the tailwind-merge conflict over the
    // fixed height. Heights step an even +4 (24/28/32/36/40); radius is a uniform `rounded-sm`.
    size: {
      xs: {
        root: [
          "h-6 gap-1 text-xs px-2",
          "has-data-[slot=button-start-decorator]:ps-1.5 has-data-[slot=button-end-decorator]:pe-1.5",
        ],
        startDecorator: "[&_svg]:size-4",
        endDecorator: "[&_svg]:size-4",
        loader: "[&_svg]:size-4",
      },
      sm: {
        root: [
          "h-7 gap-1 text-[0.8125rem] px-2.5",
          "has-data-[slot=button-start-decorator]:ps-2 has-data-[slot=button-end-decorator]:pe-2",
        ],
        startDecorator: "[&_svg]:size-4.5",
        endDecorator: "[&_svg]:size-4.5",
        loader: "[&_svg]:size-4.5",
      },
      md: {
        root: [
          "h-8 gap-1.5 text-sm px-3",
          "has-data-[slot=button-start-decorator]:ps-2.5 has-data-[slot=button-end-decorator]:pe-2.5",
        ],
        startDecorator: "[&_svg]:size-5",
        endDecorator: "[&_svg]:size-5",
        loader: "[&_svg]:size-5",
      },
      lg: {
        root: [
          "h-9 gap-1.5 text-[0.9375rem] px-3.5",
          "has-data-[slot=button-start-decorator]:ps-3 has-data-[slot=button-end-decorator]:pe-3",
        ],
        startDecorator: "[&_svg]:size-5.5",
        endDecorator: "[&_svg]:size-5.5",
        loader: "[&_svg]:size-5.5",
      },
      xl: {
        root: [
          "h-10 gap-2 text-base px-4",
          "has-data-[slot=button-start-decorator]:ps-3.5 has-data-[slot=button-end-decorator]:pe-3.5",
        ],
        startDecorator: "[&_svg]:size-6",
        endDecorator: "[&_svg]:size-6",
        loader: "[&_svg]:size-6",
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
        root: "bg-surface-raised text-foreground border-subtle-outline shadow-xs hover:bg-neutral-soft data-disabled:bg-disabled",
      },
      // Colored fills come from `compoundVariants`; the disabled fill (`bg-disabled`, a dedicated
      // neutral fill token — not the `-outline` border tint) is color-independent so it lives here
      // for the fill-bearing variants (ghost/link stay transparent when disabled — muted text only).
      solid: { root: "data-disabled:bg-disabled" },
      soft: { root: "data-disabled:bg-disabled" },
      outline: { root: "bg-transparent data-disabled:border-disabled-outline" },
      ghost: { root: "bg-transparent" },
      link: {
        root: "h-auto bg-transparent border-transparent px-0.5 py-0.5 hover:underline underline-offset-4",
      },
    },
    // `colorScheme` carries no base classes of its own — every fill is variant×colorScheme-specific
    // and lives in `compoundVariants`. It's declared here (with empty slots) so it's a real, typed
    // variant the compound entries can match on, rather than an untyped prop.
    colorScheme: {
      primary: {},
      neutral: {},
      success: {},
      warning: {},
      danger: {},
      info: {},
    },
    // Layout only — the component mounts/unmounts the loader slot via `<Show>`, so there is no
    // "hidden"/"none" member here. It passes `loaderPlacement: undefined` when not loading.
    loaderPlacement: {
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
    colorScheme: "primary",
    size: "md",
    fullWidth: false,
  },
});
