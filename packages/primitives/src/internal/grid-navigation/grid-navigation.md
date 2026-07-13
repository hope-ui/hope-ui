# `createGridNavigation`

2D navigation over a row/cell collection, layered on **one** [`createListFocus`](../list-focus/list-focus.md).
Up/Down/Left/Right with per-axis wrap, `firstInRow`/`lastInRow`, grid `first`/`last`, RTL,
skip-disabled, and cell spans. The vertical edges fire `onNavigateBefore`/`onNavigateAfter`, which a
calendar uses to flip months while the parent re-renders. Modeled on Angular Aria's `private/grid`,
with the calendar month-flip pattern from Astryx's `useGridFocus`.

Because it drives the shared focus, the **roving⇆activedescendant** switch and the defer-focus-until-
the-element-exists behavior come straight from `createListFocus` — a grid over a
`createVirtualCollection` navigates unmounted cells exactly like a list does.

## API

```ts
function createGridNavigation<V>(options: {
  focus: CreateListFocusReturn<V>;            // over the FLAT cell items
  cells: Accessor<GridCell<V>[]>;             // each item + its {rowIndex, colIndex, rowSpan?, colSpan?}
  columnCount?: Accessor<number>;             // defaults to max(colIndex + colSpan)
  rowCount?: Accessor<number>;                // defaults to max(rowIndex + rowSpan)
  rowWrap?: Accessor<"nowrap" | "loop" | "continuous">; // default "nowrap"
  colWrap?: Accessor<"nowrap" | "loop" | "continuous">; // default "nowrap"
  textDirection?: Accessor<"ltr" | "rtl">;    // default "ltr"
  onNavigateBefore?: () => void;              // ArrowUp past the first row
  onNavigateAfter?: () => void;               // ArrowDown past the last row
}): {
  up(); down(); right(); left();
  firstInRow(); lastInRow(); first(); last();
  onKeyDown: JSX.EventHandler<HTMLElement, KeyboardEvent>;
};
```

`right()`/`left()` move by `colIndex` (visual right/left in LTR); the `onKeyDown` swaps them under RTL.

## Wrap modes (per axis)

| | `nowrap` | `loop` | `continuous` |
|---|---|---|---|
| Left/Right (`colWrap`) | stop at the row edge | wrap within the row | **cross to the adjacent row** (row-major); fires `onNavigate*` at the grid's outer edge |
| Up/Down (`rowWrap`) | fire `onNavigate*` at the grid edge | wrap within the column | fire `onNavigate*` at the grid edge |

`colWrap: "continuous"` is the "ArrowRight past the last column lands on the first cell of the next
row" behavior. On the vertical axis, both `nowrap` and `continuous` fire the `onNavigate*` callback at
the edge — that is the calendar month-flip seam.

## Spans

Each cell may declare `rowSpan`/`colSpan`. A cell occupies every slot it covers, so **moving into** a
wide/tall cell from any covered edge lands on it, and **moving out of** one steps past its whole span
(ArrowRight from a `colSpan: 2` cell skips to the column after it). Calendars have no spans; data grids
do.

## Keyboard

| Key | Action |
|---|---|
| Arrow keys | `up`/`down`/`left`/`right` (RTL-aware) |
| Home / End | `firstInRow` / `lastInRow` |
| mod+Home / mod+End | grid `first` / `last` |

## Calendar month-flip

```ts
const grid = createGridNavigation({
  focus, cells,
  onNavigateAfter: () => { setMonth((m) => m + 1); /* then focus the new month's first row */ },
  onNavigateBefore: () => { setMonth((m) => m - 1); /* … its last row */ },
});
```

ArrowDown on the last week fires `onNavigateAfter`; the parent advances the month, re-renders, and
sets the active cell on the new grid (defer-focus handles the not-yet-mounted target). Verified with a
throwaway calendar harness in the browser test.

## SSR

Navigation runs from keyboard events only; the getters it reads on `focus` are SSR-safe. No effect or
DOM access at module scope.
