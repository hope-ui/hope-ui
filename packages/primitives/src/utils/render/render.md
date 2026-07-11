# `renderElement`

Shared render-prop / `as`-polymorphism primitive used by every public component in
hope-ui, so no component hand-rolls its own polymorphic-`as` type system — or its own
ref merging.

## API

```ts
type RenderProp<Props> = (props: Props) => JSX.Element;

function renderElement<Props extends object, El extends Element = Element>(options: {
  as: ValidComponent;
  props: Props;
  render?: RenderProp<Props>;
  ref?: JSX.RefCallback<El>;
}): JSX.Element;
```

- `as` — the default tag/component rendered when no `render` prop is given.
- `props` — the fully computed DOM props/state for the element (already merged via
  `withDefaults`/`merge`/`omit` by the caller).
- `render` — optional consumer override: a **function** receiving `props`, which it spreads
  onto its own element.
- `ref` — an optional component-internal ref setter, merged with any `ref` the consumer put
  on `props`.

## `render` is a function, never an element

An earlier version accepted `JSX.Element | ((props) => JSX.Element)`. The element form was
a trap: by the time a Solid JSX element reaches `renderElement` it is an already-constructed
DOM node. There is no `cloneElement`, and no way to inject props into it after the fact — so
the element branch could only *discard* every computed prop.

```tsx
// Used to type-check, render, and produce a button with no onClick, no aria-expanded,
// and no aria-controls. The dialog never opened. No error anywhere.
<Dialog.Trigger render={<MyButton />} />
```

Requiring a function makes the prop flow visible at the call site, and makes the broken
version unrepresentable:

```tsx
<Dialog.Trigger render={(props) => <MyButton {...props} />} />
```

## Ref merging

`renderElement` owns it. Pass the component's internal ref setter as `ref`; any consumer
`ref` already present on `props` is merged with it:

```tsx
const [ref, setRef] = createSignal<HTMLDivElement>();

renderElement<JSX.HTMLAttributes<HTMLDivElement>, HTMLDivElement>({
  as: "div",
  props: rest, // may or may not carry a consumer `ref`
  ref: setRef,
});
```

No `mergeRefs` utility exists or is needed. SolidJS 2.0's `ref` attribute natively accepts
an array of ref-setter functions, and `@solidjs/web`'s `applyRef` flattens the array and
skips falsy entries — so an absent consumer ref costs nothing. The consumer's ref is read
inside a getter, not eagerly in the component body, so `spread`'s own ref-handling effect
is what triggers the read (an eager read would be an untracked prop read, which Solid's
dev build warns about).

## Known limitation: cross-element `render` typing

Each component types its own `render` prop against its *own* element's attributes (e.g.
`Button`'s `render` receives `JSX.ButtonHTMLAttributes<HTMLButtonElement>`-shaped props).
This is intentionally strict for the common case (restyling/wrapping the same kind of
element), but TypeScript's event-handler and `ref` contravariance means a `render` function
that switches to a genuinely different element (button → anchor) will not type-check
without an explicit assertion at the call site — there is no sound way to type one concrete
props interface as simultaneously correct for arbitrary target elements without threading a
generic type parameter through every component (a `Polymorphic<T>`-style approach, and the
exact type-DX cost hope-ui is trying to avoid — see the architecture plan's pitfall
notes). This is a known, accepted trade-off, not a bug: cross-element renders are real but
rarer than same-element restyling, and an explicit assertion at that boundary is honest
about the type system's actual guarantee.

## Example

```tsx
renderElement({
  as: "button",
  props: { type: "button", disabled: true },
  render: (p) => <a href="#" {...(p as unknown as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)} />,
});
```
