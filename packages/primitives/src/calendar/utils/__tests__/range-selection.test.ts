import { CalendarDate, endOfMonth } from "@internationalized/date";
import { describe, expect, it } from "vitest";
import { rangeSelection } from "../range-selection";
import type { DateRange, SelectionState } from "../selection";

const empty: SelectionState = { value: null, anchor: null };
const d = (day: number) => new CalendarDate(2026, 1, day);
const asRange = (state: SelectionState) => state.value as DateRange;
/** A month-view cell's period: the degenerate one-day span the predicates collapse on. */
const on = (day: number): DateRange => ({ start: d(day), end: d(day) });
/** A year-view cell's period: the whole month of 2026. */
const monthOf = (month: number): DateRange => ({
  start: new CalendarDate(2026, month, 1),
  end: endOfMonth(new CalendarDate(2026, month, 1)),
});

describe("rangeSelection.select", () => {
  it("first activate anchors a collapsed range (not yet committed)", () => {
    const next = rangeSelection.select(empty, d(10));
    expect(next.anchor?.toString()).toBe("2026-01-10");
    expect(asRange(next).start.toString()).toBe("2026-01-10");
    expect(asRange(next).end.toString()).toBe("2026-01-10");
  });

  it("second activate completes and orders the range, clearing the anchor", () => {
    const started = rangeSelection.select(empty, d(20));
    const done = rangeSelection.select(started, d(10)); // pick an earlier end → reorders
    expect(done.anchor).toBeNull();
    expect(asRange(done).start.toString()).toBe("2026-01-10");
    expect(asRange(done).end.toString()).toBe("2026-01-20");
  });

  it("extend keeps the anchor and slides the moving endpoint", () => {
    const started = rangeSelection.select(empty, d(10));
    const extended = rangeSelection.select(started, d(15), { extend: true });
    expect(extended.anchor?.toString()).toBe("2026-01-10");
    expect(asRange(extended).end.toString()).toBe("2026-01-15");

    // A non-extend activate then commits.
    const committed = rangeSelection.select(extended, d(18));
    expect(committed.anchor).toBeNull();
    expect(asRange(committed).end.toString()).toBe("2026-01-18");
  });

  it("extend with no anchor re-opens from the committed start", () => {
    const committed: SelectionState = { value: { start: d(5), end: d(9) }, anchor: null };
    const reopened = rangeSelection.select(committed, d(12), { extend: true });
    expect(reopened.anchor?.toString()).toBe("2026-01-05");
    expect(asRange(reopened).end.toString()).toBe("2026-01-12");
  });
});

describe("rangeSelection predicates", () => {
  const state: SelectionState = { value: { start: d(10), end: d(14) }, anchor: null };

  it("isSelected covers the whole committed span", () => {
    expect(rangeSelection.isSelected(state, on(9))).toBe(false);
    expect(rangeSelection.isSelected(state, on(10))).toBe(true);
    expect(rangeSelection.isSelected(state, on(12))).toBe(true);
    expect(rangeSelection.isSelected(state, on(14))).toBe(true);
    expect(rangeSelection.isSelected(state, on(15))).toBe(false);
  });

  it("distinguishes start / middle / end", () => {
    expect(rangeSelection.isRangeStart(state, on(10))).toBe(true);
    expect(rangeSelection.isRangeMiddle(state, on(12))).toBe(true);
    expect(rangeSelection.isRangeMiddle(state, on(10))).toBe(false);
    expect(rangeSelection.isRangeEnd(state, on(14))).toBe(true);
  });

  it("highlightedRange spans anchor→highlightEnd (ordered) only while selecting", () => {
    const selecting: SelectionState = { value: { start: d(10), end: d(10) }, anchor: d(10) };
    const forward = rangeSelection.highlightedRange(selecting, d(14));
    expect(forward?.start.toString()).toBe("2026-01-10");
    expect(forward?.end.toString()).toBe("2026-01-14");
    // Reorders when the hover end precedes the anchor.
    const backward = rangeSelection.highlightedRange(selecting, d(5));
    expect(backward?.start.toString()).toBe("2026-01-05");
    expect(backward?.end.toString()).toBe("2026-01-10");
    // No highlightEnd, or no anchor (not mid-selection) → null.
    expect(rangeSelection.highlightedRange(selecting, null)).toBeNull();
    expect(rangeSelection.highlightedRange(state, d(14))).toBeNull();
  });
});

describe("rangeSelection predicates over a wide period (year / decade cells)", () => {
  // Jan 15 → Mar 10: the range starts and ends *mid-month*, so a month cell tested by its first day
  // alone would leave January dark and hand February the start corner.
  const state: SelectionState = {
    value: { start: new CalendarDate(2026, 1, 15), end: new CalendarDate(2026, 3, 10) },
    anchor: null,
  };

  it("selects every period the range passes through", () => {
    expect(rangeSelection.isSelected(state, monthOf(1))).toBe(true);
    expect(rangeSelection.isSelected(state, monthOf(2))).toBe(true);
    expect(rangeSelection.isSelected(state, monthOf(3))).toBe(true);
    expect(rangeSelection.isSelected(state, monthOf(4))).toBe(false);
  });

  it("puts each corner on the period holding that endpoint", () => {
    expect(rangeSelection.isRangeStart(state, monthOf(1))).toBe(true);
    expect(rangeSelection.isRangeEnd(state, monthOf(1))).toBe(false);
    expect(rangeSelection.isRangeMiddle(state, monthOf(2))).toBe(true);
    expect(rangeSelection.isRangeStart(state, monthOf(2))).toBe(false);
    expect(rangeSelection.isRangeEnd(state, monthOf(3))).toBe(true);
    expect(rangeSelection.isRangeMiddle(state, monthOf(3))).toBe(false);
  });

  it("gives one period both corners when the range fits inside it", () => {
    const withinJanuary: SelectionState = { value: { start: d(5), end: d(20) }, anchor: null };
    expect(rangeSelection.isRangeStart(withinJanuary, monthOf(1))).toBe(true);
    expect(rangeSelection.isRangeEnd(withinJanuary, monthOf(1))).toBe(true);
    expect(rangeSelection.isRangeMiddle(withinJanuary, monthOf(1))).toBe(false);
  });
});
