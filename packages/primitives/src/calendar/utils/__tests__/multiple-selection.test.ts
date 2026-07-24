import { CalendarDate, endOfMonth } from "@internationalized/date";
import { describe, expect, it } from "vitest";
import { multipleSelection } from "../multiple-selection";
import type { DateRange, SelectionResult, SelectionState } from "../selection";

const empty: SelectionState = { value: null, anchor: null, endpoint: null };
const d = (day: number) => new CalendarDate(2026, 1, day);
const apply = (state: SelectionState, result: SelectionResult): SelectionState => ({
  ...state,
  ...result,
});
const days = (state: { value: unknown }) => (state.value as CalendarDate[]).map((x) => x.day);
/** A month-view cell's period: the degenerate one-day span the predicates collapse on. */
const on = (day: number): DateRange => ({ start: d(day), end: d(day) });
/** A year-view cell's period: the whole month of 2026. */
const monthOf = (month: number): DateRange => ({
  start: new CalendarDate(2026, month, 1),
  end: endOfMonth(new CalendarDate(2026, month, 1)),
});

describe("multipleSelection", () => {
  it("adds a day when absent, keeping the set sorted", () => {
    const a = multipleSelection.select(empty, d(10));
    const b = multipleSelection.select(apply(empty, a), d(3));
    expect(days(b)).toEqual([3, 10]);
    expect(b.anchor).toBeNull();
  });

  it("removes a day when already present (toggle)", () => {
    const a = multipleSelection.select(empty, d(10));
    const b = multipleSelection.select(apply(empty, a), d(3));
    const c = multipleSelection.select(apply(empty, b), d(10));
    expect(days(c)).toEqual([3]);
  });

  it("isSelected matches any day in the set", () => {
    const state: SelectionState = { value: [d(3), d(10)], anchor: null, endpoint: null };
    expect(multipleSelection.isSelected(state, on(3))).toBe(true);
    expect(multipleSelection.isSelected(state, on(10))).toBe(true);
    expect(multipleSelection.isSelected(state, on(4))).toBe(false);
  });

  it("isSelected lights a wider period holding any selected day (year / decade cells)", () => {
    const state: SelectionState = {
      value: [d(3), new CalendarDate(2026, 3, 20)],
      anchor: null,
      endpoint: null,
    };
    expect(multipleSelection.isSelected(state, monthOf(1))).toBe(true);
    expect(multipleSelection.isSelected(state, monthOf(2))).toBe(false);
    expect(multipleSelection.isSelected(state, monthOf(3))).toBe(true);
  });

  it("caps both ends of each degenerate one-day band, and has no tentative range", () => {
    const state: SelectionState = { value: [d(3)], anchor: null, endpoint: null };
    expect(multipleSelection.isSelectionStart(state, on(3))).toBe(true);
    expect(multipleSelection.isSelectionEnd(state, on(3))).toBe(true);
    expect(multipleSelection.highlightedRange(state)).toBeNull();
  });
});
