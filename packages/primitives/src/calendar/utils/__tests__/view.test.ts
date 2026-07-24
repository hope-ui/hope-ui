import { CalendarDate } from "@internationalized/date";
import { describe, expect, it } from "vitest";
import {
  cellPeriod,
  decadeStart,
  isInViewScope,
  normalizeFocusForView,
  periodContains,
  periodsOverlap,
  VIEW_COLUMNS,
  YEARS_PER_DECADE,
} from "../view";

describe("VIEW_COLUMNS / YEARS_PER_DECADE", () => {
  it("is 7 columns in month view, 3 in year/decade", () => {
    expect(VIEW_COLUMNS).toEqual({ month: 7, year: 3, decade: 3 });
    expect(YEARS_PER_DECADE).toBe(10);
  });
});

describe("decadeStart", () => {
  it("floors a year to its decade block", () => {
    expect(decadeStart(2026)).toBe(2020);
    expect(decadeStart(2020)).toBe(2020);
    expect(decadeStart(2029)).toBe(2020);
    expect(decadeStart(2030)).toBe(2030);
    expect(decadeStart(1999)).toBe(1990);
  });
});

describe("normalizeFocusForView", () => {
  const date = new CalendarDate(2026, 6, 15);

  it("keeps the day in month view", () => {
    expect(normalizeFocusForView("month", date).toString()).toBe("2026-06-15");
  });
  it("snaps to the month start in year view", () => {
    expect(normalizeFocusForView("year", date).toString()).toBe("2026-06-01");
  });
  it("snaps to Jan 1 in decade view", () => {
    expect(normalizeFocusForView("decade", date).toString()).toBe("2026-01-01");
  });
});

describe("cellPeriod", () => {
  const date = new CalendarDate(2026, 2, 15);
  const span = (view: "month" | "year" | "decade") => {
    const period = cellPeriod(view, date);
    return [period.start.toString(), period.end.toString()];
  };

  it("is the single day in month view", () => {
    expect(span("month")).toEqual(["2026-02-15", "2026-02-15"]);
  });
  it("is the whole month in year view — leap February included", () => {
    expect(span("year")).toEqual(["2026-02-01", "2026-02-28"]);
    const leap = cellPeriod("year", new CalendarDate(2024, 2, 15));
    expect(leap.end.toString()).toBe("2024-02-29");
  });
  it("is the whole year in decade view", () => {
    expect(span("decade")).toEqual(["2026-01-01", "2026-12-31"]);
  });
});

describe("periodContains / periodsOverlap", () => {
  const jan = { start: new CalendarDate(2026, 1, 1), end: new CalendarDate(2026, 1, 31) };
  const d = (day: number) => new CalendarDate(2026, 1, day);

  it("periodContains is inclusive at both ends", () => {
    expect(periodContains(jan, d(1))).toBe(true);
    expect(periodContains(jan, d(31))).toBe(true);
    expect(periodContains(jan, new CalendarDate(2025, 12, 31))).toBe(false);
    expect(periodContains(jan, new CalendarDate(2026, 2, 1))).toBe(false);
  });

  it("periodContains collapses to a same-day test on a degenerate period", () => {
    const oneDay = cellPeriod("month", d(10));
    expect(periodContains(oneDay, d(10))).toBe(true);
    expect(periodContains(oneDay, d(11))).toBe(false);
  });

  it("periodsOverlap is true for any shared day, false for adjacency", () => {
    expect(periodsOverlap(jan, { start: d(31), end: new CalendarDate(2026, 3, 1) })).toBe(true);
    expect(periodsOverlap(jan, { start: d(5), end: d(6) })).toBe(true); // fully inside
    expect(periodsOverlap({ start: d(5), end: d(6) }, jan)).toBe(true); // symmetric
    expect(
      periodsOverlap(jan, {
        start: new CalendarDate(2026, 2, 1),
        end: new CalendarDate(2026, 2, 28),
      }),
    ).toBe(false); // touching but disjoint
  });
});

describe("isInViewScope", () => {
  const visible = new CalendarDate(2026, 6, 1);

  it("month = same calendar month", () => {
    expect(isInViewScope("month", new CalendarDate(2026, 6, 30), visible)).toBe(true);
    expect(isInViewScope("month", new CalendarDate(2026, 7, 1), visible)).toBe(false);
  });
  it("year = same calendar year", () => {
    expect(isInViewScope("year", new CalendarDate(2026, 12, 31), visible)).toBe(true);
    expect(isInViewScope("year", new CalendarDate(2027, 1, 1), visible)).toBe(false);
  });
  it("decade = same 10-year block", () => {
    expect(isInViewScope("decade", new CalendarDate(2029, 1, 1), visible)).toBe(true);
    expect(isInViewScope("decade", new CalendarDate(2030, 1, 1), visible)).toBe(false);
    expect(isInViewScope("decade", new CalendarDate(2019, 1, 1), visible)).toBe(false);
  });
});
