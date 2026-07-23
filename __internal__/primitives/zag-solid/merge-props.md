# `mergeProps`

Zag's JSX-aware prop merger, re-exported from the `zag-solid` barrel. Composes several prop
objects (or accessors returning them) into one lazily-read object where **handlers, classes and
styles compose** instead of overwriting.

Part of the vendored `@zag-js/solid@1.42.0` fork — read `machine.md` first. Copied verbatim from
upstream; it imports only `@zag-js/core`, never `solid-js`.

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
