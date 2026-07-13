import type { CalendarDate } from "@internationalized/date";
import type { JSX } from "@solidjs/web";
import { type Accessor, createMemo, createSignal, untrack } from "solid-js";
import type { CreateCalendarReturn } from "../root/calendar-root";

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
  /** Inside the range hover-preview band (range mode). */
  readonly isPreview: boolean;
  /** The roving cursor is on this cell. */
  readonly isFocused: boolean;
  /** `isDateDisabled` hit — focusable + announced, but not selectable. */
  readonly isUnavailable: boolean;
  /** The dimmed/blocked look (unavailable or a whole out-of-range period). */
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
 * The `<td>` carries the `data-*` paint hooks + `aria-selected`; the `<button>` carries the view-aware
 * `aria-label` (with Today / selected / range / unavailable suffixes) and `aria-disabled` for
 * unavailable days. The tab stop is the focused cell (`tabindex` from `isFocused`), which is correct on
 * the server too (it compares dates, and doesn't depend on the client-only collection).
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
  const isPreview = () => state.isInPreviewRange(date());
  const isUnavailable = () => state.isDateUnavailable(date());
  const isDisabledPaint = () => isUnavailable() || state.isCellOutOfRange(date());

  const dayState = createMemo<CalendarDayState>(() => ({
    date: date(),
    label: label(),
    isToday: isToday(),
    isOutside: isOutside(),
    isSelected: isSelected(),
    isRangeStart: isRangeStart(),
    isRangeMiddle: isRangeMiddle(),
    isRangeEnd: isRangeEnd(),
    isPreview: isPreview(),
    isFocused: isFocused(),
    isUnavailable: isUnavailable(),
    isDisabled: isDisabledPaint(),
  }));

  const ariaLabel = () => {
    const messages = state.messages();
    const parts = [state.formatCellName(date())];
    if (isToday()) parts.push(messages.today);
    if (isRangeStart() && isRangeEnd())
      parts.push(messages.selected); // single-day range
    else if (isRangeStart()) parts.push(messages.rangeStart);
    else if (isRangeEnd()) parts.push(messages.rangeEnd);
    else if (isSelected()) parts.push(messages.selected);
    if (isUnavailable()) parts.push(messages.unavailable);
    return parts.join(", ");
  };

  const onMouseDown: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (event) => {
    // A roving `tabindex` can leave an inert cell click-focusable; block that native focus so a click
    // can't land on — or cross into — an outside/out-of-range day.
    if (state.isDateNonFocusable(date())) event.preventDefault();
  };
  const onClick: JSX.EventHandler<HTMLButtonElement, MouseEvent> = (event) => {
    event.preventDefault();
    if (state.isDateNonFocusable(date())) return; // inert — never activates, even via a forced click
    state.activate(date());
  };
  const onMouseEnter: JSX.EventHandler<HTMLButtonElement, MouseEvent> = () => {
    state.setPreviewDate(date());
  };
  const onFocus: JSX.EventHandler<HTMLButtonElement, FocusEvent> = () => {
    // `createListFocus` moves DOM focus from inside its own effect (`element.focus()`), which fires
    // this synchronously — so the reads here would run in that effect's tracking scope. This is an
    // imperative sync with real focus, never a dependency, so untrack the whole body.
    untrack(() => {
      if (state.isDateNonFocusable(date())) return;
      state.setFocusedDate(date()); // keep the roving cursor synced with real focus
    });
  };

  // Not annotated as `JSX.HTMLAttributes` inline: the `data-*` keys would trip the excess-property
  // check on a fresh literal. As a variable it assigns structurally to the return type below.
  const props = {
    role: "gridcell" as const,
    get "aria-selected"() {
      return isSelected() ? "true" : undefined;
    },
    get "data-today"() {
      return isToday() ? "" : undefined;
    },
    get "data-outside"() {
      return isOutside() ? "" : undefined;
    },
    get "data-disabled"() {
      return isDisabledPaint() ? "" : undefined;
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
    get "data-preview"() {
      return isPreview() ? "" : undefined;
    },
    get "data-focused"() {
      return isFocused() ? "" : undefined;
    },
  };

  const triggerProps: JSX.ButtonHTMLAttributes<HTMLButtonElement> = {
    type: "button",
    get tabindex() {
      return isFocused() ? 0 : -1;
    },
    get "aria-label"() {
      return ariaLabel();
    },
    get "aria-disabled"() {
      return isUnavailable() ? "true" : undefined;
    },
    onMouseDown,
    onMouseEnter,
    onClick,
    onFocus,
  };

  return { props, triggerProps, setTriggerRef, dayState };
}
