import type { JSX } from "@solidjs/web";
import { createEffect, createMemo, createSignal, merge, omit, untrack } from "solid-js";
import { createGridNavigation, type GridCell } from "../../internal";
import { composeEventHandlers, createKeyboardHandler } from "../../utils";
import type { CreateCalendarReturn } from "../root/calendar-root";
import { type ArrowDirection, arrowDelta, resolveViewArrowMove } from "../utils/navigation";

const ARROW_KEYS: Record<string, ArrowDirection> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

export interface CreateCalendarGridReturn {
  /** Spread onto the `<table role="grid">`. The component renders the rows/cells inside it. */
  props: JSX.HTMLAttributes<HTMLTableElement>;
}

/**
 * The view-agnostic grid engine on a `<table role="grid">`. Composes `createGridNavigation` (over the
 * calendar's shared `createListFocus` + `createCollection`) for roving focus + in-scope arrow roving
 * (RTL-aware, skip-disabled) + Home/End + mod+Home/End, and layers the calendar-specific keyboard on
 * top:
 *
 * - **Period-crossing** (the crux). On an arrow, `resolveViewArrowMove` computes the target date; if
 *   it stays in the visible scope, the grid's own coordinate roving handles it (day-by-day across
 *   weeks via `colWrap="continuous"`). If it **crosses** the visible month/year/decade, this
 *   intercepts *before* the grid sees it, re-targeting the cursor into the adjacent period
 *   (`setFocusedDate`, which flips the visible scope) — so the grid never itself crosses. Because the
 *   cursor is a single source of truth, there is no `event.target` disambiguation (unlike the Angular
 *   original's two same-element listeners).
 * - **`PageUp`/`PageDown`** page one period; **`Shift+PageUp`/`Down`** page ±1 year in month view
 *   (APG); **`Shift+Arrow`** extends a range (month view + range mode only). `Enter`/`Space` are the
 *   cell button's native activation — not handled here.
 * - **Deferred focus** replaces the Angular `afterNextRender` nudge: after a cross / page / drill, the
 *   target cell is focused once it mounts, via `createListFocus`'s built-in deferral. It is armed only
 *   by user navigation, never on the initial render (so the calendar doesn't steal focus on mount).
 */
