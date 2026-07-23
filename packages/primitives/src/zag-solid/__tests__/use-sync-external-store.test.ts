import { createRoot, flush } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { useSyncExternalStore } from "../use-sync-external-store";

/** A minimal external store: the shape `useSyncExternalStore` exists to bridge. */
function createStore<T>(initial: T) {
  const listeners = new Set<() => void>();
  let snapshot = initial;
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    emit(next: T) {
      snapshot = next;
      listeners.forEach((listener) => {
        listener();
      });
    },
    get listenerCount() {
      return listeners.size;
    },
  };
}

/**
 * The subscription lives in `onSettled`, so the accessor is created inside `createRoot` and the
 * root is settled with `flush()` before anything is asserted — emitting into an unsettled store
 * would be asserting on the pre-subscription state.
 */
function subscribed<T>(create: () => T): { value: T; dispose: () => void } {
  let dispose!: () => void;
  const value = createRoot((disposeRoot) => {
    dispose = disposeRoot;
    return create();
  });
  flush();
  return { value, dispose };
}

describe("useSyncExternalStore", () => {
  it("reads the snapshot synchronously, before the subscription is set up", () => {
    const store = createStore("initial");
    let snapshot!: () => string;

    const dispose = createRoot((disposeRoot) => {
      snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
      // Still inside the root body: `onSettled` has not run, so nothing is subscribed yet — but
      // the first snapshot must already be readable, or a component would render blank.
      expect(snapshot()).toBe("initial");
      expect(store.listenerCount).toBe(0);
      return disposeRoot;
    });

    dispose();
  });

  it("re-reads the snapshot when the store emits", () => {
    const store = createStore("a");
    const { value: snapshot, dispose } = subscribed(() =>
      useSyncExternalStore(store.subscribe, store.getSnapshot),
    );

    expect(store.listenerCount).toBe(1);

    flush(() => store.emit("b"));
    expect(snapshot()).toBe("b");

    flush(() => store.emit("c"));
    expect(snapshot()).toBe("c");
    dispose();
  });

  it("picks up a snapshot that changed between render and subscription", () => {
    // The gap `onSettled` re-reads for: the store moved on while the tree was still rendering.
    const store = createStore("a");
    let snapshot!: () => string;

    const dispose = createRoot((disposeRoot) => {
      snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot);
      return disposeRoot;
    });
    store.emit("b");
    flush();

    expect(snapshot()).toBe("b");
    dispose();
  });

  it("stores a function snapshot instead of invoking it", () => {
    // The boxing guard: 2.0's `createSignal(fn)` is the memo overload.
    const stored = () => "called";
    const store = createStore(stored);
    const { value: snapshot, dispose } = subscribed(() =>
      useSyncExternalStore(store.subscribe, store.getSnapshot),
    );

    expect(snapshot()).toBe(stored);
    dispose();
  });

  it("unsubscribes when the owning scope is disposed", () => {
    const store = createStore("a");
    const { value: snapshot, dispose } = subscribed(() =>
      useSyncExternalStore(store.subscribe, store.getSnapshot),
    );

    expect(store.listenerCount).toBe(1);

    dispose();

    expect(store.listenerCount).toBe(0);

    flush(() => store.emit("b"));
    expect(snapshot()).toBe("a");
  });

  it("ignores the server-snapshot argument it accepts for React parity", () => {
    const store = createStore("client");
    const serverSnapshot = vi.fn(() => "server");
    const { value: snapshot, dispose } = subscribed(() =>
      useSyncExternalStore(store.subscribe, store.getSnapshot, serverSnapshot),
    );

    expect(snapshot()).toBe("client");
    expect(serverSnapshot).not.toHaveBeenCalled();
    dispose();
  });
});
