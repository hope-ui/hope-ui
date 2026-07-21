# `createListboxItem`

The option part of the [listbox family](./listbox-root.md). It registers one item with the listbox's
source and emits that item's ARIA + state attributes and its pointer/click behavior. Works over both
source modes:

- **collection** — self-registers via `state.collection.register({ ref, disabled, textValue, value })`,
  and uses the returned `CollectionItem`.
- **virtual** — pass an `index` accessor; the hook looks the item up as `state.source.items()[index]`
  and publishes this row's element into the window (`registerElement` + `measureElement`) via
  `createRegisteredElement`, so `items()[index].element()` resolves for the rendered slice.

The `<li>`/`<div>` gets `role="option"`, `aria-selected` (omitted in `selectionMode="none"`),
`aria-disabled`, `data-active`/`data-selected`/`data-disabled`, the roving/activedescendant
`tabindex`, and composed `onClick` / `onPointerMove` handlers.

## API

```ts
function createListboxItem<V = unknown>(
  state: CreateListboxReturn<V>,
  props: {
    ref: Accessor<HTMLElement | null | undefined>; // the option element (a real signal accessor)
    value?: V;              // required in collection mode; ignored in virtual (comes from getItemData)
    index?: Accessor<number>; // virtual mode only — selects the virtual path
    disabled?: boolean;     // collection mode
    textValue?: string;     // explicit typeahead text, overriding itemToLabel / textContent
    // …plus any other HTML attributes to spread through
  },
): {
  props: Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> & {
    "data-active"?: string; "data-selected"?: string; "data-disabled"?: string;
  };
  isSelected: Accessor<boolean>;
  isActive: Accessor<boolean>;
  isDisabled: Accessor<boolean>;
};
```

`ref` is a control prop (the element accessor the hook reacts to); the consumer still wires
`ref={setRef}` on the element itself, and `props` omits `ref` so it can be spread onto any element.

## Behavior

- **Click** — `onClick` focuses the item (`focus.focus` / `focus.focusIndex` in virtual mode) then
  selects it: `selection.selectOne` in single/none (none no-ops), `selection.toggle` in multiple. The
  consumer's own `onClick` runs first, so `event.preventDefault()` cancels the built-in behavior.
- **Pointer move** — `onPointerMove` re-targets the active item to this one, but **only on real
  movement**, guarded by `state.pointerMoved(clientX, clientY)`. A spurious `pointermove` at
  unchanged coords (the list scrolling under a still cursor after a keyboard arrow) is ignored, so a
  keyboard arrow is never overridden. Disabled items ignore pointer moves.
- **One active item** — because both click/pointer and keyboard write the *same* active index, there
  is exactly one `data-active` item at all times, and the highlight is styled by `data-active` only.

## ARIA

`role="option"`, owned by the ancestor `role="listbox"`. `aria-selected` is `"true"`/`"false"` for
single/multiple selection and omitted entirely under `selectionMode="none"` (a browsing list).
`aria-disabled="true"` on disabled items; navigation skips them unless `skipDisabled` is off. In
virtual mode the `id` is the `itemToValue` string, so `aria-activedescendant` names a stable id even
for a row that is about to scroll into view.

## SSR

Registration and element publishing run in effects (`createRegisteredElement` /
`createCollection.register`), which never run server-side, so nothing registers during SSR — the
server renders the option markup with its static attributes and hydration wires the behavior on the
client.
