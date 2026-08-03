import { type Accessor, createSignal, isEqual } from "solid-js";

export interface CreateControllableStateOptions<T> {
  /**
   * The controlled value. `undefined` means "uncontrolled" — the internal signal is used
   * instead. Pass an accessor over the prop (`() => props.open`) so the read stays lazy.
   */
  value: Accessor<T | undefined>;
  /** Initial value for uncontrolled usage. Read once, when the internal signal is created. */
  defaultValue: Accessor<T>;
  /** Called on every requested change, controlled or not. */
  onChange?: (value: T) => void;
}

/** See the note on boxing in `createControllableState`. */
interface Box<T> {
  value: T;
}

/**
 * Lets a component's state be driven by the consumer through a `value` prop *or* held internally
 * when no such prop is passed, without every caller writing that branch itself. Modeled on the
 * `useControlled` hook in Base UI, a React headless component library. Returns the resolved value
 * and a setter that writes the internal signal only while uncontrolled but always calls `onChange`.
 *
 * Which mode applies is decided on every read, by whether `value()` is `undefined`, rather than
 * latched at first render — so a component may switch modes mid-life, and `undefined` can never be
 * a meaningful controlled value. Where it would be for some `T`, model the empty case as `null` or
 * a sentinel instead.
 *
 * ```tsx
 * const [open, setOpen] = createControllableState({
 *   value: () => props.open,
 *   defaultValue: () => props.defaultOpen ?? false,
 *   onChange: (value) => props.onOpenChange?.(value),
 * });
 * ```
 */
export function createControllableState<T>(
  options: CreateControllableStateOptions<T>,
): readonly [Accessor<T>, (value: T) => void] {
  // Boxed because SolidJS 2.0 overloads `createSignal`: one overload takes `Exclude<T, Function>`,
  // another a compute function. A function-valued `T` would therefore be invoked as a memo rather
  // than stored, and `value()` would return its result. A primitive generic over `T` cannot ship
  // that trap, so the signal holds an object and `equals` unwraps it — restoring the reference
  // equality `createSignal` would have applied to the value itself.
  const [box, setBox] = createSignal<Box<T>>(
    { value: options.defaultValue() },
    { equals: (previous, next) => isEqual(previous.value, next.value) },
  );

  const value: Accessor<T> = () => {
    const controlled = options.value();
    // `=== undefined`, not `??`: `null` is a legitimate controlled value for some `T`.
    return controlled === undefined ? box().value : controlled;
  };

  const setValue = (next: T) => {
    if (options.value() === undefined) {
      setBox({ value: next });
    }
    options.onChange?.(next);
  };

  return [value, setValue] as const;
}
