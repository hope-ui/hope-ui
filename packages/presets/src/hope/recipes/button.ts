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
 * `text-primary-emphasis`, `border-warning-subtle-line`, etc. actually exist in the emitted CSS.
 *
 * ── Where the semantic tokens come from ─────────────────────────────────────────────────────────
 * `bg-primary` → `var(--color-primary)` → `var(--hope-primary)` (via `_base/theme-map.css`). Every
 * interaction state is a *finished* token too — the hover wash (guarded against the pressed state,
 * `hover:not-data-pressed:bg-primary-hovered`, so it never fights the press color),
 * `data-pressed:bg-primary-pressed`, `focus-visible:ring-focus-halo`, and the dim-only state axes
 * `data-disabled:opacity-disabled` / `aria-busy:opacity-loading`. The recipe computes no color: no
 * `color-mix`, no alpha modifier (`bg-x/50`), no magic opacity, so a preset that redefines a shade
 * changes the painted result predictably (the recipe-purity rule — enforced by `pnpm check:recipe-purity`).
 * Interaction *triggers* are still Tailwind's own `hover:`/`focus-visible:` and hope's `data-pressed`/
 * `data-disabled`/`aria-busy` variants.
 */

import type { ButtonColorScheme, ButtonSize, ButtonVariant } from "@hope-ui/theming";
// The Button recipe's variant vocabulary is owned by `@hope-ui/theming` (the contract); this theme
// implements it. `hopeRecipes` (in `./index`) checks the finished recipe against `RecipeRegistry`.
import { tv } from "@hope-ui/theming";

