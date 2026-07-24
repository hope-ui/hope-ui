import { CalendarDate } from "@internationalized/date";
import { describe, expect, it } from "vitest";
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

describe("constrainDate", () => {
  const iso = (date: CalendarDate) => date.toString();

  it("leaves an in-range date alone, including on either bound", () => {
    expect(iso(constrainDate(new CalendarDate(2026, 2, 15), min, max))).toBe("2026-02-15");
    expect(iso(constrainDate(min, min, max))).toBe("2026-02-01");
    expect(iso(constrainDate(max, min, max))).toBe("2026-02-28");
  });

  it("clamps up to min and down to max", () => {
    expect(iso(constrainDate(new CalendarDate(2025, 12, 31), min, max))).toBe("2026-02-01");
    expect(iso(constrainDate(new CalendarDate(2026, 6, 9), min, max))).toBe("2026-02-28");
  });

  it("leaves an absent bound unbounded", () => {
    expect(iso(constrainDate(new CalendarDate(1900, 1, 1)))).toBe("1900-01-01");
    expect(iso(constrainDate(new CalendarDate(1900, 1, 1), undefined, max))).toBe("1900-01-01");
    expect(iso(constrainDate(new CalendarDate(2200, 1, 1), min))).toBe("2200-01-01");
  });

  it("is idempotent", () => {
    const once = constrainDate(new CalendarDate(2025, 12, 31), min, max);
    expect(iso(constrainDate(once, min, max))).toBe(iso(once));
  });
});

describe("lastAvailableDateFrom", () => {
  const iso = (date: CalendarDate | undefined) => date?.toString();
  const anchor = new CalendarDate(2026, 2, 10);
  const unavailableOn =
    (...days: number[]) =>
    (date: CalendarDate) =>
      days.includes(date.day);

  it("stops on the day before the nearest unavailable one, in either direction", () => {
    expect(iso(lastAvailableDateFrom(anchor, 1, unavailableOn(17)))).toBe("2026-02-16");
    expect(iso(lastAvailableDateFrom(anchor, -1, unavailableOn(5)))).toBe("2026-02-06");
  });

  it("returns the anchor itself when the very next day is unavailable", () => {
    expect(iso(lastAvailableDateFrom(anchor, 1, unavailableOn(11)))).toBe("2026-02-10");
    expect(iso(lastAvailableDateFrom(anchor, -1, unavailableOn(9)))).toBe("2026-02-10");
  });

  it("crosses the month boundary — the run is a property of the days, not of the visible month", () => {
    expect(iso(lastAvailableDateFrom(new CalendarDate(2026, 2, 26), 1, unavailableOn(4)))).toBe(
      "2026-03-03",
    );
  });

  it("reports an unbounded side as undefined when nothing is unavailable in reach", () => {
    expect(lastAvailableDateFrom(anchor, 1, () => false)).toBeUndefined();
    expect(lastAvailableDateFrom(anchor, -1, () => false)).toBeUndefined();
  });

  it("searches only one month either way by default", () => {
    // April 1 is beyond a month from February 10, so that side reads as unbounded.
    const aprilFirst = (date: CalendarDate) => date.month === 4 && date.day === 1;
    expect(lastAvailableDateFrom(anchor, 1, aprilFirst)).toBeUndefined();
  });

  it("honors a narrower search span", () => {
    expect(lastAvailableDateFrom(anchor, 1, unavailableOn(17), { days: 3 })).toBeUndefined();
    expect(iso(lastAvailableDateFrom(anchor, 1, unavailableOn(17), { days: 7 }))).toBe(
      "2026-02-16",
    );
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
