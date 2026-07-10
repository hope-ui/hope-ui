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
 * The controlled/uncontrolled dance every stateful component needs, modeled on Base UI's
 * `useControlled`. Returns the resolved value and a setter that writes the internal signal
 * only while uncontrolled, but always notifies `onChange`.
 *
 * Controlled-ness is decided per read, by whether `value()` is `undefined` — not latched at
 * first render. That means a component can go from uncontrolled to controlled mid-life; it
 * also means `undefined` can never be a meaningful controlled value. For a `T` where it
 * would be, model the empty case explicitly (`null`, or a sentinel) rather than `undefined`.
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
  // The value is boxed because SolidJS 2.0 overloads `createSignal`: its second overload
  // takes `Exclude<T, Function>`, and its *third* takes a `ComputeFunction<T>`. So a
  // function-valued `T` would be silently invoked as a memo compute rather than stored, and
  // `value()` would return its return value. A generic kernel primitive can't accept that
  // trap, so the signal holds an object and `equals` unwraps it — reproducing
  // `createSignal`'s own default reference equality (`isEqual`) on the value inside.
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
    if (options.value() === undefined) setBox({ value: next });
    options.onChange?.(next);
  };

  return [value, setValue] as const;
}
