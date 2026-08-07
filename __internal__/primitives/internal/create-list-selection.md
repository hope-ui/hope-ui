# `createListSelection`

Selection state layered on a [`createListFocus`](create-list-focus.md) instance: single or
multiple, explicit or follow-focus, with Shift range extension from an anchor. Modeled on Angular
Aria's `list-selection`; the behavior checklist (select-on-focus, Ctrl+A, Shift-extend from an
anchor) is cross-checked against react-aria's `useSelectableCollection`/`useSelectableItem`.

Object values are supported through the Base UI **`itemToValue`** model: each value maps to an
identity key, and two values are equal when their keys are `===`. Pass `itemToValue: (v) => v.id` and
a fresh `{ id, name }` object each render (or a controlled value straight from a server) still matches
the registered item. Override the rule entirely with `isItemEqualToValue`. This primitive is where
that model replaced the retired Angular-idiom `compareWith` comparator, and the rest of the kernel
followed: [`createListFocus`](create-list-focus.md) takes the same `itemToValue`,
[`createListExpansion`](create-list-expansion.md) takes both. `createListbox` threads its own
`itemToValue` (default `String(item)`) through here.

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
  itemToValue?: (value: V) => unknown;                        // identity key, default (v) => v
  isItemEqualToValue?: (a: V, b: V) => boolean;               // default key(a) === key(b)
}): {
  value: Accessor<V[]>;
  setValue(value: V[]): void; // replace the whole selection in ONE write — see below
  isSelected(item): boolean;
  firstSelectedIndex(): number; // lowest selected index in focus.items(), else -1; the entry row
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

Equality precedence: an explicit `isItemEqualToValue` wins outright; otherwise the default compares
`itemToValue(a) === itemToValue(b)`; with neither, `itemToValue` is identity so it collapses to plain
`===`. `createListExpansion` resolves the pair identically, so one mapper covers both.

## `setValue` — the one mutation that isn't item-wise

Every other mutator takes a `CollectionItem`, and should stay that way: it is what keeps selection
and focus talking about the same rows. `setValue` exists for the one shape they cannot express — a
**native** control handing back an arbitrary set in a single gesture. `HiddenSelect` needs it twice:
when browser autofill (or a mobile picker) changes the hidden `<select>`, and when the owning form
is reset and the widget has to revert to its default selection.

It has to be **one** write. A SolidJS 2.0 signal write is not visible to a plain read until the next
flush, so `deselectAll()` followed by N × `select(item)` would have every `select` read the
pre-write value and keep only the last one.

## Modes and behaviors

- **`selectionMode`** — `"single"` keeps at most one value (every add/toggle-on replaces);
  `"multiple"` accumulates a set; `"none"` disables all mutations.
- **`selectionBehavior`** — `"explicit"` changes selection only on an action (Space/Enter, click);
  `"follow"` makes the active item become the selection as focus moves (single-select listbox, Tabs).
  When combining follow with [typeahead](create-list-typeahead.md), pass
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

## Rejected alternatives

### `compareWith` / `compareByIdOrReference` (the Angular-idiom equality default)
**Why not:** it compares two values directly, so it cannot be fed by the `itemToValue` a consumer has
*already* declared for the selection identity and for the string a form submits — `createListbox` would
carry one rule for equality and a second for its value model, free to disagree. Base UI's
`itemToValue` + `isItemEqualToValue` express both from one mapping, and the swap landed while this
primitive still had no consumer, so it cost no migration. It ended up settling the kernel's whole
vocabulary: [`createListFocus`](create-list-focus.md) adopted `itemToValue` for re-homing, then
[`createListExpansion`](create-list-expansion.md) — the last holdout — took both, and the
`compareByIdOrReference` helper was deleted with it.

### Expressing `setValue` item-wise (`deselectAll()`, then N × `select(item)`)
**Why not:** a SolidJS 2.0 signal write is not visible to a plain read until the next flush, so every
`select()` in the sequence reads the pre-write value and only the last one survives. A native control
hands back an arbitrary set in a single gesture — `HiddenSelect`'s `<select>` changing under autofill,
and its form-reset restore — so that set has to land in **one** write. Every other mutator stays
item-wise, which is what keeps selection and focus talking about the same rows; see *`setValue` — the
one mutation that isn't item-wise* above.
