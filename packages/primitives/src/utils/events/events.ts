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
 * Chains event handlers into one, in the order given. Modeled on React Aria's `chain`,
 * with one addition: **a handler that calls `event.preventDefault()` stops the rest.**
 *
 * Components pass the consumer's handler first and their own behavior last, which makes
 * `preventDefault()` a cancel channel: `<Dialog.Trigger onClick={(e) => e.preventDefault()}>`
 * runs the consumer's handler and skips the internal `setOpen(true)`. On a
 * `<button type="button">` — what every trigger/close part renders — `preventDefault()`
 * has no other effect, so the channel is unambiguous.
 *
 * Handles both handler forms Solid accepts: a plain function, and the bound tuple
 * (`[handler, data]`). An `undefined` entry is skipped, so a consumer prop that isn't set
 * needs no guard at the call site.
 *
 * Call this inside a getter on the merged props (not eagerly in the component body), so
 * the consumer's handler is read inside `spread`'s own effect rather than as an untracked
 * prop read.
 */
export function composeEventHandlers<T, E extends Event>(
  ...handlers: Array<JSX.EventHandlerUnion<T, E> | undefined>
): JSX.EventHandler<T, E> {
  return (event) => {
    for (const handler of handlers) {
      if (event.defaultPrevented) return;
      callEventHandler(handler, event as EventHandlerEvent<T, E>);
    }
  };
}
