# `createListTypeahead`

Type-to-focus over a list's items, layered on a [`createListFocus`](../create-list-focus/create-list-focus.md)
instance. It buffers typed characters, resets the buffer after a delay, matches item `textValue`s
case-insensitively, and moves the active item through `focus.focusIndex` — so a match in an unmounted
virtualized row scrolls in and focuses exactly like arrow navigation.

Modeled on Angular Aria's `list-typeahead` and Angular CDK's standalone `typeahead`; the matching
rules follow react-aria's `useTypeSelect`.

## API

```ts
function createListTypeahead<V = unknown>(options: {
  focus: CreateListFocusReturn<V>;
  delay?: Accessor<number>; // buffer-reset delay in ms, default 500
}): {
  search(char: string): void;
  isTyping: Accessor<boolean>;
  onKeyDown: JSX.EventHandler<HTMLElement, KeyboardEvent>;
};
```

- `search(char)` — feed one printable character.
- `isTyping()` — `true` while a buffer is active. A single-select listbox that follows focus reads
  this to **suppress selection while the user is typing** (so typeahead browses without selecting).
- `onKeyDown` — routes printable characters to `search` via
  [`createKeyboardHandler`](../../utils/keymap/keymap.md)'s `onText` channel. Compose it alongside
  navigation/selection handlers with `composeEventHandlers`.

## Matching rules

| Input | Behavior |
|---|---|
| distinct letters, e.g. `b` then `l` | **extend** — searches the full buffer (`bl`) from the current item, refining toward one item |
| same letter repeated, e.g. `b`, `b` | **cycle** — searches that single letter starting *after* the current item, stepping through every item beginning with it |
| a letter with no current item | jumps to the first item beginning with it |
| leading Space | **ignored** — Space stays available for selection until a query is already in progress |

Search always **wraps** around the end of the list and **skips** items `focus.isFocusable` rejects.
The buffer resets after `delay` ms of inactivity.

## Virtualization

`search` reads `item.textValue()`, which a `createVirtualCollection` supplies from its per-index data
even for rows that were never mounted. Focusing the match calls `focus.focusIndex`, which scrolls the
row into view and focuses it once it mounts. So typeahead over a 10k-row list finds and reveals an
offscreen match — verified in the browser test.

## SSR

Typeahead runs only from keyboard events (client). It uses `setTimeout` for the buffer reset, cleaned
up via `onCleanup`; nothing touches the DOM or a timer at module scope, so it is inert during SSR.
