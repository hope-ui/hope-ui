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

## Rejected alternatives

### `@solid-primitives/context`'s `createContextProvider`

**Why not:** It hands back a *factory* Provider component, which does not match how every family in
this repo consumes a context — the raw `Context` used directly as JSX, `<DialogContext value={…}>`.
Swapping to it rewrites every root part to gain nothing this helper doesn't already do (2.0 supplies
the Provider and the throwing `useContext`; the helper supplies the component-named message), so it
is a lateral refactor for a runtime dependency. Recorded in `__internal__/solid-primitives-eval.md`
§ *Tier A — evaluated, kept*.
**Revisit if:** a compound component needs `createOptionalContextProvider`, `createLayeredContext`
or `MultiProvider` — those have no in-repo equivalent and are still open candidates.

### A hand-rolled `XContext` / `useXContext` pair per component family

**Why not:** The pair is small enough to copy, and copying it is how the one thing this wrapper adds
gets dropped: a family that forgets the `try`/`catch` reports `createContext`'s generic *"Context
must either be created with a default value…"*, which names neither the part the consumer wrote nor
the root they forgot. Five families spelling their own also means five places to change when Solid's
context shape moves again.
