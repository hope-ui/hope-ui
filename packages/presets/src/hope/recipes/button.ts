/*
 * @hope-ui/presets/hope — Button slot recipe.
 *
 * A *slot recipe*: `tv` (tailwind-variants) maps variant props to one class string per named part
 * ("slot"), and `@hope-ui/components`' Button reads it through `useRecipe("button")`. It encodes
 * hope's "vega on your tokens" look: shadcn/ui's vega button metrics (reserved 1px border, 1px press
 * nudge, 3px translucent focus ring, uniform 8px radius) painted through hope's `--hope-*` tokens.
 *
 * ── Why every class is a literal string ─────────────────────────────────────────────────────────
 * The consumer's Tailwind build only emits utilities it can find by scanning this file (`@source
 * "./recipes"`), and a scanner sees *literal* candidates only. So the per-color utilities cannot be
 * built with `bg-${role}` template strings — they are written out in `COLOR_CLASSES` and assembled
 * into `compoundVariants`, entries that apply only when several variants match at once.
 *
 * ── Recipe purity ───────────────────────────────────────────────────────────────────────────────
 * `bg-primary` resolves `var(--color-primary)` → `var(--hope-primary)` (via `_base/_theme-map.css`).
 * Every interaction state is a *finished* token too, so this recipe computes no color — no
 * `color-mix`, no alpha modifier (`bg-x/50`), no magic opacity — and a preset redefining a shade
 * changes the painted result predictably. Derived colors (the focus halo) are authored as tokens in
 * `theme.css` instead. Enforced by `pnpm check:recipe-purity`. Interaction *triggers* stay Tailwind's
 * own `hover:`/`focus-visible:` plus hope's `data-pressed`/`data-disabled`/`aria-busy` variants.
 */

import type { ButtonColorScheme, ButtonSize, ButtonVariant } from "@hope-ui/theming";
import { tv } from "@hope-ui/theming";

/*
 * Every (role × variant × state) is its own finished token; nothing is computed and nothing is
 * borrowed from a sibling variant — `inverted` gets its own `{role}-inverted*` ladder rather than
 * reusing solid's `on-{role}`/`{role}`. The soft/outline/ghost/link label is `{role}-emphasis`, the
 * role's legible *content* color, so neutral & warning read correctly in both themes rather than
 * looking disabled.
 *
 * The filled variants (solid/inverted/soft) carry a border MATCHING their fill and tracking it across
 * states, so the base's reserved 1px edge continues the fill instead of showing a transparent gap to
 * the page background — and the base's `border-color` transition animates it in step. `ghost`/`link`
 * stay borderless; `focus-visible:border-focus` still wins on focus. Each hover wash is guarded
 * against the pressed state (`hover:not-data-pressed:`) so the two never fight.
 */
const COLOR_CLASSES: Record<
  ButtonColorScheme,
  Record<Exclude<ButtonVariant, "default">, string>
