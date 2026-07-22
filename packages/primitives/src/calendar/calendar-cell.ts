import type { CalendarDate } from "@internationalized/date";
import type { JSX } from "@solidjs/web";
import { type Accessor, createMemo, createSignal, untrack } from "solid-js";
import type { CreateCalendarReturn } from "./calendar-root";

/**
 * The per-cell state a custom cell body branches on (the primitives-layer render seam) — the same
 * flags the default cell paints with, so a custom body can mirror the default look exactly.
 */
export interface CalendarDayState {
  /** The date this cell represents. */
  readonly date: CalendarDate;
  /** The localized, view-aware short label (day number / month name / year). */
  readonly label: string;
  /** Today (view-aware: today's day / month / year). */
  readonly isToday: boolean;
  /** A leading/trailing filler cell outside the visible scope. */
  readonly isOutside: boolean;
  /** Part of the committed selection (any mode). */
  readonly isSelected: boolean;
  readonly isRangeStart: boolean;
  readonly isRangeMiddle: boolean;
  readonly isRangeEnd: boolean;
  /** Inside the tentative hover-range band while a range selection is in progress (range mode). */
  readonly isHighlighted: boolean;
  /** The roving cursor is on this cell. */
  readonly isFocused: boolean;
  /** `isDateDisabled` hit — focusable + announced, but not selectable (painted `data-unavailable`). */
  readonly isUnavailable: boolean;
  /** A whole out-of-range period — inert (not focusable, not selectable), painted `data-disabled`.
   * Distinct from {@link isUnavailable} (React-Aria's split): an unavailable day stays interactive. */
  readonly isDisabled: boolean;
}

export interface CreateCalendarCellOptions {
  /** The date this cell represents. */
  date: Accessor<CalendarDate>;
  /** The visible short label (day number / month / year). */
  label?: Accessor<string>;
  /** Whether this is a leading/trailing filler cell outside the visible scope. */
  isOutside?: Accessor<boolean>;
}

export interface CreateCalendarCellReturn {
  /** Spread onto the `<td role="gridcell">` — the paint hooks + `aria-selected`. */
  props: JSX.HTMLAttributes<HTMLTableCellElement>;
  /** Spread onto the inner `<button>` — the roving focus target + interaction. */
  triggerProps: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  /** Ref callback for the inner `<button>` (the registered focus element). */
  setTriggerRef: (element: HTMLButtonElement) => void;
  /** The per-cell state, for a custom cell body. */
  dayState: Accessor<CalendarDayState>;
}

/**
 * A single calendar cell: a `<td role="gridcell">` wrapping the inner `<button>` that is the roving
 * focus target. Registers its date into the calendar's shared collection (`disabled` when the date is
 * non-focusable, so the grid skips it), and owns activation + the roving-cursor sync + the inert-cell
 * guards:
 *
 * - `onClick` (which native `Enter`/`Space`/pointer all fire) → `activate`, refused on an inert cell.
 * - `onMouseDown` prevents native click-focus landing on an inert cell.
 * - `onFocus` syncs the roving cursor (`setFocusedDate`), guarded off inert cells.
 * - `onMouseEnter` feeds the range hover preview.
 *
 * The registered day-state custom variants are self-based (`&:where([data-range-middle])`), so an
 * attribute only lights a utility on the element that carries it. That splits the paint across the two
 * elements: the `<td>` carries the ARIA grid semantics (`role="gridcell"` + `aria-selected`) **and**
 * the band-level range/tentative-highlight hooks, so the `cell` slot paints the continuous range band
 * that spans cells; the inner `<button>` carries the full per-day set (plus `aria-label`,
 * `aria-disabled`, roving `tabindex`, `data-focused`), so the `cellTrigger` slot paints the solid
 * endpoint pills and marks on top of that band. The shared range flags are therefore emitted on both.
 * The tab stop is the focused cell (`tabindex` from `isFocused`), correct on the server too (it
 * compares dates, and doesn't depend on the client-only collection).
 */
