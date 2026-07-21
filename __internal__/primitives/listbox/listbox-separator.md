# `createListboxSeparator`

The separator part of the [listbox family](./listbox-root.md): a purely visual divider between runs of
options. It takes props (not `state`) — it holds no listbox behavior.

It is **`role="presentation"` + `aria-hidden="true"`**, deliberately **not** `role="separator"`: a
`separator` is not a valid child of a `listbox`, and a real one would be announced as an item by some
assistive tech. So the separator is removed from the accessibility tree entirely and is a pure visual
affordance.

## API

```ts
function createListboxSeparator(props?: JSX.HTMLAttributes<HTMLElement>): {
  props: Omit<JSX.HTMLAttributes<HTMLElement>, "ref">; // role="presentation" + aria-hidden="true"
};
```

Consumer props (`class`, `style`, …) pass through; `role` and `aria-hidden` are owned by the hook.

## ARIA

`role="presentation"` clears the element's implicit semantics; `aria-hidden="true"` takes it out of
the accessibility tree. It contributes nothing to the listbox's option set or to arrow navigation.

## SSR

Pure attribute computation — no effects, no DOM reads — so it renders identically on the server and
hydrates without incident.
