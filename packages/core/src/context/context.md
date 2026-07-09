# `createComponentContext`

Thin wrapper around SolidJS 2.0's `createContext`/`useContext`. 2.0 already returns the
Provider component directly (`<XContext value={...}>`, no `.Provider`) and `useContext`
already throws by default when no Provider is mounted — so this helper doesn't need to
reimplement any of that (unlike a hand-rolled `XContext`/`useXContext` pair per
component family, with no shared kernel). It only adds one thing: a friendlier,
component-named error message in place of `createContext`'s generic one.

## API

```ts
function createComponentContext<T>(name: string): readonly [Context<T>, () => T];
```

- `name` — the component family name, used only to build the missing-Provider error
  message (e.g. `"Dialog"` → `"Dialog sub-components must be rendered inside a Dialog root component."`).
- Returns a tuple: the `Context<T>` itself (use directly as a JSX Provider, e.g.
  `<DialogContext value={...}>`), and a `useXContext()` hook that reads it and rethrows
  with the friendlier message if no Provider is found.

## Example

```tsx
interface DialogContextValue {
  open: () => boolean;
  setOpen: (open: boolean) => void;
}

const [DialogContext, useDialogContext] = createComponentContext<DialogContextValue>("Dialog");

function Root(props: { children: JSX.Element }) {
  const [open, setOpen] = createSignal(false);
  return <DialogContext value={{ open, setOpen }}>{props.children}</DialogContext>;
}

function Trigger() {
  const { setOpen } = useDialogContext(); // throws "Dialog sub-components must be..." if no <Root>
  return <button onClick={() => setOpen(true)}>Open</button>;
}
```
