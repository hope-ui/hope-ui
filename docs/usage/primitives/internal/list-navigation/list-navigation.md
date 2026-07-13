# `createListNavigation`

Arrow-key navigation layered on a [`createListFocus`](../list-focus/list-focus.md) instance:
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
}): {
  next(): void;
  prev(): void;
  first(): void;
  last(): void;
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

`onKeyDown` calls `preventDefault()` **only** on keys it acts on, so an off-axis arrow (ArrowDown in
a horizontal list) still scrolls the page. It's built with
[`createKeyboardHandler`](../../utils/keymap/keymap.md); compose it with the consumer's handler (and
with typeahead/selection handlers) via `composeEventHandlers`.

## Behavior

- **Skip-disabled** — movement lands on the next item `focus.isFocusable` accepts, so disabled items
  are stepped over. (With `focus`'s `skipDisabled` off, nothing is skipped — the menu case.)
- **Wrap** — off by default: `next` at the last item (and `prev` at the first) stays put. On: it
  cycles. A list with a single focusable item never moves.
- **From no active item** — `next`/ArrowDown goes to the first focusable item, `prev`/ArrowUp to the
  last. This is the typical "widget just received focus, press down" entry.
- **`peekNext`/`peekPrev`** report where a move would land without performing it (`-1` = nowhere) —
  useful for a component that must decide whether an arrow should navigate or defer to a parent
  (e.g. a submenu, or a grid handing off to `createGridNavigation`).

## SSR

Navigation only ever runs from keyboard events (client). The getters it calls on `focus` are
SSR-safe reads; no effect or DOM access happens at module scope.
