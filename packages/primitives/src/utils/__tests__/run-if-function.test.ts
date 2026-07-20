import { describe, expect, it, vi } from "vitest";
import { runIfFunction } from "../run-if-function";

// Unit (node, no DOM): pure logic. `runIfFunction` normalizes a `T | (() => T)` — it returns a plain
// value untouched and calls a factory, and each call is independent (the reuse-safety property the
// themeable chrome-content design leans on).
describe("runIfFunction", () => {
  it("returns a plain value as-is", () => {
    const value = { brand: "loader" };
    expect(runIfFunction(value)).toBe(value);
  });

  it("returns non-function primitives untouched", () => {
    expect(runIfFunction(42)).toBe(42);
    expect(runIfFunction("x")).toBe("x");
    expect(runIfFunction(null)).toBe(null);
    expect(runIfFunction(undefined)).toBe(undefined);
    expect(runIfFunction(false)).toBe(false);
  });

  it("calls a factory and returns its result", () => {
    const factory = vi.fn(() => "made");
    expect(runIfFunction(factory)).toBe("made");
    expect(factory).toHaveBeenCalledOnce();
  });

  it("invokes the factory once per call, yielding a fresh result each time", () => {
    // The whole point of the factory form: a single shared factory produces an independent value
    // on every call, so two consumers never fight over one already-built subtree.
    let count = 0;
    const factory = () => ({ id: count++ });
    const first = runIfFunction(factory);
    const second = runIfFunction(factory);
    expect(first).toEqual({ id: 0 });
    expect(second).toEqual({ id: 1 });
    expect(first).not.toBe(second);
  });
});
