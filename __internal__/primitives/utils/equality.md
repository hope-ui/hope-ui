# `compareByIdOrReference` / `ValueComparator`

A shared value-equality helper for the primitives that hold a set of values keyed by identity.
[`createListExpansion`](../internal/create-list-expansion.md) is its remaining consumer;
[`createListSelection`](../internal/create-list-selection.md) moved to Base UI's
`itemToValue`/`isItemEqualToValue` model (see *Rejected alternatives* below). It stays in `utils/`
rather than folding into `create-list-expansion.ts`: a second consumer keyed by identity is the
expected case, not a hypothetical one.

## API

```ts
type ValueComparator<V> = (a: V, b: V) => boolean;

function compareByIdOrReference<V>(a: V, b: V): boolean;
```

`compareByIdOrReference` is the **default** `createListExpansion` uses:

| `a`, `b` | Result |
|---|---|
| both objects with an `id` | `a.id === b.id` |
| primitives, `null`, or objects without `id` | `a === b` |
| one has `id`, the other doesn't | `a === b` (so different references → `false`) |

This is what lets a consumer pass a fresh `{ id, name }` object each render — or a controlled value
straight off the wire — and still have it match the registered item, without keeping references
stable. It mirrors Angular Material's `compareWith`.

## Overriding

Pass your own `compareWith` (a `ValueComparator<V>`) to `createListExpansion` when values are keyed
by something other than `id`:

```ts
createListExpansion({ focus, compareWith: (a, b) => a.sku === b.sku });
```

## Note

Purely a comparison of two values — no reactivity, no DOM. Safe in any environment.

## Rejected alternatives

### Reference equality (`===`) alone
**Why not:** it makes reference identity the consumer's problem. A controlled value arriving from a
server, or a fresh `{ id, name }` rebuilt each render, is never `===` the registered item, so
nothing matches and the row reads as unselected/collapsed with no error anywhere. The `id` branch
is what lets a consumer hand over plain data without threading stable references through the app.

### `compareByIdOrReference` as `createListSelection`'s default (the Angular `compareWith` idiom)
**Why not:** a comparator answers *are these equal* and nothing else, while selection also needs
the value as a **key** — the string a form submits, and what `indexOfValue` resolves a row by.
Selection moved to Base UI's `itemToValue`/`isItemEqualToValue` model instead (see
[`create-list-selection.md`](../internal/create-list-selection.md) and
[`listbox-root.md`](../listbox/listbox-root.md) § Value & form model); it had no consumer yet, so
the swap carried no migration. `compareByIdOrReference` remains the default for
[`createListExpansion`](../internal/create-list-expansion.md) only, which needs equality and no key.
