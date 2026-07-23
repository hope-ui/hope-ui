import { createRoot, createSignal, flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { createTrack } from "../track";

/**
 * `createTrack` owns an effect, so it is created inside `createRoot`; the signal writes that
 * drive it happen **outside** that callback (2.0 throws `[REACTIVE_WRITE_IN_OWNED_SCOPE]`
 * otherwise) and are wrapped in `flush()` so the effect has run by the next assertion.
 */
function tracked(create: () => void): () => void {
  let dispose!: () => void;
  createRoot((disposeRoot) => {
    dispose = disposeRoot;
    create();
  });
  flush();
  return dispose;
}

describe("createTrack", () => {
  it("does not fire on the first run", () => {
    const effect = vi.fn();
    const [value] = createSignal("a");

    const dispose = tracked(() => createTrack([() => value()], effect));

    expect(effect).not.toHaveBeenCalled();
    dispose();
  });

  it("fires once per change of a tracked dep", () => {
    const effect = vi.fn();
    const [value, setValue] = createSignal("a");

    const dispose = tracked(() => createTrack([() => value()], effect));

    flush(() => setValue("b"));
    expect(effect).toHaveBeenCalledOnce();

    flush(() => setValue("c"));
    expect(effect).toHaveBeenCalledTimes(2);
    dispose();
  });

  it("stays quiet when a dep is rewritten to an equal value", () => {
    const effect = vi.fn();
    const [value, setValue] = createSignal("a");

    const dispose = tracked(() => createTrack([() => value()], effect));

    flush(() => setValue("a"));

    expect(effect).not.toHaveBeenCalled();
    dispose();
  });

  it("compares deeply, so a new object with the same shape is not a change", () => {
    // `isEqual` here is Zag's deep one, not Solid's reference default — a machine that tracks
    // `context.get("value")` for an array would otherwise re-run on every rebuild of that array.
    const effect = vi.fn();
    const [value, setValue] = createSignal<string[]>(["a"]);

    const dispose = tracked(() => createTrack([() => value()], effect));

    flush(() => setValue(["a"]));
    expect(effect).not.toHaveBeenCalled();

    flush(() => setValue(["a", "b"]));
    expect(effect).toHaveBeenCalledOnce();
    dispose();
  });

  it("fires once when several deps change together", () => {
    const effect = vi.fn();
    const [first, setFirst] = createSignal(1);
    const [second, setSecond] = createSignal(1);

    const dispose = tracked(() => createTrack([() => first(), () => second()], effect));

    flush(() => {
      setFirst(2);
      setSecond(2);
    });

    expect(effect).toHaveBeenCalledOnce();
    dispose();
  });

  it("accepts a plain, non-accessor dep and simply never sees it change", () => {
    const effect = vi.fn();
    const [value, setValue] = createSignal("a");

    const dispose = tracked(() => createTrack(["constant", () => value()], effect));

    flush(() => setValue("b"));

    expect(effect).toHaveBeenCalledOnce();
    dispose();
  });

  it("stops firing once the owning scope is disposed", () => {
    const effect = vi.fn();
    const [value, setValue] = createSignal("a");

    const dispose = tracked(() => createTrack([() => value()], effect));
    dispose();

    flush(() => setValue("b"));

    expect(effect).not.toHaveBeenCalled();
  });
});
