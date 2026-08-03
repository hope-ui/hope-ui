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
   * {@link isUnavailable}, which stays interactive — the split comes from React Aria, Adobe's
   * headless accessibility hook library and this family's main reference. */
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
 * non-focusable, so the grid's arrows skip it), and owns activation, the roving-cursor sync, and the
 * inert-cell guards:
 *
 * - `createPress` → `activate` (plus the keyboard-only range auto-advance), inert while non-focusable.
 * - `onMouseDown` prevents native click-focus landing on an inert cell.
 * - `onFocus` syncs the roving cursor (`setFocusedDate`), guarded off inert cells.
 * - `onMouseEnter` moves the range preview (`highlightDate` — the roving cursor), guarded off cells the
 *   range could not end on.
 *
 * **Why the attributes are emitted twice.** The theme's day-state variants are self-based
 * (`&:where([data-selected])`), so an attribute only styles the element carrying it. The `<td>` gets
 * the ARIA grid semantics plus the band flags, so the `cell` slot can paint a band spanning several
 * cells; the inner `<button>` gets the full per-day set, so the `cellTrigger` slot paints the endpoint
 * pills and marks on top of it. Hence `data-selected`/`data-selection-start`/`data-selection-end` and
 * `aria-disabled` on both. Full attribute table:
 * `__internal__/primitives/calendar/calendar-cell.md` § Attributes.
 *
 * There is no "middle" attribute — a recipe derives it as
 * `[data-selected]:not([data-selection-start]):not([data-selection-end])`, which is unambiguous
 * because range mode paints exactly one band (tentative while anchored, committed when idle).
 */
export function createCalendarCell(
  state: CreateCalendarReturn,
  options: CreateCalendarCellOptions,
): CreateCalendarCellReturn {
  const date = options.date;
  const label = () => options.label?.() ?? "";
  const isOutside = () => options.isOutside?.() ?? false;

  const [triggerRef, setTriggerRef] = createSignal<HTMLButtonElement>();
  // The returned handle is deliberately dropped: the tab stop is derived from `isFocused` (which works
  // on the server, where nothing has registered yet), and the grid finds cells by their date value.
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
  // `data-disabled` and `data-unavailable` are independent, not exclusive: a day that is unavailable
  // *and* outside `[min, max]` carries both (struck **and** dimmed). That combination is routine, not a
  // corner case — a contiguous range narrows the bounds to the anchor's available run, so the
  // unavailable day bounding that run carries both for as long as the range is in progress. A recipe
  // has to make them readable together rather than assume one excludes the other.
  const isDisabled = () => state.isCellDisabled(date());
  // The gate behind `aria-disabled` and the hover preview. The roving tab stop is gated on
  // `isNonFocusable` instead, one notch looser: an unavailable day is still reachable by keyboard.
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
  // Activation goes through the shared press engine rather than a raw `onClick` because the *pointer
  // type* gates the keyboard auto-advance below, and a click event alone cannot supply it: a screen
  // reader's virtual click carries `detail === 0` exactly as Enter does, so discriminating on `detail`
  // would silently hand assistive-technology users the sighted-keyboard behavior.
  //
  // Two things not to "restore" here — both in `calendar-cell.md` § Rejected alternatives. `disabled`
  // replaces the old inline guard (`createPress` short-circuits every interaction while it is true,
  // forced clicks included), and there is deliberately no `preventDefault()`: a `<button
  // type="button">` has no default click action, and `defaultPrevented` is how `createPress` is
  // cancelled, so calling it would cancel every activation.
  const press = createPress<HTMLButtonElement>({
    ref: triggerRef,
    nativeButton: () => true,
    disabled: isNonFocusable,
    onPress: (event) => {
      // "A range began" has to come from `activate`'s return value. Reading `anchorDate()` after the
      // call would not work — a Solid 2.0 signal write is invisible to a plain read until the next
      // flush — and reading it *before* is not the same question: `createCalendar` serves all three
      // selection modes from one hook, so single/multiple, a refused day and a year/decade drill all
      // pass an "anchor was null" test without any range having begun.
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
    // this handler synchronously — so a plain read here would register as a dependency of that effect.
    // Every read below is an imperative sync with real focus, never a dependency, so untrack the body.
    untrack(() => {
      if (isNonFocusable()) {
        return;
      }
      state.setFocusedDate(date());
    });
  };

  // The `<td role="gridcell">`: ARIA grid semantics plus the band flags the `cell` slot paints. Not
  // annotated `JSX.*` inline — TypeScript's excess-property check rejects `data-*` keys on a fresh
  // object literal, but assigns this variable to the return type structurally.
  const props = {
    role: "gridcell" as const,
    get "aria-selected"() {
      return isSelected() ? "true" : undefined;
    },
    // Mirrored onto the button below, so the state is readable whether assistive technology lands on
    // the grid cell or on its inner control.
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

  // The inner `<button>` — the roving focus target AND the painted element, so it carries the full
  // `data-*` day-state set as well as the `<td>`'s share of it. Same reason the annotation is omitted
  // as on `props` above.
  const triggerProps = {
    type: "button" as const,
    get tabindex() {
      // The tab stop is the focused cell — but never a cell the arrows skip, or Tab lands the user on
      // a dead cell (a whole-calendar `disabled` would otherwise still leave one tabbable).
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
