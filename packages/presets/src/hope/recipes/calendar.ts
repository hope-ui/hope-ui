/*
 * @hope-ui/presets/hope — Calendar slot recipe (the "nova" calendar), in hope's `--hope-*` tokens.
 *
 * Standalone-first: no popup chrome by default (a DatePicker popover layers its own surface). Day
 * state is painted from the `data-*` hooks `createCalendarCell` emits, split across two elements: the
 * `<td>` (`cell`) paints the continuous band that spans cells; the `<button>` (`cellTrigger`, `z-10`)
 * paints the solid endpoint pills and per-day marks on top. Both carry the band flags because the
 * custom variants are self-based (`:where([data-*])`).
 *
 * The band vocabulary is React Aria's `data-selected` / `data-selection-start` / `data-selection-end`,
 * and there is exactly one band — tentative while a range is anchored, committed when it is not. The
 * interior is derived (`data-selection-middle`, registered in `_base/_variants.css`), never emitted.
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
    // column. It paints the continuous band off its own `data-selected`/`data-selection-*` — spanning
    // cells seamlessly under the pills — with logical rounding at the ends and at row wraps.
    //
    // There is exactly ONE band (tentative while a range is anchored, committed when it is not), so the
    // endpoint and interior rules below are mutually exclusive by construction — the second set of
    // rules and the exclusion chains a separate tentative-highlight vocabulary needed are simply gone.
    cell: [
      "relative rounded-md p-0 text-center align-middle select-none outline-none",

      "data-selection-start:bg-selected data-selection-start:rounded-e-none",
      "data-selection-end:bg-selected data-selection-end:rounded-s-none",
      // A one-day band is start AND end — squared on both sides by the two rules above, which would
      // leave a square band peeking around the rounded pill. Two attributes, so it wins on specificity.
      "[&[data-selection-start][data-selection-end]]:rounded-md",
      // An endpoint that lands on a row edge is its row's whole band segment: round its outer corner so
      // the segment closes, mirroring the middle-cell row-wrap rounding below (`:first`/`:last`, `md`).
      "data-selection-start:last:rounded-e-md",
      "data-selection-end:first:rounded-s-md",

      // `data-selection-middle` is derived, not emitted: the preset registers it as
      // `[data-selected]:not([data-selection-start]):not([data-selection-end])`, so it can never
      // overlap the two endpoint rules above.
      "data-selection-middle:bg-selected data-selection-middle:rounded-none",
      "data-selection-middle:first:rounded-s-md data-selection-middle:last:rounded-e-md",
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
      // High→low: disabled › band endpoint › band interior › unavailable › today › outside.
      "data-disabled:pointer-events-none data-disabled:opacity-disabled data-disabled:text-foreground-disabled",

      // Solid endpoint pill (bg painted here; the continuous band lives on the <td>). One band, so an
      // endpoint is an endpoint whether the range is tentative or committed — and a single/multiple
      // selection caps both ends of its own one-day band, which is what gives it a pill here too.
      "[&[data-selection-start]:not([data-disabled])]:bg-primary [&[data-selection-start]:not([data-disabled])]:text-on-primary",
      "[&[data-selection-end]:not([data-disabled])]:bg-primary [&[data-selection-end]:not([data-disabled])]:text-on-primary",

      // Sitting on the band's interior — legible on bg-selected. Spelled out rather than written as the
      // registered `data-selection-middle:` variant, because these guarded arbitrary variants are what keep
      // the cascade order-independent.
      "[&[data-selected]:not([data-selection-start]):not([data-selection-end]):not([data-disabled])]:text-on-selected",

      // Unavailable: the strike always shows; the muted color yields only to a band the day sits on.
      "data-unavailable:line-through",
      "[&[data-unavailable]:not([data-selected]):not([data-disabled])]:text-foreground-disabled",

      // Today / outside-month tints — lowest, so they never fight the band or the unavailable mark.
      "[&[data-today]:not([data-selected]):not([data-unavailable]):not([data-disabled])]:text-primary",
      "[&[data-outside-month]:not([data-selected]):not([data-unavailable]):not([data-today]):not([data-disabled])]:text-foreground-subtle",

      // Hover wash only on a plain, actionable day (unavailable stays interactive, so exclude it too).
      "[&:not([data-disabled]):not([data-unavailable]):not([data-selected]):hover]:bg-surface-raised-hovered",

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
