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
  type TextDirection,
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
  cellPeriod,
  type FirstDayOfWeek,
  isInViewScope,
  normalizeFocusForView,
} from "./utils/view";
import { buildYearCells, formatYear } from "./utils/year-view";

/** Per-date predicate (the public `isDateDisabled` option) — React Aria "unavailable" semantics. */
export type IsDateDisabled = (date: CalendarDate) => boolean;

/**
 * What becomes of a range abandoned mid-selection — React Aria's `commitBehavior`
 * (`useRangeCalendar`):
 *  - `"select"` (default) — commit the tentative range at the roving cursor.
 *  - `"reset"` — drop the anchor and restore the selection that was committed before it.
 *  - `"clear"` — empty the selection.
 */
export type CalendarCommitBehavior = "select" | "reset" | "clear";

export interface CreateCalendarOptions {
  /** `role=group` accessible name. Overrides the built-in `calendar.label` message. */
  label?: string;
  /** Locale for date formatting. Defaults to `useLocale()` (the `I18nProvider` / browser locale). */
  locale?: string;
  /** Reading direction. Defaults to `useLocale()`. Feeds the grid's RTL arrow flip. */
  dir?: TextDirection;
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
  /**
   * Range mode: what happens to a range abandoned mid-selection — the pointer released outside the
   * calendar, or focus leaving it. Default `"select"`. Applied by `createCalendarGroup`; `Escape`
   * always cancels (`"reset"`) regardless.
   */
  commitBehavior?: CalendarCommitBehavior;
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
  direction: Accessor<TextDirection>;
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
  /** Whether a range may span unavailable days — the resolved option. Default `false`, which is what
   * narrows {@link min}/{@link max} around the anchor. Read by the grid to decide whether Shift+Arrow
   * may step *past* an unavailable day or must stop at it. */
  allowsNonContiguousRanges: Accessor<boolean>;
  /** The resolved abandonment policy `createCalendarGroup` applies. Default `"select"`. */
  commitBehavior: Accessor<CalendarCommitBehavior>;
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
  /**
   * Derived: the **one** band range mode paints — `anchorDate` → `focusedDate` while a range selection
   * is in progress, and the committed range when it is not (React Aria's `highlightedRange`). Null
   * outside range mode, and while range mode has nothing selected.
   */
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
  /**
   * Apply an activation. Returns whether it **began a range** — no anchor before, one after. The cell
   * hook needs that fact to gate the keyboard auto-advance and cannot recover it by re-reading
   * {@link anchorDate}: under solid-js 2.0's client build a signal write is invisible to a plain read
   * until the next flush, so the anchor still reads `null` immediately after this returns.
   */
  activate: (date: CalendarDate, opts?: { extend?: boolean }) => boolean;
  /**
   * Step the cursor one day past a just-anchored range (+1, falling back to −1, staying put when
   * neither is selectable) — React Aria's `focusNearestAvailableDate`. The affordance that tells a
   * **keyboard** user they are selecting a range rather than a single date; the pointer gets the same
   * signal from hover, so `createCalendarCell` calls this only for a keyboard press.
   */
  focusNearestAvailableDate: (anchor: CalendarDate) => void;
  /** Move the tentative range's moving endpoint to `date` — i.e. move the roving cursor, but only
   * while a range selection is anchored. A no-op otherwise. */
  highlightDate: (date: CalendarDate) => void;
  /**
   * Abandon the range in progress: drop the anchor **and** restore the selection committed before it
   * anchored (React Aria's `setAnchorDate(null)`, plus the restore hope-ui's degenerate in-progress
   * value makes necessary — see `calendar-root.md`). Emits nothing: the consumer was never told about
   * the in-progress value. A no-op with no anchor.
   */
  clearAnchor: () => void;
  /**
   * Complete the range in progress at the roving cursor (React Aria's `commitSelection`), emitting
   * `onValueChange` as any other completing activate does. A no-op with no anchor; falls back to
   * {@link clearAnchor} when the cursor sits on a day that cannot be selected, so a range in progress
   * is never left behind.
   */
  commitSelection: () => void;
  /**
   * Empty the selection and drop any anchor (React Aria's `clearSelection`) — `null`, or `[]` in
   * multiple mode. Emits `onValueChange` unless the consumer's last-known value was already empty.
   */
  clearSelection: () => void;

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
  /** Inside the painted band ({@link highlightedRange} in range mode) **and** paintable: a day the
   * calendar makes inert (`isCellDisabled`) or marks unavailable is excluded, as React Aria's
   * `isSelected` is. The two endpoint predicates below carry the same guard. */
  isSelected: (date: CalendarDate) => boolean;
  /** Holds the band's start endpoint. Both endpoints are true on a one-day band. */
  isSelectionStart: (date: CalendarDate) => boolean;
  /** Holds the band's end endpoint. */
  isSelectionEnd: (date: CalendarDate) => boolean;
  formatCellName: (date: CalendarDate) => string;
  formatFullDate: (date: CalendarDate) => string;

