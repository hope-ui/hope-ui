# `renderElement`

Shared render-prop / `as`-polymorphism primitive used by every public component in
solid-zero, so no component hand-rolls its own polymorphic-`as` type system.

## API

```ts
function renderElement<Props extends object>(options: {
  as: ValidComponent;
  props: Props;
  render?: JSX.Element | ((props: Props) => JSX.Element);
}): JSX.Element;
```

- `as` — the default tag/component rendered when no `render` prop is given.
- `props` — the fully computed DOM props/state for the element (already merged via
  `merge`/`omit`, SolidJS 2.0's replacements for 1.x's `mergeProps`/`splitProps`, by
  the caller).
- `render` — optional consumer override. Either a JSX element, or a function receiving
  `props` so the consumer can spread them onto their own element (e.g. render a Button
  as an anchor tag).

## Known limitation: cross-element `render` typing

Each component types its own `render` prop against its *own* element's attributes (e.g.
`Button`'s `render` receives `JSX.ButtonHTMLAttributes<HTMLButtonElement>`-shaped props).
This is intentionally strict for the common case (restyling/wrapping the same kind of
element), but TypeScript's event-handler and `ref` contravariance means a `render`
function that switches to a genuinely different element (button → anchor) will not
type-check without an explicit assertion at the call site — there is no sound way to
type one concrete props interface as simultaneously correct for arbitrary target
elements without threading a generic type parameter through every component (the
`Polymorphic<T>` approach Kobalte and other React libraries use, and the exact type-DX
cost solid-zero is trying to avoid — see the architecture plan's pitfall notes). This is
a known, accepted trade-off, not a bug: cross-element renders are real but rarer than
same-element restyling, and an explicit assertion at that boundary is honest about the
type system's actual guarantee.

## Why no `mergeRefs` helper

SolidJS 2.0's `ref` attribute natively accepts an array of ref-setter functions, so
merging an internal ref with a consumer-supplied one is just:

```tsx
ref={[internalRefSetter, props.ref]}
```

No custom ref-merging utility is needed, unlike in React-based headless libraries.

## Example

```tsx
renderElement({
  as: "button",
  props: { type: "button", disabled: true },
  render: (p) => <a href="#" {...(p as unknown as JSX.AnchorHTMLAttributes<HTMLAnchorElement>)} />,
});
```