/*
 * Per-color, per-variant fills — literal so Tailwind's `@source` scan emits them. Every
 * (role × variant × state) is its own finished token; nothing is computed and nothing is borrowed
 * from a sibling variant.
 *  - solid   : `bg-{role}` + `text-on-{role}`, hovered/pressed → `bg-{role}-hovered`/`-pressed`.
 *  - inverted: the swap of solid on its own dedicated tokens — `bg-{role}-inverted` +
 *              `text-on-{role}-inverted`, hovered/pressed → `bg-{role}-inverted-hovered`/`-pressed`.
 *              For solid/colored surfaces; the hope defaults reproduce the on-color/role swap but as
 *              independent, tunable knobs (no borrowing of solid's `on-{role}`/`{role}`).
 *  - soft    : `bg-{role}-soft` + `text-{role}-emphasis`, hovered/pressed → `bg-{role}-soft-hovered`/`-pressed`.
 *  - outline : transparent bg + `text-{role}-emphasis` + the soft `border-{role}-subtle-line` tint
 *              (neutral uses `border-neutral-subtle-line`); hovered/pressed wash →
 *              `bg-{role}-outline-hovered`/`-pressed`.
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
    solid:
      "bg-primary text-on-primary hover:not-data-pressed:bg-primary-hovered data-pressed:bg-primary-pressed",
    inverted:
      "bg-primary-inverted text-on-primary-inverted hover:not-data-pressed:bg-primary-inverted-hovered data-pressed:bg-primary-inverted-pressed",
    soft: "bg-primary-soft text-primary-emphasis hover:not-data-pressed:bg-primary-soft-hovered data-pressed:bg-primary-soft-pressed",
    outline:
      "text-primary-emphasis border-primary-subtle-line hover:not-data-pressed:bg-primary-outline-hovered data-pressed:bg-primary-outline-pressed",
    ghost:
      "text-primary-emphasis hover:not-data-pressed:bg-primary-ghost-hovered data-pressed:bg-primary-ghost-pressed",
    link: "text-primary-emphasis hover:not-data-pressed:text-primary-link-hovered data-pressed:text-primary-link-pressed hover:underline underline-offset-4",
  },
  neutral: {
    solid:
      "bg-neutral text-on-neutral hover:not-data-pressed:bg-neutral-hovered data-pressed:bg-neutral-pressed",
    inverted:
      "bg-neutral-inverted text-on-neutral-inverted hover:not-data-pressed:bg-neutral-inverted-hovered data-pressed:bg-neutral-inverted-pressed",
    soft: "bg-neutral-soft text-neutral-emphasis hover:not-data-pressed:bg-neutral-soft-hovered data-pressed:bg-neutral-soft-pressed",
    outline:
      "text-neutral-emphasis border-neutral-subtle-line hover:not-data-pressed:bg-neutral-outline-hovered data-pressed:bg-neutral-outline-pressed",
    ghost:
      "text-neutral-emphasis hover:not-data-pressed:bg-neutral-ghost-hovered data-pressed:bg-neutral-ghost-pressed",
    link: "text-neutral-emphasis hover:not-data-pressed:text-neutral-link-hovered data-pressed:text-neutral-link-pressed hover:underline underline-offset-4",
  },
  success: {
    solid:
      "bg-success text-on-success hover:not-data-pressed:bg-success-hovered data-pressed:bg-success-pressed",
    inverted:
      "bg-success-inverted text-on-success-inverted hover:not-data-pressed:bg-success-inverted-hovered data-pressed:bg-success-inverted-pressed",
    soft: "bg-success-soft text-success-emphasis hover:not-data-pressed:bg-success-soft-hovered data-pressed:bg-success-soft-pressed",
    outline:
      "text-success-emphasis border-success-subtle-line hover:not-data-pressed:bg-success-outline-hovered data-pressed:bg-success-outline-pressed",
    ghost:
      "text-success-emphasis hover:not-data-pressed:bg-success-ghost-hovered data-pressed:bg-success-ghost-pressed",
    link: "text-success-emphasis hover:not-data-pressed:text-success-link-hovered data-pressed:text-success-link-pressed hover:underline underline-offset-4",
  },
  warning: {
    solid:
      "bg-warning text-on-warning hover:not-data-pressed:bg-warning-hovered data-pressed:bg-warning-pressed",
    inverted:
      "bg-warning-inverted text-on-warning-inverted hover:not-data-pressed:bg-warning-inverted-hovered data-pressed:bg-warning-inverted-pressed",
    soft: "bg-warning-soft text-warning-emphasis hover:not-data-pressed:bg-warning-soft-hovered data-pressed:bg-warning-soft-pressed",
    outline:
      "text-warning-emphasis border-warning-subtle-line hover:not-data-pressed:bg-warning-outline-hovered data-pressed:bg-warning-outline-pressed",
    ghost:
      "text-warning-emphasis hover:not-data-pressed:bg-warning-ghost-hovered data-pressed:bg-warning-ghost-pressed",
    link: "text-warning-emphasis hover:not-data-pressed:text-warning-link-hovered data-pressed:text-warning-link-pressed hover:underline underline-offset-4",
  },
  danger: {
    solid:
      "bg-danger text-on-danger hover:not-data-pressed:bg-danger-hovered data-pressed:bg-danger-pressed",
    inverted:
      "bg-danger-inverted text-on-danger-inverted hover:not-data-pressed:bg-danger-inverted-hovered data-pressed:bg-danger-inverted-pressed",
    soft: "bg-danger-soft text-danger-emphasis hover:not-data-pressed:bg-danger-soft-hovered data-pressed:bg-danger-soft-pressed",
    outline:
      "text-danger-emphasis border-danger-subtle-line hover:not-data-pressed:bg-danger-outline-hovered data-pressed:bg-danger-outline-pressed",
    ghost:
      "text-danger-emphasis hover:not-data-pressed:bg-danger-ghost-hovered data-pressed:bg-danger-ghost-pressed",
    link: "text-danger-emphasis hover:not-data-pressed:text-danger-link-hovered data-pressed:text-danger-link-pressed hover:underline underline-offset-4",
  },
  info: {
    solid:
      "bg-info text-on-info hover:not-data-pressed:bg-info-hovered data-pressed:bg-info-pressed",
    inverted:
      "bg-info-inverted text-on-info-inverted hover:not-data-pressed:bg-info-inverted-hovered data-pressed:bg-info-inverted-pressed",
    soft: "bg-info-soft text-info-emphasis hover:not-data-pressed:bg-info-soft-hovered data-pressed:bg-info-soft-pressed",
    outline:
      "text-info-emphasis border-info-subtle-line hover:not-data-pressed:bg-info-outline-hovered data-pressed:bg-info-outline-pressed",
    ghost:
      "text-info-emphasis hover:not-data-pressed:bg-info-ghost-hovered data-pressed:bg-info-ghost-pressed",
    link: "text-info-emphasis hover:not-data-pressed:text-info-link-hovered data-pressed:text-info-link-pressed hover:underline underline-offset-4",
  },
};

const COLOR_VARIANTS: Array<Exclude<ButtonVariant, "default">> = [
  "solid",
  "inverted",
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

/*
 * ── Horizontal padding lives in compoundVariants, never on the `size` base ──────────────────────
 * So no button ever carries two competing `px-*` classes for tailwind-merge to resolve, and nothing
 * depends on variant declaration order: a text button gets its `px-*` from the (size × iconOnly:false)
 * compound; an icon-only button gets no `px-*` at all (it's square and centered). The `:has()`-scoped
 * decorator overrides (the `has-...:ps` and `pe` inline-padding utilities) stay on the `size` base —
 * a different modifier, so they never twMerge against these. `link` is excluded from these compounds: it
 * owns `px-0.5` in the `variant` map, so a link button matches no padding compound and there is never
 * a px-vs-px conflict. Every value is a literal (Tailwind's `@source` scan needs literal candidates).
 */
