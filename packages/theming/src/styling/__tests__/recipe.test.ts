import { describe, expect, it } from "vitest";
import type { SlotClassFn, SlotRecipeFn } from "../recipe";

// The recipe shape is types-only; these are compile-time assignability checks (verified by
// `pnpm typecheck`), plus one runtime assertion so the shape can't silently change.

// A single-part recipe defaults to the "root" slot; each slot resolves to a class *function*.
const singleSlot: SlotRecipeFn<{ size?: "sm" | "md" }> = (props) => ({
  root: () => `x x--size_${props?.size ?? "md"}`,
});
const _rootIsClassFn: SlotClassFn = singleSlot().root;
void _rootIsClassFn;

// A multi-part recipe names its slots; a slot function can merge a `class` override.
const multiSlot: SlotRecipeFn<{ variant?: "a" }, "root" | "label"> = () => ({
  root: () => "y",
  label: ({ class: c } = {}) => `y__label ${c ?? ""}`.trim(),
});

describe("SlotRecipeFn / SlotClassFn", () => {
  it("resolves each slot to a class function returning a string", () => {
    expect(singleSlot({ size: "sm" }).root()).toBe("x x--size_sm");
    expect(multiSlot().label({ class: "extra" })).toBe("y__label extra");
  });
});
