import { type Accessor, createSignal, isEqual, onSettled } from "solid-js";

/** See the boxing note in `useSyncExternalStore`. */
interface Box<T> {
  value: T;
}

/**
 * The React `useSyncExternalStore` shape, as an accessor. Kept for a 1:1 public surface with
 * `@zag-js/solid`; nothing in the kernel consumes it.
 *
 * Two Solid 2.0 changes: `onMount` is gone (`onSettled`, which takes a *returned* teardown
 * instead of an inner `onCleanup`), and the snapshot is boxed because `createSignal(fn)` is 2.0's
 * memo overload — a function-valued snapshot would be invoked instead of stored. Same trap, and
 * the same fix, as `createBindable` and `createControllableState`.
 */
export function useSyncExternalStore<T>(
  subscribe: (listener: () => void) => () => void,
  getSnapshot: () => T,
  _getServerSnapshot?: () => T,
): Accessor<T> {
  const [box, setBox] = createSignal<Box<T>>(
    { value: getSnapshot() },
    { equals: (previous, next) => isEqual(previous.value, next.value) },
  );

  onSettled(() => {
    setBox({ value: getSnapshot() });
    return subscribe(() => {
      setBox({ value: getSnapshot() });
    });
  });

  return () => box().value;
}