const TEXT_PADDING_VARIANTS: Array<Exclude<ButtonVariant, "link">> = [
  "default",
  "solid",
  "inverted",
  "soft",
  "outline",
  "ghost",
];
const SIZE_PADDING: Record<ButtonSize, string> = {
  xs: "px-2",
  sm: "px-2.5",
  md: "px-3",
  lg: "px-3.5",
  xl: "px-4",
};
// The icon-only button's icon lands in the `label` slot (as `children`), which has no
// `[&_svg]:size-*` otherwise — size it here, per button size. Full literals so they're scannable.
const ICON_ONLY_LABEL_SVG: Record<ButtonSize, string> = {
  xs: "[&_svg]:size-4",
  sm: "[&_svg]:size-4.5",
  md: "[&_svg]:size-5",
  lg: "[&_svg]:size-5.5",
  xl: "[&_svg]:size-6",
};
const BUTTON_SIZES: ButtonSize[] = ["xs", "sm", "md", "lg", "xl"];

const paddingCompoundVariants = [
  // Text buttons: per-size horizontal padding, for every non-link chrome variant.
  ...BUTTON_SIZES.map((size) => ({
    iconOnly: false,
    variant: TEXT_PADDING_VARIANTS,
    size,
    class: { root: SIZE_PADDING[size] },
  })),
  // Icon-only buttons: `aspect-square` + the size's fixed `h-*` yields a square (width computes from
  // height under border-box); no `px-*`, so the icon centers via the root's `justify-center`.
  ...BUTTON_SIZES.map((size) => ({
    iconOnly: true,
    size,
    class: { root: "aspect-square", label: ICON_ONLY_LABEL_SVG[size] },
  })),
];

/**
 * hope's Button slot recipe — used as-is by the component (`recipe(props).root()`), no adapter.
 * `hopeRecipes` (in `./index`) checks it against the `button` contract in `@hope-ui/theming`.
 */
