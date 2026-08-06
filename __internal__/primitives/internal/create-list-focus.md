# `createListFocus`

The **foundation** of the list-navigation kernel. It owns two things and nothing else: the **active
item**, and the **`roving | activedescendant` switch**. `createListNavigation`, `createListTypeahead`
and `createListSelection` each take one `createListFocus` instance and layer their concern on top —
mirroring Angular Aria's `ListNavigation`/`ListSelection`/`ListTypeahead`, which each inject one
`ListFocus`. Modeled on Angular's `list-focus` (its reasoning and public surface, adapted, not its
code).

## The two focus modes

| | `roving` (default) | `activedescendant` |
|---|---|---|
| Container `tabindex` | `-1` | `0` |
| Item `tabindex` | `0` for the active item, `-1` for the rest | always `-1` |
| `aria-activedescendant` | — | active item's id |
| Real DOM focus | on the active item | stays on the container |

Roving is the default and matches most APG composite-widget examples. Activedescendant is for
widgets that must keep DOM focus on a single element (a combobox input driving a listbox, a grid
where focus must not leave the textbox).

## The item-source seam and deferred focus

`createListFocus` reads an abstract [`ItemSource`](create-collection.md) — it never depends
on `createCollection` directly, so it works identically over a fully-mounted `createCollection` and
a windowed `createVirtualCollection`.

The load-bearing detail: **real `.focus()` is deferred until the item's element exists.** A roving
list usually focuses a mounted element synchronously, but a virtualized list navigates to rows that
are not in the DOM yet. `focusIndex` therefore:

1. sets the active index (updating tab stops / `aria-activedescendant` reactively);
2. calls `source.scrollIndexIntoView(index)` to bring the row into view;
3. in roving mode, records the index and lets an effect call `.focus()` once the element mounts.

Activedescendant mode never moves DOM focus, so it uses the same "the element may be absent"
plumbing for free — which is why focus lives here, in one primitive, rather than in each component.

## Scrolling the active row into view

Which rows get step 2 is exactly the difference between the two modes:

| Mode | `source.scrollIndexIntoView(index)` runs for |
|---|---|
| `activedescendant` | **every** active row |
| `roving` | only a row whose `element()` has not resolved (virtualized, outside the window) |

In **activedescendant** mode nothing moves DOM focus, so a *mounted but clipped* option would sit
offscreen while `aria-activedescendant` names it — with every test green. That is precisely the
failure a Select would ship, and roving mode has been hiding it all along.

In **roving** mode the deferred `.focus()` is itself the scroll: the browser computes the offset from
the real scrollport, which is strictly better than a source can. Asking the source *as well* lands a
second, coarser scroll on top of the browser's exact one and clips the active row — measured at 6px
in the virtualized listbox, where `scrollToIndex` aligns against the border box while the port
excludes the border and the padding. So roving asks the source only for the one thing `.focus()`
cannot do: make an unmounted row exist.

Sources align `"nearest"` ([`scroll-into-view.md`](scroll-into-view.md)), so even the
activedescendant path is a no-op whenever the row is already fully visible — no visibility test is
needed here.

