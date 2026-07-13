import { CalendarDate } from "@internationalized/date";
import { describe, expect, it } from "vitest";
import type { DateRange, SelectionState } from "./index";
import { rangeSelection } from "./range-selection";

const empty: SelectionState = { value: null, anchor: null };
const d = (day: number) => new CalendarDate(2026, 1, day);
const asRange = (state: SelectionState) => state.value as DateRange;

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
    expect(rangeSelection.isSelected(state, d(9))).toBe(false);
    expect(rangeSelection.isSelected(state, d(10))).toBe(true);
    expect(rangeSelection.isSelected(state, d(12))).toBe(true);
    expect(rangeSelection.isSelected(state, d(14))).toBe(true);
    expect(rangeSelection.isSelected(state, d(15))).toBe(false);
  });

  it("distinguishes start / middle / end", () => {
    expect(rangeSelection.isRangeStart(state, d(10))).toBe(true);
    expect(rangeSelection.isRangeMiddle(state, d(12))).toBe(true);
    expect(rangeSelection.isRangeMiddle(state, d(10))).toBe(false);
    expect(rangeSelection.isRangeEnd(state, d(14))).toBe(true);
  });

  it("isInPreviewRange spans anchor→preview only while selecting", () => {
    const selecting: SelectionState = { value: { start: d(10), end: d(10) }, anchor: d(10) };
    expect(rangeSelection.isInPreviewRange(selecting, d(12), d(14))).toBe(true);
    expect(rangeSelection.isInPreviewRange(selecting, d(15), d(14))).toBe(false);
    // No preview date, or no anchor → false.
    expect(rangeSelection.isInPreviewRange(selecting, d(12), null)).toBe(false);
    expect(rangeSelection.isInPreviewRange(state, d(12), d(14))).toBe(false);
  });
});
