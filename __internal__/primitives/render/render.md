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

No `mergeRefs` utility exists or is needed. `renderElement` merges the internal setter and any
consumer `ref` into a **single function ref**, and inside that callback delegates the flatten +
falsy-skip to `@solidjs/web`'s `applyRef` (`applyRef([internalRef, consumerRef], element)`) — so
an absent consumer ref, or a consumer ref that is itself an array, costs nothing.

Exposing the merge as **one function** is what makes it work with any render target — a host
element, a component honouring a plain function ref, and a component that composes refs itself.
See *Handing the render target the raw ref array* below for the shape this replaced.

The consumer's `ref` is read *inside* the merged callback, not eagerly in the component body, so
the read lands in the render target's ref-handling effect (an eager read would be an untracked prop
read, which Solid's dev build warns about).

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

## Rejected alternatives

### `RenderProp` accepting an already-built `JSX.Element`
**Why not:** the first version typed it `JSX.Element | ((props) => JSX.Element)`, and the element
branch could only ever *discard* every computed prop — by the time a Solid JSX element reaches
`renderElement` it is an already-constructed DOM node, and there is no `cloneElement` to inject
props into it after the fact.

```tsx
// Used to type-check, render, and produce a button with no onClick, no aria-expanded,
// and no aria-controls. The dialog never opened. No error anywhere.
<Dialog.Trigger render={<MyButton />} />
```

Requiring a function makes the prop flow visible at the call site, and the broken version
unrepresentable:

```tsx
<Dialog.Trigger render={(props) => <MyButton {...props} />} />
```

### Handing the render target the raw ref array `[internalRef, consumerRef]`
**Why not:** only host elements honour it, because their compiler flattens an array ref through
`applyRef`. A consumer *component* that reads `props.ref` itself and guards
`if (typeof r === "function") r(el)` — TanStack Router's `Link`, and most libraries — drops a
non-function ref silently, so both refs die and `render` cannot wrap arbitrary components. Pinned by
*"merges refs onto a component that only honours function refs (TanStack `Link` shape)"*.

### A `mergeRefs` utility (hand-rolled, or `@solid-primitives/refs`)
**Why not:** `@solidjs/web`'s `applyRef` already flattens ref arrays and skips falsy entries (pinned
in `solid-contract.browser.test.tsx`, whose header names this as the reason no `mergeRefs` helper
is needed), so the whole merge is one callback inside `renderElement` — and a per-component copy
(Dialog carried one until `renderElement` took ownership) puts the single-function-ref rule above
in as many places as there are parts.
**Revisit if:** `renderElement`'s prop merge grows enough to adopt `@solid-primitives/props`'
`combineProps` — `mergeRefs` is recorded as a future consideration alongside it in
`__internal__/solid-primitives-eval.md`.

### `Polymorphic<T>` / `PolymorphicProps<T>` generic `as`-prop machinery
**Why not:** typing one props interface as simultaneously correct for arbitrary target elements
means threading a generic type parameter through every component, which is a known type-DX pain
point the moment a consumer wraps those components in their own polymorphic layer —
`__internal__/plan.md` lists it among the failure modes this architecture exists to prevent. The
price paid instead is an explicit assertion at cross-element `render` boundaries; see *Known
limitation: cross-element `render` typing* above.

### A port of Base UI's `useRender` implementation
**Why not:** its memoization and `forwardRef` machinery is React re-render bookkeeping with no
counterpart here — Solid components run once, and refs merge without a forwarding dance. Only the
*idea* (one shared hook owning render-prop composition) is taken; the React implementation would be
carried in and immediately reversed out.
