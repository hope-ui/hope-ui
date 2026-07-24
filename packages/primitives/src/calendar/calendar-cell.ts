import type { CalendarDate } from "@internationalized/date";
import type { JSX } from "@solidjs/web";
import { type Accessor, createMemo, createSignal, untrack } from "solid-js";
import { createPress } from "../internal";
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
  /**
   * Inside the painted band (any mode). In range mode that band is tentative while a selection is in
   * progress (anchor → roving cursor) and committed when it is not — one band, so there is no separate
   * "highlighted" flag. A "middle" cell is `isSelected && !isSelectionStart && !isSelectionEnd`.
   */
  readonly isSelected: boolean;
  /** Holds the band's start endpoint. Both endpoints are true on a one-day band. */
  readonly isSelectionStart: boolean;
  /** Holds the band's end endpoint. */
  readonly isSelectionEnd: boolean;
  /** The roving cursor is on this cell. */
  readonly isFocused: boolean;
  /** `isDateDisabled` hit — focusable + announced, but not selectable (painted `data-unavailable`). */
  readonly isUnavailable: boolean;
  /** The calendar makes this cell inert — a whole out-of-range period, or the whole calendar
   * `disabled`. Not focusable, not selectable, painted `data-disabled`. Distinct from
   * {@link isUnavailable} (React-Aria's split): an unavailable day stays interactive. */
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
 * - `createPress` → `activate` (plus the keyboard-only range auto-advance), inert while non-focusable.
 * - `onMouseDown` prevents native click-focus landing on an inert cell.
 * - `onFocus` syncs the roving cursor (`setFocusedDate`), guarded off inert cells.
 * - `onMouseEnter` moves the range preview (`highlightDate` — the roving cursor), guarded off cells the
 *   range could not end on.
 *
 * The registered day-state custom variants are self-based (`&:where([data-selected])`), so an
 * attribute only lights a utility on the element that carries it. That splits the paint across the two
 * elements: the `<td>` carries the ARIA grid semantics (`role="gridcell"` + `aria-selected` +
 * `aria-disabled`) **and** the band hooks, so the `cell` slot paints the continuous band that spans
 * cells; the inner `<button>` carries the full per-day set (plus `aria-label`, roving `tabindex`,
 * `data-focused`, `data-pressed`), so the `cellTrigger` slot paints the solid endpoint pills and marks
 * on top of that band. The shared band flags — and `aria-disabled`, which React Aria mirrors — are
 * therefore emitted on both. The tab stop is the focused *focusable* cell, correct on the server too
 * (both halves compare dates, and neither depends on the client-only collection).
 *
 * The band vocabulary is React Aria's: `data-selected` + `data-selection-start` + `data-selection-end`,
 * with no middle attribute — a recipe derives the middle in CSS
 * (`[data-selected]:not([data-selection-start]):not([data-selection-end])`). Range mode paints exactly
 * one band, tentative while anchored and committed when idle, so nothing needs disambiguating.
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
  const isSelectionStart = () => state.isSelectionStart(date());
  const isSelectionEnd = () => state.isSelectionEnd(date());
  const isUnavailable = () => state.isDateUnavailable(date());
  const isNonFocusable = () => state.isDateNonFocusable(date());
  // `data-disabled` marks only the truly-inert days — out-of-range, or the whole calendar disabled
  // (dim + no pointer). Unavailable days are painted separately (`data-unavailable`) and stay
  // interactive — React-Aria's isDisabled vs isUnavailable split.
  //
  // The two are independent, not exclusive: an unavailable day the bounds also put out of range
  // carries both (struck *and* dimmed). That is any unavailable day outside `[min, max]`, and — since
  // a contiguous range narrows the bounds to the anchor's available run — routinely the unavailable
  // day that bounds the run, for as long as the range is in progress. A recipe must therefore make the
  // two readable together rather than assume one excludes the other.
  const isDisabled = () => state.isCellDisabled(date());
  // React Aria's `isSelectable` — the gate behind `aria-disabled` and the hover preview. A day is
  // selectable when the calendar neither makes it inert nor marks it unavailable. The roving tab stop
  // is gated on `isNonFocusable` instead, one notch looser: an unavailable day is still reachable.
  const isSelectable = () => !isNonFocusable() && !isUnavailable();

  const dayState = createMemo<CalendarDayState>(() => ({
    date: date(),
    label: label(),
    isToday: isToday(),
    isOutside: isOutside(),
    isSelected: isSelected(),
    isSelectionStart: isSelectionStart(),
    isSelectionEnd: isSelectionEnd(),
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
    if (isSelectionStart() && isSelectionEnd()) {
      parts.push(t("calendar.selected")); // single-day band
    } else if (isSelectionStart()) {
      parts.push(t("calendar.rangeStart"));
    } else if (isSelectionEnd()) {
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
    // can't land on — or cross into — an outside/out-of-range/disabled day.
    if (isNonFocusable()) {
      event.preventDefault();
    }
  };
  // Activation goes through the shared press engine rather than a raw `onClick`, because the *pointer
  // type* is what gates the keyboard auto-advance below — and that cannot be recovered from the click
  // event alone. A screen reader's virtual click carries `detail === 0` exactly as Enter does, and
  // React Aria deliberately routes it down a different branch (select, but do **not** move the cursor);
  // gating on `detail` would have silently given AT users the sighted-keyboard behavior. See the
  // porting rule in `__internal__/reference-implementations.md`.
  //
  // `disabled` carries the old inline guard: `createPress` short-circuits every interaction — including
  // the click — while it is true, so an inert cell still never activates via a forced click. The
  // previous handler's unconditional `preventDefault()` is deliberately gone: a `<button type="button">`
  // has no default click action to suppress, and `defaultPrevented` is `createPress`'s cancel channel,
  // so keeping it would have cancelled every activation.
  const press = createPress<HTMLButtonElement>({
    ref: triggerRef,
    nativeButton: () => true,
    disabled: isNonFocusable,
    onPress: (event) => {
      // React Aria gates the advance on `!state.anchorDate` read *before* selecting. Ours takes the
      // fact from `activate` itself, for two reasons: `createCalendar` is one hook for all three
      // selection modes where RA has a separate range state object (so "there was no anchor" is not
      // the same as "a range began" — single/multiple, a refused day, and a year/decade drill all
      // clear that first bar), and re-reading `anchorDate()` afterwards would not work anyway, since a
      // solid-js 2.0 signal write is invisible to a plain read until the next flush.
      const beganRange = state.activate(date());
      if (event.pointerType === "keyboard" && beganRange) {
        state.focusNearestAvailableDate(date());
      }
    },
  });

  const onMouseEnter: JSX.EventHandler<HTMLButtonElement, MouseEvent> = () => {
    // Only a day the range could actually end on may move the tentative band. Without this gate,
    // hovering an outside-month or unavailable day would preview a range that the matching click
    // refuses to commit — and, since the band now rides the roving cursor, would strand the tab stop
    // on an inert cell.
    if (!isSelectable()) {
      return;
    }
    state.highlightDate(date());
  };
  const onFocus: JSX.EventHandler<HTMLButtonElement, FocusEvent> = () => {
    // `createListFocus` moves DOM focus from inside its own effect (`element.focus()`), which fires
    // this synchronously — so the reads here would run in that effect's tracking scope. This is an
    // imperative sync with real focus, never a dependency, so untrack the whole body.
    untrack(() => {
      if (isNonFocusable()) {
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
    // Mirrored onto the button below: React Aria puts `!isSelectable` on both, so the state is
    // readable whether an assistive technology lands on the grid cell or on its inner control.
    get "aria-disabled"() {
      return isSelectable() ? undefined : "true";
    },
    get "data-selected"() {
      return isSelected() ? "" : undefined;
    },
    get "data-selection-start"() {
      return isSelectionStart() ? "" : undefined;
    },
    get "data-selection-end"() {
      return isSelectionEnd() ? "" : undefined;
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
      // The tab stop is the focused cell — but never a cell the arrows skip, or the roving stop
      // strands on a dead cell (a whole-calendar `disabled` would otherwise leave one tabbable).
      return isFocused() && !isNonFocusable() ? 0 : -1;
    },
    get "aria-label"() {
      return ariaLabel();
    },
    get "aria-disabled"() {
      return isSelectable() ? undefined : "true";
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
    get "data-selection-start"() {
      return isSelectionStart() ? "" : undefined;
    },
    get "data-selection-end"() {
      return isSelectionEnd() ? "" : undefined;
    },
    get "data-focused"() {
      return isFocused() ? "" : undefined;
    },
    get "data-pressed"() {
      return press.isPressed() ? "" : undefined;
    },
    ...press.pressProps,
    onMouseDown,
    onMouseEnter,
    onFocus,
  };

  return { props, triggerProps, setTriggerRef, dayState };
}
