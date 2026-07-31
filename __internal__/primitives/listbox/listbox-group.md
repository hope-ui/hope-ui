# `createListboxGroup`

The group part of the [listbox family](./listbox-root.md): a `role="group"` wrapper that visually and
semantically groups a run of options and names itself from its
[`GroupLabel`](./listbox-group-label.md). Data mode only — virtual mode is flat (grouped
virtualization is deferred).

**The kernel never sees a group.** `createListbox`'s `groupToItems` flattens `items` into navigation
order and stops there; this part is what the consumer renders around the resulting run of options,
and the group's *name* comes from the consumer's own data, not from anything the kernel holds. That
is why there is no `groupToLabel`, why the inner iteration is a plain `<For>`, and why this hook takes
no `state`. See [`createListbox` § Grouping](./listbox-root.md).

It takes props (not `state`) — a group holds no listbox behavior, only the label-id linkage. It owns a
`labelId` signal that `createListboxGroupLabel` registers into (mirroring the `createDialog` →
`createDialogTitle` split), and its `aria-labelledby` falls back to the consumer's own value rather
than overwriting it, so a consumer may label the group directly instead of with a `GroupLabel`.

## API

```ts
function createListboxGroup(props?: JSX.HTMLAttributes<HTMLElement>): {
  props: Omit<JSX.HTMLAttributes<HTMLElement>, "ref">; // role="group" + aria-labelledby
  labelId: Accessor<string | undefined>;
  setLabelId: (id: string | undefined) => void;        // called by createListboxGroupLabel
};
```

## ARIA

`role="group"` is an allowed owned child of `role="listbox"`; the options inside it remain owned by the
listbox (they are DOM descendants). `aria-labelledby` points at the group's label element so assistive
tech announces the group name when entering it. There is **no** required keyboard behavior — arrow
navigation still flows across the whole listbox, ignoring group boundaries.

## SSR

Pure reactive state; `aria-labelledby` resolves from the label id, which `createListboxGroupLabel`
publishes via `createRegisteredId` (an `onSettled` write that never runs server-side). The
server-rendered group therefore carries `aria-labelledby` only if the consumer set one directly;
otherwise the linkage lands on the client after mount.

## Rejected alternatives

### `Listbox.Root` emitting the group wrapper itself

**Why not:** the wrapper would stop being a consumer-written part, and `Group` / `GroupLabel` /
`Separator` would lose the `render` prop and the `class` seam every other part has — a consumer
could neither re-target the element nor style it through the recipe. Rendering the group from the
per-entry callback costs nothing, because a row resolves its index through `indexOfValue` rather
than from its place in the tree.

### Grouping in virtual mode

**Why not:** windowing measures a flat run of rows, so a group wrapper has no position in the
window and `groupToItems` has nothing to flatten into one. Declaring `groupToItems` and
`estimateSize` together is a dev warning, and `estimateSize` wins.

**Revisit if:** a consumer needs a grouped list long enough to virtualize — grouped virtualization
is deferred, not ruled out.