export const buttonRecipe = tv({
  slots: {
    // `bg-clip-padding` keeps the reserved 1px transparent border from painting the fill under it, so
    // solid↔outline never shifts by a pixel.
    root: [
      "relative inline-flex items-center justify-center whitespace-nowrap font-medium leading-none",
      "select-none border border-transparent bg-clip-padding outline-none",
      // Transition `translate`, NOT `transform`: Tailwind v4 compiles `translate-y-px` (the pressed
      // sink) to the standalone `translate` CSS property, so `transition-transform` would never animate
      // the sink — it would snap. Colors/border/shadow round out the list.
      "transition-[color,background-color,border-color,box-shadow,translate] duration-150 ease-out",
      // Focus halo is the finished `focus-halo` token (a preset-authored translucent color), not an
      // alpha modifier over `focus` — recipes never compute (recipe-purity rule).
      "focus-visible:border-focus focus-visible:ring-3 focus-visible:ring-focus-halo",
      "data-pressed:translate-y-px",
      // Two dim-only state axes, styled identically bar the opacity token. `createButton` emits
      // `data-disabled` for both native (`:disabled`) and non-native (`aria-disabled`) buttons; the
      // component sets `aria-busy` while loading. Neither swaps color — each just neutralises chrome
      // (no cursor/pointer/shadow) and dims via a finished opacity token: `opacity-disabled` for
      // disabled, `opacity-loading` for loading. Both are preset-owned knobs (hope dims disabled to
      // 0.4 and leaves loading at full opacity — the loader arc conveys it), never a magic `opacity-90`.
      "data-disabled:cursor-not-allowed data-disabled:pointer-events-none data-disabled:shadow-none data-disabled:opacity-disabled",
      "aria-busy:cursor-progress aria-busy:pointer-events-none aria-busy:shadow-none aria-busy:opacity-loading",
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
    // fixed height. Heights step an even +4 (24/28/32/36/40); radius tracks size off the shadcn scale —
    // xs/sm cap at a `min()` of `--radius-md` so they never over-round, md+ use `rounded-lg`.
    size: {
      xs: {
        root: [
          "h-6 gap-1 text-xs rounded-[min(var(--radius-md),10px)]",
          "has-data-[slot=button-start-decorator]:ps-1.5 has-data-[slot=button-end-decorator]:pe-1.5",
        ],
        startDecorator: "[&_svg]:size-4",
        endDecorator: "[&_svg]:size-4",
        loader: "[&_svg]:size-4",
      },
      sm: {
        root: [
          "h-7 gap-1 text-[0.8125rem] rounded-[min(var(--radius-md),12px)]",
          "has-data-[slot=button-start-decorator]:ps-2 has-data-[slot=button-end-decorator]:pe-2",
        ],
        startDecorator: "[&_svg]:size-4.5",
        endDecorator: "[&_svg]:size-4.5",
        loader: "[&_svg]:size-4.5",
      },
      md: {
        root: [
          "h-8 gap-1.5 text-sm rounded-lg",
          "has-data-[slot=button-start-decorator]:ps-2.5 has-data-[slot=button-end-decorator]:pe-2.5",
        ],
        startDecorator: "[&_svg]:size-5",
        endDecorator: "[&_svg]:size-5",
        loader: "[&_svg]:size-5",
      },
      lg: {
        root: [
          "h-9 gap-1.5 text-[0.9375rem] rounded-lg",
          "has-data-[slot=button-start-decorator]:ps-3 has-data-[slot=button-end-decorator]:pe-3",
        ],
        startDecorator: "[&_svg]:size-5.5",
        endDecorator: "[&_svg]:size-5.5",
        loader: "[&_svg]:size-5.5",
      },
      xl: {
        root: [
          "h-10 gap-2 text-base rounded-lg",
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
    // Typed axis with no classes of its own — the square metrics (and the removal of horizontal
    // padding) live entirely in `paddingCompoundVariants` above, keyed by (size × iconOnly), so
    // nothing relies on tailwind-merge out-ordering a base `px-*`.
    iconOnly: {
      true: {},
      false: {},
    },
    variant: {
      // shadcn's outline button: surface fill, subtle gray border, faint shadow — color-independent
      // (ignores `color`); rest → hover → press walk the `surface-raised` elevation ladder. (Slot
      // recipes need `{ root }` objects, not bare strings — a bare string applies to no slot.)
      default: {
        root: "bg-surface-raised text-foreground border-subtle shadow-xs hover:not-data-pressed:bg-surface-raised-hovered data-pressed:bg-surface-raised-pressed",
      },
      solid: { root: "" },
      // Color (fill + on-content + wash) lives per-role in `COLOR_CLASSES.inverted`, like `solid`.
      inverted: { root: "" },
      soft: { root: "" },
      outline: { root: "bg-transparent" },
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
  compoundVariants: [...colorCompoundVariants, ...paddingCompoundVariants],
  defaultVariants: {
    variant: "default",
    colorScheme: "primary",
    size: "md",
    fullWidth: false,
    iconOnly: false,
  },
});
