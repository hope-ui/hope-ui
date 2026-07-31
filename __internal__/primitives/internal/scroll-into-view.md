# `scrollIntoView`

Scrolls one container so a descendant is visible **inside it**, and moves nothing above it. Not a
`createX` primitive — a plain function, called imperatively by an `ItemSource`'s
`scrollIndexIntoView`.

```ts
function scrollIntoView(
  scrollContainer: HTMLElement,
  element: HTMLElement,
  alignment?: { block?: ScrollLogicalPosition; inline?: ScrollLogicalPosition }, // both default "nearest"
): void;
```

Derived from Adobe React Spectrum's `@react-aria/utils` `scrollIntoView` (Apache-2.0) — see the
`@license` header on the file and the `NOTICE.md` rows.

## Why it is needed at all

`aria-activedescendant` moves no DOM focus. Roving focus has been hiding that: a real `.focus()`
scrolls the element into view by itself, so a roving listbox never needed help. A Select highlights
its active option purely through ARIA, so without this the browser scrolls nothing and an offscreen
option stays offscreen while assistive technology announces it as active — with every test green.

## The arithmetic

Two spans per axis, in viewport coordinates:

| | What it is |
|---|---|
| **scroll area** | the element's border box, grown by its own `scroll-margin-*` |
| **scroll port** | the container's border box, minus its borders, its `scroll-padding-*`, and the scrollbar |

Borders and the scrollbar sit *inside* the border box but outside the scrollable area, so leaving
them in tucks the last row under the scrollbar. When the container is the document scroller
(`document.scrollingElement`) the port is the viewport instead: its borders and scrollbar fall
outside the scrolled area, so none of them are subtracted.

The delta per axis is `0` when the area already sits inside the port; otherwise:

| `block` / `inline` | Delta |
|---|---|
| `"start"` | `area.start - port.start` |
| `"center"` | midpoints aligned |
| `"end"` | `area.end - port.end` |
| `"nearest"` (default) | whichever of the two is smaller in absolute value |

`"nearest"` is what makes the call safe to make on **every** focus move: it is a no-op for an
already-visible row, so `createListFocus` needs no "is it visible?" test of its own.

## RTL

The physical sides here are correct and must stay physical — this is measured geometry, the same
class as the `getBoundingClientRect()` reads `check:rtl-safety` deliberately never flags. Direction
is handled explicitly: the vertical scrollbar occupies the inline **end**, which is the left edge
under `direction: rtl`, so the port shrinks on the other side there.

## SSR

Pure DOM measurement, called only from client-side focus moves. It is never reached during a server
render, so it carries no `isServer` guard.

## Callers

- `createListFocus.setActive` → `source.scrollIndexIntoView(index)`, on every focus move
  (`create-list-focus.md`).
- The data-driven `ItemSource` calls it against its registered scroll element.
  `createVirtualCollection` does **not**: it routes through `virtualizer.scrollToIndex`, which also
  has to *mount* the row. `createCollection` implements no `scrollIndexIntoView` at all — its one
  remaining consumer, Calendar, is roving, where the native `.focus()` scrolls on its own.

## Rejected alternatives

### `element.scrollIntoView()` (the native call)
**Why not:** it walks **every** scrollable ancestor up to the document, so revealing an option inside a
floating popup scrolls the page — and drags the popup itself out from under the reader. This function
touches the container it is given and nothing else.

### React Aria's `scrollIntoViewport`
**Why not:** the second export of the file this one derives from, it walks scroll parents up to (and
sometimes including) the page — the containment problem again, for the callers that actually want it.
Nothing here does: floating-ui's `shift`/`flip` already keeps the popup on screen, and a modal Select
locks page scroll. Deliberately absent rather than overlooked, and recorded as such in the package's
`NOTICE.md`.

### React Aria's iOS/WebKit scrollbar-side branch
**Why not:** it compensates for a scrollbar on the opposite side under WebKit, and overlay scrollbars
measure zero thickness there — so the correction it guards is already `0` and the branch is inert.
