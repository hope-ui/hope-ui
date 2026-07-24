import { CalendarDate, type DateValue } from "@internationalized/date";
import { createRoot, createSignal, flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import {
  type CreateCalendarOptions,
  type CreateCalendarReturn,
  createCalendar,
} from "../calendar-root";
import type { CalendarValue } from "../utils/selection";

// The state machine injects nothing DOM-ish (the announcer no-ops without `document`), so it drives
// entirely in a `createRoot`. `flush()` wraps writes because solid-js's *client* build defers them.
function setup(options: CreateCalendarOptions = {}): {
  api: CreateCalendarReturn;
  dispose: () => void;
} {
  let api!: CreateCalendarReturn;
  let dispose!: () => void;
  createRoot((d) => {
    dispose = d;
    api = createCalendar({ defaultFocusedValue: new CalendarDate(2026, 1, 15), ...options });
  });
  return { api, dispose };
}

const iso = (date: DateValue) => date.toString();

describe("createCalendar — initial state", () => {
  it("starts in month view, seeded from defaultFocusedValue", () => {
    const { api, dispose } = setup();
    expect(api.view()).toBe("month");
    expect(iso(api.focusedDate())).toBe("2026-01-15");
    expect(iso(api.visibleMonth())).toBe("2026-01-01");
    expect(api.headingLabel()).toBe("January 2026");
    expect(api.cells()[0]).toHaveLength(7);
    dispose();
  });

  it("seeds the cursor from the value when no focused value is given", () => {
    const { api, dispose } = setup({
      defaultFocusedValue: undefined,
      defaultValue: new CalendarDate(2030, 5, 9),
    });
    expect(iso(api.focusedDate())).toBe("2030-05-09");
    expect(iso(api.visibleMonth())).toBe("2030-05-01");
    dispose();
  });
});

describe("createCalendar — period navigation", () => {
  it("next()/prev() shift the visible month and clamp the cursor", () => {
    const { api, dispose } = setup({ defaultFocusedValue: new CalendarDate(2026, 1, 31) });
    flush(() => api.next());
    expect(iso(api.visibleMonth())).toBe("2026-02-01");
    expect(iso(api.focusedDate())).toBe("2026-02-28"); // Jan 31 clamps into Feb
    flush(() => api.prev());
    expect(iso(api.visibleMonth())).toBe("2026-01-01");
    dispose();
  });

  it("gates prev/next on min/max", () => {
    const { api, dispose } = setup({
      defaultFocusedValue: new CalendarDate(2026, 1, 15),
      min: new CalendarDate(2026, 1, 1),
      max: new CalendarDate(2026, 1, 31),
    });
    expect(api.isPrevDisabled()).toBe(true);
    expect(api.isNextDisabled()).toBe(true);
    flush(() => api.prev());
    expect(iso(api.visibleMonth())).toBe("2026-01-01"); // no-op
    dispose();
  });
});

describe("createCalendar — view machine", () => {
  it("drills up month → year → decade and no further", () => {
    const { api, dispose } = setup();
    flush(() => api.drillUp());
    expect(api.view()).toBe("year");
    expect(api.canDrillUp()).toBe(true);
    flush(() => api.drillUp());
    expect(api.view()).toBe("decade");
    expect(api.canDrillUp()).toBe(false);
    flush(() => api.drillUp());
    expect(api.view()).toBe("decade"); // no-op at the top
    dispose();
  });

  it("drills down decade → year → month, landing focus on the chosen period", () => {
    const { api, dispose } = setup();
    flush(() => api.setView("decade"));
    flush(() => api.drillDownTo(new CalendarDate(2027, 1, 1)));
    expect(api.view()).toBe("year");
    expect(api.focusedDate().year).toBe(2027);
    flush(() => api.drillDownTo(new CalendarDate(2027, 6, 1)));
    expect(api.view()).toBe("month");
    expect(iso(api.visibleMonth())).toBe("2027-06-01");
    dispose();
  });

  it("normalizes the cursor to the view granularity", () => {
    const { api, dispose } = setup({ defaultFocusedValue: new CalendarDate(2026, 6, 15) });
    flush(() => api.setView("year"));
    expect(iso(api.focusedDate())).toBe("2026-06-01"); // month start
    flush(() => api.setView("decade"));
    expect(iso(api.focusedDate())).toBe("2026-01-01"); // year start
    dispose();
  });
});

describe("createCalendar — cursor constraining", () => {
  it("lands prev() on min rather than stranding the cursor out of range", () => {
    // Without the clamp, Feb 3 → Jan 3, which is before min: non-focusable, arrow-skipped, yet still
    // the roving tab stop.
    const { api, dispose } = setup({
      defaultFocusedValue: new CalendarDate(2026, 2, 3),
      min: new CalendarDate(2026, 1, 10),
    });
    flush(() => api.prev());
    expect(iso(api.visibleMonth())).toBe("2026-01-01");
    expect(iso(api.focusedDate())).toBe("2026-01-10");
    expect(api.isDateNonFocusable(api.focusedDate())).toBe(false);
    dispose();
  });

  it("clamps every cursor move to max", () => {
    const { api, dispose } = setup({ max: new CalendarDate(2026, 1, 25) });
    flush(() => api.setFocusedDate(new CalendarDate(2026, 1, 31)));
    expect(iso(api.focusedDate())).toBe("2026-01-25");
    dispose();
  });

  it("clamps an out-of-range defaultFocusedValue on mount, before it seeds the visible month", () => {
    // Read without a flush: the visible month here comes from the seed, not from the scope effect —
    // the month grid is a variable 4–6 rows, so a post-mount correction would be a hydration mismatch.
    const { api, dispose } = setup({
      defaultFocusedValue: new CalendarDate(2025, 12, 5),
      min: new CalendarDate(2026, 1, 10),
    });
    expect(iso(api.focusedDate())).toBe("2026-01-10");
    expect(iso(api.visibleMonth())).toBe("2026-01-01");
    dispose();
  });

  it("clamps a controlled focusedValue that sits outside the bounds", () => {
    const { api, dispose } = setup({
      focusedValue: new CalendarDate(2026, 1, 3),
      min: new CalendarDate(2026, 1, 10),
    });
    expect(iso(api.focusedDate())).toBe("2026-01-10");
    dispose();
  });

  it("re-clamps the cursor when the bounds narrow after mount", () => {
    // Its own root: `setup` spreads its options, which would flatten the reactive `min` getter.
    const [min, setMin] = createSignal(new CalendarDate(2026, 1, 1));
    let api!: CreateCalendarReturn;
    let dispose!: () => void;
    createRoot((d) => {
      dispose = d;
      api = createCalendar({
        defaultFocusedValue: new CalendarDate(2026, 1, 15),
        get min() {
          return min();
        },
      });
    });
    expect(iso(api.focusedDate())).toBe("2026-01-15");
    flush(() => setMin(new CalendarDate(2026, 1, 20)));
    expect(iso(api.focusedDate())).toBe("2026-01-20");
    dispose();
  });

  it("keeps a clamped year/decade cursor on a cell that exists", () => {
    // The clamp is day-level, so it must be re-floored to the view's granularity — otherwise the
    // cursor sits on min's *day* and no rendered month/year cell matches it under `isSameDay`.
    const { api, dispose } = setup({ min: new CalendarDate(2026, 3, 10) });
    flush(() => api.setView("year"));
    flush(() => api.setFocusedDate(new CalendarDate(2026, 1, 1)));
    expect(iso(api.focusedDate())).toBe("2026-03-01");

    flush(() => api.setView("decade"));
    flush(() => api.setFocusedDate(new CalendarDate(2020, 1, 1)));
    expect(iso(api.focusedDate())).toBe("2026-01-01");
    dispose();
  });
});

describe("createCalendar — cursor crossing", () => {
  it("pulls the visible month along when the cursor leaves it", () => {
    const { api, dispose } = setup({ defaultFocusedValue: new CalendarDate(2026, 1, 31) });
    flush(() => api.setFocusedDate(new CalendarDate(2026, 2, 1)));
    expect(iso(api.focusedDate())).toBe("2026-02-01");
    expect(iso(api.visibleMonth())).toBe("2026-02-01");
    dispose();
  });
});

describe("createCalendar — selection", () => {
  it("single: replaces the selection and commits every activate", () => {
    const onValueChange = vi.fn();
    const { api, dispose } = setup({ onValueChange });
    flush(() => api.activate(new CalendarDate(2026, 1, 20)));
    expect(iso(api.selectionValue() as DateValue)).toBe("2026-01-20");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    dispose();
  });

  it("range: anchors on the first activate, commits (emits) only on the second", () => {
    const onValueChange = vi.fn();
    const { api, dispose } = setup({ selectionMode: "range", onValueChange });
    flush(() => api.activate(new CalendarDate(2026, 1, 20)));
    expect(api.anchorDate()).not.toBeNull();
    expect(onValueChange).not.toHaveBeenCalled();

    flush(() => api.activate(new CalendarDate(2026, 1, 10)));
    expect(api.anchorDate()).toBeNull();
    const value = api.selectionValue() as { start: CalendarDate; end: CalendarDate };
    expect(iso(value.start)).toBe("2026-01-10");
    expect(iso(value.end)).toBe("2026-01-20");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    dispose();
  });

  it("range: the tentative band tracks the roving cursor, however the cursor moved", () => {
    const { api, dispose } = setup({ selectionMode: "range" });
    flush(() => api.activate(new CalendarDate(2026, 1, 10)));
    // Anchoring alone opens a one-day band on the anchor — the cursor is already there.
    expect(iso(api.highlightedRange()?.end as CalendarDate)).toBe("2026-01-10");

    // A keyboard move (setFocusedDate) grows the band, with no hover involved at all.
    flush(() => api.setFocusedDate(new CalendarDate(2026, 1, 14)));
    const range = api.highlightedRange();
    expect(iso(range?.start as CalendarDate)).toBe("2026-01-10");
    expect(iso(range?.end as CalendarDate)).toBe("2026-01-14");
    expect(api.isHighlighted(new CalendarDate(2026, 1, 12))).toBe(true);
    expect(api.isHighlighted(new CalendarDate(2026, 1, 15))).toBe(false);

    // `highlightDate` (the hover path) is the same move, so the two can never disagree.
    flush(() => api.highlightDate(new CalendarDate(2026, 1, 18)));
    expect(iso(api.focusedDate())).toBe("2026-01-18");
    expect(iso(api.highlightedRange()?.end as CalendarDate)).toBe("2026-01-18");

    // Completing the range clears the anchor, and with it the tentative band.
    flush(() => api.activate(new CalendarDate(2026, 1, 18)));
    expect(api.anchorDate()).toBeNull();
    expect(api.highlightedRange()).toBeNull();
    expect(api.isHighlighted(new CalendarDate(2026, 1, 12))).toBe(false);
    dispose();
  });

  it("highlightDate is inert with no anchor — hover never steals the roving cursor", () => {
    const { api, dispose } = setup({ selectionMode: "range" });
    flush(() => api.highlightDate(new CalendarDate(2026, 1, 22)));
    expect(iso(api.focusedDate())).toBe("2026-01-15"); // the seed, untouched
    expect(api.highlightedRange()).toBeNull();
    dispose();
  });

  it("range: marks the tentative band's endpoints, in whichever direction it was drawn", () => {
    const { api, dispose } = setup({ selectionMode: "range" });
    const anchor = new CalendarDate(2026, 1, 10);
    flush(() => api.activate(anchor));

    // Moving forward: the anchor opens the band, the cursor's day closes it.
    flush(() => api.highlightDate(new CalendarDate(2026, 1, 14)));
    expect(api.isHighlightedStart(anchor)).toBe(true);
    expect(api.isHighlightedEnd(new CalendarDate(2026, 1, 14))).toBe(true);
    // The interior is in the band but caps neither end.
    expect(api.isHighlighted(new CalendarDate(2026, 1, 12))).toBe(true);
    expect(api.isHighlightedStart(new CalendarDate(2026, 1, 12))).toBe(false);
    expect(api.isHighlightedEnd(new CalendarDate(2026, 1, 12))).toBe(false);

    // Moving back past the anchor swaps which end each date caps (the range is ordered).
    flush(() => api.highlightDate(new CalendarDate(2026, 1, 6)));
    expect(api.isHighlightedStart(new CalendarDate(2026, 1, 6))).toBe(true);
    expect(api.isHighlightedEnd(anchor)).toBe(true);
    expect(api.isHighlightedStart(anchor)).toBe(false);

    // Back on the anchor itself: a one-day band, so it is both endpoints at once.
    flush(() => api.highlightDate(anchor));
    expect(api.isHighlightedStart(anchor)).toBe(true);
    expect(api.isHighlightedEnd(anchor)).toBe(true);
    dispose();
  });

  it("single/multiple: never report a tentative band, whatever the cursor does", () => {
    for (const selectionMode of ["single", "multiple"] as const) {
      const { api, dispose } = setup({ selectionMode });
      const date = new CalendarDate(2026, 1, 10);
      flush(() => api.activate(date));
      flush(() => api.setFocusedDate(new CalendarDate(2026, 1, 14)));
      expect(api.highlightedRange()).toBeNull();
      expect(api.isHighlightedStart(date)).toBe(false);
      expect(api.isHighlightedEnd(new CalendarDate(2026, 1, 14))).toBe(false);
      // With no anchor to preview, hover is a no-op in these modes — the cursor stays put.
      flush(() => api.highlightDate(new CalendarDate(2026, 1, 22)));
      expect(iso(api.focusedDate())).toBe("2026-01-14");
      dispose();
    }
  });

  it("multiple: toggles a sorted set", () => {
    const { api, dispose } = setup({ selectionMode: "multiple" });
    flush(() => api.activate(new CalendarDate(2026, 1, 20)));
    flush(() => api.activate(new CalendarDate(2026, 1, 10)));
    expect((api.selectionValue() as CalendarDate[]).map(iso)).toEqual(["2026-01-10", "2026-01-20"]);
    flush(() => api.activate(new CalendarDate(2026, 1, 20)));
    expect((api.selectionValue() as CalendarDate[]).map(iso)).toEqual(["2026-01-10"]);
    dispose();
  });

  it("activate drills (not selects) in year/decade view", () => {
    const { api, dispose } = setup();
    flush(() => api.setView("year"));
    flush(() => api.activate(new CalendarDate(2026, 6, 1)));
    expect(api.view()).toBe("month");
    expect(api.selectionValue()).toBeNull();
    dispose();
  });

  it("refuses to select an unavailable or out-of-range date", () => {
    const { api, dispose } = setup({
      isDateDisabled: (d) => d.day === 20,
      max: new CalendarDate(2026, 1, 25),
    });
    flush(() => api.activate(new CalendarDate(2026, 1, 20))); // unavailable
    expect(api.selectionValue()).toBeNull();
    flush(() => api.activate(new CalendarDate(2026, 1, 26))); // out of range
    expect(api.selectionValue()).toBeNull();
    dispose();
  });
});

describe("createCalendar — abandoning a range in progress", () => {
  const range = { selectionMode: "range" as const };
  const committed = {
    ...range,
    defaultValue: { start: new CalendarDate(2026, 1, 2), end: new CalendarDate(2026, 1, 4) },
  };
  const asRange = (value: CalendarValue) => value as { start: CalendarDate; end: CalendarDate };

  it("defaults commitBehavior to select, and reports the configured one", () => {
    const { api, dispose } = setup(range);
    expect(api.commitBehavior()).toBe("select");
    dispose();
    const clearing = setup({ ...range, commitBehavior: "clear" });
    expect(clearing.api.commitBehavior()).toBe("clear");
    clearing.dispose();
  });

  it("clearAnchor restores the range committed before the abandoned one, silently", () => {
    const onValueChange = vi.fn();
    const { api, dispose } = setup({ ...committed, onValueChange });
    flush(() => api.activate(new CalendarDate(2026, 1, 10)));
    // Mid-selection the value is the degenerate in-progress `{ anchor, anchor }` — deliberate, and
    // exactly why the pre-anchor snapshot exists.
    expect(iso(asRange(api.selectionValue()).start)).toBe("2026-01-10");

    flush(() => api.clearAnchor());
    expect(api.anchorDate()).toBeNull();
    expect(iso(asRange(api.selectionValue()).start)).toBe("2026-01-02");
    expect(iso(asRange(api.selectionValue()).end)).toBe("2026-01-04");
    // The consumer was never told about the in-progress value, so putting it back is not a change.
    expect(onValueChange).not.toHaveBeenCalled();
    dispose();
  });

  it("clearAnchor leaves an untouched calendar empty, and is inert with no anchor", () => {
    const { api, dispose } = setup(range);
    flush(() => api.clearAnchor()); // nothing anchored — a no-op
    expect(api.selectionValue()).toBeNull();

    flush(() => api.activate(new CalendarDate(2026, 1, 10)));
    flush(() => api.clearAnchor());
    expect(api.anchorDate()).toBeNull();
    expect(api.selectionValue()).toBeNull();
    expect(api.highlightedRange()).toBeNull();
    dispose();
  });

  it("commitSelection completes the tentative range at the cursor", () => {
    const onValueChange = vi.fn();
    const { api, dispose } = setup({ ...range, onValueChange });
    flush(() => api.activate(new CalendarDate(2026, 1, 10)));
    flush(() => api.setFocusedDate(new CalendarDate(2026, 1, 14)));

    flush(() => api.commitSelection());
    expect(api.anchorDate()).toBeNull();
    expect(iso(asRange(api.selectionValue()).start)).toBe("2026-01-10");
    expect(iso(asRange(api.selectionValue()).end)).toBe("2026-01-14");
    expect(onValueChange).toHaveBeenCalledTimes(1);

    flush(() => api.commitSelection()); // no anchor left — inert
    expect(onValueChange).toHaveBeenCalledTimes(1);
    dispose();
  });

  it("commitSelection abandons rather than leave a range in progress on an unselectable cursor", () => {
    // Only reachable with the contiguity narrowing off: otherwise the bounds keep the cursor inside
    // the anchor's available run, so it can never land on an unavailable day.
    const onValueChange = vi.fn();
    const { api, dispose } = setup({
      ...range,
      allowsNonContiguousRanges: true,
      isDateDisabled: (date) => date.day === 17,
      onValueChange,
    });
    flush(() => api.activate(new CalendarDate(2026, 1, 10)));
    flush(() => api.setFocusedDate(new CalendarDate(2026, 1, 17)));

    flush(() => api.commitSelection());
    expect(api.anchorDate()).toBeNull();
    expect(api.selectionValue()).toBeNull();
    expect(onValueChange).not.toHaveBeenCalled();
    dispose();
  });

  it("commitSelection abandons rather than drill when the calendar is not in month view", () => {
    // `activate` descends a view outside month view, so committing there would silently drill *and*
    // leave the range in progress.
    const onValueChange = vi.fn();
    const { api, dispose } = setup({ ...committed, onValueChange });
    flush(() => api.activate(new CalendarDate(2026, 1, 10)));
    flush(() => api.drillUp());
    expect(api.view()).toBe("year");

    flush(() => api.commitSelection());
    expect(api.view()).toBe("year");
    expect(api.anchorDate()).toBeNull();
    expect(iso(asRange(api.selectionValue()).start)).toBe("2026-01-02");
    expect(onValueChange).not.toHaveBeenCalled();
    dispose();
  });

  it("clearSelection empties the selection and emits — once, and never for an already-empty one", () => {
    const onValueChange = vi.fn();
    const { api, dispose } = setup({ ...committed, onValueChange });
    flush(() => api.activate(new CalendarDate(2026, 1, 10)));

    flush(() => api.clearSelection());
    expect(api.anchorDate()).toBeNull();
    expect(api.selectionValue()).toBeNull();
    expect(onValueChange).toHaveBeenCalledWith(null);
    expect(onValueChange).toHaveBeenCalledTimes(1);

    // The consumer already knows it is empty — anchoring and clearing again changes nothing for them.
    flush(() => api.activate(new CalendarDate(2026, 1, 12)));
    flush(() => api.clearSelection());
    expect(onValueChange).toHaveBeenCalledTimes(1);
    dispose();
  });

  it("clearSelection empties a multiple-selection calendar to []", () => {
    const onValueChange = vi.fn();
    const { api, dispose } = setup({ selectionMode: "multiple", onValueChange });
    flush(() => api.activate(new CalendarDate(2026, 1, 10)));
    flush(() => api.clearSelection());
    expect(api.selectionValue()).toEqual([]);
    expect(onValueChange).toHaveBeenLastCalledWith([]);
    dispose();
  });
});

describe("createCalendar — the selection paint", () => {
  const committedRange = {
    selectionMode: "range" as const,
    defaultValue: { start: new CalendarDate(2026, 1, 10), end: new CalendarDate(2026, 1, 20) },
  };

  it("cuts an unavailable day out of a committed range", () => {
    const { api, dispose } = setup({ ...committedRange, isDateDisabled: (d) => d.day === 15 });
    // The interior paints as it always did…
    expect(api.isSelected(new CalendarDate(2026, 1, 12))).toBe(true);
    expect(api.isRangeMiddle(new CalendarDate(2026, 1, 12))).toBe(true);
    // …but the unavailable day is not selectable, so it must not read as selected either.
    expect(api.isSelected(new CalendarDate(2026, 1, 15))).toBe(false);
    expect(api.isRangeMiddle(new CalendarDate(2026, 1, 15))).toBe(false);
    dispose();
  });

  it("cuts an out-of-range day — and the endpoint beyond it — out of a committed range", () => {
    // `max` narrowed after the range was committed: everything past it is inert, so nothing past it
    // may paint, including the range's own end.
    const { api, dispose } = setup({ ...committedRange, max: new CalendarDate(2026, 1, 18) });
    expect(api.isRangeStart(new CalendarDate(2026, 1, 10))).toBe(true);
    expect(api.isSelected(new CalendarDate(2026, 1, 18))).toBe(true);
    expect(api.isSelected(new CalendarDate(2026, 1, 19))).toBe(false);
    expect(api.isSelected(new CalendarDate(2026, 1, 20))).toBe(false);
    expect(api.isRangeEnd(new CalendarDate(2026, 1, 20))).toBe(false);
    dispose();
  });

  it("keeps the band continuous across the month boundary", () => {
    // The outside-scope filler days are non-focusable but not `isCellDisabled`, so they stay painted —
    // otherwise a range straddling two months would render with a hole at the seam.
    const { api, dispose } = setup({
      selectionMode: "range",
      defaultValue: { start: new CalendarDate(2025, 12, 28), end: new CalendarDate(2026, 1, 5) },
    });
    const dec30 = new CalendarDate(2025, 12, 30);
    expect(api.isOutsideVisibleScope(dec30)).toBe(true);
    expect(api.isSelected(dec30)).toBe(true);
    expect(api.isRangeMiddle(dec30)).toBe(true);
    dispose();
  });

  it("keeps a read-only calendar's selection visible", () => {
    // `readOnly` refuses *changes*; it does not make the current value non-selectable, so — unlike
    // `disabled` — it leaves the paint alone.
    const { api, dispose } = setup({ readOnly: true, defaultValue: new CalendarDate(2026, 1, 20) });
    expect(api.isSelected(new CalendarDate(2026, 1, 20))).toBe(true);
    dispose();
  });

  it("paints nothing when the whole calendar is disabled", () => {
    // React Aria parity: `disabled` is the first arm of `isCellDisabled`, and `isSelected` is false
    // for every cell-disabled day — a disabled calendar shows no selection at all.
    const { api, dispose } = setup({ disabled: true, defaultValue: new CalendarDate(2026, 1, 20) });
    expect(api.selectionValue()).not.toBeNull(); // the value itself is untouched
    expect(api.isSelected(new CalendarDate(2026, 1, 20))).toBe(false);
    dispose();
  });
});

describe("createCalendar — contiguous ranges", () => {
  // Jan 5 and Jan 17 unavailable ⇒ the run around an anchor of Jan 10 is Jan 6 … Jan 16.
  const contiguousRange = {
    selectionMode: "range" as const,
    isDateDisabled: (date: CalendarDate) => date.day === 5 || date.day === 17,
  };
  const anchor = new CalendarDate(2026, 1, 10);
  const pastTheRun = new CalendarDate(2026, 1, 18);

  it("narrows the bounds to the anchor's available run, and restores them on commit", () => {
    const { api, dispose } = setup(contiguousRange);
    expect(api.min()).toBeUndefined();
    expect(api.max()).toBeUndefined();

    flush(() => api.activate(anchor));
    expect(iso(api.min() as DateValue)).toBe("2026-01-06");
    expect(iso(api.max() as DateValue)).toBe("2026-01-16");
    // Narrowing the bounds is what makes every downstream predicate inherit the constraint.
    expect(api.isCellDisabled(pastTheRun)).toBe(true);
    expect(api.isDateNonFocusable(pastTheRun)).toBe(true);
    expect(api.isDateSelectable(pastTheRun)).toBe(false);
    // Including the nav: nothing outside the run is selectable, so there is nowhere to page to.
    expect(api.isPrevDisabled()).toBe(true);
    expect(api.isNextDisabled()).toBe(true);

    flush(() => api.activate(new CalendarDate(2026, 1, 14)));
    expect(api.anchorDate()).toBeNull();
    expect(api.min()).toBeUndefined();
    expect(api.isCellDisabled(pastTheRun)).toBe(false);
    expect(api.isPrevDisabled()).toBe(false);
    dispose();
  });

  it("caps the tentative band at the unavailable day, whichever way the cursor moves", () => {
    const { api, dispose } = setup(contiguousRange);
    flush(() => api.activate(anchor));

    // The cursor clamp is the same one the band rides, so hover and keyboard cap identically.
    flush(() => api.highlightDate(new CalendarDate(2026, 1, 25)));
    expect(iso(api.focusedDate())).toBe("2026-01-16");
    expect(iso(api.highlightedRange()?.end as CalendarDate)).toBe("2026-01-16");
    expect(api.isHighlighted(pastTheRun)).toBe(false);

    flush(() => api.setFocusedDate(new CalendarDate(2026, 1, 1)));
    expect(iso(api.focusedDate())).toBe("2026-01-06");
    expect(iso(api.highlightedRange()?.start as CalendarDate)).toBe("2026-01-06");
    dispose();
  });

  it("commits at the run's edge when activated past it", () => {
    const onValueChange = vi.fn();
    const { api, dispose } = setup({ ...contiguousRange, onValueChange });
    flush(() => api.activate(anchor));
    flush(() => api.activate(new CalendarDate(2026, 1, 25)));

    const value = api.selectionValue() as { start: CalendarDate; end: CalendarDate };
    expect(iso(value.start)).toBe("2026-01-10");
    expect(iso(value.end)).toBe("2026-01-16");
    expect(iso(api.focusedDate())).toBe("2026-01-16");
    expect(onValueChange).toHaveBeenCalledTimes(1);
    dispose();
  });

  it("keeps the outright refusal outside an anchored run", () => {
    // No anchor ⇒ no narrowing ⇒ no clamp: an out-of-range activation is still a no-op, not a commit
    // at `max`. Only the narrowing this option introduces is clamped away.
    const { api, dispose } = setup({ ...contiguousRange, max: new CalendarDate(2026, 1, 25) });
    flush(() => api.activate(new CalendarDate(2026, 1, 26)));
    expect(api.selectionValue()).toBeNull();
    expect(api.anchorDate()).toBeNull();
    dispose();
  });

  it("tightens the consumer's own bounds rather than replacing them", () => {
    const { api, dispose } = setup({
      ...contiguousRange,
      min: new CalendarDate(2026, 1, 8),
      max: new CalendarDate(2026, 1, 20),
    });
    flush(() => api.activate(anchor));
    // Whichever side is stricter wins: `min` from the consumer, `max` from the run.
    expect(iso(api.min() as DateValue)).toBe("2026-01-08");
    expect(iso(api.max() as DateValue)).toBe("2026-01-16");
    dispose();
  });

  it("allowsNonContiguousRanges leaves the bounds alone", () => {
    const { api, dispose } = setup({ ...contiguousRange, allowsNonContiguousRanges: true });
    flush(() => api.activate(anchor));
    expect(api.min()).toBeUndefined();
    expect(api.max()).toBeUndefined();
    expect(api.isCellDisabled(pastTheRun)).toBe(false);

    // The band spans the unavailable day, which the paint still cuts out of it.
    flush(() => api.highlightDate(new CalendarDate(2026, 1, 25)));
    expect(api.isHighlighted(pastTheRun)).toBe(true);
    flush(() => api.activate(new CalendarDate(2026, 1, 25)));
    const value = api.selectionValue() as { start: CalendarDate; end: CalendarDate };
    expect(iso(value.end)).toBe("2026-01-25");
    expect(api.isSelected(new CalendarDate(2026, 1, 17))).toBe(false);
    dispose();
  });

  it("is inert without an isDateDisabled predicate, and in the anchorless modes", () => {
    const { api, dispose } = setup({ selectionMode: "range" });
    flush(() => api.activate(anchor));
    expect(api.min()).toBeUndefined();
    dispose();

    for (const selectionMode of ["single", "multiple"] as const) {
      const anchorless = setup({ ...contiguousRange, selectionMode });
      flush(() => anchorless.api.activate(anchor));
      expect(anchorless.api.min()).toBeUndefined();
      expect(anchorless.api.max()).toBeUndefined();
      anchorless.dispose();
    }
  });

  it("releases the bounds when selectionMode leaves range mid-selection", () => {
    // Nothing clears `anchorDate` on a mode switch, so gating only on the anchor would leave the
    // calendar clamped to a five-day window in a mode that has no ranges at all.
    // Its own root: `setup` spreads its options, which would flatten the reactive getter.
    const [selectionMode, setSelectionMode] = createSignal<"range" | "single">("range");
    let api!: CreateCalendarReturn;
    let dispose!: () => void;
    createRoot((d) => {
      dispose = d;
      api = createCalendar({
        defaultFocusedValue: new CalendarDate(2026, 1, 15),
        isDateDisabled: contiguousRange.isDateDisabled,
        get selectionMode() {
          return selectionMode();
        },
      });
    });
    flush(() => api.activate(anchor));
    expect(iso(api.max() as DateValue)).toBe("2026-01-16");

    flush(() => setSelectionMode("single"));
    expect(api.anchorDate()).not.toBeNull(); // the stale anchor is still there…
    expect(api.max()).toBeUndefined(); // …but it no longer bounds anything
    expect(api.isCellDisabled(pastTheRun)).toBe(false);
    dispose();
  });
});

describe("createCalendar — native form", () => {
  it("exposes name/form/required accessors, defaulting required to false", () => {
    const { api, dispose } = setup();
    expect(api.name()).toBeUndefined();
    expect(api.form()).toBeUndefined();
    expect(api.required()).toBe(false);
    expect(api.formValues()).toEqual([]); // nothing to submit without a name
    dispose();

    const custom = setup({ name: "date", form: "signup", required: true });
    expect(custom.api.name()).toBe("date");
    expect(custom.api.form()).toBe("signup");
    expect(custom.api.required()).toBe(true);
    custom.dispose();
  });

  it("single: formValues carries the ISO date; empty without a name or a selection", () => {
    // A selection with no `name` still submits nothing (form support is opt-in via `name`).
    const anon = setup({ defaultValue: new CalendarDate(2026, 1, 20) });
    expect(anon.api.formValues()).toEqual([]);
    anon.dispose();

    const { api, dispose } = setup({ name: "date" });
    expect(api.formValues()).toEqual([]); // no selection yet
    flush(() => api.activate(new CalendarDate(2026, 1, 20)));
    expect(api.formValues()).toEqual([{ name: "date", value: "2026-01-20" }]);
    dispose();
  });

  it("multiple: one entry per selected date, all sharing the name", () => {
    const { api, dispose } = setup({ name: "days", selectionMode: "multiple" });
    flush(() => api.activate(new CalendarDate(2026, 1, 20)));
    flush(() => api.activate(new CalendarDate(2026, 1, 10)));
    expect(api.formValues()).toEqual([
      { name: "days", value: "2026-01-10" },
      { name: "days", value: "2026-01-20" },
    ]);
    dispose();
  });

  it("range: empty mid-selection, paired Start/End once complete", () => {
    const { api, dispose } = setup({ name: "trip", selectionMode: "range" });
    flush(() => api.activate(new CalendarDate(2026, 1, 20))); // anchor set — in progress
    expect(api.anchorDate()).not.toBeNull();
    expect(api.formValues()).toEqual([]); // empty until the range completes

    flush(() => api.activate(new CalendarDate(2026, 1, 10))); // completes (ordered)
    expect(api.anchorDate()).toBeNull();
    expect(api.formValues()).toEqual([
      { name: "tripStart", value: "2026-01-10" },
      { name: "tripEnd", value: "2026-01-20" },
    ]);
    dispose();
  });
});

describe("createCalendar — whole-calendar disabled", () => {
  it("makes every cell inert and both nav buttons disabled", () => {
    const { api, dispose } = setup({ disabled: true });
    const jan15 = new CalendarDate(2026, 1, 15);
    expect(api.isCellDisabled(jan15)).toBe(true);
    expect(api.isDateNonFocusable(jan15)).toBe(true);
    expect(api.isDateSelectable(jan15)).toBe(false);
    // Nav is as inert as the cells — otherwise a disabled calendar still pages.
    expect(api.isPrevDisabled()).toBe(true);
    expect(api.isNextDisabled()).toBe(true);
    flush(() => api.next());
    expect(iso(api.visibleMonth())).toBe("2026-01-01");
    dispose();
  });

  it("leaves an enabled calendar's in-range days untouched", () => {
    const { api, dispose } = setup();
    expect(api.isCellDisabled(new CalendarDate(2026, 1, 15))).toBe(false);
    expect(api.isPrevDisabled()).toBe(false);
    expect(api.isNextDisabled()).toBe(false);
    dispose();
  });

  it("keeps isCellDisabled to the calendar's own bounds, not the visible scope", () => {
    // The outside-month filler days are non-focusable, but not `isCellDisabled`: they keep their
    // `data-outside-month` tint instead of being repainted dim.
    const { api, dispose } = setup({ min: new CalendarDate(2026, 1, 10) });
    const nextMonth = new CalendarDate(2026, 2, 3);
    expect(api.isOutsideVisibleScope(nextMonth)).toBe(true);
    expect(api.isCellDisabled(nextMonth)).toBe(false);
    expect(api.isDateNonFocusable(nextMonth)).toBe(true);
    // A day before `min` is out of range — inert *and* dimmed.
    expect(api.isCellDisabled(new CalendarDate(2026, 1, 5))).toBe(true);
    dispose();
  });
});

describe("createCalendar — per-date predicates", () => {
  it("classifies non-focusable (outside/out-of-range) vs unavailable", () => {
    const { api, dispose } = setup({
      min: new CalendarDate(2026, 1, 10),
      isDateDisabled: (d) => d.day === 15,
    });
    // A day before min is hard out-of-range (non-focusable).
    expect(api.isDateNonFocusable(new CalendarDate(2026, 1, 5))).toBe(true);
    expect(api.isDateSelectable(new CalendarDate(2026, 1, 5))).toBe(false);
    // The unavailable day stays focusable but not selectable.
    expect(api.isDateNonFocusable(new CalendarDate(2026, 1, 15))).toBe(false);
    expect(api.isDateUnavailable(new CalendarDate(2026, 1, 15))).toBe(true);
    expect(api.isDateSelectable(new CalendarDate(2026, 1, 15))).toBe(false);
    // A next-month day (outside the visible scope) is non-focusable.
    expect(api.isOutsideVisibleScope(new CalendarDate(2026, 2, 1))).toBe(true);
    dispose();
  });
});
