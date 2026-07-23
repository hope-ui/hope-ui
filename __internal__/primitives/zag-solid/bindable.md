# `createBindable`

The reactive cell every Zag machine is built out of: its state value, and each key of its
context. A machine never touches `createSignal` — it calls `bindable(...)`, which `useMachine`
supplies as this function.

Part of the vendored `@zag-js/solid@1.42.0` fork — read `machine.md` first for the fork's status
and the full deviation table.

## API

```ts
function createBindable<T>(props: Accessor<BindableParams<T>>): Bindable<T>;

createBindable.cleanup: (fn: VoidFunction) => void;
createBindable.ref: <T>(defaultValue: T) => { get(): T; set(next: T): void };
```

`BindableParams<T>` (from `@zag-js/core`):

- `defaultValue` — uncontrolled seed.
- `value` — when not `undefined`, the cell is **controlled**: `set` never writes, but still
  reports through `onChange`. Controlled-ness is decided per read, not latched.
- `onChange(next, prev)` — called on every requested change, controlled or not.
- `isEqual(a, b)` — decides whether a change is worth reporting. Defaults to `Object.is`.
- `hash(value)` — stringifies for the machine's `context.hash(key)`. Defaults to `String`.
- `debug` — a label; every `set` is logged under it.
- `sync` — see below.

Returns `{ initial, ref, get, set, invoke, hash }`. `ref` is a plain `{ current }` object holding
the last settled value: not reactive, and the thing a functional updater (`set(prev => …)`)
resolves against.

## Why the value is boxed

The one non-mechanical change in the whole fork.

SolidJS 2.0 overloads `createSignal`: the second overload takes `Exclude<T, Function>`, and the
**third** takes a `ComputeFunction<T>`. So `createSignal(initial)` with a function-valued `initial`
creates a *memo* — the function is invoked and its return value stored. Zag's bindable explicitly
supports function values (upstream unwraps them with `isFunction` on the way out of `get`), so an
unboxed port silently corrupts any machine that stores a callback in context.

The signal therefore holds a `{ value: T }` box, with an `equals` that unwraps and compares with
Solid's own `isEqual` — reproducing `createSignal`'s default reference equality on the value
inside. `createControllableState` boxes for exactly the same reason; see CLAUDE.md, "SolidJS 2.0 —
API differences".

A side effect worth naming: because the box makes the stored value unambiguous, `get()` no longer
needs upstream's `isFunction(v) ? v() : v` unwrapping. That also removes an upstream quirk where a
*controlled* function value would be invoked on read.

## `sync`

Zag's flag for "this write must be observable before `set` returns". The upstream Solid adapter
ignores it, correctly: Solid 1.x had no deferred flush to opt out of. Under 2.0's client build a
write is invisible to a plain read until the next flush, so the flag becomes meaningful again and
is honoured the way the React adapter does it — `flush` when set, a plain call otherwise:

```ts
const exec = props().sync ? flush : identity;
exec(() => setValue(value));
```

(`identity` is `@zag-js/utils`' run-this-now helper, not a value identity — it calls the function.)

The machine's own state cell does not set `sync`; it drains at the call site instead, which is
what the React adapter does too. See `machine.md`, "The flush".

## The effect, and what lags

`valueRef.current` and `prevValue.current` are maintained by a `createEffect`, so they hold the
last **settled** value, not the last written one. That is upstream's design across every
framework adapter (React updates them in a layout effect), and it is why:

- `set(prev => …)` resolves against the last settled value, and
- the first `set()` after creation reports `prev: undefined` unless something has flushed.

Tests have to settle the cell before asserting — `bindable.test.ts` calls `flush()` right after
`createRoot`, which is what upstream gets for free from `renderHook` plus a microtask.

The effect uses 2.0's split `createEffect(compute, effect)` form; the single-argument form
upstream used throws `[MISSING_EFFECT_FN]`.

## `createBindable.ref` and `.cleanup`

`ref` is a non-reactive box for values a machine wants to keep without re-rendering (DOM nodes,
timers). `cleanup` is `onCleanup`, exposed so machine code can register teardown without importing
from `solid-js`.
