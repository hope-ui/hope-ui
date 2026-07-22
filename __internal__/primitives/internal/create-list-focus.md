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

`createListFocus` reads an abstract [`ItemSource`](../create-collection/create-collection.md) — it never depends
on `createCollection` directly, so it works identically over a fully-mounted `createCollection` and
a windowed `createVirtualCollection`.

The load-bearing detail: **real `.focus()` is deferred until the item's element exists.** A roving
list usually focuses a mounted element synchronously, but a virtualized list navigates to rows that
are not in the DOM yet. `focusIndex` therefore:

1. sets the active index (updating tab stops / `aria-activedescendant` reactively);
2. if the target row is unmounted, calls `source.scrollIndexIntoView(index)` to bring it in;
3. in roving mode, records the index and lets an effect call `.focus()` once the element mounts.

Activedescendant mode never moves DOM focus, so it uses the same "the element may be absent"
plumbing for free — which is why focus lives here, in one primitive, rather than in each component.

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
it elsewhere). It is a no-op in collection mode (nothing unmounts) and in activedescendant mode (focus
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
  activeIndex?: Accessor<number | undefined>;           // controlled; -1 = none
  defaultActiveIndex?: number;                          // default -1
  onActiveChange?: (index: number) => void;
}): CreateListFocusReturn<V>;
```

Returned surface: `items`, `activeIndex`, `activeItem`, `disabled`, `skipDisabled`, `focusMode`;
`focusIndex(index)`, `focus(item)`, `focusActive()`; `isActive(item)`, `isFocusable(item)`;
`getListTabIndex()`, `getItemTabIndex(item)`, `activeDescendant()`.

- **Roving tab stop before navigation.** APG requires exactly one tabbable element. Before any
  arrow press (`activeIndex === -1`), the *first focusable* item gets `tabindex=0`, so Tab reaches
  the widget. After navigation the active item is the tab stop.
- **`isFocusable`** is `!item.disabled() || !skipDisabled()` — with `skipDisabled` off (menus),
  disabled items stay focusable but selection/activation should still refuse them.
- **`disabled` list** forces every `tabindex` to `-1` and suppresses `aria-activedescendant`.

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
