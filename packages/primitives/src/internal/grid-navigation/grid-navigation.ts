import type { JSX } from "@solidjs/web";
import { type Accessor, createMemo } from "solid-js";
import type { CollectionItem } from "../collection/collection";
import type { CreateListFocusReturn } from "../list-focus/list-focus";
import type { TextDirection } from "../list-navigation/list-navigation";

/**
 * How movement behaves at an axis edge.
 * - `"nowrap"`: stop (and, on the vertical axis, fire the matching `onNavigate*` callback).
 * - `"loop"`: wrap to the opposite end of the same row/column.
 * - `"continuous"`: cross into the adjacent row/column (row-major), so ArrowRight past the last
 *   column lands on the first cell of the next row. At the grid's outer edge it fires `onNavigate*`.
 */
export type GridWrap = "nowrap" | "loop" | "continuous";

/** One cell in the 2D layout, wrapping a flat collection item with its coordinates + span. */
export interface GridCell<V> {
  item: CollectionItem<V>;
  rowIndex: number;
  colIndex: number;
  /** Default `1`. */
  rowSpan?: number;
  /** Default `1`. */
  colSpan?: number;
}

export interface CreateGridNavigationOptions<V> {
  /**
   * The shared focus instance, over the **flat cell items**. Grid navigation reuses it for the
   * roving⇆activedescendant switch and the defer-focus-until-mounted plumbing; it just computes 2D
   * targets and calls `focus.focus(cell.item)`.
   */
  focus: CreateListFocusReturn<V>;
  /** The 2D layout: every cell with its coordinates and spans. Reactive. */
  cells: Accessor<GridCell<V>[]>;
  /** Column count. Defaults to the max `colIndex + colSpan` across cells. Reactive. */
  columnCount?: Accessor<number>;
  /** Row count. Defaults to the max `rowIndex + rowSpan` across cells. Reactive. */
  rowCount?: Accessor<number>;
  /** Edge behavior for Up/Down. Default `"nowrap"`. Reactive. */
  rowWrap?: Accessor<GridWrap>;
  /** Edge behavior for Left/Right. Default `"nowrap"`. Reactive. */
  colWrap?: Accessor<GridWrap>;
  /** Text direction; swaps Left/Right. Default `"ltr"`. Reactive. */
  textDirection?: Accessor<TextDirection>;
  /** Fired when navigation would move before the first row (ArrowUp at the top). Calendar month-flip. */
  onNavigateBefore?: () => void;
  /** Fired when navigation would move after the last row (ArrowDown at the bottom). Calendar month-flip. */
  onNavigateAfter?: () => void;
}

export interface CreateGridNavigationReturn {
  up(): void;
  down(): void;
  /** Move one column toward higher `colIndex` (visual right in LTR). */
  right(): void;
  /** Move one column toward lower `colIndex` (visual left in LTR). */
  left(): void;
  firstInRow(): void;
  lastInRow(): void;
  first(): void;
  last(): void;
  /** Arrow/Home/End handler; Left/Right are swapped under RTL. `mod+Home`/`mod+End` jump to grid ends. */
  onKeyDown: JSX.EventHandler<HTMLElement, KeyboardEvent>;
}

/**
 * 2D navigation over a row/cell collection, layered on one `createListFocus`. Handles Up/Down/
 * Left/Right with per-axis wrap (`nowrap`/`loop`/`continuous`), `firstInRow`/`lastInRow` and grid
 * `first`/`last`, RTL, skip-disabled, and cell spans. The vertical edges fire `onNavigateBefore`/
 * `onNavigateAfter`, which a calendar uses to flip months (Astryx's `useGridFocus` pattern) while
 * the parent re-renders and sets the new active cell. Modeled on Angular Aria's `private/grid`.
 *
 * Because it drives the shared focus, the roving⇆activedescendant switch and defer-focus-until-the-
 * element-exists behavior come for free from `createListFocus` — a grid over a
 * `createVirtualCollection` navigates unmounted cells the same way a list does.
 */
