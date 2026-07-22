/*
 * @hope-ui/presets/hope — Listbox slot recipe.
 *
 * The `tailwind-variants` slot recipe the `@hope-ui/components` `Listbox` reads through
 * `useRecipe("listbox")`. Listbox is **standalone-first**: it renders as a plain, in-flow list of
 * options — a settings list, a form control, a picker embedded directly in a page — so the default
 * carries **no elevated / popup chrome** (no surface background, border, shadow, rounded corners, or
 * panel padding). A consumer that floats a listbox in a popover — or the future `Select`/`Combobox`
 * that wraps this in a `createFloating` layer — supplies that elevated-surface look itself (via a
 * `class` override or its own content recipe); it is deliberately not baked into the standalone
 * default. Listbox is a **neutral collection surface** (no color axis) — the only accents are the
 * transient highlight and the persistent selection, both driven by tokens, not a variant.
 *
 * The recipe still styles everything a standalone list needs: the row highlight + selection glyph,
 * the group label, and the section separator. What it omits is only the floating-panel container.
 *
 * ── Highlight is `data-active:` ONLY — never `hover:` / bare `:focus` ────────────────────────────
 * Keyboard navigation and the pointer share a single active index in the primitive
 * (`createListFocus`), so exactly one row carries `data-active` at any time — written by both arrows
 * and pointer motion. The row must therefore be highlighted by the registered `data-active:` custom
 * variant alone: a `hover:` / bare `:focus` background would let the cursor's physical position paint
 * a *second* highlight the moment it lagged the active index by a frame. `data-active:bg-active` +
 * `data-active:text-on-active` are the finished collection-state tokens (shadcn uses `focus:bg-accent`
 * / `data-highlighted` for the same reason).
 *
 * ── Recipe purity ───────────────────────────────────────────────────────────────────────────────
 * Every color is a finished `--hope-*` token: `bg-active`/`text-on-active` (the highlight),
 * `bg-subtle` (the separator hairline), `text-foreground`/`text-foreground-muted` (content + muted
 * label), `opacity-disabled` (the disabled dim — an opacity *token*, not a magic number). The recipe
 * computes no color — no `color-mix`, no alpha modifier, no magic opacity. `[&_svg]:size-4` is a raw
 * Tailwind utility (unpoliced). Every class is a literal string so the consumer's `@source` scan can
 * see it.
 *
 * ── Single axis: `size` (density) ───────────────────────────────────────────────────────────────
 * Every density value (the row's text / vertical padding / leading padding / gap, and the panel's
 * min width) lives *only* in the `size` variants — `sm`, `md`, and `lg` each carry their full,
 * self-contained set. The base slots carry **no** density class, so a size is applied additively and
 * nothing depends on tailwind-merge stripping a competing base class. The trailing `pr-8` (indicator
 * clearance) and `right-2` indicator placement are size-independent chrome and stay in the base — the
 * glyph box does not change — so only density moves.
 */

// The Listbox recipe's variant vocabulary is owned by `@hope-ui/theming` (the contract); this theme
// implements it. `hopeRecipes` (in `./index`) checks the finished recipe against `RecipeRegistry`.
import { tv } from "@hope-ui/theming";

/**
 * hope's Listbox slot recipe — used as-is by the component (`recipe(props).item()`), no adapter.
 * `hopeRecipes` (in `./index`) checks it against the `listbox` contract in `@hope-ui/theming`.
 */
export const listboxRecipe = tv({
  slots: {
    // The `role="listbox"` element and (in virtual mode) the scroll element. Deliberately NO popup
    // chrome (no background, border, shadow, rounded corners, or padding) — a standalone list sits in
    // the page flow; a floating consumer layers the surface itself. `overflow-y-auto` makes it the
    // scroll container (structural — the virtual mode depends on it; it only scrolls once a consumer
    // caps the height). `outline-none` because focus is indicated by the active row's highlight (in
    // activedescendant mode the container holds focus), not a ring around the whole list. The
    // `min-w-*` floor is a density value and lives per `size`, not here.
    root: "text-foreground overflow-y-auto outline-none",
    // An `role="option"` row. `relative` anchors the absolute `itemIndicator`; `pr-8` reserves the
    // trailing glyph gutter. Highlight is `data-active:` ONLY (see the header note) — no `hover:` /
    // bare `:focus` background. `data-disabled:` dims and drops pointer events. `[&_svg]:size-4`
    // sizes a leading icon a consumer drops in. Text / vertical + leading padding / gap are density
    // values and live per `size`, not here.
    item: "relative flex cursor-default items-center rounded-md pr-8 outline-none select-none data-active:bg-active data-active:text-on-active data-disabled:pointer-events-none data-disabled:opacity-disabled [&_svg]:size-4",
    // The chosen-row check glyph's placement — pinned in the reserved `pr-8` gutter. Rendered by the
    // component only when the row is selected; its color inherits the row's text color.
    itemIndicator: "absolute right-2 flex items-center justify-center [&_svg]:size-4",
    // A `role="group"` section wrapper — a little vertical rhythm around each labelled section; no
    // horizontal inset, so grouped rows stay aligned with ungrouped ones.
    group: "not-last:pb-1",
    // The group's label — small, muted, non-interactive.
    groupLabel: "px-1.5 py-1 text-xs text-foreground-muted",
    // A hairline divider between sections — full width of its container; it never takes the pointer.
    separator: "my-1 h-px bg-subtle pointer-events-none",
  },
  variants: {
    // `size` owns the full density set — row text / vertical + leading padding / gap, and the panel's
    // min width. Each size is self-contained (the base carries no competing density class), so a size
    // applies additively and nothing relies on tailwind-merge resolution. The `pr-8` indicator gutter
    // and the `right-2` glyph placement are size-independent chrome (in the base) — only density moves.
    size: {
      sm: {
        root: "min-w-32",
        item: "gap-1 py-0.5 pl-1 text-xs",
      },
      md: {
        root: "min-w-36",
        item: "gap-1.5 py-1 pl-1.5 text-sm",
      },
      lg: {
        root: "min-w-40",
        item: "gap-2 py-1.5 pl-2 text-base",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
