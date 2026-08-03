import type { JSX } from "@solidjs/web";
import { createEffect, createMemo, merge, omit, untrack } from "solid-js";
import { createGridNavigation, type GridCell } from "../internal";
import { composeEventHandlers, createKeyboardHandler } from "../utils";
import type { CreateCalendarReturn } from "./calendar-root";
import { firstSelectableDateFrom } from "./utils/boundary";
import { type ArrowDirection, arrowDelta, resolveViewArrowMove } from "./utils/navigation";

const ARROW_KEYS: Record<string, ArrowDirection> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
};

export interface CreateCalendarGridReturn {
  /** Spread onto the `<table role="grid">`. The component renders the rows/cells inside it. */
  props: JSX.HTMLAttributes<HTMLTableElement>;
  /** Spread onto the weekday `<thead>`. `aria-hidden`: every cell's `aria-label` already names its
   * weekday, so an exposed column header makes a screen reader announce it twice. */
  headerProps: JSX.HTMLAttributes<HTMLTableSectionElement>;
}

/**
 * The view-agnostic grid engine on a `<table role="grid">`. It composes `createGridNavigation` — which
 * already handles roving focus, arrow movement inside the visible grid (RTL-aware, skipping disabled
 * cells), Home/End and mod+Home/End — and layers the calendar-specific keyboard on top:
 *
 * - **Period-crossing**, the crux. On an arrow, `resolveViewArrowMove` computes the target date. If it
 *   stays inside the visible month/year/decade, `createGridNavigation` handles it. If it **crosses**,
 *   this intercepts *before* the grid sees the event and moves the cursor into the adjacent period
 *   with `setFocusedDate`, which pulls the visible scope along — so the grid itself never crosses.
 * - **`PageUp`/`PageDown`** page one period; **`Shift+PageUp`/`Down`** page ±1 year in month view;
 *   **`Shift+Arrow`** extends a range (month view + range mode only); **`Escape`** cancels a range in
 *   progress, consuming the key only when there was one to cancel. `Enter`/`Space` are the cell
 *   button's native activation and are not handled here.
 * - **Deferred focus**: after a cross / page / drill the target cell does not exist yet, so focusing it
 *   waits until it mounts. Armed only by user navigation, never on the initial render, so a calendar
 *   never steals focus on mount.
 *
 * It also owns the grid's ARIA state and `headerProps` for the weekday `<thead>`. Keyboard table:
 * `__internal__/primitives/calendar/calendar-grid.md` § Keyboard.
 */
