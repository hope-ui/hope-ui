import { CalendarDate, endOfMonth } from "@internationalized/date";
import { describe, expect, it } from "vitest";
import { rangeSelection } from "../range-selection";
import type { DateRange, SelectionResult, SelectionState } from "../selection";

const d = (day: number) => new CalendarDate(2026, 1, day);
/** A {@link SelectionState} with every field defaulted to "nothing selected, cursor nowhere". */
const stateOf = (partial: Partial<SelectionState> = {}): SelectionState => ({
  value: null,
  anchor: null,
  endpoint: null,
  ...partial,
});
/** Apply a `select` result to the state it came from — the caller's job, since `select` owns no cursor. */
const apply = (state: SelectionState, result: SelectionResult): SelectionState => ({
  ...state,
  ...result,
});
const empty = stateOf();
const asRange = (state: { value: unknown }) => state.value as DateRange;
/** A month-view cell's period: the degenerate one-day span the predicates collapse on. */
const on = (day: number): DateRange => ({ start: d(day), end: d(day) });
/** A year-view cell's period: the whole month of 2026. */
const monthOf = (month: number): DateRange => ({
  start: new CalendarDate(2026, month, 1),
  end: endOfMonth(new CalendarDate(2026, month, 1)),
});
/**
 * The middle of the band, which the strategy deliberately does not expose: React Aria derives it, and
 * so does the preset's `data-selection-middle` variant.
 */
const isMiddle = (state: SelectionState, period: DateRange) =>
  rangeSelection.isSelected(state, period) &&
  !rangeSelection.isSelectionStart(state, period) &&
  !rangeSelection.isSelectionEnd(state, period);

describe("rangeSelection.select", () => {
  it("first activate anchors without writing a value", () => {
    const next = rangeSelection.select(empty, d(10));
    expect(next.anchor?.toString()).toBe("2026-01-10");
    // The degenerate `{date, date}` write is gone: a range in progress lives entirely in the anchor +
    // the caller's cursor, so a controlled consumer is never holding a value it was not told about.
    expect(next.value).toBeNull();
  });

  it("leaves a previously committed range in place until the new one completes", () => {
    const committed = stateOf({ value: { start: d(5), end: d(9) } });
    const anchored = rangeSelection.select(committed, d(20));
    expect(anchored.anchor?.toString()).toBe("2026-01-20");
    expect(asRange(anchored).start.toString()).toBe("2026-01-05");
    expect(asRange(anchored).end.toString()).toBe("2026-01-09");
  });

  it("second activate completes and orders the range, clearing the anchor", () => {
    const started = apply(empty, rangeSelection.select(empty, d(20)));
    const done = rangeSelection.select(started, d(10)); // pick an earlier end → reorders
    expect(done.anchor).toBeNull();
    expect(asRange(done).start.toString()).toBe("2026-01-10");
    expect(asRange(done).end.toString()).toBe("2026-01-20");
  });

  it("extend keeps the anchor and writes nothing — the caller's cursor is the moving end", () => {
    const started = apply(empty, rangeSelection.select(empty, d(10)));
    const extended = rangeSelection.select(started, d(15), { extend: true });
    expect(extended.anchor?.toString()).toBe("2026-01-10");
    expect(extended.value).toBeNull();

    // A non-extend activate then commits, from the same anchor.
    const committed = rangeSelection.select(apply(started, extended), d(18));
    expect(committed.anchor).toBeNull();
    expect(asRange(committed).start.toString()).toBe("2026-01-10");
    expect(asRange(committed).end.toString()).toBe("2026-01-18");
  });

  it("extend with no anchor re-opens from the committed start", () => {
    const committed = stateOf({ value: { start: d(5), end: d(9) } });
    const reopened = rangeSelection.select(committed, d(12), { extend: true });
    expect(reopened.anchor?.toString()).toBe("2026-01-05");
    // The committed range stands until the re-opened one completes; the band comes from the anchor and
    // the caller's cursor, so nothing needs to be written here.
    expect(asRange(reopened).end.toString()).toBe("2026-01-09");
  });

  it("extend with nothing to extend anchors at the date itself", () => {
    // The strategy is total, so it still answers with no anchor *and* no committed range. `activate`
    // never reaches this: it seeds the range at the roving cursor first, which the strategy — knowing
    // only a value and an anchor — cannot do (see `calendar-root.md`).
    const opened = rangeSelection.select(empty, d(12), { extend: true });
    expect(opened.anchor?.toString()).toBe("2026-01-12");
    expect(opened.value).toBeNull();
  });
});

