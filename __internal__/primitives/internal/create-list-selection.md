# `createListSelection`

Selection state layered on a [`createListFocus`](../create-list-focus/create-list-focus.md) instance: single or
multiple, explicit or follow-focus, with Shift range extension from an anchor. Modeled on Angular
Aria's `list-selection`; the behavior checklist (select-on-focus, Ctrl+A, Shift-extend from an
anchor) is cross-checked against react-aria's `useSelectableCollection`/`useSelectableItem`.

Object values are supported. By default two values are equal when both are objects sharing an `id`
(`a.id === b.id`), falling back to strict `===` for primitives or objects without an `id` — so a
consumer can pass a fresh `{ id, name }` object each render (or a controlled value straight from a
server) and it still matches the registered item. Override the rule entirely with `compareWith`, the
same escape hatch as Angular Material's `compareWith`.

## API

```ts
function createListSelection<V>(options: {
  focus: CreateListFocusReturn<V>;
  selectionMode?: Accessor<"none" | "single" | "multiple">; // default "single"
  value?: Accessor<V[] | undefined>;                          // controlled
  defaultValue?: V[];                                         // default []
  onChange?: (value: V[]) => void;
  selectionBehavior?: Accessor<"explicit" | "follow">;        // default "explicit"
  shouldFollowFocus?: Accessor<boolean>;                      // gate for follow, e.g. !isTyping()
  compareWith?: (a: V, b: V) => boolean;                      // default compareByIdOrReference
}): {
  value: Accessor<V[]>;
  isSelected(item): boolean;
  select(item): void;      // add (single replaces); sets anchor
  deselect(item): void;
  toggle(item): void;      // flip; sets anchor
  selectOne(item): void;   // selection = [item]; sets anchor
  selectRange(toIndex?): void; // multiple; anchor..toIndex (default active), replaces
  selectAll(): void;       // multiple
  deselectAll(): void;
  toggleActive(): void;    // Space
  selectActive(): void;    // Enter
  setAnchor(index): void;
};

// Also exported: pure range math, unit-tested.
function selectionRange(fromIndex: number, toIndex: number): number[];
```

The default comparator, `compareByIdOrReference`, and the `ValueComparator<V>` type live in
[`@hope-ui/primitives/utils`](../../utils/equality.md).

## Modes and behaviors

- **`selectionMode`** — `"single"` keeps at most one value (every add/toggle-on replaces);
  `"multiple"` accumulates a set; `"none"` disables all mutations.
- **`selectionBehavior`** — `"explicit"` changes selection only on an action (Space/Enter, click);
  `"follow"` makes the active item become the selection as focus moves (single-select listbox, Tabs).
  When combining follow with [typeahead](../create-list-typeahead/create-list-typeahead.md), pass
  `shouldFollowFocus: () => !typeahead.isTyping()` so browsing by type doesn't select.

## Range extension (Shift)

`selectRange(toIndex)` selects every focusable item between the **anchor** and `toIndex`
(inclusive), replacing the current selection. The anchor is set by the last `select`/`toggle`/
`selectOne` (or explicitly via `setAnchor`). A component wiring `Shift+ArrowDown` should peek the
navigation target and pass it explicitly:

```ts
.on("shift+ArrowDown", (e) => {
  e.preventDefault();
  const target = navigation.peekNext();   // NOT navigation.next() then activeIndex():
  if (target < 0) return;                 // the write isn't visible to a sync read until flush
  selection.selectRange(target);
  focus.focusIndex(target);
})
```

## Keyboard (as wired by a component)

| Key | Action |
|---|---|
| Space | `toggleActive()` |
| Enter | `selectActive()` |
| mod+A | `selectAll()` (⌘ on Apple platforms, Ctrl elsewhere — via `createKeyboardHandler`) |
| Shift+Arrow | `selectRange(peeked target)` |

## SSR

Pure reactive state; the only effect is the follow-focus one, which never runs server-side. Safe to
create during SSR — `value()` reports the default until the client takes over.
