/*
 * @hope-ui/presets/hope — Calendar slot recipe (the "nova" calendar), in hope's `--hope-*` tokens.
 *
 * Standalone-first: no popup chrome by default (a DatePicker popover layers its own surface). Day
 * state is painted from the `data-*` hooks `createCalendarCell` emits, split across two elements: the
 * `<td>` (`cell`) paints the continuous range/preview band that spans cells; the `<button>`
 * (`cellTrigger`, `z-10`) paints the solid endpoint pills and per-day marks on top. Both carry the
 * range flags because the custom variants are self-based (`:where([data-*])`).
 *
 * Recipe purity: every color is a finished `--hope-*` token; `--cell-size`, `calc()`, `ring-3` are
 * lengths, and every class is a literal for the `@source` scan.
 */
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
    root: "inline-flex flex-col gap-1 text-foreground select-none",
    // The navigation row: prev — heading — next. `justify-between` pins the nav buttons to the edges;
    // the heading is `flex-1` (per its slot) and fills the space between them.
    header: "flex items-center justify-between gap-1",
    // The center caption `<button>` (the current month/year — a view-switcher trigger). Ghost: only a
    // surface hover wash, no fill; focus shows the shared roving ring + border; disabled dims via the
    // token. `flex-1` stretches it to fill the header width between the nav buttons.
    heading:
      "inline-flex flex-1 items-center justify-center rounded-md border border-transparent font-medium transition-[color,background-color,border-color,box-shadow] hover:bg-surface-raised-hovered focus-visible:border-focus focus-visible:ring-3 focus-visible:ring-focus-halo focus-visible:outline-none data-disabled:pointer-events-none data-disabled:opacity-disabled",
    // Previous-period nav `<button>` — a ghost, square icon button. Box + glyph size live per `size`.
    prevButton:
      "inline-flex items-center justify-center shrink-0 select-none rounded-md border border-transparent transition-[color,background-color,border-color,box-shadow] hover:bg-surface-raised-hovered focus-visible:border-focus focus-visible:ring-3 focus-visible:ring-focus-halo focus-visible:outline-none data-disabled:pointer-events-none data-disabled:opacity-disabled rtl:[&_svg]:rotate-180",
    // Next-period nav `<button>` — the mirror of `prevButton`.
    nextButton:
      "inline-flex items-center justify-center shrink-0 select-none rounded-md border border-transparent transition-[color,background-color,border-color,box-shadow] hover:bg-surface-raised-hovered focus-visible:border-focus focus-visible:ring-3 focus-visible:ring-focus-halo focus-visible:outline-none data-disabled:pointer-events-none data-disabled:opacity-disabled rtl:[&_svg]:rotate-180",
    // The `<table role="grid">`. Pinned to the month footprint (`7 × --cell-size`) with `table-fixed`
    // so every view keeps one width (month → 7 square columns, year/decade → 3 wide ones).
    // `border-separate` with zero horizontal spacing keeps the band flush across a row while the
    // vertical spacing breathes between weeks. `group/grid` gates the roving focus ring on the grid
    // actually holding focus.
    grid: "group/grid w-[calc(var(--cell-size)*7)] table-fixed border-separate border-spacing-x-0 border-spacing-y-2",
    // A weekday-head `<th scope="col">` — small, muted, non-interactive. Size-independent (the table
    // column width comes from `--cell-size`), so its text stays fixed at the nova `0.8rem`.
    weekday: "text-[0.8rem] font-normal text-foreground-muted select-none",
    // A `<td role="gridcell">` wrapping the day trigger. No padding, so the `w-full` trigger fills the
    // column. It paints the continuous range/tentative band off its own `data-range-*`/`data-highlighted`
    // — spanning cells seamlessly under the pills — with logical rounding at the ends and at row wraps.
    cell: [
      "relative rounded-md p-0 text-center align-middle select-none outline-none",

      "data-range-start:bg-selected data-range-start:rounded-e-none",
      "data-range-end:bg-selected data-range-end:rounded-s-none",
      // A one-day range is start AND end — squared on both sides by the two rules above, which would
      // leave a square band peeking around the rounded pill. Two attributes, so it wins on specificity.
      "[&[data-range-start][data-range-end]]:rounded-md",
      // An endpoint that lands on a row edge is its row's whole band segment: round its outer corner so
      // the segment closes, mirroring the middle-cell row-wrap rounding below (`:first`/`:last`, `md`).
      "data-range-start:last:rounded-e-md",
      "data-range-end:first:rounded-s-md",

      "data-range-middle:bg-selected data-range-middle:rounded-none",
      "data-range-middle:first:rounded-s-md data-range-middle:last:rounded-e-md",

      "data-highlighted:bg-selected data-highlighted:rounded-none",
      "data-highlighted:first:rounded-s-md data-highlighted:last:rounded-e-md",
    ],
    // The roving day `<button>`, `z-10` above the cell band. Fills its column (`h-(--cell-size) w-full`);
    // the reserved transparent border is colored on focus. The roving ring is driven by the primitive's
    // `data-focused` (the roving cursor), shown only while the grid holds focus (`group-focus-within`) —
    // no dependence on the `:focus-visible` heuristic. The band interior + preview stay unfilled so the
    // cell band shows through; only a non-middle `data-selected` paints the solid endpoint pill.
    cellTrigger: [
      "relative z-10 flex h-(--cell-size) w-full items-center justify-center rounded-md border border-transparent font-normal outline-none select-none",
      "transition-[color,background-color,border-color,box-shadow]",

      // Text color is painted by exactly ONE rule: each rule excludes every state above it, so the guard
      // chain IS the whole precedence — never class/emit order. (tailwind-merge keeps these differently-
      // guarded arbitrary variants side by side, so array order can't decide between two matches anyway;
      // making them mutually exclusive is what removes the dependence on order entirely.)
      // High→low: disabled › selected endpoint › band (range-middle | highlighted) › unavailable › today › outside.
      "data-disabled:pointer-events-none data-disabled:opacity-disabled data-disabled:text-foreground-disabled",

      // Solid endpoint pill (bg painted here; the continuous band lives on the <td>). Stays a pill while
      // it is the preview anchor, so it deliberately does NOT exclude data-highlighted.
      "[&[data-selected]:not([data-range-middle]):not([data-disabled])]:bg-primary [&[data-selected]:not([data-range-middle]):not([data-disabled])]:text-on-primary",

      // Sitting on the band (committed middle, or tentative preview) — legible on bg-selected.
      "[&[data-range-middle]:not([data-disabled])]:text-on-selected",
      "[&[data-highlighted]:not([data-selected]):not([data-disabled])]:text-on-selected",

      // Unavailable: the strike always shows; the muted color yields only to a band the day sits on.
      "data-unavailable:line-through",
      "[&[data-unavailable]:not([data-selected]):not([data-highlighted]):not([data-disabled])]:text-foreground-disabled",

      // Today / outside-month tints — lowest, so they never fight the band or the unavailable mark.
      "[&[data-today]:not([data-selected]):not([data-highlighted]):not([data-unavailable]):not([data-disabled])]:text-primary",
      "[&[data-outside-month]:not([data-selected]):not([data-highlighted]):not([data-unavailable]):not([data-today]):not([data-disabled])]:text-foreground-subtle",

      // Hover wash only on a plain, actionable day (unavailable stays interactive, so exclude it too).
      "[&:not([data-disabled]):not([data-unavailable]):not([data-highlighted]):not([data-range-middle]):not([data-selected]):hover]:bg-surface-raised-hovered",

      // Roving ring: keyed off the primitive's data-focused (the roving cursor), gated on the grid
      // holding focus (group-focus-within/grid) — no :focus-visible dependence, so arrow-nav shows it.
      "group-focus-within/grid:data-focused:border-focus group-focus-within/grid:data-focused:ring-3 group-focus-within/grid:data-focused:ring-focus-halo",
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
        heading: "h-7 text-sm",
        cellTrigger: "text-xs",
      },
      md: {
        root: "[--cell-size:2.25rem]",
        prevButton: "size-8 [&_svg]:size-4",
        nextButton: "size-8 [&_svg]:size-4",
        heading: "h-8 text-sm",
        cellTrigger: "text-sm",
      },
      lg: {
        root: "[--cell-size:2.5rem]",
        prevButton: "size-9 [&_svg]:size-5",
        nextButton: "size-9 [&_svg]:size-5",
        heading: "h-9 text-base",
        cellTrigger: "text-base",
      },
    },
  },
  defaultVariants: {
    size: "md",
  },
});