describe("rangeSelection predicates — the committed phase", () => {
  const state = stateOf({ value: { start: d(10), end: d(14) } });

  it("isSelected covers the whole committed span", () => {
    expect(rangeSelection.isSelected(state, on(9))).toBe(false);
    expect(rangeSelection.isSelected(state, on(10))).toBe(true);
    expect(rangeSelection.isSelected(state, on(12))).toBe(true);
    expect(rangeSelection.isSelected(state, on(14))).toBe(true);
    expect(rangeSelection.isSelected(state, on(15))).toBe(false);
  });

  it("distinguishes start / end, leaving the middle to be derived", () => {
    expect(rangeSelection.isSelectionStart(state, on(10))).toBe(true);
    expect(rangeSelection.isSelectionEnd(state, on(14))).toBe(true);
    expect(isMiddle(state, on(12))).toBe(true);
    expect(isMiddle(state, on(10))).toBe(false);
    expect(isMiddle(state, on(14))).toBe(false);
  });

  it("ignores the cursor while nothing is anchored", () => {
    const moved = stateOf({ value: { start: d(10), end: d(14) }, endpoint: d(25) });
    expect(rangeSelection.isSelected(moved, on(25))).toBe(false);
    expect(rangeSelection.isSelected(moved, on(12))).toBe(true);
  });
});

describe("rangeSelection predicates — the tentative phase", () => {
  it("paints anchor→cursor, ordered, and stops painting the committed range", () => {
    const committed = { start: d(1), end: d(3) };
    const forward = stateOf({ value: committed, anchor: d(10), endpoint: d(14) });
    expect(rangeSelection.isSelected(forward, on(12))).toBe(true);
    expect(rangeSelection.isSelectionStart(forward, on(10))).toBe(true);
    expect(rangeSelection.isSelectionEnd(forward, on(14))).toBe(true);
    // The accepted trade-off: one band at a time, so the old range goes dark mid-drag (React Aria's
    // behavior — see `__internal__/primitives/calendar/utils/range-selection.md`).
    expect(rangeSelection.isSelected(forward, on(2))).toBe(false);

    // Reorders when the cursor precedes the anchor.
    const backward = stateOf({ anchor: d(10), endpoint: d(5) });
    expect(rangeSelection.isSelectionStart(backward, on(5))).toBe(true);
    expect(rangeSelection.isSelectionEnd(backward, on(10))).toBe(true);
  });

  it("gives an anchor with no cursor yet nothing to paint", () => {
    const anchoredOnly = stateOf({ anchor: d(10) });
    expect(rangeSelection.highlightedRange(anchoredOnly)).toBeNull();
    expect(rangeSelection.isSelected(anchoredOnly, on(10))).toBe(false);
  });

  it("highlightedRange is the committed value when idle and the tentative span when anchored", () => {
    const idle = stateOf({ value: { start: d(10), end: d(14) }, endpoint: d(20) });
    expect(rangeSelection.highlightedRange(idle)?.start.toString()).toBe("2026-01-10");
    expect(rangeSelection.highlightedRange(idle)?.end.toString()).toBe("2026-01-14");

    const selecting = stateOf({
      value: { start: d(10), end: d(14) },
      anchor: d(2),
      endpoint: d(4),
    });
    expect(rangeSelection.highlightedRange(selecting)?.start.toString()).toBe("2026-01-02");
    expect(rangeSelection.highlightedRange(selecting)?.end.toString()).toBe("2026-01-04");

    expect(rangeSelection.highlightedRange(empty)).toBeNull();
  });
});

describe("rangeSelection predicates over a wide period (year / decade cells)", () => {
  // Jan 15 → Mar 10: the range starts and ends *mid-month*, so a month cell tested by its first day
  // alone would leave January dark and hand February the start corner.
  const state = stateOf({
    value: { start: new CalendarDate(2026, 1, 15), end: new CalendarDate(2026, 3, 10) },
  });

  it("selects every period the range passes through", () => {
    expect(rangeSelection.isSelected(state, monthOf(1))).toBe(true);
    expect(rangeSelection.isSelected(state, monthOf(2))).toBe(true);
    expect(rangeSelection.isSelected(state, monthOf(3))).toBe(true);
    expect(rangeSelection.isSelected(state, monthOf(4))).toBe(false);
  });

  it("puts each corner on the period holding that endpoint", () => {
    expect(rangeSelection.isSelectionStart(state, monthOf(1))).toBe(true);
    expect(rangeSelection.isSelectionEnd(state, monthOf(1))).toBe(false);
    expect(isMiddle(state, monthOf(2))).toBe(true);
    expect(rangeSelection.isSelectionStart(state, monthOf(2))).toBe(false);
    expect(rangeSelection.isSelectionEnd(state, monthOf(3))).toBe(true);
    expect(isMiddle(state, monthOf(3))).toBe(false);
  });

  it("gives one period both corners when the range fits inside it", () => {
    const withinJanuary = stateOf({ value: { start: d(5), end: d(20) } });
    expect(rangeSelection.isSelectionStart(withinJanuary, monthOf(1))).toBe(true);
    expect(rangeSelection.isSelectionEnd(withinJanuary, monthOf(1))).toBe(true);
    expect(isMiddle(withinJanuary, monthOf(1))).toBe(false);
  });

  it("paints the tentative band across periods too, so a drill-up mid-selection still previews", () => {
    const selecting = stateOf({
      anchor: new CalendarDate(2026, 1, 15),
      endpoint: new CalendarDate(2026, 3, 10),
    });
    expect(rangeSelection.isSelected(selecting, monthOf(2))).toBe(true);
    expect(rangeSelection.isSelectionStart(selecting, monthOf(1))).toBe(true);
    expect(rangeSelection.isSelectionEnd(selecting, monthOf(3))).toBe(true);
  });
});
