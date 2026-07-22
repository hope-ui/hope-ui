/*
 * @hope-ui/presets/hope — Calendar slot recipe.
 *
 * The `tailwind-variants` slot recipe the `@hope-ui/components` `Calendar` reads through
 * `useRecipe("calendar")`. It paints the "nova" calendar — a plain, in-flow date picker (navigation
 * header over a month grid) — entirely through hope's semantic `--hope-*` tokens.
 * Calendar is **standalone-first**, like Listbox: the default carries **no elevated / popup chrome**
 * (no surface background, border, shadow, or rounded panel). A consumer that floats it in a popover
 * (a future DatePicker) supplies that surface itself; it is deliberately not baked into the default.
 * Calendar is a **neutral date surface** (no color axis) — the only accents are the selection and the
 * range / tentative-hover bands, all driven by tokens, not a variant.
 *
 * ── Day-cell state is `data-*` ONLY — never a plain `hover:` that outranks it ──────────────────────
 * `createCalendarCell` emits the canonical registered day-state hooks **on the day trigger** (`data-today`,
 * `data-outside-month`, `data-unavailable`, `data-selected`, `data-range-start`/`-middle`/`-end`,
 * `data-highlighted` (the tentative hover-range band), `data-disabled`), each as a zero-specificity
 * `:where(...)` custom variant (see `_base/_variants.css`), so the cell is painted by those variants
 * and **source order** decides the winner — not the cursor's physical position.
 *
 * The hover wash is therefore written `[&:where(:hover)]:bg-surface-raised-hovered`, NOT a bare
 * `hover:`. A bare `hover:` compiles to `.sel:hover` (specificity `0,1,1`), which outranks every
 * `:where([data-*])` fill (`0,1,0`) and would stomp the selection / range / preview under the pointer.
 * Wrapping it as `:where(:hover)` drops it to `0,1,0` — equal rank — so it joins the same source-order
 * cascade and, placed *before* the state fills, loses to any of them. A day with no state fill (a plain
 * selectable day) is the only day the wash paints. Disabled days carry `pointer-events-none`, so
 * `:hover` never matches them.
 *
 * ── State-fill order (later wins the equal-specificity cascade) ────────────────────────────────────
 * `data-today` (a soft tint) first → the tentative `data-highlighted` band → `data-selected` (solid) →
 * `data-range-middle` (light band, so a middle day that also reports `selected` still reads as the
 * band, not the solid fill) → the solid `data-range-start`/`-end` endpoints last (so an endpoint beats
 * the middle). `data-highlighted` before `data-selected` keeps the range **anchor** (selected AND
 * highlighted) painted as the solid pill while the rest of the preview is the light band.
 *
 * Range corners use **logical** radii (`rounded-s`/`rounded-e`) so the band rounds on the leading edge
 * under both LTR and RTL: the start/end pills round their *outer* side and square their *inner* side
 * (`rounded-e-none`/`rounded-s-none`) to sit flush against the band; a single-day range
 * (`[data-range-start][data-range-end]`) re-rounds both sides. `data-highlighted` is `rounded-none` so
 * the tentative preview reads as one continuous band, not separate pills. Continuity holds because the
 * grid is `border-collapse` with `table-fixed` columns, so the day buttons fill their cells flush.
 *
 * `data-unavailable` (the `isDateDisabled` predicate hit) strikes the day through and stays
 * interactive; it is distinct from `data-disabled` (a whole out-of-range period — dimmed +
 * non-interactive), so the two never stack on one day.
 *
 * ── Recipe purity ───────────────────────────────────────────────────────────────────────────────
 * Every color is a finished `--hope-*` token: `bg-primary`/`text-on-primary` (the solid selection),
 * `bg-selected`/`text-on-selected` (the range + tentative band), `bg-active` (today's tint),
 * `bg-surface-raised-hovered` (the day/nav hover wash), `text-foreground`/`-muted`/`-subtle`/
 * `-disabled` (content + muted weekday + outside-month + unavailable text), `border-focus` +
 * `ring-focus-halo` (the roving focus ring + border, reused from Button), `opacity-disabled` (the
 * disabled dim — an opacity *token*, not a magic number). The recipe computes no color — no
 * `color-mix`, no alpha modifier, no magic opacity. The `--cell-size` geometry variable,
 * `w-[calc(var(--cell-size)*7)]`, `ring-3`, and `text-[0.8rem]` are lengths, not colors, so the purity
 * scan leaves them alone. Every class is a literal so the `@source` scan sees it.
 *
 * ── Single axis: `size` (density) + one geometry variable ─────────────────────────────────────────
 * `size` sets `--cell-size` on `root` (the day-cell box: `sm` 2rem, `md` 2.25rem, `lg` 2.5rem), plus
 * the day text size and the navigation-button box + glyph. The `grid` is pinned to
 * `w-[calc(var(--cell-size)*7)]` (the month footprint) with `table-fixed`, and each day button is
 * `h-(--cell-size) w-full` — it fills its column. So the month view is 7 square cells, while the
 * year/decade views (3 columns) distribute the *same* total width into 3 roomy pills that fit the
 * month-name / year labels: the calendar keeps one footprint across every view. The weekday `<th>`
 * auto-aligns to its column, so its `text-[0.8rem]` stays size-independent.
 */

