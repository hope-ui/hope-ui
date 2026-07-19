# `ModalBackdrop`

An invisible, viewport-covering element that blocks pointer interaction with everything
behind a modal layer. Base UI ships an equivalent `InternalBackdrop` for the same reason.

The only component in `@hope-ui/primitives`. It's here rather than inside `Dialog` because
every modal layer needs it verbatim — a modal Popover, a modal Select — and copying fifteen
lines of stacking-order-sensitive CSS into each is how the ordering rules below get quietly
lost.

## API

```tsx
function ModalBackdrop(props: { ref?: (element: HTMLDivElement) => void }): JSX.Element;
```

It renders `<div role="presentation" aria-hidden="true" data-hope-ui-modal-backdrop
style="position: fixed; inset: 0">`.

**Always pass `ref`, and add the element to `createHideOutside`'s `spare` list.** An `inert`
element is transparent to hit testing, so a backdrop that let itself be hidden would silently
stop blocking the pointer — the one job it exists for.

## Why it survives alongside `inert`

`createHideOutside` already applies `inert` to outside content, which blocks the pointer
natively. So this looks redundant — and it isn't.

`inert` only blocks the pointer on elements the layer **actually marked**. An element inserted
into the page between the walk and the `MutationObserver` callback is briefly clickable. This
backdrop covers the viewport unconditionally, so it isn't. That belt-and-braces guarantee is
the whole reason it exists; Base UI keeps its `InternalBackdrop` for the same reason.

## Channels and mechanisms

`aria-modal` and `aria-hidden` do not stop a mouse. A focus trap doesn't either — the click
fires before its `focusin` handler can react.

| Channel | Mechanism |
| ------- | --------- |
| Assistive technology | `createHideOutside` (`aria-hidden`), plus `aria-modal` on the popup |
| Focus order | `createHideOutside` (`inert`) |
| Tab cycling | `createFocusTrap` |
| Pointer, unconditionally | `ModalBackdrop` |

This is the **component-rendered** backdrop, always present while a layer is modal. It is not
the consumer's optional, visible backdrop (`Dialog.Backdrop`), which is purely decorative and
may be absent. Rendering both is normal.

## Where to render it

As the **first child of the portal** — before any consumer backdrop, before the popup:

```tsx
<Portal>
  <Show when={open() && modal()}>
    <ModalBackdrop ref={setModalBackdropEl} />
  </Show>
  {props.children}
</Portal>
```

Everything it should block comes earlier in the document; everything that must stay
interactive comes later. Both are positioned, so DOM order decides paint and hit-test order.
Putting it *inside* the popup instead (where Base UI puts theirs) would cover the consumer's
own backdrop and silently swallow its hover styles and pointer handlers.

### The popup must be positioned

This is `position: fixed`. CSS paints positioned elements above non-positioned ones
regardless of DOM order, so a `position: static` popup lands *underneath* it and its own
buttons stop responding to the mouse. Give the popup `position: fixed`/`absolute`/`relative`
— which every real modal layer does anyway.

### Clicking it dismisses the layer

It sits outside the popup, so `createDismissable`'s outside-pointerdown check fires. That
matches what clicking a consumer backdrop does, and it's what a user expects when clicking
"outside" a modal.

## Gate it on the same signal as the rest of modality

`open() && modal()` — the same condition `createFocusTrap`, `createHideOutside` and
`createScrollLock` use. If the popup has an exit transition, the pointer is unblocked when
`open` flips false rather than when the transition finishes; keeping every modal mechanism on
one condition is what makes that predictable rather than surprising.

## SSR

Renders through `renderElement` → `<Dynamic>` (a plain `<div>` would work too — the library
ships source, so literal host elements compile per environment; see `__internal__/plan.md`,
"Distribution model"). In practice a modal backdrop only ever renders inside a `Portal`, which
`@solidjs/web`'s server build refuses to run at all (`Portal` throws server-side), so the
backdrop is simply absent from the SSR HTML and mounts on the client after hydration — the
`isServer` gate on the portal wrapper is what keeps that from crashing the render.
