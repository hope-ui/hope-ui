import { CalendarDate, IslamicUmalquraCalendar, toCalendar } from "@internationalized/date";
import { describe, expect, it } from "vitest";
import { buildDecadeCells, formatDecadeRange } from "../decade-view";

describe("buildDecadeCells", () => {
  it("produces 12 year cells: one leading + the decade's 10 + one trailing", () => {
    const rows = buildDecadeCells(new CalendarDate(2026, 6, 15), "en-US", "UTC");
    expect(rows).toHaveLength(4);
    const flat = rows.flat();
    expect(flat).toHaveLength(12);

    const years = flat.map((c) => c.date.year);
    expect(years).toEqual([2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030]);
    flat.forEach((cell) => {
      expect(cell.date.month).toBe(1);
      expect(cell.date.day).toBe(1);
    });
  });

  it("flags the two adjacent years (2019, 2030) as outside, the decade as inside", () => {
    const flat = buildDecadeCells(new CalendarDate(2026, 6, 15), "en-US", "UTC").flat();
    const outside = flat.filter((c) => c.isOutside).map((c) => c.date.year);
    expect(outside).toEqual([2019, 2030]);
  });

  it("labels cells with the year", () => {
    const flat = buildDecadeCells(new CalendarDate(2026, 1, 1), "en-US", "UTC").flat();
    expect(flat[1]?.label).toBe("2020");
  });
});

describe("formatDecadeRange", () => {
  it("formats the decade span, containing both endpoints", () => {
    const label = formatDecadeRange(new CalendarDate(2026, 6, 1), "en-US", "UTC");
    expect(label).toContain("2020");
    expect(label).toContain("2029");
  });

  it("formats the decade span in the date's own calendar system", () => {
    // Rajab 1447 (Islamic) sits in the 1440–1449 AH decade, not the Gregorian 2020s.
    const islamic = toCalendar(new CalendarDate(2026, 1, 15), new IslamicUmalquraCalendar());
    const label = formatDecadeRange(islamic, "en-US", "UTC");
    expect(label).toContain("1440");
    expect(label).toContain("1449");
    expect(label).toContain("AH");
  });
});