> = {
  primary: {
    solid:
      "bg-primary text-on-primary border-primary hover:not-data-pressed:bg-primary-hovered hover:not-data-pressed:border-primary-hovered data-pressed:bg-primary-pressed data-pressed:border-primary-pressed",
    inverted:
      "bg-primary-inverted text-on-primary-inverted border-primary-inverted hover:not-data-pressed:bg-primary-inverted-hovered hover:not-data-pressed:border-primary-inverted-hovered data-pressed:bg-primary-inverted-pressed data-pressed:border-primary-inverted-pressed",
    soft: "bg-primary-soft text-primary-emphasis border-primary-soft hover:not-data-pressed:bg-primary-soft-hovered hover:not-data-pressed:border-primary-soft-hovered data-pressed:bg-primary-soft-pressed data-pressed:border-primary-soft-pressed",
    outline:
      "text-primary-emphasis border-primary-subtle-line hover:not-data-pressed:bg-primary-outline-hovered data-pressed:bg-primary-outline-pressed",
    ghost:
      "text-primary-emphasis hover:not-data-pressed:bg-primary-ghost-hovered data-pressed:bg-primary-ghost-pressed",
    link: "text-primary-emphasis hover:not-data-pressed:text-primary-link-hovered data-pressed:text-primary-link-pressed hover:underline underline-offset-4",
  },
  neutral: {
    solid:
      "bg-neutral text-on-neutral border-neutral hover:not-data-pressed:bg-neutral-hovered hover:not-data-pressed:border-neutral-hovered data-pressed:bg-neutral-pressed data-pressed:border-neutral-pressed",
    inverted:
      "bg-neutral-inverted text-on-neutral-inverted border-neutral-inverted hover:not-data-pressed:bg-neutral-inverted-hovered hover:not-data-pressed:border-neutral-inverted-hovered data-pressed:bg-neutral-inverted-pressed data-pressed:border-neutral-inverted-pressed",
    soft: "bg-neutral-soft text-neutral-emphasis border-neutral-soft hover:not-data-pressed:bg-neutral-soft-hovered hover:not-data-pressed:border-neutral-soft-hovered data-pressed:bg-neutral-soft-pressed data-pressed:border-neutral-soft-pressed",
    outline:
      "text-neutral-emphasis border-neutral-subtle-line hover:not-data-pressed:bg-neutral-outline-hovered data-pressed:bg-neutral-outline-pressed",
    ghost:
      "text-neutral-emphasis hover:not-data-pressed:bg-neutral-ghost-hovered data-pressed:bg-neutral-ghost-pressed",
    link: "text-neutral-emphasis hover:not-data-pressed:text-neutral-link-hovered data-pressed:text-neutral-link-pressed hover:underline underline-offset-4",
  },
  success: {
    solid:
      "bg-success text-on-success border-success hover:not-data-pressed:bg-success-hovered hover:not-data-pressed:border-success-hovered data-pressed:bg-success-pressed data-pressed:border-success-pressed",
    inverted:
      "bg-success-inverted text-on-success-inverted border-success-inverted hover:not-data-pressed:bg-success-inverted-hovered hover:not-data-pressed:border-success-inverted-hovered data-pressed:bg-success-inverted-pressed data-pressed:border-success-inverted-pressed",
    soft: "bg-success-soft text-success-emphasis border-success-soft hover:not-data-pressed:bg-success-soft-hovered hover:not-data-pressed:border-success-soft-hovered data-pressed:bg-success-soft-pressed data-pressed:border-success-soft-pressed",
    outline:
      "text-success-emphasis border-success-subtle-line hover:not-data-pressed:bg-success-outline-hovered data-pressed:bg-success-outline-pressed",
    ghost:
      "text-success-emphasis hover:not-data-pressed:bg-success-ghost-hovered data-pressed:bg-success-ghost-pressed",
    link: "text-success-emphasis hover:not-data-pressed:text-success-link-hovered data-pressed:text-success-link-pressed hover:underline underline-offset-4",
  },
  warning: {
    solid:
      "bg-warning text-on-warning border-warning hover:not-data-pressed:bg-warning-hovered hover:not-data-pressed:border-warning-hovered data-pressed:bg-warning-pressed data-pressed:border-warning-pressed",
    inverted:
      "bg-warning-inverted text-on-warning-inverted border-warning-inverted hover:not-data-pressed:bg-warning-inverted-hovered hover:not-data-pressed:border-warning-inverted-hovered data-pressed:bg-warning-inverted-pressed data-pressed:border-warning-inverted-pressed",
    soft: "bg-warning-soft text-warning-emphasis border-warning-soft hover:not-data-pressed:bg-warning-soft-hovered hover:not-data-pressed:border-warning-soft-hovered data-pressed:bg-warning-soft-pressed data-pressed:border-warning-soft-pressed",
    outline:
      "text-warning-emphasis border-warning-subtle-line hover:not-data-pressed:bg-warning-outline-hovered data-pressed:bg-warning-outline-pressed",
    ghost:
      "text-warning-emphasis hover:not-data-pressed:bg-warning-ghost-hovered data-pressed:bg-warning-ghost-pressed",
    link: "text-warning-emphasis hover:not-data-pressed:text-warning-link-hovered data-pressed:text-warning-link-pressed hover:underline underline-offset-4",
  },
  danger: {
    solid:
      "bg-danger text-on-danger border-danger hover:not-data-pressed:bg-danger-hovered hover:not-data-pressed:border-danger-hovered data-pressed:bg-danger-pressed data-pressed:border-danger-pressed",
    inverted:
      "bg-danger-inverted text-on-danger-inverted border-danger-inverted hover:not-data-pressed:bg-danger-inverted-hovered hover:not-data-pressed:border-danger-inverted-hovered data-pressed:bg-danger-inverted-pressed data-pressed:border-danger-inverted-pressed",
    soft: "bg-danger-soft text-danger-emphasis border-danger-soft hover:not-data-pressed:bg-danger-soft-hovered hover:not-data-pressed:border-danger-soft-hovered data-pressed:bg-danger-soft-pressed data-pressed:border-danger-soft-pressed",
    outline:
      "text-danger-emphasis border-danger-subtle-line hover:not-data-pressed:bg-danger-outline-hovered data-pressed:bg-danger-outline-pressed",
    ghost:
      "text-danger-emphasis hover:not-data-pressed:bg-danger-ghost-hovered data-pressed:bg-danger-ghost-pressed",
    link: "text-danger-emphasis hover:not-data-pressed:text-danger-link-hovered data-pressed:text-danger-link-pressed hover:underline underline-offset-4",
  },
  info: {
    solid:
      "bg-info text-on-info border-info hover:not-data-pressed:bg-info-hovered hover:not-data-pressed:border-info-hovered data-pressed:bg-info-pressed data-pressed:border-info-pressed",
    inverted:
      "bg-info-inverted text-on-info-inverted border-info-inverted hover:not-data-pressed:bg-info-inverted-hovered hover:not-data-pressed:border-info-inverted-hovered data-pressed:bg-info-inverted-pressed data-pressed:border-info-inverted-pressed",
    soft: "bg-info-soft text-info-emphasis border-info-soft hover:not-data-pressed:bg-info-soft-hovered hover:not-data-pressed:border-info-soft-hovered data-pressed:bg-info-soft-pressed data-pressed:border-info-soft-pressed",
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
 * depends on variant declaration order: a text button takes its `px-*` from the (size × iconOnly:
 * false) compound, and an icon-only button gets none at all (it is square and centered). `link` is
 * excluded from these compounds because it owns `px-0.5` in the `variant` map, so it matches no
 * padding compound and there is never a px-vs-px conflict. The `:has()`-scoped decorator overrides
 * stay on the `size` base — a different modifier, so they never twMerge against these.
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
// The icon-only button's icon lands in the `label` slot (as `children`), which carries no
// `[&_svg]:size-*` otherwise.
const ICON_ONLY_LABEL_SVG: Record<ButtonSize, string> = {
  xs: "[&_svg]:size-4",
  sm: "[&_svg]:size-4.5",
  md: "[&_svg]:size-5",
  lg: "[&_svg]:size-5.5",
  xl: "[&_svg]:size-6",
};
const BUTTON_SIZES: ButtonSize[] = ["xs", "sm", "md", "lg", "xl"];

const paddingCompoundVariants = [
  ...BUTTON_SIZES.map((size) => ({
    iconOnly: false,
    variant: TEXT_PADDING_VARIANTS,
    size,
    class: { root: SIZE_PADDING[size] },
  })),
  // `aspect-square` + the size's fixed `h-*` yields a square (width computes from height under
  // border-box); no `px-*`, so the icon centers via the root's `justify-center`.
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
    // The bare `border` reserves a 1px border WIDTH so solid↔outline never shifts by a pixel; every
    // variant supplies the COLOR (see `COLOR_CLASSES`), so the reserved edge is a fill-matched line
    // rather than a transparent gap to the page background — no `bg-clip-padding` needed.
    root: [
      "relative inline-flex items-center justify-center whitespace-nowrap font-medium leading-none",
      "select-none border outline-none",
      // Transition `translate`, NOT `transform`: Tailwind v4 compiles `translate-y-px` (the pressed
      // sink) to the standalone `translate` CSS property, so `transition-transform` would never
      // animate the sink — it would snap.
      "transition-[color,background-color,border-color,box-shadow,translate] duration-150 ease-out",
      // `focus-halo` is a finished preset-authored translucent token, not an alpha modifier over
      // `focus` — recipes never compute a color (recipe purity).
      "focus-visible:border-focus focus-visible:ring-3 focus-visible:ring-focus-halo",
      "data-pressed:translate-y-px",
      // Two dim-only state axes, identical bar the opacity token. `createButton` emits `data-disabled`
      // for both native (`:disabled`) and non-native (`aria-disabled`) buttons; the component sets
      // `aria-busy` while loading. Neither swaps color — each neutralises chrome and dims through a
      // finished opacity token, so both stay preset-tunable knobs rather than a magic `opacity-90`.
      "data-disabled:cursor-not-allowed data-disabled:pointer-events-none data-disabled:shadow-none data-disabled:opacity-disabled",
      "aria-busy:cursor-progress aria-busy:pointer-events-none aria-busy:shadow-none aria-busy:opacity-loading",
    ],
    label: "inline-flex items-center",
    startDecorator: "inline-flex shrink-0 items-center justify-center",
    endDecorator: "inline-flex shrink-0 items-center justify-center",
    // Loader styling lives here rather than in the component's JSX so Tailwind's `@source` scan can
    // see the utilities. The default loader is one Lucide arc, targeted as the `svg` inside this slot.
    loader: [
      "pointer-events-none inline-flex items-center justify-center",
      "[&_svg]:origin-center [&_svg]:animate-spin",
      "motion-reduce:[&_svg]:animate-none",
    ],
  },
  variants: {
    // Declared before `variant` so `link`'s `h-auto`/`px-0.5` win the tailwind-merge conflict over the
    // fixed height. Heights step an even +4 (24/28/32/36/40); xs/sm cap their radius at a `min()` of
    // `--radius-md` so they never over-round.
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
    // A typed axis with no classes of its own — the square metrics (and the *removal* of horizontal
    // padding) live entirely in `paddingCompoundVariants`, so nothing relies on tailwind-merge
    // out-ordering a base `px-*`.
    iconOnly: {
      true: {},
      false: {},
    },
    variant: {
      // shadcn's outline button: color-independent neutral chrome, walking the `surface-raised`
      // elevation ladder from rest → hover → press. (A slot recipe needs `{ root }` objects here, not
      // bare strings — a bare string applies to no slot at all.)
      default: {
        root: "bg-surface-raised text-foreground border-subtle shadow-xs hover:not-data-pressed:bg-surface-raised-hovered data-pressed:bg-surface-raised-pressed",
      },
      solid: { root: "" },
      inverted: { root: "" },
      soft: { root: "" },
      outline: { root: "bg-transparent" },
      // `border-transparent` is explicit because the base carries no border color, and a bare `border`
      // would otherwise paint in `currentColor`.
      ghost: { root: "bg-transparent border-transparent" },
      // Layout only; the color ladder and underline live per-role in `COLOR_CLASSES.link`.
      link: {
        root: "h-auto bg-transparent border-transparent px-0.5 py-0.5",
      },
    },
    // No base classes of its own — every fill is variant×colorScheme-specific and lives in
    // `compoundVariants`. Declared here with empty slots so it is a real, typed variant those entries
    // can match on, rather than an untyped prop.
    colorScheme: {
      primary: {},
      neutral: {},
      success: {},
      warning: {},
      danger: {},
      info: {},
    },
    // Layout only — the component mounts/unmounts the loader slot via `<Show>`, so there is no
    // "hidden"/"none" member here; it passes `loaderPlacement: undefined` when not loading.
    loaderPlacement: {
      // Overlay: label + decorators keep their width but go invisible, so the button never resizes.
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
