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

export function createBindable<T>(props: Accessor<BindableParams<T>>): Bindable<T> {
  const initial = props().value ?? props().defaultValue;

  const eq = props().isEqual ?? Object.is;

  // Boxed because SolidJS 2.0 overloads `createSignal`: a function-typed `T` would hit the
  // `ComputeFunction` (memo) overload and be *invoked* rather than stored. Zag's bindable
  // explicitly supports function values (upstream unwraps them with `isFunction` on the way out),
  // so the signal holds `{ value: T }` and `equals` unwraps — the same fix, for the same reason,
  // as `createControllableState`. See CLAUDE.md, "SolidJS 2.0 — API differences".
  const [box, setBox] = createSignal<Box<T>>(
    { value: initial as T },
    { equals: (previous, next) => isEqual(previous.value, next.value) },
  );
  const controlled = createMemo(() => props().value != undefined);

  const valueRef = { current: initial as T };
  const prevValue: Record<"current", T | undefined> = { current: undefined };

  createEffect(
    () => (controlled() ? (props().value as T) : box().value),
    (value) => {
      prevValue.current = value;
      valueRef.current = value;
    },
  );

  const setValue = (value: T | ((prev: T) => T)) => {
    const prev = prevValue.current;
    const next = isFunction(value) ? value(valueRef.current) : value;

    if (props().debug) {
      console.log(`[bindable > ${props().debug}] setValue`, { next, prev });
    }

    if (!controlled()) {
      setBox({ value: next });
    }
    if (!eq(next, prev)) {
      props().onChange?.(next, prev);
    }
  };

  function get(): T {
    return controlled() ? (props().value as T) : box().value;
  }

  return {
    initial,
    ref: valueRef,
    get,
    set(value: T | ((prev: T) => T)) {
      // `sync` is Zag's "this write must be observable before the caller returns" flag. The
      // upstream Solid adapter ignores it because Solid 1.x had no deferred flush to opt out of;
      // 2.0's client build does, so honour it exactly as the React adapter does with `flushSync`.
      const exec = props().sync ? flush : identity;
      exec(() => setValue(value));
    },
    invoke(nextValue: T, previousValue: T) {
      props().onChange?.(nextValue, previousValue);
    },
    hash(value: T) {
      return props().hash?.(value) ?? String(value);
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
