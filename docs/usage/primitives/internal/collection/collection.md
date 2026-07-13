# `createCollection`

The **default item source** for the list-navigation kernel: an ordered, reactive registry of the
items a collection component renders. It is the foundation Model A (DOM-first registry) depends on.

`<Listbox.Root>` calls `createCollection` once; each `<Listbox.Option>` calls `collection.register`
from its own scope. Navigation, selection, typeahead and focus all read `collection.items()`.

## Why this is a primitive

[`createRegisteredElement`](../registered-element/registered-element.md) publishes a descendant's
element to an ancestor, but it is a **one-directional publisher**: it returns no collection and
gives **no ordering guarantee** — registration order is `createEffect`-creation order, which is not
the order a screen reader or an `ArrowDown` press should follow.

`createCollection` adds exactly that missing piece. `items()` sorts every registered element by
`compareDocumentPosition`, so the list is always in **DOM order** regardless of when each item
happened to register (an item can render first but register last — an `<Show>`-gated option that
mounts ahead of its siblings still sorts to the front). Angular Aria's `SortedCollection` +
`private/behaviors/list` is the reference (its reasoning and public surface, adapted — not its code).

## The item-source seam

`createCollection` implements the abstract `ItemSource<V>` interface that `createListFocus` reads:

```ts
interface ItemSource<V = unknown> {
  items: Accessor<ReadonlyArray<CollectionItem<V>>>;
  scrollIndexIntoView?: (index: number) => void; // omitted here — every item is mounted
}

interface CollectionItem<V = unknown> {
  id: string;                                 // stable, known before mount
  element: Accessor<HTMLElement | undefined>; // resolves once the item mounts
  disabled: Accessor<boolean>;
  textValue: Accessor<string>;                // falls back to trimmed textContent
  value: Accessor<V>;
}
```

The other implementation, `createVirtualCollection`, satisfies the same interface but resolves
`element` only for the windowed slice and provides `scrollIndexIntoView`. A behavior written against
`ItemSource` works over either — that is the whole point of the seam. See `list-focus.md`.

## API

```ts
function createCollection<V = unknown>(): {
  items: Accessor<ReadonlyArray<CollectionItem<V>>>;
  register: (options: RegisterItemOptions<V>) => CollectionItem<V>;
  indexOf: (item: CollectionItem<V>) => number;
};

interface RegisterItemOptions<V = unknown> {
  ref: Accessor<HTMLElement | null | undefined>; // a real signal accessor
  id?: string;                                    // defaults to createUniqueId()
  disabled?: Accessor<boolean>;
  textValue?: Accessor<string>;
  value?: Accessor<V>;
}
```

- `register` — call it from the **item's own scope**. The returned handle's `id` is usable
  immediately (for the element's `id` attribute and `aria-activedescendant`); `element` resolves
  after the item mounts. Registration and cleanup are deferred through `createRegisteredElement`, so
  a descendant writing this ancestor-owned collection never trips `[REACTIVE_WRITE_IN_OWNED_SCOPE]`.
- `items` — the full set, DOM-sorted. Identity changes whenever an item registers/unregisters.
- `indexOf` — the item's position in `items()`, or `-1`.

## SSR

`createRegisteredElement` uses `createEffect`, which never runs during SSR, so nothing registers
server-side and `items()` is empty. The `id` from `createUniqueId()` is still SSR-stable, so a part
that renders its own `id` attribute at render time hydrates cleanly; anything that depends on the
*collected set* (an active-descendant IDREF, `aria-setsize`) needs a client-side pass, which is the
normal collection story.

## Example

```tsx
function Option(props: { value: string }) {
  const collection = useListboxContext();
  const [ref, setRef] = createSignal<HTMLLIElement>();
  const item = collection.register({ ref, value: () => props.value });
  return (
    <li ref={setRef} id={item.id} role="option">
      {props.children}
    </li>
  );
}
```
