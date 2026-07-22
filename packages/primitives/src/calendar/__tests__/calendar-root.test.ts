import { CalendarDate, type DateValue } from "@internationalized/date";
import { createRoot, flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import {
  type CreateCalendarOptions,
  type CreateCalendarReturn,
  createCalendar,
} from "../calendar-root";

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

  it("range: highlightDate drives highlightedRange + isHighlighted while mid-selection; null clears", () => {
    const { api, dispose } = setup({ selectionMode: "range" });
    // Anchor the range, then hover a later day.
    flush(() => api.activate(new CalendarDate(2026, 1, 10)));
    flush(() => api.highlightDate(new CalendarDate(2026, 1, 14)));

    const range = api.highlightedRange();
    expect(range).not.toBeNull();
    expect(iso(range?.start as CalendarDate)).toBe("2026-01-10");
    expect(iso(range?.end as CalendarDate)).toBe("2026-01-14");
    expect(api.isHighlighted(new CalendarDate(2026, 1, 12))).toBe(true);
    expect(api.isHighlighted(new CalendarDate(2026, 1, 15))).toBe(false);

    flush(() => api.highlightDate(null));
    expect(api.highlightedRange()).toBeNull();
    expect(api.isHighlighted(new CalendarDate(2026, 1, 12))).toBe(false);
    dispose();
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
