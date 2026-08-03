/*
 * @hope-ui/presets/hope — Calendar slot recipe (the "nova" calendar).
 *
 * A *slot recipe*: `tv` (tailwind-variants) maps variant props to one class string per named part
 * ("slot"), and `@hope-ui/components`' Calendar reads it through `useRecipe("calendar")`.
 * Standalone-first: no popup chrome by default, since a DatePicker popover layers its own surface.
 *
 * Day state is painted from the `data-*` hooks `createCalendarCell` emits, split across two elements:
 * the `<td>` (`cell`) paints the continuous band that spans cells, and the `<button>` (`cellTrigger`,
 * `z-10`) paints the solid endpoint pills and per-day marks on top. Both carry the band flags because
 * the custom variants are self-based (`:where([data-*])`).
 *
 * The band vocabulary is React Aria's `data-selected`/`data-selection-start`/`data-selection-end`, and
 * there is exactly ONE band — tentative while a range is anchored, committed when it is not — which is
 * why no parallel tentative-highlight vocabulary exists. The interior is derived
 * (`data-selection-middle`, registered in `_base/_variants.css`), never emitted by the primitive.
 *
 * Recipe purity: every color is a *finished* `--hope-*` design token — never one this recipe computes
 * (no `color-mix`, no alpha modifier, no magic opacity), with derived colors authored as tokens in the
 * preset's `theme.css` instead. Enforced by `pnpm check:recipe-purity`; `--cell-size`, `calc()` and
 * `ring-3` are lengths, not colors. Every class is a literal string, because the consumer's Tailwind
 * build only emits utilities it can find by scanning this file (`@source "./recipes"`).
 */
import { tv } from "@hope-ui/theming";

/**
 * hope's Calendar slot recipe — used as-is by the component (`recipe(props).cellTrigger()`), no
 * adapter. `hopeRecipes` (in `./index`) checks it against the `calendar` contract in `@hope-ui/theming`.
 */
