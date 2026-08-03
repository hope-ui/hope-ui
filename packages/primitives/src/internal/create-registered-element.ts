import { type Accessor, createEffect } from "solid-js";

export interface CreateRegisteredElementOptions<T extends Element> {
  /**
   * The element to publish. Must be a real signal accessor, not a plain variable: the element is
   * usually created as a reactive consequence of some `open`/`present` signal, so a non-tracking
   * read would catch it still `undefined` and never see it appear.
   */
  ref: Accessor<T | null | undefined>;
  /** Called with the element once it exists. */
  register: (element: T) => void;
  /** Called with the same element when it changes or the owner is disposed. */
  unregister: (element: T) => void;
}

/**
 * Publishes a descendant's DOM element into an ancestor's context, so the ancestor can act on an
 * element it does not own — a dialog root, for instance, collecting its popup and backdrop so it can
 * spare exactly those when it hides the rest of the page from assistive tech.
 *
 * The element counterpart of `createRegisteredId`, and it exists for the same reason: SolidJS 2.0
 * throws `[REACTIVE_WRITE_IN_OWNED_SCOPE]` when a descendant writes, from its own synchronous render
 * body, to a signal an ancestor's reactive scope owns. This defers into `createEffect` rather than
 * `onSettled` because a ref is only populated *after* render and is replaced when the element
 * remounts. `unregister` is handed the element that was registered rather than the current one, so
 * an ancestor holding a list removes exactly the entry it was given.
 *
 * Effects do not run on the server, so nothing registers there; an ancestor whose server-rendered
 * markup depends on a registered element needs its own fallback.
 */
export function createRegisteredElement<T extends Element>(
  options: CreateRegisteredElementOptions<T>,
): void {
  createEffect(
    () => options.ref(),
    (element) => {
      if (element == null) {
        return;
      }
      options.register(element);
      return () => options.unregister(element);
    },
  );
}
