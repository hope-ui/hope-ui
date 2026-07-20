import {
  type CalendarDate,
  getLocalTimeZone,
  isSameDay,
  isSameMonth,
  startOfMonth,
  today,
} from "@internationalized/date";
import { createAnnounce } from "@solid-primitives/a11y";
import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  untrack,
} from "solid-js";
import { type TranslateFn, useLocale } from "../../i18n";
import {
  type CreateCollectionReturn,
  type CreateListFocusReturn,
  createCollection,
  createControllableState,
  createListFocus,
} from "../../internal";
import { withDefaults } from "../../utils";
import {
  isDateOutOfRange,
  isMonthOutOfRange,
  isNextDecadeDisabled,
  isNextMonthDisabled,
  isNextYearDisabled,
  isPreviousDecadeDisabled,
  isPreviousMonthDisabled,
  isPreviousYearDisabled,
  isYearOutOfRange,
} from "../utils/boundary";
import { buildDecadeCells, formatDecadeRange } from "../utils/decade-view";
import {
  buildMonthCells,
  type CalendarCellModel,
  clampDateToMonth,
  formatFullDate,
  formatMonthYear,
  getWeekdays,
  type Weekday,
} from "../utils/month-view";
import {
  type CalendarSelectionMode,
  type CalendarValue,
  type DateRange,
  firstDateOf,
  type SelectionState,
  selectionStrategyFor,
} from "../utils/selection";
import {
  type CalendarView,
  type FirstDayOfWeek,
  isInViewScope,
  normalizeFocusForView,
} from "../utils/view";
import { buildYearCells, formatYear } from "../utils/year-view";

/** Per-date predicate (the public `isDateDisabled` option) — React Aria "unavailable" semantics. */
export type IsDateDisabled = (date: CalendarDate) => boolean;

export interface CreateCalendarOptions {
  /** `role=group` accessible name. Overrides the built-in `calendar.label` message. */
  label?: string;
  /** Locale for date formatting. Defaults to `useLocale()` (the `I18nProvider` / browser locale). */
  locale?: string;
  /** Reading direction. Defaults to `useLocale()`. Feeds the grid's RTL arrow flip. */
  dir?: "ltr" | "rtl";
  /** IANA time zone for "today" + formatting. Default: the system zone. */
  timeZone?: string;
  /** Week-start override. Default: locale-derived. */
  firstDayOfWeek?: FirstDayOfWeek;
  /** Earliest selectable/reachable date (inclusive). */
  min?: CalendarDate;
  /** Latest selectable/reachable date (inclusive). */
  max?: CalendarDate;
  /** Custom per-date "unavailable" predicate — focusable + announced, but not selectable. */
  isDateDisabled?: IsDateDisabled;
  /** Disable the whole calendar. Default `false`. */
  disabled?: boolean;
  /** Read-only: navigable + focusable, but not selectable. Default `false`. */
  readOnly?: boolean;
  /** Selection mode. Default `"single"`. Keys the `value` union. */
  selectionMode?: CalendarSelectionMode;
  /** Controlled selection value (union keyed by `selectionMode`). */
  value?: CalendarValue;
  /** Initial selection value, uncontrolled. Default `null`. */
  defaultValue?: CalendarValue;
  /** Fired when the selection commits (range: only on completion). */
  onValueChange?: (value: CalendarValue) => void;
  /** Controlled roving-focus cursor. */
  focusedValue?: CalendarDate | null;
  /** Initial focus cursor, uncontrolled. Defaults to a value-derived date, else today. Pass a stable
   * value for deterministic SSR (see `calendar-root.md`). */
  defaultFocusedValue?: CalendarDate | null;
  /** Fired whenever the roving cursor moves. */
  onFocusedValueChange?: (date: CalendarDate) => void;
}

export interface CreateCalendarReturn {
  // --- config (resolved, reactive) ---
  locale: Accessor<string>;
  direction: Accessor<"ltr" | "rtl">;
  timeZone: Accessor<string>;
  firstDayOfWeek: Accessor<FirstDayOfWeek | undefined>;
  min: Accessor<CalendarDate | undefined>;
  max: Accessor<CalendarDate | undefined>;
  disabled: Accessor<boolean>;
  readOnly: Accessor<boolean>;
  mode: Accessor<CalendarSelectionMode>;
  /** The message resolver (built-in en/fr + app overlay), for the calendar's own labels/announcements. */
  t: TranslateFn;
  groupLabel: Accessor<string>;

