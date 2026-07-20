import { CalendarDate } from "@internationalized/date";
import { describe, expect, it } from "vitest";
import { multipleSelection } from "../multiple-selection";
import type { SelectionState } from "../selection";

const empty: SelectionState = { value: null, anchor: null };
const d = (day: number) => new CalendarDate(2026, 1, day);
const days = (state: SelectionState) => (state.value as CalendarDate[]).map((x) => x.day);

describe("multipleSelection", () => {
  it("adds a day when absent, keeping the set sorted", () => {
    const a = multipleSelection.select(empty, d(10));
    const b = multipleSelection.select(a, d(3));
    expect(days(b)).toEqual([3, 10]);
    expect(b.anchor).toBeNull();
  });

  it("removes a day when already present (toggle)", () => {
    const a = multipleSelection.select(empty, d(10));
    const b = multipleSelection.select(a, d(3));
    const c = multipleSelection.select(b, d(10));
    expect(days(c)).toEqual([3]);
  });

  it("isSelected matches any day in the set", () => {
    const state: SelectionState = { value: [d(3), d(10)], anchor: null };
    expect(multipleSelection.isSelected(state, d(3))).toBe(true);
    expect(multipleSelection.isSelected(state, d(10))).toBe(true);
    expect(multipleSelection.isSelected(state, d(4))).toBe(false);
  });

  it("has no range or highlight state", () => {
    const state: SelectionState = { value: [d(3)], anchor: null };
    expect(multipleSelection.isRangeStart(state, d(3))).toBe(false);
    expect(multipleSelection.isRangeMiddle(state, d(3))).toBe(false);
    expect(multipleSelection.isRangeEnd(state, d(3))).toBe(false);
    expect(multipleSelection.highlightedRange(state, d(5))).toBeNull();
  });
});
