# `createVirtualCollection`

The **virtualized item source**: a thin SolidJS reactive binding over
[`@tanstack/virtual-core`](https://tanstack.com/virtual) that satisfies the same
[`ItemSource`](create-collection.md) seam as `createCollection`. Swap one for the other and
the whole navigation kernel — `createListFocus`, `createListNavigation`, `createListTypeahead`,
`createListSelection` — works unchanged over a 10 000-row list.

## Why virtualization needs the seam

A windowed list renders only the visible slice to the DOM, so a registry of *mounted* elements can't
see the whole list — ArrowDown past the window, Home/End over all items, typeahead over offscreen
labels, and `aria-setsize`/`aria-posinset` would all break. TanStack Virtual is **count-in,
windowed-DOM-out**, so the full set is known at the data layer even though the DOM is windowed. This
binding reconciles the two:

- `items()` reflects the **full** count. Navigation, typeahead and set-size see every row.
- each item's `element` accessor resolves **only for the mounted window** (`undefined` otherwise).
- `scrollIndexIntoView(index)` maps to the virtualizer's `scrollToIndex`.

`createListFocus` reads exactly those three things, so roving focus over an unmounted row is automatic:
it scrolls the target in, then focuses it once the row mounts. That deferred-focus plumbing is shared
with activedescendant mode — see `create-list-focus.md`.

## `@tanstack/virtual-core`, adopted as an optional peer

The core is framework-agnostic with no Solid version coupling, so it is **adopted** and only the Solid
binding is written by hand. It goes in as an **optional `peerDependency`**: a consumer who never
virtualizes keeps a zero-dependency `@hope-ui/primitives` install; only those who call
`createVirtualCollection` install the core. The two members it is picked for are
`scrollToIndex(index, {align})` — the "bring an unmounted target into view" hook — and
`measureElement`, for variable row sizes.

## API

```ts
function createVirtualCollection<V = unknown>(options: {
  count: Accessor<number>;                                   // full length, reactive
  scrollElement: Accessor<HTMLElement | null | undefined>;   // scroll container signal
  estimateSize: (index: number) => number;                  // px estimate per row
  getItemData: (index: number) => VirtualItemData<V>;        // value/textValue/disabled per index
  overscan?: number;                                         // default 5
  horizontal?: boolean;                                      // default false
}): {
  items: Accessor<ReadonlyArray<CollectionItem<V>>>;         // ItemSource — full set
  scrollIndexIntoView: (index: number) => void;              // ItemSource — → scrollToIndex
  virtualItems: Accessor<VirtualItem[]>;                     // the window to render
  totalSize: Accessor<number>;                               // spacer height/width
  registerElement: (index: number, element: HTMLElement | null) => void;
  unregisterElement: (element: HTMLElement) => void;        // retire by identity — see create-collection.md
  measureElement: (element: HTMLElement | null) => void;
  virtualizer: Virtualizer<HTMLElement, HTMLElement>;        // escape hatch
};
```

`VirtualItemData.textValue` is **required for offscreen typeahead** — an unmounted row has no
`textContent` to fall back to.

`VirtualItemData` carries **no id**: the binding generates one per row through
[`createItemIds`](create-collection.md), the same scheme `createDataCollection` uses. A caller cannot
hand one in, which is the point — an id derived from application data is not reliably legal, unique,
or whitespace-free, and every one of those failures breaks `aria-activedescendant` in silence.

## Rendering rows

Render only `virtualItems()`, absolutely positioned inside a `totalSize()`-tall spacer. Each row
publishes its element (via [`createRegisteredElement`](create-registered-element.md))
and hands it to `measureElement`, and carries `data-index` so the measurer can identify it:

```tsx
<div ref={setScrollRef} role="listbox" style={{ height: "300px", "overflow-y": "auto" }}>
  <div style={{ height: `${collection.totalSize()}px`, position: "relative" }}>
    <For each={collection.virtualItems()}>
      {(v) => {
        const [ref, setRef] = createSignal<HTMLElement>();
        createRegisteredElement({
          ref,
          register: (el) => { collection.registerElement(v.index, el); collection.measureElement(el); },
          unregister: (el) => collection.unregisterElement(el),
        });
        return <div ref={setRef} data-index={v.index} role="option"
                    style={{ position: "absolute", top: `${v.start}px`, height: `${v.size}px` }} />;
      }}
    </For>
  </div>
</div>
```

## Implementation notes

- The binding is `_didMount()` once, plus a split `createEffect(deps, effect)` that re-pushes
  options when `count`/`scrollElement` change and calls `_willUpdate()` (which is where the core
  attaches its scroll/resize observers the first time the scroll element exists). Both are tracked
  in the compute; the effect body is `untrack`ed because the virtualizer's own methods re-read the
  scroll element through a closure.
- The `rendered` (window) and `elements` (mounted row map) signals are created with
  `ownedWrite: true`. Both are bridges from imperative sources — the virtualizer's re-entrant
  `onChange`, and row unmount cleanups that fire during `<For>` reconciliation — which land while a
  Solid computation is on the stack; `ownedWrite` is the framework-sanctioned marker for exactly
  that.

## SSR

Client-only by nature: it measures the DOM. During SSR no effect runs and no scroll element
resolves, so `items()` reports the full count with every `element` `undefined` and nothing throws.
Hydration is not a concern for the virtualized path.

## Rejected alternatives

### A registry of mounted elements as the virtualized source
**Why not:** a windowed list renders only the visible slice, so a mounted-element registry sees a
fraction of the data — ArrowDown past the window, Home/End over all items, typeahead over offscreen
labels, and `aria-setsize`/`aria-posinset` all break. The count-in/windowed-DOM-out shape is what
reconciles the two; see *Why virtualization needs the seam* above.

### `@tanstack/solid-virtual`
**Why not:** it is compiled for Solid 1.x, so it may not clear the Solid-2.0-beta compile pipeline the
rest of this package is built with — the adopted-dependency hazard in
`__internal__/solid-primitives-eval.md`. The framework-agnostic core has no Solid version coupling at
all, which leaves only the binding to own.
**Revisit if:** a Solid-2.0 build of `@tanstack/solid-virtual` ships and clears the hydration
round-trip.

### `@solid-primitives/virtual`
**Why not:** it exposes neither `scrollToIndex(index, { align })` nor `measureElement` — the two
members this source is built on. Without the first, focus cannot reach a row outside the window at
all; without the second, every row is stuck at its `estimateSize`.

### `@tanstack/virtual-core` as a required dependency
**Why not:** every consumer of `@hope-ui/primitives` would install a virtualizer whether or not
anything they render virtualizes. As an optional peer, only a caller of `createVirtualCollection` pays
for it — the same pattern `createFloating` later took for `@floating-ui/dom`.

### A caller-supplied `VirtualItemData.id`
**Why not:** virtual rows used to carry the `itemToValue` string as their id, and application data is
not reliably legal, unique across two collections on a page, or whitespace-free — each failure breaks
`aria-activedescendant` silently, for screen-reader users only. The field was removed rather than made
optional, so a caller cannot reintroduce the hazard; ids come from
[`createItemIds`](create-collection.md) instead.
