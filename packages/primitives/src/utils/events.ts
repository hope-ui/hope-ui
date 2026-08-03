import type { JSX } from "@solidjs/web";

/** The event a Solid JSX event handler actually receives, with `currentTarget` narrowed. */
export type EventHandlerEvent<T, E extends Event> = E & {
  currentTarget: T;
  target: Element;
};

/**
 * Invokes a single `JSX.EventHandlerUnion`, which is either a plain function or Solid's
 * bound-handler tuple form (`onClick={[handler, data]}`).
 */
function callEventHandler<T, E extends Event>(
  handler: JSX.EventHandlerUnion<T, E> | undefined,
  event: EventHandlerEvent<T, E>,
): void {
  if (typeof handler === "function") {
    handler(event);
  } else if (Array.isArray(handler)) {
    handler[0](handler[1], event);
  }
}

/**
 * Chains event handlers into one, in the order given — the `chain` helper from React Aria (Adobe's
 * headless accessibility library) plus one addition: **a handler that calls
 * `event.preventDefault()` stops the rest.**
 *
 * Components pass the consumer's handler first and their own behavior last, so `preventDefault()`
 * becomes a cancel channel: `<Dialog.Trigger onClick={(e) => e.preventDefault()}>` runs the
 * consumer's handler and skips the internal `setOpen(true)`. On the `<button type="button">` every
 * trigger renders, `preventDefault()` has no other effect, so the channel is unambiguous.
 *
 * Call this inside a getter on the merged props, never eagerly in the component body, so the
 * consumer's handler is read inside the element's own event-binding effect rather than untracked.
 */
export function composeEventHandlers<T, E extends Event>(
  ...handlers: Array<JSX.EventHandlerUnion<T, E> | undefined>
): JSX.EventHandler<T, E> {
  return (event) => {
    for (const handler of handlers) {
      if (event.defaultPrevented) {
        return;
      }
      callEventHandler(handler, event as EventHandlerEvent<T, E>);
    }
  };
}
