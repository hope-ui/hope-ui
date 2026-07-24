import type { Bindable, BindableParams } from "@zag-js/core";
import { identity, isFunction } from "@zag-js/utils";
import {
  type Accessor,
  createEffect,
  createMemo,
  createSignal,
  flush,
  isEqual,
  onCleanup,
} from "solid-js";

/** See the boxing note in `createBindable`. */
interface Box<T> {
  value: T;
}

/**
 * The reactive cell behind every Zag context value and behind the machine's own state. A machine
 * hands in an accessor that rebuilds its params on each call; the cell decides controlled vs.
 * uncontrolled per read, notifies `onChange` on real changes only, and resolves updater functions
 * against the current value.
 *
 * Deliberately **not** built on `createControllableState` (the kernel's own controlled/uncontrolled
 * primitive), which treats `null` as a controlled value. Zag's rule is `value != undefined`, so a
 * machine prop of `null` — `highlightedValue`, `value` for a cleared select — means *uncontrolled*.
 * Reusing the house primitive would silently change every such machine's semantics.
 */
export function createBindable<T>(params: Accessor<BindableParams<T>>): Bindable<T> {
  // Memoized rather than called per read. The accessor a machine passes rebuilds its whole params
  // object — the state cell re-runs `machine.initialState({ prop })` inside it — so upstream's
  // read-through shape re-derived all of that on every single `get()`.
  const currentParams = createMemo(params);

  // Read once, at construction. `useMachine` creates every cell inside `seedFromProps`, which is
  // where the "this read is a seed, not a subscription" case is made — see `machine.ts`.
  const initial = (currentParams().value ?? currentParams().defaultValue) as T;
  const valuesAreEqual = currentParams().isEqual ?? Object.is;

  // Boxed because SolidJS 2.0 overloads `createSignal`: a function-typed `T` would hit the
  // `ComputeFunction` (memo) overload and be *invoked* rather than stored. Zag's bindable
  // explicitly supports function values (upstream unwraps them with `isFunction` on the way out),
  // so the signal holds `{ value: T }` and `equals` unwraps — the same fix, for the same reason,
  // as `createControllableState`. See CLAUDE.md, "SolidJS 2.0 — API differences".
  const [box, setBox] = createSignal<Box<T>>(
    { value: initial },
    { equals: (previous, next) => isEqual(previous.value, next.value) },
  );

  const isControlled = createMemo(() => currentParams().value != undefined);
  const value = () => (isControlled() ? (currentParams().value as T) : box().value);

  // Plain locals, not `{ current }` boxes: an updater (`set(previous => …)`) and the `onChange`
  // comparison both need the *settled* value, which the effect below writes one flush behind the
  // signal. Nothing outside this closure mutates them.
  let settledValue = initial;
  let previousValue: T | undefined;

  createEffect(value, (settled) => {
    previousValue = settled;
    settledValue = settled;
  });

  const setValue = (next: T | ((previous: T) => T)) => {
    const previous = previousValue;
    const resolved = isFunction(next) ? next(settledValue) : next;

    const debugLabel = currentParams().debug;
    if (debugLabel) {
      console.log(`[bindable > ${debugLabel}] setValue`, { next: resolved, prev: previous });
    }

    if (!isControlled()) {
      setBox({ value: resolved });
    }
    if (!valuesAreEqual(resolved, previous)) {
      currentParams().onChange?.(resolved, previous);
    }
  };

  return {
    initial,
    // Zag types this `any` and no machine in the pinned set reads it, but it is part of the
    // `Bindable` contract. A live view of the settled value, rather than a second copy to keep
    // in sync.
    ref: {
      get current() {
        return settledValue;
      },
    },
    get: value,
    set(next: T | ((previous: T) => T)) {
      // `sync` is Zag's "this write must be observable before the caller returns" flag. The
      // upstream Solid adapter ignores it because Solid 1.x had no deferred flush to opt out of;
      // 2.0's client build does, so honour it exactly as the React adapter does with `flushSync`.
      const exec = currentParams().sync ? flush : identity;
      exec(() => setValue(next));
    },
    invoke(next: T, previous: T) {
      currentParams().onChange?.(next, previous);
    },
    hash(value: T) {
      return currentParams().hash?.(value) ?? String(value);
    },
  };
}

createBindable.cleanup = (fn: VoidFunction) => {
  onCleanup(() => fn());
};

createBindable.ref = <T>(defaultValue: T) => {
  let value = defaultValue;
  return {
    get: () => value,
    set: (next: T) => {
      value = next;
    },
  };
};