  // --- state ---
  view: Accessor<CalendarView>;
  visibleMonth: Accessor<CalendarDate>;
  focusedDate: Accessor<CalendarDate>;
  selectionValue: Accessor<CalendarValue>;
  anchorDate: Accessor<CalendarDate | null>;
  /** Derived: the tentative highlight range while a range selection is in progress (else null). */
  highlightedRange: Accessor<DateRange | null>;
  todayDate: Accessor<CalendarDate>;

  // --- computeds ---
  cells: Accessor<CalendarCellModel[][]>;
  weekdays: Accessor<Weekday[]>;
  headingLabel: Accessor<string>;
  isPrevDisabled: Accessor<boolean>;
  isNextDisabled: Accessor<boolean>;
  canDrillUp: Accessor<boolean>;

  // --- heading id (the grid's `aria-labelledby` and the heading's `id` — one SSR-stable value) ---
  headingId: Accessor<string>;

  // --- navigation / mutation ---
  navigate: (deltaMonths: number) => void;
  prev: () => void;
  next: () => void;
  drillUp: () => void;
  drillDownTo: (date: CalendarDate) => void;
  setView: (view: CalendarView) => void;
  setFocusedDate: (date: CalendarDate) => void;
  activate: (date: CalendarDate, opts?: { extend?: boolean }) => void;
  /** Move the tentative highlight end to `date` (range mode, mid-selection); `null` clears it. */
  highlightDate: (date: CalendarDate | null) => void;

  // --- per-date predicates ---
  isOutsideVisibleScope: (date: CalendarDate) => boolean;
  isOutOfRange: (date: CalendarDate) => boolean;
  isCellOutOfRange: (date: CalendarDate) => boolean;
  isDateUnavailable: (date: CalendarDate) => boolean;
  isDateNonFocusable: (date: CalendarDate) => boolean;
  isDateSelectable: (date: CalendarDate) => boolean;
  isToday: (date: CalendarDate) => boolean;
  isFocused: (date: CalendarDate) => boolean;
  isSelected: (date: CalendarDate) => boolean;
  isRangeStart: (date: CalendarDate) => boolean;
  isRangeMiddle: (date: CalendarDate) => boolean;
  isRangeEnd: (date: CalendarDate) => boolean;
  isHighlighted: (date: CalendarDate) => boolean;
  formatCellName: (date: CalendarDate) => string;
  formatFullDate: (date: CalendarDate) => string;

  // --- shared navigation kernel (consumed by the grid + cell part hooks) ---
  collection: CreateCollectionReturn<string>;
  listFocus: CreateListFocusReturn<string>;
  /** Announce a string via the screen-reader live region (client-only). */
  announce: (message: string) => void;
}

/**
 * The shared state kernel of a calendar — the one call at the root of the tree, modeled on
 * `createDialog`. It owns the view state machine (month / year / decade), the roving cursor, the
 * selection (via the pure `SelectionStrategy` seam), all the date math + predicates, the shared
 * navigation kernel (`createCollection` + `createListFocus`, which the grid + cell part hooks compose),
 * and the live-region announcer. It renders **no JSX and no host element**.
 *
 * The view machine: `view` selects what `visibleMonth` is shown *as*; `cells`/`headingLabel`/boundary
 * math/predicates switch on it. `drillUp` climbs month→year→decade; `drillDownTo` descends; `activate`
 * *selects* in month view but *drills* in year/decade. The cursor (`focusedDate`) is kept normalized to
 * the active view's cell granularity so `isFocused` is a plain `isSameDay` everywhere, and the visible
 * scope follows the cursor when it leaves (arrow-off-the-edge crossing) via one effect.
 *
 * Ported from the Angular calendar's `CalendarContext` + root directive; the controlled/uncontrolled
 * `value`/`focusedValue` pairs use `createControllableState`.
 */
