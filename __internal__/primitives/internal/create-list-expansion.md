# `createListExpansion`

Expand/collapse state for disclosure widgets — **Accordion, Tree, Disclosure**. It layers on the
collection's items, **not** on `createListFocus`, because expansion is orthogonal to focus: a Tree
node moves focus with the arrow keys (navigation) and opens/closes with Right/Left or Enter
(expansion), independently. Modeled on Angular Aria's `expansion`.

Object values are supported through the Base UI **`itemToValue`** model: each value maps to an
identity key, and two values are equal when their keys are `===`. Pass `itemToValue: (v) => v.id` and
a fresh `{ id, name }` object each render (or a controlled value straight from a server) still matches
the registered item. Override the rule entirely with `isItemEqualToValue`. These are the same two
options [`createListSelection`](create-list-selection.md) takes — and `itemToValue` is the one
[`createListFocus`](create-list-focus.md) takes — so a widget passes one mapper to the whole kernel.

## API

```ts
function createListExpansion<V>(options: {
  items: Accessor<ReadonlyArray<CollectionItem<V>>>; // usually collection.items
  expansionMode?: Accessor<"single" | "multiple">;    // default "multiple"
  value?: Accessor<V[] | undefined>;                   // controlled
  defaultValue?: V[];                                  // default []
  onChange?: (value: V[]) => void;
  collapsible?: Accessor<boolean>;                     // default true (single mode only)
  itemToValue?: (value: V) => unknown;                 // identity key, default (v) => v
  isItemEqualToValue?: (a: V, b: V) => boolean;        // default key(a) === key(b)
}): {
  expandedValues: Accessor<V[]>;
  isExpanded(item): boolean;
  isExpandable(item): boolean; // = !item.disabled()
  expand(item): void;
  collapse(item): void;
  toggle(item): void;
  expandAll(): void;   // multiple only
  collapseAll(): void;
};
```

Equality precedence: an explicit `isItemEqualToValue` wins outright; otherwise the default compares
`itemToValue(a) === itemToValue(b)`; with neither, `itemToValue` is identity so it collapses to plain
`===`.

## Modes

- **`"multiple"`** (default) — any number of items open at once. `expandAll`/`collapseAll` apply.
- **`"single"`** — an accordion: expanding one item collapses the others.
  - **`collapsible: true`** (default) — the open item can be closed, leaving nothing open.
  - **`collapsible: false`** — re-clicking the open item keeps it open; one panel is always open.
    `collapseAll` is a no-op.

Disabled items (`isExpandable` false) refuse `expand`, and `expandAll` skips them.

## Wiring (component's job)

- **Trigger**: `aria-expanded` (as the string `"true"`/`"false"`), `aria-controls` pointing at the
  panel id, `onClick={() => expansion.toggle(item)}`.
- **Panel**: `role="region"` + `aria-labelledby` the trigger, `hidden` when not expanded. Keeping
  the panel in the DOM (just `hidden`) keeps the trigger's `aria-controls` IDREF valid; removing it
  entirely would require dropping `aria-controls` while collapsed (the Dialog trigger pattern).
- **Tree**: use `aria-expanded` on the `treeitem`, and expand/collapse on ArrowRight/ArrowLeft.

## SSR

Pure reactive state, no effects and no DOM access. `expandedValues()` reflects `defaultValue`
during SSR, so server markup can render the initially-open panels and hydrate cleanly.

## Rejected alternatives

### Injecting one `createListFocus`, the shape every sibling behavior takes
**Why not:** expansion is orthogonal to focus — a Tree node moves focus with the arrow keys
(navigation) and opens or closes with Right/Left or Enter (expansion), independently — so routing
expansion through the focus instance would tie an item's open state to whether it is the active one.
It reads only `value` and `disabled` off the items it is given, so any `ItemSource`'s items work and a
widget with no active item at all (a Disclosure) needs no focus manager to hold expansion state.
`plan.md` still describes this primitive as injecting one; the implementation is the record.

### `compareWith` / `compareByIdOrReference` (the Angular-idiom equality default)
**Why not:** it was a second equality vocabulary for one idea. A consumer's expansion keys are the
same values as their selection keys, so a Tree wiring both primitives would declare an `itemToValue`
for one and a comparator for the other, free to disagree with no error anywhere. The comparator also
cannot be *fed* by the `itemToValue` already declared for the value model, because it answers only
"are these equal" and never produces the key. This primitive was the last holdout — `createListSelection`
moved first, `createListFocus` followed in roadmap #22 — and it migrated (#23) before Accordion, its
only future consumer, could freeze the old spelling into a public component's API. The helper is
deleted, not deprecated: at `v0.0.0` a stranded util is what gets picked back up by someone who does
not know it was retired. **Consequence:** the default equality is now plain `===` rather than
id-matching, so object values that are rebuilt per render need an explicit `itemToValue` — the same
trade the other two primitives already make.

### Taking only `itemToValue`, as `createListFocus` does
**Why not:** focus's re-homing only has to recognize one row across an array swap, which a key
settles; expansion holds **user-visible, consumer-supplied state** — a controlled `value` array
arriving from a server — exactly like selection, where an equality rule that no key can express is a
legitimate shape. Matching selection option-for-option is also what keeps a widget that both expands
and selects from having one rule available on one primitive and not the other.
