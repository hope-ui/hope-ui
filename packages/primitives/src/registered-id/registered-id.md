# `createRegisteredId`

Publishes a descendant's `id` into an ancestor's context, so the ancestor can point an ARIA
relationship at an element it doesn't own — `Dialog.Popup`'s `aria-labelledby` naming
`Dialog.Title`'s `id`, `Dialog.Trigger`'s `aria-controls` naming `Dialog.Popup`'s.

## API

```ts
function createRegisteredId(options: {
  id: Accessor<string | false | undefined>;
  register: (id: string | undefined) => void;
}): void;
```

- `id` — the id to publish. `false` and `undefined` both register nothing. (`false` is
  dom-expressions' "omit this attribute" convention; Solid types every `id` prop as
  `string | false | undefined`.)
- `register` — receives the id once mounted, and `undefined` on cleanup.

## Why this is a primitive and not a snippet

SolidJS 2.0 throws `[REACTIVE_WRITE_IN_OWNED_SCOPE]` when a descendant writes to a signal
owned by an **ancestor's** reactive scope directly from its own synchronous render body.
"Register my id with my parent" is precisely that write. `createRegisteredId` defers it
into `onSettled`, which moves it out of the owned-scope call stack.

The naive version — `context.setTitleId(props.id)` in the component body — looks right,
passes a trivial isolated test, and throws in a real tree. Every future component with a
`Title`/`Label`/`Description` part needs this, so it lives in the kernel rather than being
copy-pasted (and subtly mis-copied) five times.

The id is read **once**, after mount. That matches how ARIA-linking ids are used: generated
by `createUniqueId`, or pinned by the consumer. Nothing animates an `id`.

## SSR

`onSettled` never runs during SSR, so nothing registers server-side.

A component whose server-rendered markup must *already* carry the linked attribute needs
its own server-visible fallback. `Dialog.Root` does this: it generates a `popupId` up front
so `Trigger`'s `aria-controls` has a value during SSR, and `Popup` only overrides it later
if the consumer pinned an explicit `id`.

Where the registering component only ever renders inside a `Portal` — which doesn't render
server-side at all — there is no server value for a later client-only write to disagree
with, and hydration is safe by construction. That's why `Dialog.Title` and
`Dialog.Description` need no fallback.

## Example

```tsx
export const Title: Component<DialogTitleProps> = (props) => {
  const context = useDialogContext();
  const merged = withDefaults(props, { id: createUniqueId() });

  createRegisteredId({ id: () => merged.id, register: context.setTitleId });

  return renderElement({ as: "h2", render: merged.render, props: omit(merged, "render") });
};
```
