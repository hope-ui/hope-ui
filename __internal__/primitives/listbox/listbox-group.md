# `createListboxGroup`

The group part of the [listbox family](./listbox-root.md): a `role="group"` wrapper that visually and
semantically groups a run of options and names itself from its
[`GroupLabel`](./listbox-group-label.md). Collection mode only — virtual mode is flat (grouped
virtualization is deferred).

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
