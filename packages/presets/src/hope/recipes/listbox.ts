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
 * computes no color — no `color-mix`, no alpha modifier, no magic opacity. `[&_svg]:size-*` is a raw
 * Tailwind utility (unpoliced). Every class is a literal string so the consumer's `@source` scan can
 * see it.
 *
 * ── RTL ─────────────────────────────────────────────────────────────────────────────────────────
 * Every inset here is logical (`pe-8`, `end-1`, `ps-*`), never physical (`pr-8`, `right-1`, `pl-*`):
 * the indicator gutter is reserved on the side the text *ends*, so it mirrors with the locale
 * instead of leaving the glyph on top of the label in `rtl`. Enforced by `pnpm check:rtl-safety`.
 *
 * ── Single axis: `size` (density) ───────────────────────────────────────────────────────────────
 * Every density value lives *only* in the `size` variants — `sm`, `md`, and `lg` each carry their
 * full, self-contained set: the row's text / leading padding / gap / corner radius / glyph box, the
 * indicator's inset and glyph box, and the panel's min width. The base slots carry **no** density
 * class, so a size is applied additively and nothing depends on tailwind-merge stripping a competing
 * base class. Only the trailing `pe-8` (indicator clearance) is size-independent chrome and stays in
 * the base: the gutter is wide enough for the largest glyph at every size, so a row's text never
 * shifts when the size changes for a reason other than density.
 *
 * The row's *vertical* padding is deliberately constant (`py-1.5`): the text size already drives the
 * row's height, and a second, size-varying term made `sm` rows read as cramped next to their `sm`
 * control. Density moves through the type scale and the glyph box, not through the block padding.
 *
 * These values mirror `select.ts` class for class — same rows, so they must look identical. Select
 * is the visual source of truth; a change here without the matching one there is the bug.
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
    // An `role="option"` row. `relative` anchors the absolute `itemIndicator`; `pe-8` reserves the
    // trailing glyph gutter. Highlight is `data-active:` ONLY (see the header note) — no `hover:` /
    // bare `:focus` background. `data-disabled:` dims and drops pointer events. Text / leading
    // padding / gap / radius, and the box a consumer's leading icon gets (`[&_svg]:size-*`), are
    // density values and live per `size`, not here.
    item: "relative flex cursor-default items-center pe-8 outline-none select-none data-active:bg-active data-active:text-on-active data-disabled:pointer-events-none data-disabled:opacity-disabled",
    // The chosen-row check glyph's placement — pinned in the reserved `pe-8` gutter. Rendered by the
    // component only when the row is selected; its color inherits the row's text color. Its inset and
    // glyph box scale with the row, so both live per `size`.
    itemIndicator: "absolute flex items-center justify-center",
    // A `role="group"` section wrapper — a little vertical rhythm around each labelled section; no
    // horizontal inset, so grouped rows stay aligned with ungrouped ones.
    group: "not-last:pb-1",
    // The group's label — small, muted, non-interactive.
    groupLabel: "px-1.5 py-1 text-xs text-foreground-muted",
    // A hairline divider between sections — full width of its container; it never takes the pointer.
    separator: "my-1 h-px bg-subtle pointer-events-none",
  },
  variants: {
    // `size` owns the full density set — row text / leading padding / gap / radius / glyph box, the
    // indicator's inset and glyph box, and the panel's min width. Each size is self-contained (the
    // base carries no competing density class), so a size applies additively and nothing relies on
    // tailwind-merge resolution. Only the `pe-8` indicator gutter is size-independent chrome (in the
    // base). Values mirror `select.ts` exactly — see the header note.
    size: {
      sm: {
        root: "min-w-32",
        item: "text-xs gap-1 py-1.5 ps-1.5 rounded-sm [&_svg]:size-3.5",
        itemIndicator: "end-1 [&_svg]:size-3.5",
      },
      md: {
        root: "min-w-36",
        item: "text-sm gap-1.5 py-1.5 ps-1.5 rounded-md [&_svg]:size-4",
        itemIndicator: "end-1 [&_svg]:size-4",
      },
      lg: {
        root: "min-w-40",
        item: "text-base gap-2 py-1.5 ps-1.5 rounded-md [&_svg]:size-4.5",
        itemIndicator: "end-1 [&_svg]:size-4.5",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
