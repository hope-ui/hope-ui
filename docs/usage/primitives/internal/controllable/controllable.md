# `createControllableState`

The controlled/uncontrolled dance every stateful component needs, in one place. Modeled on
Base UI's `useControlled`.

## API

```ts
function createControllableState<T>(options: {
  value: Accessor<T | undefined>;
  defaultValue: Accessor<T>;
  onChange?: (value: T) => void;
}): readonly [Accessor<T>, (value: T) => void];
```

- `value` — the controlled value. `undefined` means "uncontrolled". Pass an accessor over
  the prop (`() => props.open`) so the read stays lazy and reactive.
- `defaultValue` — initial value for uncontrolled usage. Read **once**, when the internal
  signal is created.
- `onChange` — called on every requested change, controlled or not.

## Behavior

| Mode | `setValue(next)` writes the internal signal? | `onChange(next)` fires? |
| ---- | -------------------------------------------- | ----------------------- |
| Uncontrolled (`value()` is `undefined`) | Yes | Yes |
| Controlled | **No** | Yes |

A controlled component's state lives with the consumer: the setter must not fork an
internal copy, or the two silently diverge. The consumer's `onChange` handler is what moves
the value, and the next read of `value()` picks it up.

Controlled-ness is decided **per read**, not latched at first render, so a component may go
from uncontrolled to controlled mid-life. The cost of that choice: `undefined` can never be
a meaningful controlled value. For a `T` where it would be, model the empty case explicitly
(`null`, or a sentinel) — `null` reads through correctly, because the fallback is
`=== undefined`, not `??`.

## Why the value is boxed

SolidJS 2.0 overloads `createSignal`. Its value overload takes `Exclude<T, Function>`; a
*third* overload takes a `ComputeFunction<T>`. So `createSignal(someFunction)` doesn't store
the function — it creates a memo and invokes it. A generic kernel primitive can't ship that
trap, so the internal signal holds `{ value: T }` and its `equals` unwraps the box with
Solid's own `isEqual`. Reference equality on the value inside is preserved exactly: writing
the same value twice notifies once, just as a plain `createSignal` would.

## SSR

No DOM access, no effects — just a signal. Runs identically during SSR.

## Example

```tsx
export const Root: Component<DialogRootProps> = (props) => {
  const merged = withDefaults(props, { defaultOpen: false });
  const [open, setOpen] = createControllableState({
    value: () => merged.open,
    defaultValue: () => merged.defaultOpen,
    onChange: (value) => merged.onOpenChange?.(value),
  });

  return <DialogContext value={{ open, setOpen }}>{merged.children}</DialogContext>;
};
```

Note the `withDefaults` for `defaultOpen`: `merge` would let a wrapper forwarding
`defaultOpen={props.defaultOpen}` (unset) beat the default. See `defaults.md`.