export function createCalendarGrid(
  state: CreateCalendarReturn,
  props: JSX.HTMLAttributes<HTMLTableElement>,
): CreateCalendarGridReturn {
  const isRtl = () => state.direction() === "rtl";

  // Map each registered cell to its (row, col) coordinate from the current view's cell model.
  const gridCells = createMemo<GridCell<string>[]>(() => {
    const rows = state.cells();
    const posByKey = new Map<string, { row: number; col: number }>();
    rows.forEach((row, r) => {
      row.forEach((cell, c) => {
        posByKey.set(cell.key, { row: r, col: c });
      });
    });
    const out: GridCell<string>[] = [];
    for (const item of state.collection.items()) {
      const pos = posByKey.get(item.value());
      if (pos) out.push({ item, rowIndex: pos.row, colIndex: pos.col });
    }
    return out;
  });

  const grid = createGridNavigation<string>({
    focus: state.listFocus,
    cells: gridCells,
    rowWrap: () => "nowrap",
    // Day-by-day across weeks (and month-by-month across year rows). Crossing the whole scope is
    // intercepted below before this ever reaches a grid edge.
    colWrap: () => "continuous",
    textDirection: () => state.direction(),
  });

  // --- Deferred focus nudge ---
  // Armed by user navigation (cross / page / view change), then focuses the cell for the *settled*
  // cursor once it has rendered. `nudge` only arms a flag — it must NOT capture `focusedDate` now,
  // because the client build defers the `setFocusedDate` write, so the value isn't updated yet. The
  // effect reads `focusedDate` reactively (only while armed), so it re-runs as the write + re-render
  // settle, then focuses and disarms.
  const [pendingNudge, setPendingNudge] = createSignal(false);
  const nudge = () => setPendingNudge(true);
  createEffect(
    () => {
      if (!pendingNudge()) return undefined; // not armed → don't even track the cursor
      const key = state.focusedDate().toString();
      // Pick the *focusable* cell for this date. During a period cross the outgoing scope's trailing
      // outside cell shares the date key transiently — `!disabled()` skips it. Reading `element()`
      // here (tracked) re-runs this until the real cell has mounted + connected, so we never focus a
      // detaching node and then stop retrying.
      const item = state.collection
        .items()
        .find((candidate) => candidate.value() === key && !candidate.disabled());
      return item?.element()?.isConnected ? item : undefined;
    },
    (item) => {
      if (!item) return; // the target cell hasn't rendered/connected yet — a later run fires
      // `listFocus.focus` reads reactive state internally; this is a deliberate imperative move from
      // inside an effect callback, so it must be untracked.
      untrack(() => state.listFocus.focus(item));
      setPendingNudge(false);
    },
  );

  // A view change (drill up/down) re-lands focus on the re-normalized cell — skip the initial run.
  createEffect(
    () => state.view(),
    (_view, previous) => {
      if (previous !== undefined) nudge();
    },
  );

  // --- Keyboard beyond the grid's own keymap ---
  const pageYears = (event: KeyboardEvent, deltaYears: number) => {
    if (state.view() !== "month") return;
    event.preventDefault();
    state.navigate(deltaYears * 12);
    nudge();
  };
  const shiftArrow = (event: KeyboardEvent, direction: ArrowDirection) => {
    if (state.view() !== "month" || state.mode() !== "range") return;
    event.preventDefault();
    const target = state.focusedDate().add({ days: arrowDelta(direction, isRtl()) });
    if (state.isOutOfRange(target)) return;
    state.activate(target, { extend: true });
    nudge();
  };

  const keymap = createKeyboardHandler<HTMLTableElement>()
    .on("PageUp", (event) => {
      event.preventDefault();
      state.prev();
      nudge();
    })
    .on("PageDown", (event) => {
      event.preventDefault();
      state.next();
      nudge();
    })
    .on("shift+PageUp", (event) => pageYears(event, -1))
    .on("shift+PageDown", (event) => pageYears(event, 1))
    .on("shift+ArrowUp", (event) => shiftArrow(event, "up"))
    .on("shift+ArrowDown", (event) => shiftArrow(event, "down"))
    .on("shift+ArrowLeft", (event) => shiftArrow(event, "left"))
    .on("shift+ArrowRight", (event) => shiftArrow(event, "right"));

  const handleKeyDown: JSX.EventHandler<HTMLTableElement, KeyboardEvent> = (event) => {
    const direction = ARROW_KEYS[event.key];
    if (direction && !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const { target, crosses } = resolveViewArrowMove(
        state.view(),
        state.focusedDate(),
        state.visibleMonth(),
        direction,
        isRtl(),
      );
      if (crosses) {
        event.preventDefault();
        if (!state.isCellOutOfRange(target)) {
          state.setFocusedDate(target);
          nudge();
        }
        return;
      }
      grid.onKeyDown(event); // in-scope roving (it preventDefaults matched keys itself)
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      grid.onKeyDown(event);
      return;
    }
    keymap.onKeyDown(event);
  };

  const rest = omit(props, "onKeyDown", "onPointerLeave");
  const elementProps = merge(rest, {
    role: "grid" as const,
    get "aria-labelledby"() {
      return state.headingId();
    },
    get "data-view"() {
      return state.view();
    },
    get tabindex() {
      return state.listFocus.getListTabIndex();
    },
    get onKeyDown() {
      return composeEventHandlers<HTMLTableElement, KeyboardEvent>(props.onKeyDown, handleKeyDown);
    },
    get onPointerLeave() {
      return composeEventHandlers<HTMLTableElement, PointerEvent>(props.onPointerLeave, () =>
        state.highlightDate(null),
      );
    },
  });

  return { props: elementProps };
}