export function createGridNavigation<V>(
  options: CreateGridNavigationOptions<V>,
): CreateGridNavigationReturn {
  const { focus } = options;
  const isRtl = () => (options.textDirection?.() ?? "ltr") === "rtl";
  const rowWrap = () => options.rowWrap?.() ?? "nowrap";
  const colWrap = () => options.colWrap?.() ?? "nowrap";

  const columnCount = () =>
    options.columnCount?.() ??
    options.cells().reduce((max, cell) => Math.max(max, cell.colIndex + (cell.colSpan ?? 1)), 0);
  const rowCount = () =>
    options.rowCount?.() ??
    options.cells().reduce((max, cell) => Math.max(max, cell.rowIndex + (cell.rowSpan ?? 1)), 0);

  // Slot → cell, expanding spans, so landing on any covered slot resolves to the cell that owns it.
  const slotMap = createMemo(() => {
    const map = new Map<string, GridCell<V>>();
    for (const cell of options.cells()) {
      const rowSpan = cell.rowSpan ?? 1;
      const colSpan = cell.colSpan ?? 1;
      for (let r = cell.rowIndex; r < cell.rowIndex + rowSpan; r++) {
        for (let c = cell.colIndex; c < cell.colIndex + colSpan; c++) {
          map.set(`${r},${c}`, cell);
        }
      }
    }
    return map;
  });

  const cellAt = (row: number, col: number) => slotMap().get(`${row},${col}`);
  const activeCell = () => {
    const item = focus.activeItem();
    return item ? options.cells().find((cell) => cell.item === item) : undefined;
  };
  const focusCell = (cell: GridCell<V> | undefined) => {
    if (cell && focus.isFocusable(cell.item)) focus.focus(cell.item);
  };

  const horizontal = (direction: 1 | -1) => {
    const cell = activeCell();
    const columns = columnCount();
    const rows = rowCount();
    if (!cell || columns === 0) return;

    let row = cell.rowIndex;
    let col = direction > 0 ? cell.colIndex + (cell.colSpan ?? 1) : cell.colIndex - 1;
    const wrap = colWrap();

    for (let guard = 0; guard <= columns * rows + columns; guard++) {
      if (col >= columns) {
        if (wrap === "nowrap") return;
        if (wrap === "loop") col = 0;
        else {
          row += 1;
          col = 0;
          if (row >= rows) return options.onNavigateAfter?.();
        }
      } else if (col < 0) {
        if (wrap === "nowrap") return;
        if (wrap === "loop") col = columns - 1;
        else {
          row -= 1;
          col = columns - 1;
          if (row < 0) return options.onNavigateBefore?.();
        }
      }
      const target = cellAt(row, col);
      if (target && focus.isFocusable(target.item)) return focusCell(target);
      col += direction;
    }
  };

  const vertical = (direction: 1 | -1) => {
    const cell = activeCell();
    const rows = rowCount();
    if (!cell || rows === 0) return;

    const col = cell.colIndex;
    let row = direction > 0 ? cell.rowIndex + (cell.rowSpan ?? 1) : cell.rowIndex - 1;
    const wrap = rowWrap();

    for (let guard = 0; guard <= rows; guard++) {
      if (row >= rows) {
        if (wrap === "loop") row = 0;
        else return options.onNavigateAfter?.(); // nowrap + continuous both flip at the vertical edge
      } else if (row < 0) {
        if (wrap === "loop") row = rows - 1;
        else return options.onNavigateBefore?.();
      }
      const target = cellAt(row, col);
      if (target && focus.isFocusable(target.item)) return focusCell(target);
      row += direction;
    }
  };

  /** First focusable cell scanning row-major between two flat positions (inclusive), in `direction`. */
  const scanRowMajor = (fromRow: number, toRow: number, columns: number, direction: 1 | -1) => {
    const rowStep = direction;
    for (let row = fromRow; direction > 0 ? row <= toRow : row >= toRow; row += rowStep) {
      const startCol = direction > 0 ? 0 : columns - 1;
      for (let col = startCol; col >= 0 && col < columns; col += direction) {
        const target = cellAt(row, col);
        if (target && focus.isFocusable(target.item)) return target;
      }
    }
    return undefined;
  };

  const firstInRow = () => {
    const cell = activeCell();
    const columns = columnCount();
    if (!cell) return;
    for (let col = 0; col < columns; col++) {
      const target = cellAt(cell.rowIndex, col);
      if (target && focus.isFocusable(target.item)) return focusCell(target);
    }
  };
  const lastInRow = () => {
    const cell = activeCell();
    const columns = columnCount();
    if (!cell) return;
    for (let col = columns - 1; col >= 0; col--) {
      const target = cellAt(cell.rowIndex, col);
      if (target && focus.isFocusable(target.item)) return focusCell(target);
    }
  };
  const first = () => focusCell(scanRowMajor(0, rowCount() - 1, columnCount(), 1));
  const last = () => focusCell(scanRowMajor(rowCount() - 1, 0, columnCount(), -1));

  const up = () => vertical(-1);
  const down = () => vertical(1);
  const right = () => horizontal(1);
  const left = () => horizontal(-1);

  const onKeyDown: JSX.EventHandler<HTMLElement, KeyboardEvent> = (event) => {
    switch (event.key) {
      case "ArrowUp":
        event.preventDefault();
        return up();
      case "ArrowDown":
        event.preventDefault();
        return down();
      case "ArrowRight":
        event.preventDefault();
        return isRtl() ? left() : right();
      case "ArrowLeft":
        event.preventDefault();
        return isRtl() ? right() : left();
      case "Home":
        event.preventDefault();
        return event.ctrlKey || event.metaKey ? first() : firstInRow();
      case "End":
        event.preventDefault();
        return event.ctrlKey || event.metaKey ? last() : lastInRow();
    }
  };

  return { up, down, right, left, firstInRow, lastInRow, first, last, onKeyDown };
}
