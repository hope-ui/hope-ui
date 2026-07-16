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
 * `text-primary-emphasis`, `border-warning-line`, etc. actually exist in the emitted CSS.
 *
 * ── Where the semantic tokens come from ─────────────────────────────────────────────────────────
 * `bg-primary` → `var(--color-primary)` → `var(--hope-primary)` (via `_base/theme-map.css`). Every
 * interaction state is a *finished* token too — `hover:bg-primary-hovered`,
 * `data-pressed:bg-primary-pressed`, `hover:text-primary-link-hovered`, `focus-visible:ring-focus-halo`,
 * `data-disabled:opacity-disabled`. The recipe computes no color: no `color-mix`, no alpha modifier
 * (`bg-x/50`), no magic opacity, so a preset that redefines a shade changes the painted result
 * predictably (the recipe-purity rule — enforced by `pnpm check:recipe-purity`). Interaction
 * *triggers* are still Tailwind's own `hover:`/`focus-visible:` and hope's `data-pressed`/
 * `data-disabled` variants.
 */

import type { ButtonColorScheme, ButtonVariant } from "@hope-ui/theming";
// The Button recipe's variant vocabulary is owned by `@hope-ui/theming` (the contract); this theme
// implements it. `hopeRecipes` (in `./index`) checks the finished recipe against `RecipeRegistry`.
import { tv } from "@hope-ui/theming";

/*
 * Per-color, per-variant fills — literal so Tailwind's `@source` scan emits them. Every
 * (role × variant × state) is its own finished token; nothing is computed and nothing is borrowed
 * from a sibling variant.
 *  - solid   : `bg-{role}` + `text-on-{role}`, hovered/pressed → `bg-{role}-hovered`/`-pressed`.
 *  - soft    : `bg-{role}-soft` + `text-{role}-emphasis`, hovered/pressed → `bg-{role}-soft-hovered`/`-pressed`.
 *  - outline : transparent bg + `text-{role}-emphasis` + the `border-{role}-line` tint (neutral has
 *              no `-line` → `border-strong`); hovered/pressed wash → `bg-{role}-outline-hovered`/`-pressed`.
 *  - ghost   : like outline without the border; wash → `bg-{role}-ghost-hovered`/`-pressed`.
 *  - link    : `text-{role}-emphasis`, hovered/pressed text → `text-{role}-link-hovered`/`-pressed`,
 *              underline on hover.
 * The soft/outline/ghost/link label is `{role}-emphasis` — the role's legible *content* color — so
 * neutral & warning read correctly in both themes rather than looking disabled.
 */
const COLOR_CLASSES: Record<
  ButtonColorScheme,
  Record<Exclude<ButtonVariant, "default">, string>