  // --- shared navigation kernel (consumed by the grid + cell part hooks) ---
  collection: CreateCollectionReturn<string>;
  listFocus: CreateListFocusReturn<string>;
  /**
   * Whether something has asked DOM focus to follow the roving cursor to wherever it settles. Armed by
   * the grid's own navigation and by {@link focusNearestAvailableDate}; consumed (and cleared) by the
   * grid, which owns the effect that waits for the target cell to mount before focusing it.
   */
  pendingCursorFocus: Accessor<boolean>;
  setPendingCursorFocus: (pending: boolean) => void;
  /** Announce a string via the screen-reader live region (client-only). */
  announce: (message: string) => void;
}

/**
 * The shared state kernel of a calendar — the one call at the root of the tree, modeled on
 * `createDialog`. Owns the view machine (month / year / decade), the roving cursor, the selection
 * (via the pure `SelectionStrategy` seam), the date math + predicates, the navigation kernel the
 * grid + cell part hooks compose, and the live-region announcer. Renders no JSX and no host element.
 *
 * Ported from the Angular calendar's `CalendarContext` + root directive. Full model:
 * `__internal__/primitives/calendar/calendar-root.md`.
 */
export function createCalendar(options: CreateCalendarOptions = {}): CreateCalendarReturn {
  const merged = withDefaults(options, {
    selectionMode: "single" as CalendarSelectionMode,
    disabled: false,
    readOnly: false,
    required: false,
    allowsNonContiguousRanges: false,
    commitBehavior: "select" as CalendarCommitBehavior,
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
  const commitBehavior = () => merged.commitBehavior;
  const groupLabel = () => merged.label ?? t("calendar.label");
  const name = () => merged.name;
  const form = () => merged.form;
  const required = () => merged.required;

  // --- State ---
  // "Bring DOM focus to wherever the cursor settles." Armed by whoever moves the cursor
  // programmatically, consumed by the grid (which waits for the target cell to mount before
  // focusing). It lives here rather than in the grid because a *cell* has to arm it too, and a cell
  // has no reference to the grid hook. A plain-value signal, so it consumes no hydration id.
  const [pendingCursorFocus, setPendingCursorFocus] = createSignal(false);

  const [view, setViewSignal] = createSignal<CalendarView>("month");
  const todayDate = createMemo(() => today(timeZone()));

  // The in-progress range endpoint. Declared here rather than beside `selectionValue` below, because
  // `min`/`max` read it: while a range is anchored, the calendar's own bounds narrow around the anchor.
  const [anchorDate, setAnchorDate] = createSignal<CalendarDate | null>(null);

  // React Aria's contiguity model (`useRangeCalendarState`'s `getAvailableRange`, folded into the
  // calendar's own `min`/`max`): while a range is anchored, the selectable window shrinks to the run
  // of consecutive available days containing the anchor. Narrowing the *bounds* rather than guarding
  // at the commit is the point — every downstream predicate inherits the constraint for free, where a
  // commit-time guard would still let the arrows cross the unavailable day. Details:
  // `__internal__/primitives/calendar/calendar-root.md` § Contiguous ranges. Three choices to keep:
  //
  //  - Read through the **raw** `isDateDisabled`, not `isDateUnavailable`, which reports false
  //    outside month view — availability is a property of the days, not of the view, so drilling up
  //    mid-selection must not silently widen the window.
  //  - A `createMemo`, unlike `highlightedRange`/`formValues`: `min`/`max` are read twice per cell
  //    per predicate, each read otherwise walking a month of days through the consumer's callback.
  //    Costs one reactive node, which shifts every `_hk` in the SSR tree by one.
  //  - Gated on range mode, not on `anchorDate` alone: nothing clears the anchor when `selectionMode`
  //    changes, so a stale anchor would keep the bounds clamped for good.
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
  // view granularity so a rendered cell always matches under `isSameDay`.
  //
  // Clamping here *as well as* in `setFocusedDate` is React Aria's "constrain again at render",
  // catching the two cursors the setter never sees: a controlled `focusedValue` outside the bounds,
  // and a `min`/`max` that narrows after mount. Constrain **before** normalize — the clamp is
  // day-level, so re-flooring afterwards keeps a year/decade cursor on a cell that exists. The pair
  // is a fixed point, so re-applying it never moves an already-stored cursor again.
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
  // The snapshot every strategy call reads. `endpoint` is the roving cursor, which is the range's
  // moving end while anchored — carrying it here is what lets the paint predicates derive the band
  // from the snapshot alone, exactly as React Aria's `isSelected` reads its state object's own
  // `highlightedRange`. An existing memo gaining a third field, so no reactive node is added.
  const selectionState = createMemo<SelectionState>(() => ({
    value: selectionValue(),
    anchor: anchorDate(),
    endpoint: focusedDate(),
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

  // React Aria's gate on the whole selection paint (`useCalendarState`'s `isSelected`): a day this
  // calendar cannot select must never *look* selected, so it is cut out of the band rather than
  // painting one the matching click would refuse. Two boundaries to keep:
  // - It lives here, not in the strategies: those stay pure, mode-only and day-based, with no notion
  //   of the calendar's bounds or availability.
  // - It reads `isCellDisabled`, not `isDateNonFocusable` — the outside-scope filler days keep their
  //   paint, so a range crossing a month boundary renders as one continuous band on both sides.
  const paintsSelection = (date: CalendarDate) => !isCellDisabled(date) && !isDateUnavailable(date);
  // What a cell *covers* in the active view, which is what the selection is tested against: a year
  // cell must paint for a range merely passing through the month, not only one starting on the 1st.
  // Month view's period is the degenerate `{ date, date }`, so its predicates are unchanged.
  const periodOf = (date: CalendarDate) => cellPeriod(view(), date);
  // One band, three predicates — React Aria's vocabulary. Range mode resolves them against
  // `highlightedRange` (tentative while anchored, committed when idle), so hover and keyboard share
  // one code path. A consumer wanting the middle derives it (`isSelected && !start && !end`), which
  // is what `data-selection-middle` is repointed at in the preset.
  const isSelected = (date: CalendarDate) =>
    paintsSelection(date) && strategy().isSelected(selectionState(), periodOf(date));
  const isSelectionStart = (date: CalendarDate) =>
    paintsSelection(date) && strategy().isSelectionStart(selectionState(), periodOf(date));
  const isSelectionEnd = (date: CalendarDate) =>
    paintsSelection(date) && strategy().isSelectionEnd(selectionState(), periodOf(date));
  // A plain accessor (like the sibling predicates), NOT createMemo: an extra reactive node created in
  // this render would advance the hydration-id counter and shift every `_hk` in the SSR tree.
  const highlightedRange = (): DateRange | null => strategy().highlightedRange(selectionState());

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
    // `onFocusedValueChange` — report a date both inside `[min, max]` and at view granularity. Every
    // move funnels through here, so this is the one place the bound has to hold.
    setRawFocused(normalizeFocusForView(view(), constrainDate(date, min(), max())));
  };

  // React Aria's `focusNearestAvailableDate` (`useRangeCalendarState`), called after a **keyboard**
  // activate anchors a range: step the cursor one day past the anchor so the band reads as "range in
  // progress" rather than a committed single date. +1 day, falling back to −1, and staying put when
  // neither is selectable.
  //
  // RA's two-term invalid test collapses to one `isDateSelectable` here: its second term bounds the
  // step by the anchor's contiguous available run, which for a **one-day** step is exactly the
  // `isDateUnavailable` check `isDateSelectable` already makes, since the run's edge *is* the first
  // unavailable day in each direction. It could not read the narrowed bounds anyway — `availableRange`
  // derives from the `anchorDate` write this runs on the heels of, invisible to a plain read until the
  // next flush. `order()` in the strategy normalizes the backwards case, where stepping to −1 makes
  // the anchor the range's *end*.
  //
  // DOM focus has to come along, or the next Enter would land on the still-focused anchor cell and
  // commit a one-day range instead of the two-day band the user can see.
  const focusNearestAvailableDate = (anchor: CalendarDate) => {
    const next = anchor.add({ days: 1 });
    const target = isDateSelectable(next) ? next : anchor.subtract({ days: 1 });
    if (isDateSelectable(target)) {
      setFocusedDate(target);
      setPendingCursorFocus(true);
    }
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

  const activate = (date: CalendarDate, opts?: { extend?: boolean }): boolean => {
    if (view() !== "month") {
      drillDownTo(date);
      return false;
    }
    // While a range is anchored the bounds have narrowed to the available run around the anchor, so
    // activating past the run's edge means "end the range at the edge" rather than nothing at all —
    // React Aria clamps the same way in `selectDate`. Only that narrowing is clamped away: with no
    // anchored run the date is passed through untouched, so activating a genuinely out-of-range or
    // unavailable day stays the outright refusal it has always been.
    const isAnchoredRun = availableRange() !== null;
    const target = isAnchoredRun ? constrainDate(date, min(), max()) : date;
    if (!isDateSelectable(target)) {
      return false;
    }
    const strat = strategy();
    const previous = selectionState();
    let state: SelectionState = previous;
    // Shift+Arrow on an empty calendar has no range to re-open, so the extension opens one **at the
    // cursor** — the day it is extending *from*, which the strategy has no way to know. Gating it on an
    // empty selection is the whole point: once a range is committed, the strategy's own no-anchor
    // branch re-opens it from that range's start, and seeding here unconditionally would throw the
    // range away and collapse it to the two days around the cursor.
    if (opts?.extend && mode() === "range" && previous.anchor === null && previous.value == null) {
      state = { ...state, ...strat.select(state, focusedDate(), { extend: false }) };
    }
    const nextState = strat.select(state, target, opts);
    setSelectionValue(nextState.value);
    setAnchorDate(nextState.anchor);
    setFocusedDate(target);
    if (nextState.anchor === null) {
      merged.onValueChange?.(nextState.value);
      announceSelection(nextState.value);
    }
    return previous.anchor === null && nextState.anchor !== null;
  };

  // Hovering a day *is* moving the cursor while a range is anchored (React Aria's `highlightDate`), so
  // the band follows the pointer through the same signal the keyboard drives. With no anchor there is
  // nothing to preview, and hover must not steal the roving tab stop — hence the guard.
  const highlightDate = (date: CalendarDate) => {
    if (anchorDate() !== null) {
      setFocusedDate(date);
    }
  };

  // --- Abandoning a range in progress (React Aria's `commitBehavior` verbs) ---
  // Dropping the anchor is the whole operation, as in React Aria's `setAnchorDate(null)`: nothing was
  // written to `value` when the range anchored, so the selection committed before it is still there and
  // simply resumes painting.
  const clearAnchor = () => setAnchorDate(null);

  const commitSelection = () => {
    if (anchorDate() === null) {
      return;
    }
    const cursor = focusedDate();
    // Two ways there is nothing to commit: the cursor is on a day this calendar refuses (React Aria
    // backs off to the previous available date there; hope-ui refuses instead — see `activate`), or
    // the calendar has been drilled up, where `activate` would descend a view rather than select. This
    // runs *because* the calendar already lost the pointer or the focus that would let anyone finish,
    // so abandoning is the only outcome — leaving a range in progress behind is never one.
    if (view() !== "month" || !isDateSelectable(cursor)) {
      clearAnchor();
      return;
    }
    activate(cursor);
  };

  const clearSelection = () => {
    // `value` is never written mid-selection, so it *is* the consumer's last-known value in every
    // phase — clearing an empty calendar the user merely anchored in still emits nothing.
    const lastEmitted = selectionValue();
    const empty: CalendarValue = mode() === "multiple" ? [] : null;
    setAnchorDate(null);
    setSelectionValue(empty);
    if (!isEmptySelection(lastEmitted)) {
      merged.onValueChange?.(empty);
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
      // range: paired `${name}Start` / `${name}End` fields. No mid-selection guard is needed — a range
      // in progress writes nothing to `value`, so whatever is here is a genuinely committed range and
      // withholding it would drop a real value from the form for as long as the user drags a new one.
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
    allowsNonContiguousRanges,
    commitBehavior,
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
    focusNearestAvailableDate,
    highlightDate,
    clearAnchor,
    commitSelection,
    clearSelection,
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
    isSelectionStart,
    isSelectionEnd,
    formatCellName,
    formatFullDate: formatFull,
    collection,
    listFocus,
    pendingCursorFocus,
    setPendingCursorFocus,
    announce,
  };
}

/** Nothing selected — `null` in single/range, an empty array in multiple. */
function isEmptySelection(value: CalendarValue): boolean {
  return value == null || (Array.isArray(value) && value.length === 0);
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
