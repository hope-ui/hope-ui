# `useMachine`

Binds a Zag.js machine to SolidJS reactivity. This is the whole point of the `zag-solid` folder:
`@zag-js/core` is framework-agnostic pure TS, and `useMachine` is the adapter that gives it a
scope, a reactive state cell, props, effects, and a teardown.

## Provenance — a temporary fork

`packages/primitives/src/zag-solid/` is a **vendored fork of `@zag-js/solid@1.42.0`**
(`chakra-ui/zag`, `packages/frameworks/solid`, MIT), migrated to SolidJS 2.0. The official
adapter targets Solid 1.x and has not been migrated; this subpath exists only until upstream
ships a 2.0-compatible release, at which point it is **deleted** and `@zag-js/solid` is installed
in its place.

Everything follows from that: it is a **minimal-diff fork**. Upstream's file layout and public
API are preserved verbatim so the eventual swap is a drop-in, and only what Solid 2.0 forces was
changed. Do not refactor it toward house style, do not merge files, do not rename exports. When
something here looks unidiomatic, the question to ask is "does upstream write it that way?" — if
yes, it stays.

The `@zag-js/core` / `@zag-js/types` / `@zag-js/utils` catalog entries are pinned to `1.42.0` in
lockstep with the version this was forked from, for the same reason the solid trio is pinned
together: the adapter and the core it adapts are one unit.

### Deviations from upstream

| Upstream (Solid 1.x)                | Here (Solid 2.0)                             | Why |
| ----------------------------------- | -------------------------------------------- | --- |
| `export { Key } from "@solid-primitives/keyed"` | dropped | Uninstalled community control-flow component, used only at component-render time; no Zag component is ported yet. Re-add — and vet through hydration — when one needs keyed rendering. |
| `onMount(() => { … })`              | `onSettled(() => { … })`                     | `onMount` is gone in 2.0. `onSettled` takes a *returned* teardown instead of an inner `onCleanup`. |
| `mergeProps(a, b)` (from `solid-js`) | `merge(a, b)`                               | `mergeProps` is gone. Both call sites only *add* method keys, so `merge`'s presence-based key resolution is equivalent there. |
| `createEffect(fn)`                  | `createEffect(compute, effect)`              | 2.0 rejects the single-argument form outright (`[MISSING_EFFECT_FN]`). See `track.md`, `bindable.md`. |
| `effect()` in `createTrack`         | `untrack(effect)`                            | A `track` callback is a side effect, not a subscription, but machines read `prop(...)` inside it (dialog's `toggleVisibility`). 2.0's effect phase is strict-read-labelled, so an unwrapped call emits `[STRICT_READ_UNTRACKED]` on every controlled open/close. See `track.md`. |
| `createSignal(initial)` in `bindable` | a boxed `createSignal<{ value: T }>`       | 2.0's `createSignal(fn)` is the *memo* overload, so a function-valued state would be invoked instead of stored. See `bindable.md`. |
| `function flush(fn) { fn() }`       | `flush` from `solid-js`                      | Upstream's no-op was correct only because Solid 1.x propagated writes synchronously. See "The flush" below. |
| `import type { JSX } from "solid-js"` | `from "@solidjs/web"`                      | 2.0 moved the DOM/JSX types there; it is also this repo's `jsxImportSource`. |
| a boolean `aria-*` value passes through `normalizeProps` unchanged | stringified (`false` → `"false"`) | **The one bug fix in the fork, not a migration.** Solid's `setAttribute` writes `true` as `""` and *removes* the attribute for `false`, so `aria-modal={true}` shipped `aria-modal=""` (axe: `aria-valid-attr-value`) and `aria-expanded={false}` shipped nothing at all. Upstream has the same bug — it is invisible there because React's DOM layer stringifies `aria-*` for you. Found by `ZagDialog`; see `normalize-props.md` and `__internal__/spikes/zag-dialog-findings.md`. Upstreaming it is the real fix. |

## API

```ts
function useMachine<T extends MachineSchema>(
  machine: Machine<T>,
  userProps?: Partial<T["props"]> | Accessor<Partial<T["props"]>>,
): Service<T>;
```

- `machine` — a machine built with `createMachine` from `@zag-js/core`.
- `userProps` — the machine's props, either a plain object or an **accessor**. Pass an accessor
  (`() => ({ max: max() })`) whenever a prop comes from a signal; it is re-read through a memo, so
  guards and computed values see the current value.
- Returns the Zag `Service<T>`: `state` (with `get`/`matches`/`hasTag`), `send`, `context`, `prop`,
  `scope`, `refs`, `computed`, `event`, `getStatus`.

Reads are reactive where Zag makes them so — `service.state.get()` in a JSX expression re-renders
on transition, because the state cell is a `createBindable` over a signal.

## Lifecycle

The machine starts in `onSettled` (after the tree has settled, never during render) and stops in
`onCleanup`. Between those two points `getStatus()` is `MachineStatus.Started`; outside them,
`send` is a no-op — which is what makes an event fired from a torn-down effect harmless.

`send` itself is deferred by a `queueMicrotask`, upstream's design: an action that sends is not
re-entrant with the transition that triggered it.

## The flush

This is the one place where a faithful port required *adding* code rather than translating it.

Solid 1.x propagated a signal write synchronously, so upstream's `flush` helper could be
`(fn) => fn()` and `state.set(target)` needed no ceremony. Solid 2.0's **client** build defers a
write to the next flush, so a plain read after a write still sees the old value. Since `send`
queues one microtask per event, two events sent in the same tick would *both* read the
pre-transition state — the second event finds no transition from a state the machine has already
left, and is silently dropped.

So `flush` is Solid's `flush`, and the state write is drained at the call site:

```ts
flush(() => state.set(target));
```

which is exactly what the React adapter has always spelled as
`flushSync(() => state.set(target))` — the deferred-scheduler problem Solid 1.x simply did not
have. `machine.browser.test.tsx`'s "processes rapid sends in one tick deterministically" fails
without it (verified by removing the `flush` and watching the machine stall one state behind).

## Testing

`machine.browser.test.tsx` ports upstream's `tests/machine.test.ts` and
`tests/nested-states.test.ts`, replacing `@solidjs/testing-library`'s `renderHook` with hope-ui's
`mount()`. That swap is doing real work: `mount()` fails the test on any `STRICT_READ_UNTRACKED`
or `REACTIVE_WRITE_IN_OWNED_SCOPE` diagnostic, so the whole ported suite doubles as proof that the
adapter never reads reactive state untracked in a render body — the failure mode Solid 1.x had no
way to surface.

`machine.ssr.test.tsx` is not required by the Definition of Done (the SSR round-trip belongs to
the *components* set, and this folder ships no DOM). It exists because "all client-only work is
gated behind `onSettled`" is a claim a server render can falsify: it asserts that
`renderToStringAsync` yields the **initial** state and that no entry action or effect ran.

## See also

- `bindable.md` — the state/context cell, and the boxing note.
- `track.md` — the `track` a machine receives in its params.
- `refs.md`, `merge-props.md`, `normalize-props.md`, `use-sync-external-store.md`.
