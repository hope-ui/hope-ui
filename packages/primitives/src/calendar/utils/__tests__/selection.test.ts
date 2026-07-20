import { CalendarDate } from "@internationalized/date";
import { describe, expect, it } from "vitest";
import { firstDateOf, selectionStrategyFor } from "../selection";

const d = (day: number) => new CalendarDate(2026, 1, day);

describe("selectionStrategyFor", () => {
  it("maps each mode to its strategy singleton", () => {
    expect(selectionStrategyFor("single").mode).toBe("single");
    expect(selectionStrategyFor("range").mode).toBe("range");
    expect(selectionStrategyFor("multiple").mode).toBe("multiple");
  });
});

describe("firstDateOf", () => {
  it("returns a representative seed date for each value shape", () => {
    expect(firstDateOf(null)).toBeNull();
    expect(firstDateOf(d(5))?.toString()).toBe("2026-01-05");
    expect(firstDateOf({ start: d(5), end: d(9) })?.toString()).toBe("2026-01-05");
    expect(firstDateOf([d(7), d(3)])?.toString()).toBe("2026-01-07");
    expect(firstDateOf([])).toBeNull();
  });
});
