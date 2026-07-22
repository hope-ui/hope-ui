# `createListNavigation`

Arrow-key navigation layered on a [`createListFocus`](../create-list-focus/create-list-focus.md) instance:
`next`/`prev`/`first`/`last`, wrap, orientation, RTL, and skip-disabled. It holds **no state** — it
reads `focus.items()`/`focus.activeIndex()`, skips items `focus.isFocusable` rejects, and moves the
active item through `focus.focusIndex`. Because focus defers real `.focus()` until the element
exists, navigating past a virtualized window's edge works unchanged: the target scrolls in, then
focuses.

Modeled on Angular Aria's `list-navigation`; the edge-case set is cross-checked against react-aria's
`ListKeyboardDelegate` and floating-ui-react's `useListNavigation`.

## API

```ts
function createListNavigation<V = unknown>(options: {
  focus: CreateListFocusReturn<V>;
  orientation?: Accessor<"vertical" | "horizontal">; // default "vertical"
  wrap?: Accessor<boolean>;                          // default false
  textDirection?: Accessor<"ltr" | "rtl">;           // default "ltr"
  page?: Accessor<number>;                           // items per PageUp/PageDown, default 10
}): {
  next(): void;
  prev(): void;
  first(): void;
  last(): void;
  pageNext(): void;   // move a page toward the end, landing on a focusable item
  pagePrev(): void;   // move a page toward the start
  peekNext(): number; // target index without moving; -1 if nowhere to go
  peekPrev(): number;
  onKeyDown: JSX.EventHandler<HTMLElement, KeyboardEvent>;
};
```

## Keyboard

| Key | Vertical | Horizontal (LTR) | Horizontal (RTL) |
|---|---|---|---|
| ArrowDown | next | — | — |
| ArrowUp | prev | — | — |
| ArrowRight | — | next | prev |
| ArrowLeft | — | prev | next |
| Home | first | first | first |
| End | last | last | last |
| PageDown | pageNext | pageNext | pageNext |
| PageUp | pagePrev | pagePrev | pagePrev |

`onKeyDown` calls `preventDefault()` **only** on keys it acts on, so an off-axis arrow (ArrowDown in
a horizontal list) still scrolls the page. Page keys act in **both** orientations (they page through
list order, not an axis) and always `preventDefault` — which is also what stops the native scroll that
would otherwise push a roving-focused row out of a virtualized window and drop DOM focus (see
[`createListFocus`](../create-list-focus/create-list-focus.md)'s focus-recovery note). It's built with
[`createKeyboardHandler`](../../utils/keymap.md); compose it with the consumer's handler (and
with typeahead/selection handlers) via `composeEventHandlers`.

## Behavior

- **Skip-disabled** — movement lands on the next item `focus.isFocusable` accepts, so disabled items
  are stepped over. (With `focus`'s `skipDisabled` off, nothing is skipped — the menu case.)
- **Wrap** — off by default: `next` at the last item (and `prev` at the first) stays put. On: it
  cycles. A list with a single focusable item never moves.
- **From no active item** — `next`/ArrowDown goes to the first focusable item, `prev`/ArrowUp to the
  last. This is the typical "widget just received focus, press down" entry.
- **Page navigation** — `pageNext`/`pagePrev` jump by `page` items (default 10; pass a reactive
  accessor to derive a true "page" from the viewport). The jump clamps to the ends (so PageDown near
  the bottom lands on the last item, like End) and, if the clamped target is disabled, scans **back
  toward the current item** for the nearest focusable so a disabled tail can't overshoot. Never wraps.
- **`peekNext`/`peekPrev`** report where a move would land without performing it (`-1` = nowhere) —
  useful for a component that must decide whether an arrow should navigate or defer to a parent
  (e.g. a submenu, or a grid handing off to `createGridNavigation`).

## SSR

Navigation only ever runs from keyboard events (client). The getters it calls on `focus` are
SSR-safe reads; no effect or DOM access happens at module scope.
