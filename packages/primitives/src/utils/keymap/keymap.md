# `createKeyboardHandler`

A fluent, modifier-aware keymap builder — the declarative counterpart to the imperative
`switch (event.key)` that every collection component (Listbox, Menu, Grid) would otherwise
hand-roll. It produces a single `onKeyDown` handler from a set of key bindings plus an optional
typeahead fallback.

Modeled on Angular Aria's `private/behaviors/event-manager` (its idea, not its code). It lives in
`utils/` beside [`composeEventHandlers`](../events/events.ts) because the two are meant to be used
together.

## API

```ts
function createKeyboardHandler<T = Element>(): KeyboardHandler<T>;

interface KeyboardHandler<T> {
  on(combo: string | string[], handler: (event: KeyboardEventFor<T>) => void): KeyboardHandler<T>;
  onText(handler: (char: string, event: KeyboardEventFor<T>) => void): KeyboardHandler<T>;
  onKeyDown: JSX.EventHandler<T, KeyboardEvent>;
}
```

- `on(combo, handler)` — bind a handler to a **combo**: a `KeyboardEvent.key` value, optionally
  prefixed with `+`-joined modifiers. Pass an array to bind several keys to one handler.
- `onText(handler)` — a fallback invoked when a **single printable character** is typed and no
  `on(...)` binding matched. This is the typeahead channel.
- `onKeyDown` — the composed handler to spread onto an element. Stable for the builder's lifetime.

## Combo syntax

| Combo | Matches |
|---|---|
| `"ArrowDown"` | ArrowDown with **no** modifiers |
| `"shift+Home"` | Home with only Shift |
| `"mod+a"` | ⌘+A on Apple platforms, Ctrl+A elsewhere |
| `["Enter", " "]` | Enter **or** Space |
| `"a"` | the letter A (case-insensitive) |
| `" "` / `"Space"` | Space |
| `"Escape"` / `"Esc"` | Escape |

- **Modifiers**: `mod`, `ctrl` (`control`), `meta` (`cmd`/`command`), `alt` (`option`), `shift`.
  `mod` resolves to ⌘ on Apple platforms and Ctrl elsewhere, decided when the binding is built.
- **Modifier state must match exactly.** `"ArrowDown"` does *not* fire for `Shift+ArrowDown`, and
  `"a"` is distinct from `"mod+a"`. This is deliberate: range-extend (`Shift+Arrow`) and
  select-all (`mod+a`) must not collide with plain navigation.
- Single-character keys match case-insensitively; the key segment is never trimmed, so `" "` and
  `"+"` are bindable.

## Dispatch order

1. Bindings are checked in registration order; the **first** match runs and dispatch stops.
2. If nothing matched and the key is one printable character with neither Ctrl nor Meta held
   (Shift/Alt are allowed, so capitals and accented input still type), `onText` runs.

Handlers decide their own `preventDefault()` — the builder never calls it for you, so a binding
that should not also scroll the page (`ArrowDown`, `Home`, `" "`) must call it itself.

## Composing with the consumer's handler

Compose the consumer's `onKeyDown` **in front of** `keys.onKeyDown`, exactly as the parts compose
other handlers, so a consumer `preventDefault()` cancels the whole map:

```tsx
<ul onKeyDown={composeEventHandlers(props.onKeyDown, keys.onKeyDown)}>
```

## Example

```ts
const keys = createKeyboardHandler<HTMLUListElement>()
  .on("ArrowDown", (e) => { e.preventDefault(); navigation.next(); })
  .on("ArrowUp", (e) => { e.preventDefault(); navigation.prev(); })
  .on("Home", (e) => { e.preventDefault(); navigation.first(); })
  .on("End", (e) => { e.preventDefault(); navigation.last(); })
  .on(["Enter", " "], (e) => { e.preventDefault(); selection.toggleActive(); })
  .on("mod+a", (e) => { e.preventDefault(); selection.selectAll(); })
  .onText((char) => typeahead.search(char));
```
