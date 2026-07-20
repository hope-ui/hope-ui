# `compareByIdOrReference` / `ValueComparator`

A shared value-equality helper for the primitives that hold a set of values keyed by identity —
[`createListSelection`](../../internal/create-list-selection.md) and
[`createListExpansion`](../../internal/create-list-expansion.md). It lives in `utils/`
because more than one primitive needs it and neither should own it.

## API

```ts
type ValueComparator<V> = (a: V, b: V) => boolean;

function compareByIdOrReference<V>(a: V, b: V): boolean;
```

`compareByIdOrReference` is the **default** those primitives use:

| `a`, `b` | Result |
|---|---|
| both objects with an `id` | `a.id === b.id` |
| primitives, `null`, or objects without `id` | `a === b` |
| one has `id`, the other doesn't | `a === b` (so different references → `false`) |

This is what lets a consumer pass a fresh `{ id, name }` object each render — or a controlled value
straight off the wire — and still have it match the registered item, without keeping references
stable. It mirrors Angular Material's `compareWith`.

## Overriding

Pass your own `compareWith` (a `ValueComparator<V>`) to `createListSelection` / `createListExpansion`
when values are keyed by something other than `id`:

```ts
createListSelection({ focus, compareWith: (a, b) => a.sku === b.sku });
```

## Note

Purely a comparison of two values — no reactivity, no DOM. Safe in any environment.
