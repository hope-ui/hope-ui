import { describe, expect, it } from "vitest";
import { compareByIdOrReference } from "../equality";

describe("compareByIdOrReference", () => {
  it("compares primitives with strict equality", () => {
    expect(compareByIdOrReference("a", "a")).toBe(true);
    expect(compareByIdOrReference("a", "b")).toBe(false);
    expect(compareByIdOrReference(1, 1)).toBe(true);
  });

  it("matches distinct objects that share an id", () => {
    expect(compareByIdOrReference({ id: 1, name: "x" }, { id: 1, name: "y" })).toBe(true);
    expect(compareByIdOrReference({ id: 1 }, { id: 2 })).toBe(false);
  });

  it("falls back to reference equality when a value has no id", () => {
    const a = { name: "x" };
    expect(compareByIdOrReference(a, a)).toBe(true);
    expect(compareByIdOrReference({ name: "x" }, { name: "x" })).toBe(false);
    // Mixed: only one side carries an id → strict === (different references).
    expect(compareByIdOrReference<{ id?: number; name?: string }>({ id: 1 }, { name: "x" })).toBe(
      false,
    );
  });

  it("treats null as a plain value, not an object with id", () => {
    expect(compareByIdOrReference(null, null)).toBe(true);
    expect(compareByIdOrReference(null, { id: 1 } as unknown as null)).toBe(false);
  });
});
