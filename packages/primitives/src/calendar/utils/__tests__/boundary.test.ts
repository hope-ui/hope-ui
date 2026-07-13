import { CalendarDate } from "@internationalized/date";
import { describe, expect, it } from "vitest";
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
} from "../boundary";

const min = new CalendarDate(2026, 2, 1);
const max = new CalendarDate(2026, 2, 28);

describe("isDateOutOfRange", () => {
  it("is unbounded when a side is absent", () => {
    expect(isDateOutOfRange(new CalendarDate(1900, 1, 1))).toBe(false);
    expect(isDateOutOfRange(new CalendarDate(2026, 1, 15), undefined, max)).toBe(false);
  });
  it("is true strictly before min / after max", () => {
    expect(isDateOutOfRange(new CalendarDate(2026, 1, 31), min, max)).toBe(true);
    expect(isDateOutOfRange(new CalendarDate(2026, 3, 1), min, max)).toBe(true);
    expect(isDateOutOfRange(new CalendarDate(2026, 2, 15), min, max)).toBe(false);
  });
});

describe("month prev/next disabling", () => {
  it("disables prev when the whole previous month is before min", () => {
    // Visible Feb 2026, min Feb 1 → Jan is entirely before min.
    expect(isPreviousMonthDisabled(new CalendarDate(2026, 2, 1), min)).toBe(true);
    expect(isPreviousMonthDisabled(new CalendarDate(2026, 3, 1), min)).toBe(false);
  });
  it("disables next when the whole next month is after max", () => {
    expect(isNextMonthDisabled(new CalendarDate(2026, 2, 1), max)).toBe(true);
    expect(isNextMonthDisabled(new CalendarDate(2026, 1, 1), max)).toBe(false);
  });
});

describe("year prev/next disabling", () => {
  it("gates on the whole adjacent year", () => {
    expect(isPreviousYearDisabled(new CalendarDate(2026, 6, 1), new CalendarDate(2026, 1, 1))).toBe(
      true,
    );
    expect(isNextYearDisabled(new CalendarDate(2026, 6, 1), new CalendarDate(2026, 12, 31))).toBe(
      true,
    );
    expect(isPreviousYearDisabled(new CalendarDate(2026, 6, 1), new CalendarDate(2020, 1, 1))).toBe(
      false,
    );
  });
});

describe("decade prev/next disabling", () => {
  it("gates on the whole adjacent decade", () => {
    expect(
      isPreviousDecadeDisabled(new CalendarDate(2026, 1, 1), new CalendarDate(2020, 1, 1)),
    ).toBe(true);
    expect(isNextDecadeDisabled(new CalendarDate(2026, 1, 1), new CalendarDate(2029, 12, 31))).toBe(
      true,
    );
    expect(
      isPreviousDecadeDisabled(new CalendarDate(2026, 1, 1), new CalendarDate(2000, 1, 1)),
    ).toBe(false);
  });
});

describe("whole-period out-of-range (year/decade cells)", () => {
  it("isMonthOutOfRange only when the entire month is out", () => {
    // Feb partly in range (min Feb 1) → still reachable.
    expect(isMonthOutOfRange(new CalendarDate(2026, 2, 1), min, max)).toBe(false);
    // January entirely before min.
    expect(isMonthOutOfRange(new CalendarDate(2026, 1, 1), min, max)).toBe(true);
    // March entirely after max.
    expect(isMonthOutOfRange(new CalendarDate(2026, 3, 1), min, max)).toBe(true);
  });
  it("isYearOutOfRange only when the entire year is out", () => {
    expect(isYearOutOfRange(new CalendarDate(2026, 1, 1), min, max)).toBe(false);
    expect(isYearOutOfRange(new CalendarDate(2025, 1, 1), min, max)).toBe(true);
    expect(isYearOutOfRange(new CalendarDate(2027, 1, 1), min, max)).toBe(true);
  });
});
