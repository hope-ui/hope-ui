# `createListboxItem`

The option part of the [listbox family](./listbox-root.md). It publishes one row's element into the
listbox's source and emits that row's ARIA + state attributes and its pointer/click behavior.

There is **one** code path, because both sources are index-registered ([`IndexedItemSource`](../internal/create-collection.md)).
The only difference is how the row's index is resolved:

- **data mode** — pass the `item` this row renders. The hook resolves its position with
  `state.indexOfValue(state.itemToValue(item))`, so an option can sit anywhere in the subtree
  (a group's nested `<For>`) and still register under the right flat index.
- **virtual mode** — pass an `index` accessor. A windowed row is *recycled*: its position changes
  while the component stays mounted, so only the row itself knows it.

The element gets `role="option"`, `aria-selected` (omitted in `selectionMode="none"`),
`aria-disabled`, `data-active`/`data-selected`/`data-disabled`, the roving/activedescendant
`tabindex`, and composed `onClick` / `onPointerMove` / `onFocus` handlers.

## API

```ts
function createListboxItem<V = unknown>(
  state: CreateListboxReturn<V>,
  props: {
    ref: Accessor<HTMLElement | null | undefined>; // the option element (a real signal accessor)
    item?: V;                 // data mode — one element of the listbox's `items`
    index?: Accessor<number>; // virtual mode only — selects the virtual path
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

**Nothing about the row is declared twice.** Its label, disabled state and selection identity all come
from `Listbox.Root`'s `itemToLabel` / `isItemDisabled` / `itemToValue` — which is what lets them be
known before the row mounts. There is no `value`, `textValue` or `disabled` prop here.

`id` is **not** forwardable either: it is the `aria-activedescendant` IDREF, generated per row by the
source (`createItemIds`), so a consumer's own id would break the reference silently. Every other
native attribute (`data-*`, `aria-*`, `title`, `style`, `class`, `ref`, event handlers) is forwarded —
pinned on the element by `listbox-item.browser.test.tsx` and, at the component layer, by
`listbox.browser.test.tsx` § "Listbox.Item — DOM prop forwarding", because the `omit` list is
hand-kept and a dropped attribute fails nothing on its own.

## Registration

```tsx
createEffect(
  () => [index(), props.ref()] as const,
  ([at, element]) => {
    if (at < 0 || !element) return;
    source.registerElement(at, element);
    source.measureElement?.(element);
    return () => source.unregisterElement(element);
  },
);
```

Two details, both load-bearing:

- **The index is tracked in the `compute`, not read in the effect body.** In data mode it is a memo
  read (`indexOfValue` over a map rebuilt with the data), and reading it in the body is an untracked
  read of a reactive value — `[STRICT_READ_UNTRACKED]`, which `mount()` fails a test on. Tracking it
  is also what makes a row that moves re-register under its new index.
- **The teardown addresses the element, never the index this run registered under.** A reorder
  re-runs every moved row in sequence, so by the time a row tears down its old slot another row may
  already own it — and a plain read cannot tell, because a signal write is not visible until the next
  flush. Clearing by index there deletes the arriving row's live element and leaves that position with
  no `element()` at all: no error, just a row `aria-activedescendant` can never point at. See
  [`unregisterElement`](../internal/create-collection.md).

An `item` that resolves to `-1` — not an element of `items` — is a **dev warning naming the value**.
That row renders but can never be activated, selected or scrolled to, because arrow keys and typeahead
traverse `items` rather than the DOM. It is the one mismatch grouping can introduce, and the warning
fires at the call site.

## Behavior

- **Click** — `onClick` focuses the row (`focus.focusIndex`) then selects it: `selection.selectOne` in
  single/none (none no-ops), `selection.toggle` in multiple. The consumer's own `onClick` runs first,
  so `event.preventDefault()` cancels the built-in behavior.
- **Pointer move** — `onPointerMove` re-targets the active item to this one, but **only on real
  movement**, guarded by `state.pointerMoved(clientX, clientY)`. A spurious `pointermove` at
  unchanged coords (the list scrolling under a still cursor after a keyboard arrow) is ignored, so a
  keyboard arrow is never overridden. Disabled items ignore pointer moves. It is also the one path
  that passes `{ scroll: false }`: the row is already under the cursor, so scrolling to it would
  slide the list and hand the highlight to whatever ends up beneath the pointer. Click and focus
  keep the default (`"nearest"` is a no-op for an already-visible row). See `create-list-focus.md`.
- **Focus** — `onFocus` syncs the active index to real DOM focus (`untrack`ed, since focus is moved
  from inside `createListFocus`'s own effect). This paints the row that takes focus when the list is
  entered — tabbing in, clicking, or a programmatic `.focus()`. No `getEventTarget` guard is needed:
  Solid's `onFocus` is the non-bubbling native `focus`.
- **The highlight follows focus** — `data-active` (and the returned `isActive`) is
  `focus.isActive(item) && focus.isFocused()`: the active item **only while the widget holds focus**
  (react-aria's `manager.isFocused && manager.focusedKey === key`). So the highlight never lingers
  after focus leaves the list. `isFocused` is tracked by `createListbox`'s container `onFocusIn`/
  `onFocusOut` — see `listbox-root.md`.
- **One active item** — because both click/pointer and keyboard write the *same* active index, there
  is exactly one `data-active` item at all times, and the highlight is styled by `data-active` only.

## ARIA

`role="option"`, owned by the ancestor `role="listbox"`. `aria-selected` is `"true"`/`"false"` for
single/multiple selection and omitted entirely under `selectionMode="none"` (a browsing list).
`aria-disabled="true"` on disabled rows; navigation skips them unless `skipDisabled` is off. The `id`
is generated by the source per row, so `aria-activedescendant` names a stable id even for a row that
is about to scroll into view — and one that survives the SSR → hydrate round-trip.

## SSR

Element registration runs in an effect, which never runs server-side, so `element()` is `undefined`
for every row during SSR. Everything else is a pure data read and **does** render: the row's `id`, its
`aria-selected`, its `aria-disabled` and its `tabindex` are all correct in the server HTML, because the
source knows the whole option set without the DOM. Hydration then wires the behavior on the client.

## Rejected alternatives

### `value`, `textValue` and `disabled` as props on the row

**Why not:** the row would re-declare what the root already knows, and only from the moment it
mounts — so a closed popup or an offscreen virtual row has no text for typeahead to match against
and no disabled state for navigation to skip. All three come from `Listbox.Root`'s `itemToValue` /
`itemToLabel` / `isItemDisabled`, which answer before any row exists.

### A consumer-settable `id`

**Why not:** the row's `id` is the `aria-activedescendant` IDREF, generated per row by the source
(`createItemIds`). A consumer's own id breaks that reference silently — nothing throws, nothing
fails a test, and only screen-reader users see the result. Every *other* native attribute is
forwarded.

### Clearing the row's slot by index (`unregisterElement(index)`)

**Why not:** `<For>` keys by identity, so a reorder moves rows and every moved row re-registers in
sequence; a row clearing its old index cannot tell that another row already claimed it, because a
signal write is not visible to a plain read until the next flush. Measured on a four-row reverse:
`del(0) set(3) del(1) set(2) del(2) set(1) del(3) set(0)` left two positions with no `element()` at
all — no error, just rows `aria-activedescendant` can never point at and scroll-into-view can never
reach. The teardown addresses the *element*; see *Registration* above.

### `createRegisteredElement` for the row's element registration

**Why not:** its `register` callback runs in an effect *body*, and in data mode the row's index is a
memo read there — an untracked read of a reactive value, i.e. `[STRICT_READ_UNTRACKED]`, which
`mount()` fails the test on. Tracking the index alongside the ref in the effect's `compute` is also
what makes a row that changes position re-register under its new index.

### Scrolling the active row into view on every activation

**Why not:** on `onPointerMove` the row is already under the cursor, so scrolling to it slides the
list and hands the highlight to whatever ends up beneath the pointer. That one path passes
`{ scroll: false }`; click and focus keep the default, where `"nearest"` is a no-op for a row that
is already visible.
