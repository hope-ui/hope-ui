import { type TranslateFn, useLocale } from "@hope-ui/i18n";
import {
  type CalendarDate,
  getLocalTimeZone,
  isSameDay,
  isSameMonth,
  maxDate,
  minDate,
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
import {
  type CreateCollectionReturn,
  type CreateListFocusReturn,
  createCollection,
  createControllableState,
  createListFocus,
} from "../internal";
import { withDefaults } from "../utils";
import {
  constrainDate,
  isDateOutOfRange,
  isMonthOutOfRange,
  isNextDecadeDisabled,
  isNextMonthDisabled,
  isNextYearDisabled,
  isPreviousDecadeDisabled,
  isPreviousMonthDisabled,
  isPreviousYearDisabled,
  isYearOutOfRange,
  lastAvailableDateFrom,
} from "./utils/boundary";
import { buildDecadeCells, formatDecadeRange } from "./utils/decade-view";
import {
  buildMonthCells,
  type CalendarCellModel,
  clampDateToMonth,
  formatFullDate,
  formatMonthYear,
  getWeekdays,
  type Weekday,
} from "./utils/month-view";
import {
  type CalendarSelectionMode,
  type CalendarValue,
  type DateRange,
  firstDateOf,
  type SelectionState,
  selectionStrategyFor,
} from "./utils/selection";
import {
  type CalendarView,
  type FirstDayOfWeek,
  isInViewScope,
  normalizeFocusForView,
} from "./utils/view";
import { buildYearCells, formatYear } from "./utils/year-view";

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
  /**
   * Range mode + `isDateDisabled`: let a range span unavailable days. Default `false` — while a range
   * is anchored the bounds narrow to the run of available days around the anchor, so a selection can
   * never straddle an unavailable day. Inert without `isDateDisabled`.
   */
  allowsNonContiguousRanges?: boolean;
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

  // --- native form ---
  /** Native form field name. When set, the styled component renders hidden `<input>`(s) from
   * `formValues()`. Opt-in — nothing is submitted without it. */
  name?: string;
  /** Associates the hidden field(s) with a `<form>` by id (the input's `form` attribute), for inputs
   * rendered outside that form. */
  form?: string;
  /** Marks the field required for native form validation. Default `false`. */
  required?: boolean;
}

export interface CreateCalendarReturn {
  // --- config (resolved, reactive) ---
  locale: Accessor<string>;
  direction: Accessor<"ltr" | "rtl">;
  timeZone: Accessor<string>;
  firstDayOfWeek: Accessor<FirstDayOfWeek | undefined>;
  /** The **effective** lower bound: the `min` option, raised to the anchored range's available run
   * while a contiguous range selection is in progress. */
  min: Accessor<CalendarDate | undefined>;
  /** The **effective** upper bound — the mirror of {@link min}. */
  max: Accessor<CalendarDate | undefined>;
  disabled: Accessor<boolean>;
  readOnly: Accessor<boolean>;
  mode: Accessor<CalendarSelectionMode>;
  /** The message resolver (built-in en/fr + app overlay), for the calendar's own labels/announcements. */
  t: TranslateFn;
  groupLabel: Accessor<string>;

  // --- native form (consumed by the styled component's hidden inputs) ---
  /** The native form field name, if set. */
  name: Accessor<string | undefined>;
  /** The associated `<form>` id, if set. */
  form: Accessor<string | undefined>;
  /** Whether the field is required for native validation. */
  required: Accessor<boolean>;
  /**
   * The hidden-`<input>` entries a native `<form>` submits, derived from `selectionValue()` as ISO
   * `YYYY-MM-DD` strings (`CalendarDate.toString()`). Empty (`[]`) when `name` is unset, so the
   * component can render nothing until the calendar opts into form submission:
   *  - **single** → `[{ name, value }]` (empty when the value is `null`)
   *  - **multiple** → one entry per selected date, all sharing `name`
   *  - **range** → `[{ name: `${name}Start`, value }, { name: `${name}End`, value }]`, empty until
   *    the range is complete (mid-selection, while `anchorDate()` is set, it stays empty)
   */
  formValues: Accessor<{ name: string; value: string }[]>;