> = {
  primary: {
    solid: "bg-primary text-on-primary hover:bg-primary-hovered data-pressed:bg-primary-pressed",
    soft: "bg-primary-soft text-primary-emphasis hover:bg-primary-soft-hovered data-pressed:bg-primary-soft-pressed",
    outline:
      "text-primary-emphasis border-primary-line hover:bg-primary-outline-hovered data-pressed:bg-primary-outline-pressed",
    ghost:
      "text-primary-emphasis hover:bg-primary-ghost-hovered data-pressed:bg-primary-ghost-pressed",
    link: "text-primary-emphasis hover:text-primary-link-hovered data-pressed:text-primary-link-pressed hover:underline underline-offset-4",
  },
  neutral: {
    solid: "bg-neutral text-on-neutral hover:bg-neutral-hovered data-pressed:bg-neutral-pressed",
    soft: "bg-neutral-soft text-neutral-emphasis hover:bg-neutral-soft-hovered data-pressed:bg-neutral-soft-pressed",
    outline:
      "text-neutral-emphasis border-strong hover:bg-neutral-outline-hovered data-pressed:bg-neutral-outline-pressed",
    ghost:
      "text-neutral-emphasis hover:bg-neutral-ghost-hovered data-pressed:bg-neutral-ghost-pressed",
    link: "text-neutral-emphasis hover:text-neutral-link-hovered data-pressed:text-neutral-link-pressed hover:underline underline-offset-4",
  },
  success: {
    solid: "bg-success text-on-success hover:bg-success-hovered data-pressed:bg-success-pressed",
    soft: "bg-success-soft text-success-emphasis hover:bg-success-soft-hovered data-pressed:bg-success-soft-pressed",
    outline:
      "text-success-emphasis border-success-line hover:bg-success-outline-hovered data-pressed:bg-success-outline-pressed",
    ghost:
      "text-success-emphasis hover:bg-success-ghost-hovered data-pressed:bg-success-ghost-pressed",
    link: "text-success-emphasis hover:text-success-link-hovered data-pressed:text-success-link-pressed hover:underline underline-offset-4",
  },
  warning: {
    solid: "bg-warning text-on-warning hover:bg-warning-hovered data-pressed:bg-warning-pressed",
    soft: "bg-warning-soft text-warning-emphasis hover:bg-warning-soft-hovered data-pressed:bg-warning-soft-pressed",
    outline:
      "text-warning-emphasis border-warning-line hover:bg-warning-outline-hovered data-pressed:bg-warning-outline-pressed",
    ghost:
      "text-warning-emphasis hover:bg-warning-ghost-hovered data-pressed:bg-warning-ghost-pressed",
    link: "text-warning-emphasis hover:text-warning-link-hovered data-pressed:text-warning-link-pressed hover:underline underline-offset-4",
  },
  danger: {
    solid: "bg-danger text-on-danger hover:bg-danger-hovered data-pressed:bg-danger-pressed",
    soft: "bg-danger-soft text-danger-emphasis hover:bg-danger-soft-hovered data-pressed:bg-danger-soft-pressed",
    outline:
      "text-danger-emphasis border-danger-line hover:bg-danger-outline-hovered data-pressed:bg-danger-outline-pressed",
    ghost:
      "text-danger-emphasis hover:bg-danger-ghost-hovered data-pressed:bg-danger-ghost-pressed",
    link: "text-danger-emphasis hover:text-danger-link-hovered data-pressed:text-danger-link-pressed hover:underline underline-offset-4",
  },
  info: {
    solid: "bg-info text-on-info hover:bg-info-hovered data-pressed:bg-info-pressed",
    soft: "bg-info-soft text-info-emphasis hover:bg-info-soft-hovered data-pressed:bg-info-soft-pressed",
    outline:
      "text-info-emphasis border-info-line hover:bg-info-outline-hovered data-pressed:bg-info-outline-pressed",
    ghost: "text-info-emphasis hover:bg-info-ghost-hovered data-pressed:bg-info-ghost-pressed",
    link: "text-info-emphasis hover:text-info-link-hovered data-pressed:text-info-link-pressed hover:underline underline-offset-4",
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
      // Focus halo is the finished `focus-halo` token (a preset-authored translucent color), not an
      // alpha modifier over `focus` — recipes never compute (recipe-purity rule).
      "focus-visible:border-focus focus-visible:ring-3 focus-visible:ring-focus-halo",
      "active:translate-y-px data-pressed:translate-y-px",
      // One disabled axis: `createButton` emits `data-disabled` for both native (`:disabled`) and
      // non-native (`aria-disabled`) buttons, so the recipe styles this single variant. The dim is
      // the `opacity-disabled` token (0.4), not a magic `opacity-90`.
      "data-disabled:cursor-not-allowed data-disabled:pointer-events-none data-disabled:shadow-none data-disabled:border-transparent data-disabled:text-foreground-disabled data-disabled:opacity-disabled",
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
      // (ignores `color`); rest → hover → press walk the `surface-raised` elevation ladder. (Slot
      // recipes need `{ root }` objects, not bare strings — a bare string applies to no slot.)
      default: {
        root: "bg-surface-raised text-foreground border-subtle shadow-xs hover:bg-surface-raised-hovered data-pressed:bg-surface-raised-pressed data-disabled:bg-disabled",
      },
      // Colored fills come from `compoundVariants`; the disabled fill (`bg-disabled`, a dedicated
      // neutral fill token) is color-independent so it lives here for the fill-bearing variants
      // (ghost/link stay transparent when disabled — muted text only).
      solid: { root: "data-disabled:bg-disabled" },
      soft: { root: "data-disabled:bg-disabled" },
      // Disabled outline drops its role border to the neutral `border-subtle` tint.
      outline: { root: "bg-transparent data-disabled:border-subtle" },
      ghost: { root: "bg-transparent" },
      // Layout only; the color ladder + underline live per-role in `COLOR_CLASSES.link`.
      link: {
        root: "h-auto bg-transparent border-transparent px-0.5 py-0.5",
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
