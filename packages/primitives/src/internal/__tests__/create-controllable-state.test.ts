import { createEffect, createSignal, flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { createControllableState } from "../create-controllable-state";

describe("createControllableState", () => {
  // No `createRoot`: SolidJS 2.0 throws [REACTIVE_WRITE_IN_OWNED_SCOPE] on a synchronous
  // signal write inside a root's body. `flush()` around each write because solid-js's
  // *client* build defers writes to a microtask — see defaults.test.ts for the full note.

  it("starts at `defaultValue` and updates itself while uncontrolled", () => {
    const [open, setOpen] = createControllableState<boolean>({
      value: () => undefined,
      defaultValue: () => false,
    });

    expect(open()).toBe(false);
    flush(() => setOpen(true));
    expect(open()).toBe(true);
  });

  it("notifies `onChange` while uncontrolled", () => {
    const onChange = vi.fn();
    const [, setOpen] = createControllableState<boolean>({
      value: () => undefined,
      defaultValue: () => false,
      onChange,
    });

    flush(() => setOpen(true));
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("ignores its own setter's value while controlled, but still notifies `onChange`", () => {
    // The point of the primitive: a controlled component's state lives with the consumer.
    // `setValue` must not fork an internal copy, or the two silently diverge.
    const onChange = vi.fn();
    const [controlled, setControlled] = createSignal(false);
    const [open, setOpen] = createControllableState<boolean>({
      value: controlled,
      defaultValue: () => false,
      onChange,
    });

    flush(() => setOpen(true));
    expect(onChange).toHaveBeenCalledWith(true);
    expect(open()).toBe(false); // consumer hasn't accepted the change yet

    flush(() => setControlled(true));
    expect(open()).toBe(true);
  });

  it("tracks the controlled accessor reactively", () => {
    const [controlled, setControlled] = createSignal<boolean | undefined>(true);
    const [open] = createControllableState<boolean>({
      value: controlled,
      defaultValue: () => false,
    });

    expect(open()).toBe(true);
    flush(() => setControlled(false));
    expect(open()).toBe(false);
  });

  it("falls back to the uncontrolled value only when the controlled one is `undefined`", () => {
    // `=== undefined`, not `??` — otherwise a `null` controlled value would silently read
    // through to the internal signal.
    const [open] = createControllableState<boolean | null>({
      value: () => null,
      defaultValue: () => true,
    });

    expect(open()).toBeNull();
  });

  it("switches from uncontrolled to controlled when `value` stops being `undefined`", () => {
    const [controlled, setControlled] = createSignal<boolean | undefined>(undefined);
    const [open, setOpen] = createControllableState<boolean>({
      value: controlled,
      defaultValue: () => false,
    });

    flush(() => setOpen(true));
    expect(open()).toBe(true); // uncontrolled: internal signal

    flush(() => setControlled(false));
    expect(open()).toBe(false); // controlled: the consumer wins
  });

  it("stores a function value instead of invoking it", () => {
    // SolidJS 2.0 overloads `createSignal`: a function argument hits the
    // `ComputeFunction<T>` overload and becomes a memo, so a naive
    // `createSignal(options.defaultValue())` would return `"first"` here, not `first`.
    // `createControllableState` boxes the value to sidestep that. See create-controllable-state.ts.
    const first = () => "first";
    const second = () => "second";
    const [value, setValue] = createControllableState<() => string>({
      value: () => undefined,
      defaultValue: () => first,
    });

    expect(value()).toBe(first);
    flush(() => setValue(second));
    expect(value()).toBe(second);
  });

  it("does not notify subscribers when the value is unchanged", () => {
    // The box must not leak: two writes of the same value are one change, exactly as a
    // plain `createSignal` would behave.
    const [value, setValue] = createControllableState<number>({
      value: () => undefined,
      defaultValue: () => 1,
    });

    let reads = 0;
    createEffect(
      () => value(),
      () => {
        reads++;
      },
    );

    flush(() => setValue(1));
    const afterNoOpWrite = reads;
    flush(() => setValue(2));

    expect(reads).toBe(afterNoOpWrite + 1);
  });
});
