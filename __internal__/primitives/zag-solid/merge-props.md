# `mergeProps`

Zag's JSX-aware prop merger, re-exported from the `zag-solid` barrel. Composes several prop
objects (or accessors returning them) into one lazily-read object where **handlers, classes and
styles compose** instead of overwriting.

Part of the vendored `@zag-js/solid@1.42.0` fork — read `machine.md` first. The merging logic is
upstream's verbatim; the **one** deviation is that construction runs `untrack`ed (below).

> Not to be confused with SolidJS 2.0's `merge` (the successor to 1.x's `mergeProps`), where a
> later source simply wins by presence. These are different tools: use `merge` for props
> precedence, this one for composing a Zag part's props with a consumer's.

## API

```ts
type MaybeAccessor<T> = T | (() => T);

function mergeProps<T, U, V, W>(
  source: MaybeAccessor<T>,
  source1?: MaybeAccessor<U>,
  source2?: MaybeAccessor<V>,
  source3?: MaybeAccessor<W>,
): T & U & V & W;
```

Every property is defined as a **getter**, so a function source is re-invoked on each read and a
signal read inside it stays reactive.

## Construction is `untrack`ed — the fork's deviation

To build that getter set, the function calls **each accessor source once, to enumerate its keys**.
That is a reactive read, and a Zag part calls `mergeProps` from a *component render body* — one of
Solid 2.0's strict-read-labelled phases — so every merged part emitted a `[STRICT_READ_UNTRACKED]`
diagnostic, which `mount()` fails a test on.

It is a false positive **by construction**: the enumeration read is one-shot and structural, and
nothing downstream depends on it staying live. `untrack` covers only the *synchronous* construction,
so the per-key getters it defines re-read their sources on every access and stay fully reactive. What
is genuinely frozen is the merged object's **key set** — which was already true before the change,
and which a re-render replaces wholesale.

Same class of fix, and same justification, as `createTrack`'s `untrack(effect)` (see `track.md`):
a read that is a one-time input rather than a subscription.

**Why upstream needs none of this:** verified against the published `@zag-js/solid@1.42.0` tarball —
its `merge-props.ts` imports **only** `@zag-js/core` and contains no `untrack`, because **Solid 1.x
has no strict-read phase at all**. In 2.0 the diagnostic is opt-in per phase: `setStrictRead(label)`
(component bodies, `<For>` / `repeat` callbacks) turns it on, and `untrack(fn)` with no label turns it
back off. The read is identical in both versions; only 2.0 reports it.

**Consequence for consumers:** a Zag-backed component needs **no** `untrack` of its own to merge part
props. Both `ZagDialog` and `ZagListbox` call this function directly; the `mergePartProps` wrapper
that used to live in `zag-dialog/` has been deleted.

## Source order for a component part — `(zag, consumer, overrides)`

Every Zag-backed part in `@hope-ui/components` merges in that order, and it is a real decision rather
than a habit, because **plain keys and `on*` keys resolve in opposite directions**.

- **Plain keys resolve last-defined-wins**, so the consumer's props outrank the machine's. That is
  what keeps hope's "an internal value never silently discards the consumer's" contract — a consumer
  `aria-labelledby` on a dialog's `Content` still beats the machine's Title id.
- **`on*` keys compose the other way.** `@zag-js/core`'s `mergeProps` folds a newly-seen handler in
  *ahead* of the accumulated one (`callAll(props[key], result[key])`), so this same source order runs
  the **consumer's handler first** and Zag's second. Every Zag handler opens with
  `if (event.defaultPrevented) return`, which is precisely what makes `event.preventDefault()` the
  consumer's cancel channel — the same contract `composeEventHandlers` gives the handmade components.

**Getting the order backwards silently disables the cancel channel** (the consumer's handler would
run after the machine had already acted), with no type error and no failing test unless one exercises
`preventDefault()`. `zag-dialog.browser.test.tsx` pins it on both the trigger and the close trigger.

### `id` is *not* a key to fight over

An early version of the `ZagDialog` spike stripped `id` from every consumer's props here, on the
theory that a consumer `id` winning would desynchronise the machine's `getElementById` lookups from
the rendered attribute. That was a misuse of the API, not a limitation: Zag's **`ids` prop** on the
machine is the sanctioned mechanism, and it feeds *both* the emitted attribute and the lookup through
the same resolver, so they cannot diverge. Expose `ids` on the component's root instead of stripping
`id` on the parts. See `G1` in `__internal__/spikes/zag-dialog-findings.md`.

## Resolution rules

| Key                                          | Behavior |
| -------------------------------------------- | -------- |
| `on*`                                        | Every source's handler runs, in source order. |
| `class` / `className`                        | Concatenated, space-separated. |
| `style`                                      | Merged into one object; a CSS *string* is parsed into properties first. |
| `data-ownedby`                               | Routed through the composing branch — see below. |
| anything else                                | The **last** source with a non-`undefined` value wins. |

The composing keys are composed by `@zag-js/core`'s own `mergeProps`, so what they actually do is
whatever the pinned core version does. Two consequences worth knowing:

- A non-function value on an `on*` key falls out of the compose path and simply overwrites
  (`{ onEvent: "overwrites" }` wins over two handlers).
- **`data-ownedby` does not union at `@zag-js/core@1.42.0`.** The union branch exists on
  `chakra-ui/zag`'s `main` but is not in the published version this fork is pinned to, so the last
  source wins there too. Upstream's own test asserts the union and fails here; ours asserts the
  installed behavior deliberately, so bumping the core dependency past that change shows up as a
  red test rather than a silent behavior swap. See `merge-props.test.ts`.