export const calendarRecipe = tv({
  slots: {
    // The `role="group"` container. NO popup chrome by design (header note). `select-none` because day
    // cells are pointer/keyboard targets, not text. `--cell-size` (the day-cell box) is set per `size`
    // here and inherited by the grid and cells.
    root: "inline-flex flex-col gap-1 text-foreground select-none",
    // The navigation row: prev — heading — next.
    header: "flex items-center justify-between gap-1",
    // The center caption `<button>` — the current month/year, and the view-switcher trigger. Ghost:
    // a hover wash but no fill. `flex-1` stretches it to fill the header between the nav buttons.
    heading:
      "inline-flex flex-1 items-center justify-center rounded-md border border-transparent font-medium transition-[color,background-color,border-color,box-shadow] hover:bg-surface-raised-hovered focus-visible:border-focus focus-visible:ring-3 focus-visible:ring-focus-halo focus-visible:outline-none data-disabled:pointer-events-none data-disabled:opacity-disabled",
    // A ghost, square icon button; box and glyph size live per `size`. `rtl:[&_svg]:rotate-180` is a
    // deliberate direction flip: the chevron must point at the *previous* period, which is the other
    // way round under `dir="rtl"`.
    prevButton:
      "inline-flex items-center justify-center shrink-0 select-none rounded-md border border-transparent transition-[color,background-color,border-color,box-shadow] hover:bg-surface-raised-hovered focus-visible:border-focus focus-visible:ring-3 focus-visible:ring-focus-halo focus-visible:outline-none data-disabled:pointer-events-none data-disabled:opacity-disabled rtl:[&_svg]:rotate-180",
    // The mirror of `prevButton`, same direction flip.
    nextButton:
      "inline-flex items-center justify-center shrink-0 select-none rounded-md border border-transparent transition-[color,background-color,border-color,box-shadow] hover:bg-surface-raised-hovered focus-visible:border-focus focus-visible:ring-3 focus-visible:ring-focus-halo focus-visible:outline-none data-disabled:pointer-events-none data-disabled:opacity-disabled rtl:[&_svg]:rotate-180",
    // The `<table role="grid">`, pinned to the month footprint (`7 × --cell-size`) with `table-fixed`
    // so every view keeps one width (month → 7 square columns, year/decade → 3 wide ones).
    // `border-separate` with zero horizontal spacing keeps the band flush across a row while the
    // vertical spacing breathes between weeks. `group/grid` is the gate the roving focus ring reads.
    grid: "group/grid w-[calc(var(--cell-size)*7)] table-fixed border-separate border-spacing-x-0 border-spacing-y-2",
    // Size-independent — the column width comes from `--cell-size` — so the weekday text stays fixed.
    weekday: "text-[0.8rem] font-normal text-foreground-muted select-none",
    // A `<td role="gridcell">` wrapping the day trigger. No padding, so the `w-full` trigger fills the
    // column. It paints the continuous band off its own `data-selected`/`data-selection-*`, spanning
    // cells seamlessly under the pills, with *logical* rounding (`-s-`/`-e-`, never the physical
    // `-l-`/`-r-`) so a range mirrors under `dir="rtl"` for free.
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

      // `data-selection-middle` is derived, not emitted by the primitive: the preset registers it as
      // `[data-selected]:not([data-selection-start]):not([data-selection-end])`, so it can never
      // overlap the two endpoint rules above.
      "data-selection-middle:bg-selected data-selection-middle:rounded-none",
      "data-selection-middle:first:rounded-s-md data-selection-middle:last:rounded-e-md",
    ],
    // The roving day `<button>`, `z-10` above the cell band, filling its column. The reserved
    // transparent border is colored on focus. The band interior stays unfilled so the cell's band shows
    // through; only a non-middle `data-selected` paints the solid endpoint pill.
    cellTrigger: [
      "relative z-10 flex h-(--cell-size) w-full items-center justify-center rounded-md border border-transparent font-normal outline-none select-none",
      "transition-[color,background-color,border-color,box-shadow]",

      // A day is routinely several states at once (today AND selected, an interior that also reports
      // selected), so text color is painted by exactly ONE rule: each excludes every state above it,
      // making the guard chain the whole precedence rather than class/emit order. tailwind-merge keeps
      // differently-guarded arbitrary variants side by side, so array order could not decide between
      // two matches anyway — mutual exclusion is what removes the dependence entirely.
      // High→low: disabled › band endpoint › band interior › unavailable › today › outside.
      "data-disabled:pointer-events-none data-disabled:opacity-disabled data-disabled:text-foreground-disabled",

      // Solid endpoint pill (bg painted here; the continuous band lives on the <td>). One band, so an
      // endpoint is an endpoint whether the range is tentative or committed — and a single/multiple
      // selection caps both ends of its own one-day band, which is what gives it a pill here too.
      "[&[data-selection-start]:not([data-disabled])]:bg-primary [&[data-selection-start]:not([data-disabled])]:text-on-primary",
      "[&[data-selection-end]:not([data-disabled])]:bg-primary [&[data-selection-end]:not([data-disabled])]:text-on-primary",

      // Sitting on the band's interior — legible on `bg-selected`. Spelled out rather than using the
      // registered `data-selection-middle:` variant, because the guarded arbitrary form is what keeps
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

      // Keyed off the primitive's `data-focused` (the roving cursor) and gated on the grid holding
      // focus, deliberately NOT on `:focus-visible` — that heuristic can suppress the ring after a
      // programmatic focus, which is exactly what arrow-key navigation does.
      "group-focus-within/grid:data-focused:border-focus group-focus-within/grid:data-focused:ring-3 group-focus-within/grid:data-focused:ring-focus-halo",
    ],
  },
  variants: {
    // `size` owns the density set: `--cell-size` on `root` (inherited by the grid and cells), the day
    // text size, and the nav-button box + glyph. The day box is NOT on `cellTrigger` — the button fills
    // its column, whose width comes from `--cell-size` — so a size applies additively and nothing
    // relies on tailwind-merge resolution.
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