// The Calendar recipe's variant vocabulary is owned by `@hope-ui/theming` (the contract); this theme
// implements it. `hopeRecipes` (in `./index`) checks the finished recipe against `RecipeRegistry`.
import { tv } from "@hope-ui/theming";

/**
 * hope's Calendar slot recipe — used as-is by the component (`recipe(props).cellTrigger()`), no
 * adapter. `hopeRecipes` (in `./index`) checks it against the `calendar` contract in `@hope-ui/theming`.
 */
export const calendarRecipe = tv({
  slots: {
    // The `role="group"` container. Deliberately NO popup chrome (no background, border, shadow, or
    // rounded panel) — a standalone calendar sits in the page flow; a floating consumer layers the
    // surface itself. Stacks the navigation header over the grid; `text-foreground` is the legible
    // base content color; `select-none` because day cells are pointer/keyboard targets, not text.
    // `--cell-size` (the day-cell box) is set per `size` and inherited by the grid + cells.
    root: "inline-flex flex-col gap-2 text-foreground select-none",
    // The navigation row: prev — heading — next. `justify-between` pins the nav buttons to the edges;
    // the heading is `flex-1` (per its slot) and fills the space between them.
    header: "flex items-center justify-between gap-2 pb-2",
    // The center caption `<button>` (the current month/year — a view-switcher trigger). Ghost: only a
    // surface hover wash, no fill; focus shows the shared roving ring + border; disabled dims via the
    // token. `flex-1` stretches it to fill the header width between the nav buttons.
    heading:
      "inline-flex flex-1 items-center justify-center rounded-md border border-transparent px-2 py-1 font-medium transition-[color,background-color,border-color,box-shadow] hover:bg-surface-raised-hovered focus-visible:border-focus focus-visible:ring-3 focus-visible:ring-focus-halo focus-visible:outline-none data-disabled:pointer-events-none data-disabled:opacity-disabled",
    // Previous-period nav `<button>` — a ghost, square icon button. Box + glyph size live per `size`.
    prevButton:
      "inline-flex items-center justify-center rounded-md border border-transparent transition-[color,background-color,border-color,box-shadow] hover:bg-surface-raised-hovered focus-visible:border-focus focus-visible:ring-3 focus-visible:ring-focus-halo focus-visible:outline-none data-disabled:pointer-events-none data-disabled:opacity-disabled",
    // Next-period nav `<button>` — the mirror of `prevButton`.
    nextButton:
      "inline-flex items-center justify-center rounded-md border border-transparent transition-[color,background-color,border-color,box-shadow] hover:bg-surface-raised-hovered focus-visible:border-focus focus-visible:ring-3 focus-visible:ring-focus-halo focus-visible:outline-none data-disabled:pointer-events-none data-disabled:opacity-disabled",
    // The `<table role="grid">`. Pinned to the month footprint (`7 × --cell-size`) with `table-fixed`
    // so every view keeps one width: month splits it into 7 square columns, year/decade into 3 wide
    // ones. `border-collapse` so range-band cells sit flush with no seams.
    grid: "w-[calc(var(--cell-size)*7)] table-fixed border-collapse",
    // A weekday-head `<th scope="col">` — small, muted, non-interactive. Size-independent (the table
    // column width comes from `--cell-size`), so its text stays fixed at the nova `0.8rem`.
    weekday: "pb-1 text-[0.8rem] font-normal text-foreground-muted",
    // A `<td role="gridcell">` wrapping the day trigger — no cell padding, so the trigger box (which is
    // `w-full`) defines the column fill. `relative` in case a consumer overlays a marker.
    cell: "relative p-0 text-center",
    // The roving day `<button>`. Fills its column (`h-(--cell-size) w-full`); the reserved transparent
    // border is colored by the focus ring; `z-10` keeps the pill above any sibling paint. All day state
    // is `data-*` (see the header note); ORDER MATTERS — the later utility wins the equal-specificity
    // cascade: zero-spec hover wash → roving focus ring (reused from Button) → today tint →
    // outside-month/unavailable text → disabled dim → tentative band → solid selection → range middle
    // band → solid endpoints last. Text size lives per `size`, not here.
    cellTrigger: [
      "relative z-10 inline-flex h-(--cell-size) w-full items-center justify-center rounded-md border border-transparent font-normal select-none",
      "transition-[color,background-color,border-color,box-shadow]",
      "[&:where(:hover)]:bg-surface-raised-hovered",
      "focus-visible:border-focus focus-visible:ring-3 focus-visible:ring-focus-halo focus-visible:outline-none",
      "data-today:bg-active",
      "data-outside-month:text-foreground-subtle",
      "data-unavailable:line-through data-unavailable:text-foreground-disabled",
      "data-disabled:pointer-events-none data-disabled:opacity-disabled",
      "data-highlighted:bg-selected data-highlighted:text-on-selected data-highlighted:rounded-none",
      "data-selected:bg-primary data-selected:text-on-primary",
      "data-range-middle:bg-selected data-range-middle:text-on-selected data-range-middle:rounded-none",
      "data-range-start:bg-primary data-range-start:text-on-primary data-range-start:rounded-s-md data-range-start:rounded-e-none",
      "data-range-end:bg-primary data-range-end:text-on-primary data-range-end:rounded-e-md data-range-end:rounded-s-none",
      "[&[data-range-start][data-range-end]]:rounded-md",
    ],
  },
  variants: {
    // `size` owns the density set: `--cell-size` (the day-cell box, on `root`, inherited by the grid +
    // cells), the day text size, and the navigation-button box + glyph. The day box no longer lives on
    // `cellTrigger` — it fills its column, whose width comes from `--cell-size` — so a size applies
    // additively and nothing relies on tailwind-merge. The weekday text is size-independent.
    size: {
      sm: {
        root: "[--cell-size:2rem]",
        prevButton: "size-7 [&_svg]:size-4",
        nextButton: "size-7 [&_svg]:size-4",
        heading: "text-sm",
        cellTrigger: "text-xs",
      },
      md: {
        root: "[--cell-size:2.25rem]",
        prevButton: "size-8 [&_svg]:size-4",
        nextButton: "size-8 [&_svg]:size-4",
        heading: "text-sm",
        cellTrigger: "text-sm",
      },
      lg: {
        root: "[--cell-size:2.5rem]",
        prevButton: "size-9 [&_svg]:size-5",
        nextButton: "size-9 [&_svg]:size-5",
        heading: "text-base",
        cellTrigger: "text-base",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
