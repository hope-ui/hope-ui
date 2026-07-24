import { CalendarDate, endOfMonth } from "@internationalized/date";
import { describe, expect, it } from "vitest";
import type { DateRange, SelectionState } from "../selection";
import { singleSelection } from "../single-selection";

const empty: SelectionState = { value: null, anchor: null, endpoint: null };
const d = (day: number) => new CalendarDate(2026, 1, day);
/** A month-view cell's period: the degenerate one-day span the predicates collapse on. */
const on = (day: number): DateRange => ({ start: d(day), end: d(day) });
/** A year-view cell's period: the whole month of 2026. */
const monthOf = (month: number): DateRange => ({
  start: new CalendarDate(2026, month, 1),
  end: endOfMonth(new CalendarDate(2026, month, 1)),
});

describe("singleSelection", () => {
  it("replaces the selection on activate, never sets an anchor", () => {
    const next = singleSelection.select(empty, d(10));
    expect(next.anchor).toBeNull();
    expect((next.value as CalendarDate).toString()).toBe("2026-01-10");

    const replaced = singleSelection.select({ ...empty, ...next }, d(20));
    expect((replaced.value as CalendarDate).toString()).toBe("2026-01-20");
  });

  it("isSelected matches the one selected day", () => {
    const state: SelectionState = { value: d(10), anchor: null, endpoint: null };
    expect(singleSelection.isSelected(state, on(10))).toBe(true);
    expect(singleSelection.isSelected(state, on(11))).toBe(false);
  });

  it("isSelected lights the wider period holding the selected day (year / decade cells)", () => {
    const state: SelectionState = { value: d(10), anchor: null, endpoint: null };
    expect(singleSelection.isSelected(state, monthOf(1))).toBe(true);
    expect(singleSelection.isSelected(state, monthOf(2))).toBe(false);
  });

  it("caps both ends of its degenerate one-day band, and has no tentative range", () => {
    const state: SelectionState = { value: d(10), anchor: null, endpoint: null };
    expect(singleSelection.isSelectionStart(state, on(10))).toBe(true);
    expect(singleSelection.isSelectionEnd(state, on(10))).toBe(true);
    expect(singleSelection.highlightedRange(state)).toBeNull();
  });
});
