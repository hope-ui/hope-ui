import { describe, expect, it } from "vitest";
import { selectionRange } from "../create-list-selection";

// Pure range math — the one piece of selection logic with no reactive/DOM dependency, so it lives
// in the node `unit` project. Full selection behavior is exercised in the browser test.
describe("selectionRange", () => {
  it("returns the inclusive ascending range for an ascending pair", () => {
    expect(selectionRange(1, 4)).toEqual([1, 2, 3, 4]);
  });

  it("normalizes a descending pair to ascending order", () => {
    expect(selectionRange(4, 1)).toEqual([1, 2, 3, 4]);
  });

  it("returns a single index when both ends are equal", () => {
    expect(selectionRange(2, 2)).toEqual([2]);
  });

  it("handles a zero-based anchor", () => {
    expect(selectionRange(0, 2)).toEqual([0, 1, 2]);
  });
});
