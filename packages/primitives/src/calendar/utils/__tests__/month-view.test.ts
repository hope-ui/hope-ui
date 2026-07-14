import { CalendarDate } from "@internationalized/date";
import { describe, expect, it } from "vitest";
import {
  buildMonthCells,
  clampDateToMonth,
  DAYS_PER_WEEK,
  formatFullDate,
  formatMonthYear,
  getWeekdays,
} from "../month-view";

describe("buildMonthCells", () => {
  it("produces rows of 7 day cells covering the month", () => {
    const rows = buildMonthCells(new CalendarDate(2026, 1, 1), "en-US");
    expect(rows.length).toBeGreaterThanOrEqual(4);
    expect(rows.length).toBeLessThanOrEqual(6);
    for (const row of rows) {
      expect(row).toHaveLength(DAYS_PER_WEEK);
    }

    const flat = rows.flat();
    // Every in-month day is present and not flagged outside.
    for (let day = 1; day <= 31; day++) {
      const cell = flat.find(
        (c) => c.date.month === 1 && c.date.day === day && c.date.year === 2026,
      );
      expect(cell, `day ${day}`).toBeDefined();
      expect(cell?.isOutside).toBe(false);
    }
  });

  it("flags leading/trailing days from adjacent months as outside", () => {
    const flat = buildMonthCells(new CalendarDate(2026, 1, 1), "en-US").flat();
    const outside = flat.filter((c) => c.isOutside);
    expect(outside.length).toBeGreaterThan(0);
    for (const cell of outside) {
      expect(cell.date.month).not.toBe(1);
    }
  });

  it("uses the ISO date string as the track key and a localized day label", () => {
    const first = buildMonthCells(new CalendarDate(2026, 1, 1), "en-US").flat()[0];
    expect(first?.key).toBe(first?.date.toString());
    const jan1 = buildMonthCells(new CalendarDate(2026, 1, 1), "en-US")
      .flat()
      .find((c) => c.date.toString() === "2026-01-01");
    expect(jan1?.label).toBe("1");
  });

  it("honors firstDayOfWeek by shifting the first column", () => {
    const sun = buildMonthCells(new CalendarDate(2026, 1, 1), "en-US", "sun").flat()[0]?.date;
    const mon = buildMonthCells(new CalendarDate(2026, 1, 1), "en-US", "mon").flat()[0]?.date;
    // Different week starts put a different date in the first cell.
    expect(sun?.toString()).not.toBe(mon?.toString());
  });
});

describe("clampDateToMonth", () => {
  it("clamps a day that doesn't exist in the target month", () => {
    // Jan 31 -> Feb 2026 (28 days).
    expect(
      clampDateToMonth(new CalendarDate(2026, 1, 31), new CalendarDate(2026, 2, 1)).toString(),
    ).toBe("2026-02-28");
    // Leap year Feb has 29.
    expect(
      clampDateToMonth(new CalendarDate(2024, 1, 31), new CalendarDate(2024, 2, 1)).toString(),
    ).toBe("2024-02-29");
  });

  it("keeps the day-of-month when it exists in the target", () => {
    expect(
      clampDateToMonth(new CalendarDate(2026, 1, 15), new CalendarDate(2026, 3, 1)).toString(),
    ).toBe("2026-03-15");
  });
});

describe("getWeekdays", () => {
  it("returns 7 localized weekday names, rotated by firstDayOfWeek", () => {
    const sun = getWeekdays("en-US", "UTC", "sun");
    expect(sun).toHaveLength(7);
    expect(sun[0]?.long).toBe("Sunday");
    const mon = getWeekdays("en-US", "UTC", "mon");
    expect(mon[0]?.long).toBe("Monday");
  });
});

describe("formatFullDate / formatMonthYear", () => {
  it("formats the full day name and the month/year heading", () => {
    const date = new CalendarDate(2026, 1, 1);
    expect(formatFullDate(date, "en-US", "UTC")).toBe("Thursday, January 1, 2026");
    expect(formatMonthYear(date, "en-US", "UTC")).toBe("January 2026");
  });
});