export function createCalendarCell(
  state: CreateCalendarReturn,
  options: CreateCalendarCellOptions,
): CreateCalendarCellReturn {
  const date = options.date;
  const label = () => options.label?.() ?? "";
  const isOutside = () => options.isOutside?.() ?? false;

  const [triggerRef, setTriggerRef] = createSignal<HTMLButtonElement>();
  // Register the inner button into the shared collection (for grid roving + DOM focus). The returned
  // handle isn't needed here: the tab stop is derived from `isFocused` (SSR-correct), and the grid
  // finds cells by their date value.
  state.collection.register({
    ref: triggerRef,
    value: () => date().toString(),
    disabled: () => state.isDateNonFocusable(date()),
  });

  const isToday = () => state.isToday(date());
  const isFocused = () => state.isFocused(date());
  const isSelected = () => state.isSelected(date());
  const isRangeStart = () => state.isRangeStart(date());
  const isRangeMiddle = () => state.isRangeMiddle(date());
  const isRangeEnd = () => state.isRangeEnd(date());
  const isHighlighted = () => state.isHighlighted(date());
  const isUnavailable = () => state.isDateUnavailable(date());
  // `data-disabled` marks only the truly-inert out-of-range days (dim + no pointer). Unavailable days
  // are painted separately (`data-unavailable`) and stay interactive — React-Aria's isDisabled vs
  // isUnavailable split — so the two never double-apply (a struck-out day is not also dimmed).
  const isDisabled = () => state.isCellOutOfRange(date());

  const dayState = createMemo<CalendarDayState>(() => ({
    date: date(),
    label: label(),
    isToday: isToday(),
    isOutside: isOutside(),
    isSelected: isSelected(),
    isRangeStart: isRangeStart(),
    isRangeMiddle: isRangeMiddle(),
    isRangeEnd: isRangeEnd(),
    isHighlighted: isHighlighted(),
    isFocused: isFocused(),
    isUnavailable: isUnavailable(),
    isDisabled: isDisabled(),
  }));

  const ariaLabel = () => {
    const t = state.t;
    const parts = [state.formatCellName(date())];
    if (isToday()) {
      parts.push(t("calendar.today"));
    }
    if (isRangeStart() && isRangeEnd()) {
      parts.push(t("calendar.selected")); // single-day range
    } else if (isRangeStart()) {
      parts.push(t("calendar.rangeStart"));
    } else if (isRangeEnd()) {
      parts.push(t("calendar.rangeEnd"));
    } else if (isSelected()) {
      parts.push(t("calendar.selected"));
    }
    if (isUnavailable()) {
      parts.push(t("calendar.unavailable"));
    }
    return parts.join(", ");
  };

  const onMouseDown: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (event) => {
    // A roving `tabindex` can leave an inert cell click-focusable; block that native focus so a click
    // can't land on — or cross into — an outside/out-of-range day.
    if (state.isDateNonFocusable(date())) {
      event.preventDefault();
    }
  };
  const onClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (event) => {
    event.preventDefault();
    if (state.isDateNonFocusable(date())) {
      return; // inert — never activates, even via a forced click
    }
    state.activate(date());
  };
  const onMouseEnter: JSX.EventHandler<HTMLButtonElement, MouseEvent> = () => {
    state.highlightDate(date());
  };
  const onFocus: JSX.EventHandler<HTMLButtonElement, FocusEvent> = () => {
    // `createListFocus` moves DOM focus from inside its own effect (`element.focus()`), which fires
    // this synchronously — so the reads here would run in that effect's tracking scope. This is an
    // imperative sync with real focus, never a dependency, so untrack the whole body.
    untrack(() => {
      if (state.isDateNonFocusable(date())) {
        return;
      }
      state.setFocusedDate(date()); // keep the roving cursor synced with real focus
    });
  };

  // The `<td role="gridcell">` — ARIA grid semantics + the band-level range/highlight hooks the `cell`
  // slot paints (the continuous band that spans cells). `aria-selected` is the ARIA selection state;
  // the solid endpoint pills + per-day marks are painted on the button below, above the band. Not
  // annotated `JSX.*` inline: the `data-*` keys would trip the excess-property check on a fresh literal.
  const props = {
    role: "gridcell" as const,
    get "aria-selected"() {
      return isSelected() ? "true" : undefined;
    },
    get "data-range-start"() {
      return isRangeStart() ? "" : undefined;
    },
    get "data-range-middle"() {
      return isRangeMiddle() ? "" : undefined;
    },
    get "data-range-end"() {
      return isRangeEnd() ? "" : undefined;
    },
    get "data-highlighted"() {
      return isHighlighted() ? "" : undefined;
    },
  };

  // The inner `<button>` — the roving focus target AND the painted element. It carries the view-aware
  // `aria-label` / `aria-disabled` / `tabindex` plus every `data-*` day-state hook, so a recipe styling
  // `cellTrigger` (the button) sees them — the registered custom variants are self-based, so a hook on
  // the `<td>` would never fire a `data-*:` utility on the button. Not annotated as `JSX.*` inline: the
  // `data-*` keys would trip the excess-property check on a fresh literal; as a variable it assigns
  // structurally to the return type below.
  const triggerProps = {
    type: "button" as const,
    get tabindex() {
      return isFocused() ? 0 : -1;
    },
    get "aria-label"() {
      return ariaLabel();
    },
    get "aria-disabled"() {
      return isUnavailable() ? "true" : undefined;
    },
    get "data-today"() {
      return isToday() ? "" : undefined;
    },
    get "data-outside-month"() {
      return isOutside() ? "" : undefined;
    },
    get "data-unavailable"() {
      return isUnavailable() ? "" : undefined;
    },
    get "data-disabled"() {
      return isDisabled() ? "" : undefined;
    },
    get "data-selected"() {
      return isSelected() ? "" : undefined;
    },
    get "data-range-start"() {
      return isRangeStart() ? "" : undefined;
    },
    get "data-range-middle"() {
      return isRangeMiddle() ? "" : undefined;
    },
    get "data-range-end"() {
      return isRangeEnd() ? "" : undefined;
    },
    get "data-highlighted"() {
      return isHighlighted() ? "" : undefined;
    },
    get "data-focused"() {
      return isFocused() ? "" : undefined;
    },
    onMouseDown,
    onMouseEnter,
    onClick,
    onFocus,
  };

  return { props, triggerProps, setTriggerRef, dayState };
}
