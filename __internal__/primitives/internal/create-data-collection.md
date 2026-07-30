# `createDataCollection`

The **data-driven item source**: `CollectionItem`s derived purely from an array, satisfying the same
[`ItemSource`](create-collection.md) seam as `createCollection` and
[`createVirtualCollection`](create-virtual-collection.md). It is the third and last implementation of
that seam, and the one a Select is built on.

## Why a third source

DOM-registered options and lazy mounting are mutually exclusive. `createCollection` builds its item
list from *mounted elements*, so a closed Select — which must not mount a single option the user may
never open — would have `focus.items() === []` and lose three things at once:

| | DOM-registered + lazy | Data-driven |
|---|---|---|
| Closed-trigger typeahead (focus the trigger, type `b` → Banana, popup never opens) | impossible | **works, natively** |
| An `allowsEmptyCollection` open guard | meaningless — the collection is always empty before opening | **meaningful** |
| `<select>` autofill (the browser matches `<option>`s) | only the selected option exists | **the full list, server-side too** |

The cost is small because `createVirtualCollection` already proved the shape: its items memo builds
`CollectionItem`s from data alone, with `element: () => elements().get(index)` filled in by
`registerElement` when a row mounts. Strip the virtualizer and that is this primitive.

One thing falls out for free: **`textValue` never falls back to `element.textContent`.** It comes
from `itemToLabel`, which is readable *before* the row mounts — the property offscreen typeahead
needs.

## API

```ts
function createDataCollection<V = unknown, G = V>(options: {
  items: Accessor<readonly G[]>;                              // the data — group entries when grouped
  groupToItems?: (group: G) => readonly V[];                  // flattens `items` into navigation order
  itemToValue: (item: V) => string;                           // selection identity + form value (not the id)
  itemToLabel?: (item: V) => string;                          // typeahead text; defaults to itemToValue
  isItemDisabled?: (item: V) => boolean;                      // default false
  scrollElement: Accessor<HTMLElement | null | undefined>;    // the container scrollIndexIntoView scrolls
}): {
  items: Accessor<ReadonlyArray<CollectionItem<V>>>;          // ItemSource — the flattened rows
  scrollIndexIntoView: (index: number) => void;               // ItemSource
  registerElement: (index: number, element: HTMLElement | null) => void;
  indexOfValue: (value: string) => number;                    // -1 when unknown
  groups: Accessor<readonly G[] | undefined>;                 // undefined when not grouped
};
```

The option `items` is the **input data**; the returned `items()` is the derived `CollectionItem`
list the navigation kernel reads. They are the same array only for a flat list.

`itemToValue` is required and has no default — the caller resolves one (`createListbox` defaults it
to `String(item)`), so the fallback lives in exactly one place.

### Ids are generated, not the value

A row's `id` is `` `${generatedPrefix}-${index}` `` — [`createItemIds`](create-collection.md), Base
UI's `${rootId}-${index}` scheme, where the item's id is not even a prop a consumer can set. It is
**never** derived from `itemToValue`, because a value is arbitrary application data and usually comes
from a server: it can carry whitespace (an IDREF containing a space can never be pointed at), collide
with a second collection listing the same records on the same page, or simply not be a legal id. Each
of those breaks `aria-activedescendant` silently, for screen-reader users only.

Generated does not mean unstable: `createUniqueId()` is SSR-stable, so the IDREF the server renders
and the one the hydrating client computes still agree — the property a data-driven source is chosen
for in the first place.

`itemToValue` keeps the jobs that are actually about the data: the selection identity, the string a
form submits, and the key `indexOfValue` resolves a row by. A duplicate is a dev warning naming the
value, and the first item wins — the later one can never be selected or resolved.

## Grouping

`groupToItems` has exactly one job: flattening `items` into **navigation order**, which is what arrow
keys and typeahead traverse and what every index in this primitive means. The group's *label* never
reaches the kernel — a consumer renders it from its own key — so there is no `groupToLabel` and no
`{ label, items }` shape to conform to.

`groups()` hands those entries back for the consumer to iterate (`Select.List`'s callback goes one
level up when it is set), and is `undefined` for a flat list, which is how a part tells the two modes
apart in one read. The inner iteration can be a plain `<For>` at any nesting depth, because a row
resolves its own position through `indexOfValue` rather than from its place in the tree.

`CollectionItem` deliberately gains **no** group boundary information in this step; nothing needs it
until group-aware navigation (Home/End within a group, `aria-setsize` per group) exists.

## Resolving a row from its value

`indexOfValue(value)` reads a `Map` rebuilt with the data. It exists so a part can resolve its row
from the `item` it was handed — `source.indexOfValue(itemToValue(props.item))` — instead of taking an
`index` prop it has no way to know, or reading a hidden per-row context. Building the map is O(n) per
**data change**, not per render.

## Registering a row

A mounted row publishes its element by **index**, which is what resolves `items()[index].element()`
for the `aria-activedescendant` IDREF's target and for scroll-into-view. Unlike
`createVirtualCollection`'s rows — whose index is a plain number off a `VirtualItem` —
**this index is reactive**: a row moves when the data does. So the registration is *not*
`createRegisteredElement`, whose `register` callback runs in an effect body where reading the index
would be an untracked read of a reactive value (`[STRICT_READ_UNTRACKED]`, which `mount()` fails a
test on). Track both in the compute:

```tsx
createEffect(
  () => [index(), ref()] as const,
  ([at, element]) => {
    if (!element) {
      return;
    }
    source.registerElement(at, element);
    return () => source.registerElement(at, null);
  },
);
```

That is also what makes a row that changes position re-register under its new index and clear the old
one. `create-data-collection.browser.test.tsx`'s `registerRow` is the shape to copy.

## Scrolling the active row into view

`scrollIndexIntoView(index)` calls [`scrollIntoView`](scroll-into-view.md) against `scrollElement`
with default (`"nearest"`) alignment, and no-ops unless **both** the scroll element and the row's
element have resolved. `"nearest"` is what makes `createListFocus`'s unconditional activedescendant
call safe on every move: it is a no-op for an already-visible row, so no visibility test is needed
anywhere.

The reads inside it are deliberately `untrack`ed. It is an imperative DOM sync driven by a focus
move, never a dependency, and `createListFocus` can call it from inside its own effect — where the
reads would otherwise trip `[STRICT_READ_UNTRACKED]`.

In **roving** mode this is almost never called: every row is mounted, so the native `.focus()` does
the scrolling and `createListFocus` asks the source only for rows that do not exist yet. The scroll
path here belongs to **activedescendant** mode, where nothing moves DOM focus. See
[`create-list-focus.md`](create-list-focus.md) § "Scrolling the active row into view".

## SSR

Everything except element registration works server-side, which is the point: `items()`,
`textValue()`, `disabled()` and the ids are pure data reads. No effect runs, so `element()` is
`undefined` for every row and `scrollIndexIntoView` no-ops on its `scrollElement` guard. The ids come
from one `createUniqueId()` per collection, which the server render and the hydrating client resolve
identically — so a Select can server-render its whole option list, IDREFs included.

## Example

```tsx
const [listRef, setListRef] = createSignal<HTMLElement>();
const source = createDataCollection<Product>({
  items: () => products(),
  itemToValue: (product) => product.sku,
  itemToLabel: (product) => product.title,
  isItemDisabled: (product) => product.outOfStock,
  scrollElement: listRef,
});
const focus = createListFocus({ source, focusMode: () => "activedescendant", element: listRef });
```