`focusIndex(index, { scroll: false })` and `focus(item, { scroll: false })` opt out. The one caller
that does is the **pointer** path (`createListboxItem`'s `onPointerMove`): the row is already under
the cursor, so scrolling to it would slide the list and hand the highlight to whatever ends up
beneath the pointer. Click and focus keep the default.

A source with no `scrollIndexIntoView` — `createCollection` — simply ignores all of this.

## Roving + virtualization: focus recovery

Deferred focus handles *navigating to* an unmounted row. The reverse also happens: in roving mode the
active option holds real DOM focus, and a virtualized source can **unmount that option when it scrolls
out of the window** — by PageDown, the mouse wheel, or dragging the scrollbar, none of which change
the active index. The browser then drops focus to `<body>`, and since the container's key handler only
sees events that *bubble up from a focused descendant*, keyboard navigation would silently die.

An effect guards this: when the element roving last focused disappears **and** focus fell back to
`<body>` as a direct result, it pulls focus to the container (`options.element`) so keydowns keep
arriving; the next arrow/typeahead then re-homes onto a mounted option. It is gated tightly so it never
*steals* focus — only the element we focused, only when no navigation is mid-flight (that path
re-focuses the target itself), and only when focus actually landed on `<body>` (not when the user moved
it elsewhere). It is a no-op over a fully-mounted source (nothing unmounts) and in activedescendant mode (focus
already lives on the container). Note that page navigation `preventDefault`s the native scroll, so the
common trigger is the wheel/scrollbar; Page keys move the active index and thus focus normally.

## API

```ts
function createListFocus<V = unknown>(options: {
  source: ItemSource<V>;
  focusMode?: Accessor<"roving" | "activedescendant">; // default "roving"
  disabled?: Accessor<boolean>;                         // default false
  skipDisabled?: Accessor<boolean>;                     // default true
  element?: Accessor<HTMLElement | null | undefined>;   // container, for AD focus restore
  entryIndex?: Accessor<number>;                        // the row focus enters on; default -1
  activeIndex?: Accessor<number | undefined>;           // controlled; -1 = none
  defaultActiveIndex?: number;                          // default -1
  onActiveChange?: (index: number) => void;
  itemToValue?: (value: V) => unknown;                  // identity key; default identity
}): CreateListFocusReturn<V>;
```

Returned surface: `items`, `activeIndex`, `activeItem`, `disabled`, `skipDisabled`, `focusMode`,
`isFocused`; `setFocused(value)`, `focusIndex(index, options?)`, `focus(item, options?)`,
`focusActive()`, `focusEntry()`; `isActive(item)`, `isFocusable(item)`; `getListTabIndex()`,
`getItemTabIndex(item)`, `activeDescendant()`.

`options` is `{ scroll?: boolean }` (default `true`) — see "Scrolling the active row into view".

- **Roving tab stop before navigation.** APG requires exactly one tabbable element. Before any
  arrow press (`activeIndex === -1`), the *entry item* gets `tabindex=0`, so Tab reaches the widget.
  After navigation the active item is the tab stop.
- **The entry item.** When focus arrives with nothing active, `focusEntry()` activates the entry item;
  the tab stop resolves to the same index, so Tab lands directly on it with no post-focus jump. The
  entry item is `entryIndex` (the first selected row, per APG's "focus is set on the selected option")
  when it is focusable, else the first focusable item. `createListbox` feeds `entryIndex` from its
  selection.
- **`isFocused` is a paint gate, not a focus mover.** It records whether the widget holds focus so the
  highlight can be shown only while it does — react-aria's `manager.isFocused`, zag's `focused`. It
  never moves DOM focus. The *consumer* owns focus tracking and calls `setFocused(true/false)`
  (`createListbox` does this from the container's focus-in/out; a Select drives it from its trigger
  `<button>`, a Combobox from its input).
  The highlight itself (`data-active`) is `isActive(item) && isFocused()`, computed one layer up — this
  primitive keeps `isActive` meaning "is the active item", so nothing that layers on focus is disturbed.
- **`isFocusable`** is `!item.disabled() || !skipDisabled()` — with `skipDisabled` off (menus),
  disabled items stay focusable but selection/activation should still refuse them.
- **`disabled` list** forces every `tabindex` to `-1` and suppresses `aria-activedescendant`.
- **`itemToValue`** maps a value to the identity key used to find the active row again after the item
  array changes — see the next section. Default identity; pass `(fruit) => fruit.id` for object values
  rebuilt per render. It is `createListSelection`'s option, unchanged, so a widget passes one mapper to
  both (`createListbox` does).

## The active item is re-homed when the collection changes

`activeIndex` is a **slot number**, and any insert or remove renumbers every slot after it. Left
alone that fails two ways, both silent:

- Remove a row *before* the active one and the highlight slides onto whatever moved into that slot.
  The index is still valid, `activeItem()` still returns something, and every test stays green — it
  is simply a different option than the user was on.
- Remove the *last* row while it is active and the index falls out of range: `activeItem()` is
  `undefined`, `aria-activedescendant` names nothing, and Enter commits nothing.

Neither is hypothetical: any `Listbox` whose `items` come from a signal — an async load, a
consumer-side filter — hits both.

`Combobox` is the instructive exception. Its `items()` is the **filtered** set, so it narrows on
every keystroke, and it had already met this the hard way: `combobox-root.tsx` carries an effect that
re-anchors the highlight with `navigation.first()` whenever the filter changes. That stays, and it
still wins — it is created after this one, and sibling effects run in creation order — because
"highlight the top match" is a deliberate *search* policy, not a workaround for this bug. The
difference is that a Combobox chose that policy, while every other consumer was silently getting a
stale slot number.

So an effect on `items()` reconciles the active row: if its key is still present the index is
rewritten **quietly** (`setActiveIndexState`, not `setActive` — the element never moved, so scrolling
it into view or re-arming the deferred `.focus()` would be a spurious focus move), and if the row is
gone, focus really has to move, so the replacement goes through the full `setActive`.

The replacement is the nearest surviving **focusable** row, searched forward from the old position
and then backward. Two details carry the weight:

- **The walk searches the *previous* ordering.** The removed row is gone from the new array, so only
  the old one still knows who its neighbours were.
- **Keys are cached from the previous run**, never re-read from the previous items. By the time this
  effect runs those rows have unmounted, and their `value()` accessors close over props that no
  longer have an owner.

Adapted from react-aria's `useFocusedKeyReset` (in react-stately's `useListState`) — its reasoning,
not its code. Base UI's chips reach the same landing spot with index arithmetic alone
(`getIndexAfterChipRemoval`), which is worth knowing as independent agreement on the *policy* even
though it cannot fix the first failure above.

**Virtualization is untouched.** `createVirtualCollection`'s `items()` is the full logical set:
scrolling changes which rows have a resolved `element()`, never the array's length or order. The
separate focus-recovery effect above owns that case.

## SSR

Focus effects never run server-side, and DOM focus is a client concern. The `tabindex` and
`aria-activedescendant` getters are pure reads of reactive state, safe to call during SSR; they
simply reflect the initial active index (`-1` → no active descendant, first-focusable tab stop
resolved once the collection registers on the client).

## Example

```tsx
const collection = createCollection<string>();
const focus = createListFocus({ source: collection, element: containerRef });

<ul role="listbox" tabindex={focus.getListTabIndex()} aria-activedescendant={focus.activeDescendant()}>
  {/* each option: tabindex={focus.getItemTabIndex(item)} id={item.id} */}
</ul>
```

## Rejected alternatives

The `roving` / `activedescendant` split is **not** one of these — both modes ship, and picking between
them is the consumer's call. See *The two focus modes* above.

### react-aria's `selection`, Astryx, floating-ui-react, Angular CDK's `key-manager`
**Why not:** all four were evaluated as the navigation architecture and Angular Aria's signal-based
`private/behaviors/` won, because Angular signals ≈ Solid signals: its decomposition — one `list-focus`
owning the active item and the roving/activedescendant switch, with navigation, selection and typeahead
each *injecting* that one instance — ports almost 1:1 into `createX` + split-`createEffect`, which none
of the others do. They are still used for what they are good at: react-aria's `selection` is the
edge-case checklist, and Astryx's `useGridFocus` supplied the calendar month-flip. Full writeup:
`__internal__/reference-implementations.md` § *Why Angular Aria won the architecture bake-off*.

### Deriving the active highlight from the active index alone
**Why not:** the active index is written only by arrows, pointer and click — never by focus entering or
leaving — so the highlight lingered after focus left the list, and nothing painted when focus entered on
the roving tab stop. Hence `isFocused`: a paint gate that records focus without ever moving it
(react-aria's `manager.isFocused`, zag's `focused`), with the highlight computed one layer up as
`isActive(item) && isFocused()` so `isActive` keeps meaning "is the active item".

### Scrolling only rows whose `element()` has not resolved, in both modes
**Why not:** that guard is right for roving and wrong for activedescendant, which moves no DOM focus at
all — a *mounted but clipped* option then sits offscreen while `aria-activedescendant` names it to a
screen reader, with every test green. It is precisely the failure a Select would have shipped. The
scroll is scoped by focus mode instead; see *Scrolling the active row into view* above.

### One unconditional `scrollIndexIntoView` on every focus move
**Why not:** the opposite over-correction. In roving mode the deferred native `.focus()` *is* the
scroll, computed from the real scrollport; asking the source as well lands a second, coarser scroll on
top of it one frame later — measured at 6px of the active row clipped in the 10k-row story, the
virtualizer aligning against the border box (288px) while the port excludes the 1px borders and the 4px
padding (286px). Both automated gates stayed green through that regression; the Storybook pass is what
caught it.

### Clamping the active index on removal instead of re-homing by identity, as Base UI's chips do
**Why not:** clamping only rescues an index that fell out of range. It cannot see that a row was
removed *before* the active one, so the highlight slides onto whatever slid into that slot — a valid
index naming a different option, with `activeItem()` still returning something and every assertion
still passing. Base UI ships that limitation because its chip row is index-addressed end to end; this
primitive already has a value per item, so the identity comparison is nearly free.

### Reading the previous items back to find the active row's neighbours
**Why not:** by the time the effect runs those rows have unmounted, and a `CollectionItem`'s `value()`
closes over the row's props — reading a disposed one is undefined behavior at best. Keys are captured
at the end of each run instead, while the rows are still alive, which also makes the comparison a
plain array scan rather than N reactive reads.

### Taking `isItemEqualToValue` too, mirroring `createListSelection` in full
**Why not:** selection needs the full override because a consumer's equality can be arbitrary and it
runs on user-visible state. Re-homing only needs to answer "is this the same row" across one array
swap, which `itemToValue` settles; a second overlapping seam would be one more thing to keep in step
between two primitives for no behavior neither already covers.
**Revisit if:** a consumer turns up whose identity genuinely cannot be expressed as a key — the option
is additive, and `createListbox` already holds an `isItemEqualToValue` to forward.