export function createCalendar(options: CreateCalendarOptions = {}): CreateCalendarReturn {
  const merged = withDefaults(options, {
    selectionMode: "single" as CalendarSelectionMode,
    disabled: false,
    readOnly: false,
    timeZone: getLocalTimeZone(),
  });

  const i18n = useLocale();
  const t = i18n.t;
  const locale = () => merged.locale ?? i18n.locale();
  const direction = () => merged.dir ?? i18n.direction();
  const timeZone = () => merged.timeZone;
  const firstDayOfWeek = () => merged.firstDayOfWeek;
  const min = () => merged.min;
  const max = () => merged.max;
  const isDateDisabledFn = () => merged.isDateDisabled;
  const disabled = () => merged.disabled;
  const readOnly = () => merged.readOnly;
  const mode = () => merged.selectionMode;
  const groupLabel = () => merged.label ?? t("calendar.label");

  // --- State ---
  const [view, setViewSignal] = createSignal<CalendarView>("month");
  const todayDate = createMemo(() => today(timeZone()));

  // Seed the cursor + visible month once: an explicit default, else a value-derived date, else today.
  const seed =
    merged.defaultFocusedValue ??
    firstDateOf(merged.value ?? merged.defaultValue ?? null) ??
    today(untrack(timeZone));

  const [visibleMonth, setVisibleMonth] = createSignal<CalendarDate>(startOfMonth(seed));

  // The raw controllable cursor; `focusedDate` normalizes it to the view granularity so a rendered
  // cell always matches under `isSameDay`. `onFocusedValueChange` fires on every cursor move.
  const [rawFocused, setRawFocused] = createControllableState<CalendarDate>({
    value: () => merged.focusedValue ?? undefined,
    defaultValue: () => seed,
    onChange: (date) => merged.onFocusedValueChange?.(date),
  });
  const focusedDate = createMemo(() => normalizeFocusForView(view(), rawFocused()));

  // The committed selection (union keyed by mode). `onValueChange` is fired manually on *commit*
  // (below), not through `createControllableState`, so a range emits only on completion.
  const [selectionValue, setSelectionValue] = createControllableState<CalendarValue>({
    value: () => merged.value,
    defaultValue: () => merged.defaultValue ?? null,
  });
  // The tentative highlight end (hover/focus date) while a range selection is in progress. Internal:
  // the public surface is the derived `highlightedRange` accessor + the `highlightDate` setter.
  const [highlightEnd, setHighlightEnd] = createSignal<CalendarDate | null>(null);
  const [anchorDate, setAnchorDate] = createSignal<CalendarDate | null>(null);

  const strategy = createMemo(() => selectionStrategyFor(mode()));
  const selectionState = createMemo<SelectionState>(() => ({
    value: selectionValue(),
    anchor: anchorDate(),
  }));

  // The visible scope follows the cursor when it leaves — the arrow-off-the-edge / drill crossing. One
  // effect for both internal roving moves and controlled `focusedValue` updates. `visibleMonth`/`view`
  // are read untracked so only a cursor move re-runs it (never a visibleMonth write looping back).
  createEffect(
    () => focusedDate(),
    (fd) => {
      if (!isInViewScope(untrack(view), fd, untrack(visibleMonth))) {
        setVisibleMonth(startOfMonth(fd));
      }
    },
  );

  // --- Heading id: one `createUniqueId` shared by the grid's `aria-labelledby` and the heading's
  // `id`. SSR-stable and identical on server + client, so the IDREF is valid in the server markup. ---
  const generatedHeadingId = createUniqueId();
  const headingId = () => generatedHeadingId;

  // --- Announcer (real live region only where a DOM exists) ---
  // `@solid-primitives/a11y`'s `createAnnounce` builds its live regions with `document.createElement`,
  // guarded only by `isServer`. The `unit` test project runs the *client* build in Node (isServer is
  // false) with no `document`, so gate on `document` too: real announcer in a browser, no-op otherwise.
  const announce = typeof document !== "undefined" ? createAnnounce() : () => {};

  // --- Computeds (view-aware) ---
  const cells = createMemo<CalendarCellModel[][]>(() => {
    switch (view()) {
      case "month":
        return buildMonthCells(visibleMonth(), locale(), firstDayOfWeek());
      case "year":
        return buildYearCells(visibleMonth(), locale(), timeZone());
      case "decade":
        return buildDecadeCells(visibleMonth(), locale(), timeZone());
    }
  });
  const weekdays = createMemo(() => getWeekdays(locale(), timeZone(), firstDayOfWeek()));
  const headingLabel = createMemo(() => {
    switch (view()) {
      case "month":
        return formatMonthYear(visibleMonth(), locale(), timeZone());
      case "year":
        return formatYear(visibleMonth(), locale(), timeZone());
      case "decade":
        return formatDecadeRange(visibleMonth(), locale(), timeZone());
    }
  });
  const isPrevDisabled = createMemo(() => {
    switch (view()) {
      case "month":
        return isPreviousMonthDisabled(visibleMonth(), min());
      case "year":
        return isPreviousYearDisabled(visibleMonth(), min());
      case "decade":
        return isPreviousDecadeDisabled(visibleMonth(), min());
    }
  });
  const isNextDisabled = createMemo(() => {
    switch (view()) {
      case "month":
        return isNextMonthDisabled(visibleMonth(), max());
      case "year":
        return isNextYearDisabled(visibleMonth(), max());
      case "decade":
        return isNextDecadeDisabled(visibleMonth(), max());
    }
  });
  const canDrillUp = createMemo(() => view() !== "decade");

  // --- Per-date predicates ---
  const isOutsideVisibleScope = (date: CalendarDate) =>
    !isInViewScope(view(), date, visibleMonth());
  const isOutOfRange = (date: CalendarDate) => isDateOutOfRange(date, min(), max());
  const isCellOutOfRange = (date: CalendarDate) => {
    switch (view()) {
      case "month":
        return isDateOutOfRange(date, min(), max());
      case "year":
        return isMonthOutOfRange(date, min(), max());
      case "decade":
        return isYearOutOfRange(date, min(), max());
    }
  };
  const isDateUnavailable = (date: CalendarDate) => {
    if (view() !== "month") {
      return false; // unavailability is a per-day concept
    }
    return isDateDisabledFn()?.(date) ?? false;
  };
  const isDateNonFocusable = (date: CalendarDate) =>
    isOutsideVisibleScope(date) || isCellOutOfRange(date);
  const isDateSelectable = (date: CalendarDate) =>
    !disabled() && !readOnly() && !isOutOfRange(date) && !isDateUnavailable(date);

  const isToday = (date: CalendarDate) => {
    const t = todayDate();
    switch (view()) {
      case "month":
        return isSameDay(date, t);
      case "year":
        return isSameMonth(date, t);
      case "decade":
        return date.year === t.year;
    }
  };
  const isFocused = (date: CalendarDate) => isSameDay(date, focusedDate());

  const isSelected = (date: CalendarDate) => strategy().isSelected(selectionState(), date);
  const isRangeStart = (date: CalendarDate) => strategy().isRangeStart(selectionState(), date);
  const isRangeMiddle = (date: CalendarDate) => strategy().isRangeMiddle(selectionState(), date);
  const isRangeEnd = (date: CalendarDate) => strategy().isRangeEnd(selectionState(), date);
  // The tentative highlight range (anchor → highlightEnd) while mid-selection; cells derive membership.
  // A plain accessor (like the sibling predicates), NOT createMemo: an extra reactive node created in
  // this render would advance the hydration-id counter and shift every `_hk` in the SSR tree.
  const highlightedRange = (): DateRange | null =>
    strategy().highlightedRange(selectionState(), highlightEnd());
  const isHighlighted = (date: CalendarDate) => {
    const range = highlightedRange();
    return range !== null && date.compare(range.start) >= 0 && date.compare(range.end) <= 0;
  };

  const formatCellName = (date: CalendarDate) => {
    switch (view()) {
      case "month":
        return formatFullDate(date, locale(), timeZone());
      case "year":
        return formatMonthYear(date, locale(), timeZone());
      case "decade":
        return formatYear(date, locale(), timeZone());
    }
  };
  const formatFull = (date: CalendarDate) => formatFullDate(date, locale(), timeZone());

  // --- Navigation ---
  const setFocusedDate = (date: CalendarDate) => {
    // Normalize before storing, so the cursor (and `onFocusedValueChange`) stay at view granularity;
    // the effect above pulls `visibleMonth` along if this leaves the scope.
    setRawFocused(normalizeFocusForView(view(), date));
  };

  const navigate = (deltaMonths: number) => {
    const target = startOfMonth(visibleMonth().add({ months: deltaMonths }));
    setVisibleMonth(target);
    setFocusedDate(clampDateToMonth(focusedDate(), target));
  };

  const shiftYears = (deltaYears: number) => {
    setVisibleMonth(visibleMonth().add({ years: deltaYears }));
    setFocusedDate(focusedDate().add({ years: deltaYears }));
  };

  const navigateView = (dir: -1 | 1) => {
    switch (view()) {
      case "month":
        return navigate(dir);
      case "year":
        return shiftYears(dir);
      case "decade":
        return shiftYears(dir * 10);
    }
  };

  const prev = () => {
    if (isPrevDisabled()) {
      return;
    }
    navigateView(-1);
  };
  const next = () => {
    if (isNextDisabled()) {
      return;
    }
    navigateView(1);
  };

  const applyView = (nextView: CalendarView, focusTarget?: CalendarDate) => {
    setViewSignal(nextView);
    setFocusedDate(focusTarget ?? focusedDate());
  };

  const drillUp = () => {
    switch (view()) {
      case "month":
        return applyView("year");
      case "year":
        return applyView("decade");
      case "decade":
        return; // already at the top
    }
  };
  const drillDownTo = (date: CalendarDate) => {
    if (isDateNonFocusable(date)) {
      return;
    }
    switch (view()) {
      case "decade":
        return applyView("year", date);
      case "year":
        return applyView("month", date);
      case "month":
        return; // bottom of the stack
    }
  };
  const setView = (nextView: CalendarView) => applyView(nextView);

  const announceSelection = (value: CalendarValue) => {
    if (value == null) {
      return;
    }
    if (Array.isArray(value)) {
      if (value.length > 0) {
        announce(t("calendar.datesSelected", { count: value.length }));
      }
      return;
    }
    if ("start" in value) {
      announce(
        t("calendar.selectedRange", { start: formatFull(value.start), end: formatFull(value.end) }),
      );
    } else {
      announce(t("calendar.selectedDate", { date: formatFull(value) }));
    }
  };

  const activate = (date: CalendarDate, opts?: { extend?: boolean }) => {
    if (view() !== "month") {
      drillDownTo(date);
      return;
    }
    if (!isDateSelectable(date)) {
      return;
    }
    const strat = strategy();
    let state = selectionState();
    if (opts?.extend && mode() === "range" && anchorDate() === null) {
      state = strat.select(state, focusedDate(), { extend: false });
    }
    const nextState = strat.select(state, date, opts);
    setSelectionValue(nextState.value);
    setAnchorDate(nextState.anchor);
    setFocusedDate(date);
    if (nextState.anchor === null) {
      merged.onValueChange?.(nextState.value);
      announceSelection(nextState.value);
    }
  };

  const highlightDate = (date: CalendarDate | null) => setHighlightEnd(date);

  // --- Shared navigation kernel (grid + cell part hooks compose these) ---
  const collection = createCollection<string>();
  const listFocus = createListFocus<string>({
    source: collection,
    focusMode: () => "roving",
    disabled,
    // The roving tab stop tracks the cursor without moving DOM focus: the tab stop is the cell whose
    // date equals `focusedDate`. DOM focus only moves when the grid/cell hooks call `listFocus.focus`.
    activeIndex: () => {
      const key = focusedDate().toString();
      return collection.items().findIndex((item) => item.value() === key);
    },
  });

  // --- Announcements: view/period changes (skip the initial render). ---
  let announced = false;
  let lastView: CalendarView = "month";
  createEffect(
    () => [view(), headingLabel()] as const,
    ([currentView, label]) => {
      if (!announced) {
        announced = true;
        lastView = currentView;
        return;
      }
      if (currentView !== lastView) {
        lastView = currentView;
        announce(`${viewName(t, currentView)}, ${label}`);
      } else {
        announce(label);
      }
    },
  );

  return {
    locale,
    direction,
    timeZone,
    firstDayOfWeek,
    min,
    max,
    disabled,
    readOnly,
    mode,
    t,
    groupLabel,
    view,
    visibleMonth,
    focusedDate,
    selectionValue,
    anchorDate,
    highlightedRange,
    todayDate,
    cells,
    weekdays,
    headingLabel,
    isPrevDisabled,
    isNextDisabled,
    canDrillUp,
    headingId,
    navigate,
    prev,
    next,
    drillUp,
    drillDownTo,
    setView,
    setFocusedDate,
    activate,
    highlightDate,
    isOutsideVisibleScope,
    isOutOfRange,
    isCellOutOfRange,
    isDateUnavailable,
    isDateNonFocusable,
    isDateSelectable,
    isToday,
    isFocused,
    isSelected,
    isRangeStart,
    isRangeMiddle,
    isRangeEnd,
    isHighlighted,
    formatCellName,
    formatFullDate: formatFull,
    collection,
    listFocus,
    announce,
  };
}

/** The announced name for a view. */
function viewName(t: TranslateFn, view: CalendarView): string {
  switch (view) {
    case "month":
      return t("calendar.monthView");
    case "year":
      return t("calendar.yearView");
    case "decade":
      return t("calendar.decadeView");
  }
}
