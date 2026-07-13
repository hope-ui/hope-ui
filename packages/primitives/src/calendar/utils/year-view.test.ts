import { CalendarDate } from "@internationalized/date";
import { describe, expect, it } from "vitest";
import { buildYearCells, formatYear, MONTHS_PER_YEAR } from "./year-view";

describe("buildYearCells", () => {
  it("produces a 4x3 grid of the 12 months, each a month start", () => {
    const rows = buildYearCells(new CalendarDate(2026, 6, 15), "en-US", "UTC");
    expect(rows).toHaveLength(4);
    for (const row of rows) expect(row).toHaveLength(3);

    const flat = rows.flat();
    expect(flat).toHaveLength(MONTHS_PER_YEAR);
    flat.forEach((cell, index) => {
      expect(cell.date.year).toBe(2026);
      expect(cell.date.month).toBe(index + 1); // row-major = month-of-year order
      expect(cell.date.day).toBe(1);
      expect(cell.isOutside).toBe(false);
    });
  });

  it("labels cells with the short month name", () => {
    const flat = buildYearCells(new CalendarDate(2026, 1, 1), "en-US", "UTC").flat();
    expect(flat[0]?.label).toBe("Jan");
    expect(flat[11]?.label).toBe("Dec");
  });
});

describe("formatYear", () => {
  it("formats the year heading", () => {
    expect(formatYear(new CalendarDate(2026, 6, 1), "en-US", "UTC")).toBe("2026");
  });
});
