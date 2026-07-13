import { CalendarDate } from "@internationalized/date";
import { describe, expect, it } from "vitest";
import { arrowDelta, resolveArrowMove, resolveViewArrowMove } from "./navigation";

describe("arrowDelta (month view, 7-wide)", () => {
  it("moves ±7 vertically and ±1 horizontally, flipping under RTL", () => {
    expect(arrowDelta("up", false)).toBe(-7);
    expect(arrowDelta("down", false)).toBe(7);
    expect(arrowDelta("left", false)).toBe(-1);
    expect(arrowDelta("right", false)).toBe(1);
    expect(arrowDelta("left", true)).toBe(1);
    expect(arrowDelta("right", true)).toBe(-1);
  });
});

describe("resolveArrowMove (month)", () => {
  it("crosses when the target leaves the visible month", () => {
    const visible = new CalendarDate(2026, 1, 1);
    expect(resolveArrowMove(new CalendarDate(2026, 1, 15), visible, 1).crosses).toBe(false);
    const off = resolveArrowMove(new CalendarDate(2026, 1, 31), visible, 1);
    expect(off.crosses).toBe(true);
    expect(off.target.toString()).toBe("2026-02-01");
  });
});

describe("resolveViewArrowMove", () => {
  const ltr = false;

  it("month: one cell = one day", () => {
    const { target, crosses } = resolveViewArrowMove(
      "month",
      new CalendarDate(2026, 1, 15),
      new CalendarDate(2026, 1, 1),
      "right",
      ltr,
    );
    expect(target.toString()).toBe("2026-01-16");
    expect(crosses).toBe(false);
  });

  it("month: ArrowDown from the last week crosses into next month", () => {
    const { target, crosses } = resolveViewArrowMove(
      "month",
      new CalendarDate(2026, 1, 28),
      new CalendarDate(2026, 1, 1),
      "down",
      ltr,
    );
    expect(target.toString()).toBe("2026-02-04");
    expect(crosses).toBe(true);
  });

  it("year: one cell = one month, crossing at the year boundary", () => {
    const inYear = resolveViewArrowMove(
      "year",
      new CalendarDate(2026, 6, 1),
      new CalendarDate(2026, 1, 1),
      "right",
      ltr,
    );
    expect(inYear.target.toString()).toBe("2026-07-01");
    expect(inYear.crosses).toBe(false);

    const off = resolveViewArrowMove(
      "year",
      new CalendarDate(2026, 12, 1),
      new CalendarDate(2026, 1, 1),
      "right",
      ltr,
    );
    expect(off.target.year).toBe(2027);
    expect(off.crosses).toBe(true);
  });

  it("decade: one cell = one year, crossing at the decade boundary", () => {
    const inDecade = resolveViewArrowMove(
      "decade",
      new CalendarDate(2026, 1, 1),
      new CalendarDate(2026, 1, 1),
      "right",
      ltr,
    );
    expect(inDecade.target.year).toBe(2027);
    expect(inDecade.crosses).toBe(false);

    const off = resolveViewArrowMove(
      "decade",
      new CalendarDate(2029, 1, 1),
      new CalendarDate(2026, 1, 1),
      "right",
      ltr,
    );
    expect(off.target.year).toBe(2030);
    expect(off.crosses).toBe(true);
  });

  it("flips horizontal direction under RTL", () => {
    const { target } = resolveViewArrowMove(
      "month",
      new CalendarDate(2026, 1, 15),
      new CalendarDate(2026, 1, 1),
      "right",
      true,
    );
    expect(target.toString()).toBe("2026-01-14");
  });
});