export function createCalendarGrid(
  state: CreateCalendarReturn,
  props: JSX.HTMLAttributes<HTMLTableElement>,
): CreateCalendarGridReturn {
  const isRtl = () => state.direction() === "rtl";

  // Give each registered cell the (row, col) coordinate the current view's cell model puts it at —
  // what `createGridNavigation` needs to turn an arrow key into a neighbouring cell.
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
      if (pos) {
        out.push({ item, rowIndex: pos.row, colIndex: pos.col });
      }
    }
    return out;
  });

  const grid = createGridNavigation<string>({
    focus: state.listFocus,
    cells: gridCells,
    rowWrap: () => "nowrap",
    // `"continuous"` = running off the end of a row continues on the next one, so the arrows move
    // day-by-day across week boundaries. Leaving the grid entirely is intercepted below.
    colWrap: () => "continuous",
    textDirection: () => state.direction(),
  });

  // --- Deferred focus nudge ---
  // `nudge` deliberately only raises a flag. It must NOT capture `focusedDate`: a Solid 2.0 signal
  // write is invisible to a plain read until the next flush, so the caller's `setFocusedDate` has not
  // landed yet. The effect below reads `focusedDate` reactively instead — and only while armed — so it
  // re-runs as the write and the re-render settle, then focuses the cell and disarms.
  //
  // The flag lives on the root state rather than here because a *cell* arms it too (the keyboard range
  // auto-advance) and has no reference to this hook.
  const nudge = () => state.setPendingCursorFocus(true);
  createEffect(
    () => {
      if (!state.pendingCursorFocus()) {
        return undefined; // not armed → don't even track the cursor
      }
      const key = state.focusedDate().toString();
      // Two cells can hold this date at once: mid-cross, the outgoing month's trailing filler cell
      // shares the key with the incoming month's real one, and `!disabled()` is what picks the real
      // one. Reading `element()` inside the tracked compute makes this re-run until that cell has
      // mounted and connected, so a detaching node is never focused and the retry never gives up.
      const item = state.collection
        .items()
        .find((candidate) => candidate.value() === key && !candidate.disabled());
      return item?.element()?.isConnected ? item : undefined;
    },
    (item) => {
      if (!item) {
        return; // the target cell hasn't rendered/connected yet — a later run fires
      }
      // `listFocus.focus` reads reactive state internally, and this is a one-off imperative move, not
      // a dependency — untracked so those reads don't re-subscribe this effect.
      untrack(() => state.listFocus.focus(item));
      state.setPendingCursorFocus(false);
    },
  );

  // A view change (drill up/down) re-lands focus on the re-normalized cell. The `previous === undefined`
  // test skips the initial run, so mounting a calendar never steals focus.
  createEffect(
    () => state.view(),
    (_view, previous) => {
      if (previous !== undefined) {
        nudge();
      }
    },
  );

  // --- Keyboard beyond the grid's own keymap ---
  const pageYears = (event: KeyboardEvent, deltaYears: number) => {
    if (state.view() !== "month") {
      return;
    }
    event.preventDefault();
    state.navigate(deltaYears * 12);
    nudge();
  };
  const shiftArrow = (event: KeyboardEvent, direction: ArrowDirection) => {
    if (state.view() !== "month" || state.mode() !== "range") {
      return;
    }
    event.preventDefault();
    const delta = arrowDelta(direction, isRtl());
    const step = state.focusedDate().add({ days: delta });
    // Land on a day the range can actually end on. Stepping *past* an unavailable day is only sound
    // when the range is allowed to contain one; a contiguous range would have to swallow every day it
    // skipped, so it stops at the edge of the anchor's available run instead. Both cases fall out of
    // the one predicate, because the narrowed bounds already report anything past that edge as
    // unselectable.
    const target = state.allowsNonContiguousRanges()
      ? firstSelectableDateFrom(step, delta > 0 ? 1 : -1, state.isDateSelectable)
      : step;
    if (target === undefined || !state.isDateSelectable(target)) {
      return;
    }
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
    .on("shift+ArrowRight", (event) => shiftArrow(event, "right"))
    // Always a cancel, never the calendar's `commitBehavior`: that policy is for *walking away*, where
    // Escape is an explicit refusal. With nothing to cancel the event is left entirely alone, so Escape
    // still reaches an enclosing popover/dialog; with a range in progress, propagation stops so the
    // same keypress doesn't also close the surface the user is still selecting in.
    .on("Escape", (event) => {
      if (state.anchorDate() === null) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      state.clearAnchor();
    });

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
      grid.onKeyDown(event); // stays in scope — it calls `preventDefault()` on the keys it handles
      return;
    }
    if (event.key === "Home" || event.key === "End") {
      grid.onKeyDown(event);
      return;
    }
    keymap.onKeyDown(event);
  };

  // Deliberately no `onPointerLeave`: the tentative band is derived from the roving cursor, so it has
  // to survive the pointer leaving the grid — clearing it there would erase a band the anchor owns.
  const rest = omit(props, "onKeyDown");
  const elementProps = merge(rest, {
    role: "grid" as const,
    get "aria-labelledby"() {
      return state.headingId();
    },
    // Emitted only when true — each of these defaults to false in ARIA, so `"false"` would be noise.
    // `aria-multiselectable` covers both non-single modes: a range and a multiple-date calendar are
    // equally "more than one cell may be selected".
    get "aria-readonly"() {
      return state.readOnly() ? "true" : undefined;
    },
    get "aria-disabled"() {
      return state.disabled() ? "true" : undefined;
    },
    get "aria-multiselectable"() {
      return state.mode() !== "single" ? "true" : undefined;
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
  });

  return { props: elementProps, headerProps: { "aria-hidden": "true" } };
}
