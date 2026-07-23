# `useSyncExternalStore`

React's store-subscription hook, shaped as a Solid accessor. Kept for a 1:1 public surface with
`@zag-js/solid` so the eventual swap to the official adapter is a drop-in — **nothing in the
kernel consumes it**, and a Solid consumer with an external store is better served by a plain
signal.

Part of the vendored `@zag-js/solid@1.42.0` fork — read `machine.md` first.

## API

```ts
function useSyncExternalStore<T>(
  subscribe: (listener: () => void) => () => void,
  getSnapshot: () => T,
  _getServerSnapshot?: () => T,
): Accessor<T>;
```

- `subscribe` — registers a listener, returns its unsubscribe.
- `getSnapshot` — reads the store's current value.
- `_getServerSnapshot` — accepted for React parity and **ignored**.

The first snapshot is read synchronously, so the accessor is readable during render. The
subscription is set up in `onSettled`, which also re-reads the snapshot — covering the gap where
the store moved on while the tree was still rendering. Disposing the owner unsubscribes.

## Solid 2.0 changes

- `onMount(() => { …; onCleanup(unsubscribe) })` → `onSettled(() => { …; return unsubscribe })`.
  `onMount` is gone, and `onSettled` takes a **returned** teardown rather than an inner
  `onCleanup`.
- The snapshot is **boxed** in a `{ value: T }` signal, with an `equals` that unwraps. Same trap as
  `createBindable`: 2.0's `createSignal(fn)` is the memo overload, so a function-valued snapshot
  would be invoked instead of stored. See `bindable.md`.
