import { type Accessor, createEffect } from "solid-js";

export interface CreateRegisteredElementOptions<T extends Element> {
  /**
   * The element to publish. Must be a real signal accessor: the element is typically created
   * as a reactive consequence of some `open`/`present` signal, so an untracked read would
   * catch it still `undefined`, forever. See the identical note in `create-focus-trap.ts`.
   */
  ref: Accessor<T | null | undefined>;
  /** Called with the element once it exists. */
  register: (element: T) => void;
  /** Called with the same element when it changes or the owner is disposed. */
  unregister: (element: T) => void;
}

/**
 * Publishes a descendant's DOM element into an ancestor's context, so the ancestor can act on
 * an element it doesn't own — `Dialog.Root` collecting the popup, the consumer's backdrop and
 * the `ModalBackdrop` into the `targets` list `createHideOutside` must spare.
 *
 * The element counterpart of `createRegisteredId`, and it exists for the same reason: a
 * descendant may not write to a signal owned by an ancestor's reactive scope directly from
 * its own synchronous render body — SolidJS 2.0 throws `[REACTIVE_WRITE_IN_OWNED_SCOPE]`.
 * Where `createRegisteredId` defers into `onSettled` (an id is known at render time and never
 * changes), this defers into `createEffect`, because a ref is only populated *after* render
 * and may be replaced when the element remounts.
 *
 * `unregister` receives the element that was registered, not the current one, so an ancestor
 * holding a list can remove exactly the entry it was given.
 *
 * ## SSR
 *
 * `createEffect` bodies never run during SSR, so nothing registers server-side. An ancestor
 * whose server-rendered markup depends on a registered element needs its own fallback.
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