  // --- state ---
  view: Accessor<CalendarView>;
  visibleMonth: Accessor<CalendarDate>;
  focusedDate: Accessor<CalendarDate>;
  selectionValue: Accessor<CalendarValue>;
  anchorDate: Accessor<CalendarDate | null>;
  /** Derived: the tentative range `anchorDate` → `focusedDate` while a range selection is in
   * progress (else null). */
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
  /** Move the tentative range's moving endpoint to `date` — i.e. move the roving cursor, but only
   * while a range selection is anchored. A no-op otherwise. */
  highlightDate: (date: CalendarDate) => void;

  // --- per-date predicates ---
  isOutsideVisibleScope: (date: CalendarDate) => boolean;
  isOutOfRange: (date: CalendarDate) => boolean;
  isCellOutOfRange: (date: CalendarDate) => boolean;
  /** The calendar itself makes this cell inert: the whole calendar is `disabled`, or the cell's
   * period falls outside `[min, max]`. React Aria's `isCellDisabled`. */
  isCellDisabled: (date: CalendarDate) => boolean;
  isDateUnavailable: (date: CalendarDate) => boolean;
  isDateNonFocusable: (date: CalendarDate) => boolean;
  isDateSelectable: (date: CalendarDate) => boolean;
  isToday: (date: CalendarDate) => boolean;
  isFocused: (date: CalendarDate) => boolean;
  /** Part of the committed selection **and** paintable: a day the calendar makes inert
   * (`isCellDisabled`) or marks unavailable is excluded, as React Aria's `isSelected` is. The three
   * `isRange*` below carry the same guard. */
  isSelected: (date: CalendarDate) => boolean;
  isRangeStart: (date: CalendarDate) => boolean;
  isRangeMiddle: (date: CalendarDate) => boolean;
  isRangeEnd: (date: CalendarDate) => boolean;
  isHighlighted: (date: CalendarDate) => boolean;
  isHighlightedStart: (date: CalendarDate) => boolean;
  isHighlightedEnd: (date: CalendarDate) => boolean;
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
    required: false,
    allowsNonContiguousRanges: false,
    timeZone: getLocalTimeZone(),
  });

  const i18n = useLocale();
  const t = i18n.t;
  const locale = () => merged.locale ?? i18n.locale();
  const direction = () => merged.dir ?? i18n.direction();
  const timeZone = () => merged.timeZone;
  const firstDayOfWeek = () => merged.firstDayOfWeek;
  const configuredMin = () => merged.min;
  const configuredMax = () => merged.max;
  const isDateDisabledFn = () => merged.isDateDisabled;
  const allowsNonContiguousRanges = () => merged.allowsNonContiguousRanges;
  const disabled = () => merged.disabled;
  const readOnly = () => merged.readOnly;
  const mode = () => merged.selectionMode;
  const groupLabel = () => merged.label ?? t("calendar.label");
  const name = () => merged.name;
  const form = () => merged.form;
  const required = () => merged.required;

  // --- State ---
  const [view, setViewSignal] = createSignal<CalendarView>("month");
  const todayDate = createMemo(() => today(timeZone()));

  // The in-progress range endpoint. Declared here rather than beside `selectionValue` below, because
  // `min`/`max` read it: while a range is anchored, the calendar's own bounds narrow around the anchor.
  const [anchorDate, setAnchorDate] = createSignal<CalendarDate | null>(null);

  // React Aria's contiguity model (`useRangeCalendarState`'s `getAvailableRange`, folded into the
  // calendar's own `min`/`max`): while a range is anchored, the selectable window shrinks to the run of
  // consecutive available days containing the anchor, so a range can never straddle an unavailable day.
  //
  // Narrowing the **bounds** rather than adding a guard at the commit is the whole point: every
  // downstream predicate — `isCellOutOfRange` → `isCellDisabled` → `isDateNonFocusable`,
  // `isDateSelectable`, the cursor clamp and with it the tentative band — inherits the constraint for
  // free. A commit-time guard alone would still let the arrows cross the unavailable day and preview a
  // band with a hole punched in it.
  //
  // Either side is `undefined` when no unavailable day turns up within a month of the anchor — the run
  // is unbounded there, and the consumer's own bound is what remains. The run is read through the
  // **raw** `isDateDisabled` rather than `isDateUnavailable`, which reports false outside month view:
  // which days are available is a property of the days, not of the view being looked at, so drilling up
  // mid-selection must not silently widen the window.
  //
  // A `createMemo` and not a plain accessor, unlike `highlightedRange` and `formValues`: `min`/`max`
  // are read twice per cell per predicate, and each read would otherwise walk up to a month of days
  // through the consumer's `isDateDisabled` — tens of thousands of callbacks per pointer move once
  // unavailable days are sparse. That earns the one reactive node, at the measured price of shifting
  // every `_hk` in the SSR tree (and `headingId`) by one, which is why the calendar's inline snapshot
  // was re-recorded with this change.
  //
  // Gated on range mode, not on `anchorDate` alone: nothing clears the anchor when `selectionMode`
  // changes, and a stale anchor left over from an abandoned range would otherwise keep the bounds
  // clamped for good — inert cells and dead nav in a mode that has no ranges at all.
  const availableRange = createMemo<{ start?: CalendarDate; end?: CalendarDate } | null>(() => {
    const anchor = anchorDate();
    const isDateUnavailable = isDateDisabledFn();
    if (
      anchor === null ||
      isDateUnavailable === undefined ||
      mode() !== "range" ||
      allowsNonContiguousRanges()
    ) {
      return null;
    }
    return {
      start: lastAvailableDateFrom(anchor, -1, isDateUnavailable),
      end: lastAvailableDateFrom(anchor, 1, isDateUnavailable),
    };
  });

  // The effective bounds every predicate below reads: the configured ones, tightened by the anchored
  // range's available run. `maxDate`/`minDate` keep whichever side is present, so an absent bound on
  // either input leaves the other untouched.
  const min = () => maxDate(configuredMin(), availableRange()?.start) ?? undefined;
  const max = () => minDate(configuredMax(), availableRange()?.end) ?? undefined;

  // Seed the cursor + visible month once: an explicit default, else a value-derived date, else today.
  // Constrained here rather than left to the render-time clamp below, because `visibleMonth` is derived
  // from the *seed*: an out-of-range `defaultFocusedValue` would otherwise open the calendar on a month
  // the cursor is immediately pushed out of, and the month grid is a variable 4–6 rows — a structural
  // server/client disagreement, not a reactive one.
  // Every read here is one-time, so the whole expression is untracked — a consumer's `min`/`max`/
  // `timeZone` may be signal-backed getters, and the seed must not subscribe to them.
  const seed = untrack(() =>
    constrainDate(
      merged.defaultFocusedValue ??
        firstDateOf(merged.value ?? merged.defaultValue ?? null) ??
        today(timeZone()),
      min(),
      max(),
    ),
  );

  const [visibleMonth, setVisibleMonth] = createSignal<CalendarDate>(startOfMonth(seed));

  // The raw controllable cursor; `focusedDate` clamps it into `[min, max]` and normalizes it to the
  // view granularity so a rendered cell always matches under `isSameDay`. `onFocusedValueChange` fires
  // on every cursor move.
  //
  // Clamping *here* as well as in `setFocusedDate` is React Aria's "constrain again at render": it is
  // what catches the two cursors the setter never sees — a controlled `focusedValue` outside the
  // bounds, and a `min`/`max` that narrows after mount. Constrain **before** normalize, because the
  // clamp is day-level: re-flooring afterwards keeps a year/decade cursor on a cell that exists. The
  // pair is a fixed point, so re-applying it to an already-stored cursor never moves it again.
  const [rawFocused, setRawFocused] = createControllableState<CalendarDate>({
    value: () => merged.focusedValue ?? undefined,
    defaultValue: () => seed,
    onChange: (date) => merged.onFocusedValueChange?.(date),
  });
  const focusedDate = createMemo(() =>
    normalizeFocusForView(view(), constrainDate(rawFocused(), min(), max())),
  );

  // The committed selection (union keyed by mode). `onValueChange` is fired manually on *commit*
  // (below), not through `createControllableState`, so a range emits only on completion.
  const [selectionValue, setSelectionValue] = createControllableState<CalendarValue>({
    value: () => merged.value,
    defaultValue: () => merged.defaultValue ?? null,
  });

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
  // A disabled calendar cannot be paged either — the nav buttons are as inert as the cells, which is
  // what keeps `disabled` from rendering an otherwise fully operable calendar (React Aria gates the
  // same two on `isDisabled`).
  const isPrevDisabled = createMemo(() => {
    if (disabled()) {
      return true;
    }
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
    if (disabled()) {
      return true;
    }
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
  // React Aria's `isCellDisabled`: the calendar-level inertness — the whole calendar `disabled`, or a
  // period outside `[min, max]`. It deliberately excludes the outside-scope filler days that
  // `isDateNonFocusable` adds on top, so `data-disabled` keeps meaning "inert *and* dimmed" and a
  // leading/trailing day of an adjacent month keeps its own `data-outside-month` tint instead.
  const isCellDisabled = (date: CalendarDate) => disabled() || isCellOutOfRange(date);
  const isDateNonFocusable = (date: CalendarDate) =>
    isOutsideVisibleScope(date) || isCellDisabled(date);
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

  // React Aria's gate on the whole selection paint (`useCalendarState`'s `isSelected` returns false
  // when `isCellDisabled(date) || isCellUnavailable(date)`): a day this calendar cannot select must
  // never *look* selected. Otherwise a range committed before `max` narrowed — or one spanning an
  // `isDateDisabled` day — paints a band the click refuses to reproduce, and `aria-selected` claims a
  // value that is not one. Such a day is simply cut out of the band.
  //
  // Two deliberate boundaries:
  // - It lives here, not in the strategies: those stay pure, mode-only and day-based, with no notion
  //   of the calendar's bounds or availability.
  // - It reads `isCellDisabled`, **not** `isDateNonFocusable` — the outside-scope filler days keep
  //   their paint, so a range crossing a month boundary still renders as one continuous band on both
  //   sides. (React Aria folds the visible range into its own `isCellDisabled`, but it renders no
  //   filler days at all, so it has no band to keep continuous.)
  const paintsSelection = (date: CalendarDate) => !isCellDisabled(date) && !isDateUnavailable(date);
  const isSelected = (date: CalendarDate) =>
    paintsSelection(date) && strategy().isSelected(selectionState(), date);
  const isRangeStart = (date: CalendarDate) =>
    paintsSelection(date) && strategy().isRangeStart(selectionState(), date);
  const isRangeMiddle = (date: CalendarDate) =>
    paintsSelection(date) && strategy().isRangeMiddle(selectionState(), date);
  const isRangeEnd = (date: CalendarDate) =>
    paintsSelection(date) && strategy().isRangeEnd(selectionState(), date);
  // The tentative range while mid-selection: anchor → the roving cursor, exactly as React Aria derives
  // it (`useRangeCalendarState`). Deriving it from the *cursor* rather than a separate hover signal is
  // what makes hover and keyboard one code path — hover moves the cursor (`highlightDate`), so the band
  // can never disagree with the cell the user is on. A plain accessor (like the sibling predicates), NOT
  // createMemo: an extra reactive node created in this render would advance the hydration-id counter and
  // shift every `_hk` in the SSR tree.
  const highlightedRange = (): DateRange | null =>
    strategy().highlightedRange(selectionState(), focusedDate());
  const isHighlighted = (date: CalendarDate) => {
    const range = highlightedRange();
    return range !== null && date.compare(range.start) >= 0 && date.compare(range.end) <= 0;
  };
  // The tentative band's own endpoints, so a recipe can cap the preview the way it caps the committed
  // range. Both are true on the same date when the preview is one day (hovering the anchor itself).
  const isHighlightedStart = (date: CalendarDate) => {
    const range = highlightedRange();
    return range !== null && date.compare(range.start) === 0;
  };
  const isHighlightedEnd = (date: CalendarDate) => {
    const range = highlightedRange();
    return range !== null && date.compare(range.end) === 0;
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
    // Constrain then normalize before storing (React Aria's `focusCell`), so the cursor — and
    // `onFocusedValueChange` — report a date that is both inside `[min, max]` and at view granularity.
    // Every move funnels through here (`navigate`, `shiftYears`, `applyView`, `activate`,
    // `highlightDate`), so this is the one place the bound has to hold. The effect above pulls
    // `visibleMonth` along if this leaves the scope.
    setRawFocused(normalizeFocusForView(view(), constrainDate(date, min(), max())));
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
    if (disabled()) {
      return; // as inert as prev/next — a disabled calendar navigates nowhere
    }
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
    // While a range is anchored the bounds have narrowed to the available run around the anchor, so
    // activating past the run's edge means "end the range at the edge" rather than nothing at all —
    // React Aria clamps the same way in `selectDate`. Only that narrowing is clamped away: with no
    // anchored run the date is passed through untouched, so activating a genuinely out-of-range or
    // unavailable day stays the outright refusal it has always been.
    const isAnchoredRun = availableRange() !== null;
    const target = isAnchoredRun ? constrainDate(date, min(), max()) : date;
    if (!isDateSelectable(target)) {
      return;
    }
    const strat = strategy();
    let state = selectionState();
    if (opts?.extend && mode() === "range" && anchorDate() === null) {
      state = strat.select(state, focusedDate(), { extend: false });
    }
    const nextState = strat.select(state, target, opts);
    setSelectionValue(nextState.value);
    setAnchorDate(nextState.anchor);
    setFocusedDate(target);
    if (nextState.anchor === null) {
      merged.onValueChange?.(nextState.value);
      announceSelection(nextState.value);
    }
  };

  // Hovering a day *is* moving the cursor while a range is anchored (React Aria's `highlightDate`), so
  // the band follows the pointer through the same signal the keyboard drives. With no anchor there is
  // nothing to preview, and hover must not steal the roving tab stop — hence the guard.
  const highlightDate = (date: CalendarDate) => {
    if (anchorDate() !== null) {
      setFocusedDate(date);
    }
  };

  // --- Native form ---
  // The hidden-input entries a native `<form>` submits, derived from the committed selection as ISO
  // strings. A plain accessor (like `highlightedRange` / the sibling predicates, and the listbox
  // `formValues`), NOT a `createMemo`: it is read inside the component's `<For>`, recomputes cheaply,
  // and adds no reactive node to the render.
  const formValues = (): { name: string; value: string }[] => {
    const fieldName = merged.name;
    if (fieldName == null) {
      return [];
    }
    const value = selectionValue();
    if (value == null) {
      return [];
    }
    if (Array.isArray(value)) {
      // multiple: one field per selected date, all sharing the name.
      return value.map((date) => ({ name: fieldName, value: date.toString() }));
    }
    if ("start" in value) {
      // range: paired `${name}Start` / `${name}End` fields, emitted only once the range is complete —
      // mid-selection the value is a degenerate `{ start, end }` with the anchor still set.
      if (anchorDate() !== null) {
        return [];
      }
      return [
        { name: `${fieldName}Start`, value: value.start.toString() },
        { name: `${fieldName}End`, value: value.end.toString() },
      ];
    }
    // single
    return [{ name: fieldName, value: value.toString() }];
  };

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
    name,
    form,
    required,
    formValues,
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
    isCellDisabled,
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
    isHighlightedStart,
    isHighlightedEnd,
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
