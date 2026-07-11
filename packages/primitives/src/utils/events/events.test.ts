import { describe, expect, it, vi } from "vitest";
import { composeEventHandlers, type EventHandlerEvent } from "./events";

/** A cancelable event, so `preventDefault()` actually sets `defaultPrevented`. */
function clickEvent(): EventHandlerEvent<HTMLButtonElement, Event> {
  return new Event("click", { cancelable: true }) as EventHandlerEvent<HTMLButtonElement, Event>;
}

describe("composeEventHandlers", () => {
  it("calls every handler, in the order given", () => {
    const calls: string[] = [];
    const composed = composeEventHandlers<HTMLButtonElement, Event>(
      () => calls.push("first"),
      () => calls.push("second"),
      () => calls.push("third"),
    );

    composed(clickEvent());
    expect(calls).toEqual(["first", "second", "third"]);
  });

  it("skips `undefined` handlers, so an unset consumer prop needs no guard", () => {
    const internal = vi.fn();
    const composed = composeEventHandlers<HTMLButtonElement, Event>(undefined, internal);

    composed(clickEvent());
    expect(internal).toHaveBeenCalledOnce();
  });

  it("supports Solid's bound-handler tuple form", () => {
    const handler = vi.fn();
    const composed = composeEventHandlers<HTMLButtonElement, Event>([handler, "payload"]);

    const event = clickEvent();
    composed(event);
    expect(handler).toHaveBeenCalledWith("payload", event);
  });

  it("stops once a handler calls preventDefault", () => {
    // The cancel channel: a consumer's `onClick` runs first and can veto the component's
    // own behavior (e.g. `Dialog.Trigger`'s `setOpen(true)`). See events.md.
    const internal = vi.fn();
    const composed = composeEventHandlers<HTMLButtonElement, Event>(
      (event) => event.preventDefault(),
      internal,
    );

    composed(clickEvent());
    expect(internal).not.toHaveBeenCalled();
  });

  it("runs nothing when the event arrives already default-prevented", () => {
    const consumer = vi.fn();
    const internal = vi.fn();
    const composed = composeEventHandlers<HTMLButtonElement, Event>(consumer, internal);

    const event = clickEvent();
    event.preventDefault();
    composed(event);

    expect(consumer).not.toHaveBeenCalled();
    expect(internal).not.toHaveBeenCalled();
  });

  it("passes the same event object to every handler", () => {
    const seen: Event[] = [];
    const composed = composeEventHandlers<HTMLButtonElement, Event>(
      (event) => seen.push(event),
      (event) => seen.push(event),
    );

    const event = clickEvent();
    composed(event);
    expect(seen).toEqual([event, event]);
  });
});
