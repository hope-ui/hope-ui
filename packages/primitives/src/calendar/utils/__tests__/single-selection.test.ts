import { CalendarDate } from "@internationalized/date";
import { describe, expect, it } from "vitest";
import type { SelectionState } from "../selection";
import { singleSelection } from "../single-selection";

const empty: SelectionState = { value: null, anchor: null };
const d = (day: number) => new CalendarDate(2026, 1, day);

describe("singleSelection", () => {
  it("replaces the selection on activate, never sets an anchor", () => {
    const next = singleSelection.select(empty, d(10));
    expect(next.anchor).toBeNull();
    expect((next.value as CalendarDate).toString()).toBe("2026-01-10");

    const replaced = singleSelection.select(next, d(20));
    expect((replaced.value as CalendarDate).toString()).toBe("2026-01-20");
  });

  it("isSelected matches the one selected day", () => {
    const state: SelectionState = { value: d(10), anchor: null };
    expect(singleSelection.isSelected(state, d(10))).toBe(true);
    expect(singleSelection.isSelected(state, d(11))).toBe(false);
  });

  it("has no range or highlight state", () => {
    const state: SelectionState = { value: d(10), anchor: null };
    expect(singleSelection.isRangeStart(state, d(10))).toBe(false);
    expect(singleSelection.isRangeMiddle(state, d(10))).toBe(false);
    expect(singleSelection.isRangeEnd(state, d(10))).toBe(false);
    expect(singleSelection.highlightedRange(state, d(12))).toBeNull();
  });
});
