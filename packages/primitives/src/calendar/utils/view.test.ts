import { CalendarDate } from "@internationalized/date";
import { describe, expect, it } from "vitest";
import {
  decadeStart,
  isInViewScope,
  normalizeFocusForView,
  VIEW_COLUMNS,
  YEARS_PER_DECADE,
} from "./view";

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
