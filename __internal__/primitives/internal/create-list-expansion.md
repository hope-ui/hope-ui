# `createListExpansion`

Expand/collapse state for disclosure widgets — **Accordion, Tree, Disclosure**. It layers on the
collection's items, **not** on `createListFocus`, because expansion is orthogonal to focus: a Tree
node moves focus with the arrow keys (navigation) and opens/closes with Right/Left or Enter
(expansion), independently. Modeled on Angular Aria's `expansion`.

Object values are supported: by default two values are equal when both are objects sharing an `id`,
falling back to `===` — override with `compareWith` (a `ValueComparator<V>` from
[`utils/equality`](../../utils/equality.md)), the same escape hatch as Angular Material's
`compareWith`.

## API

```ts
function createListExpansion<V>(options: {
  items: Accessor<ReadonlyArray<CollectionItem<V>>>; // usually collection.items
  expansionMode?: Accessor<"single" | "multiple">;    // default "multiple"
  value?: Accessor<V[] | undefined>;                   // controlled
  defaultValue?: V[];                                  // default []
  onChange?: (value: V[]) => void;
  collapsible?: Accessor<boolean>;                     // default true (single mode only)
  compareWith?: ValueComparator<V>;                    // default compareByIdOrReference
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
