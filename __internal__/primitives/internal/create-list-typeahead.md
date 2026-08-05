# `createListTypeahead`

Type-to-focus over a list's items, layered on a [`createListFocus`](create-list-focus.md)
instance. It buffers typed characters, resets the buffer after a delay, matches item `textValue`s
case-insensitively (or, with a `collator`, diacritic-insensitively too), and moves the active item
through `onMatch` — which defaults to `focus.focusIndex`, so a match in an unmounted virtualized row
scrolls in and focuses exactly like arrow navigation.

Modeled on Angular Aria's `list-typeahead` and Angular CDK's standalone `typeahead`; the matching
rules follow react-aria's `useTypeSelect`. `onMatch` and `collator` are hope-ui additions with no
upstream file to derive from — the buffer/timeout/wrap logic they're layered on is untouched, so
this owes prose credit only (see below), not a `@license` header.

## API

```ts
function createListTypeahead<V = unknown>(options: {
  focus: CreateListFocusReturn<V>;
  delay?: Accessor<number>; // buffer-reset delay in ms, default 500
  onMatch?: (index: number) => void; // default focus.focusIndex
  collator?: Accessor<Intl.Collator>; // default: case-insensitive startsWith
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
  [`createKeyboardHandler`](../utils/keymap.md)'s `onText` channel. Compose it alongside
  navigation/selection handlers with `composeEventHandlers`.
- `onMatch` — called with the matched index instead of the default `focus.focusIndex`. A plain
  listbox never sets this, so its behavior is unchanged; `createCombobox` is the interceptor it was
  built for, passing `onTypeaheadMatch` to **select** the match rather than highlight it while the
  popup is closed —
  native `<select>` behavior, react-aria's `onTypeSelect → setSelectedKey`, Base UI's `onMatch`.
- `collator` — when present, matching uses
  `collator.compare(textValue.slice(0, query.length), query) === 0` instead of
  `textValue.toLowerCase().startsWith(query.toLowerCase())`. `Listbox.Root` passes
  `createCollator({ usage: "search", sensitivity: "base" })` (`@hope-ui/i18n`), which folds
  **diacritics and case** — `cafe` matches `Café`, which `toLowerCase()` cannot. Every other
  matching rule (extend/cycle/wrap, `focus.isFocusable` skipping) is unchanged; only the per-item
  predicate differs.

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
even for rows that were never mounted. Focusing the match calls `onMatch` (default `focus.focusIndex`),
which scrolls the row into view (mounted or not — see `create-list-focus.md`) and focuses it once it
mounts. So typeahead over a 10k-row list finds and reveals an offscreen match — verified in the
browser test.

## Collated matching — a known, accepted limitation

Matching compares with `collator.compare(textValue.slice(0, query.length), query) === 0` — the exact
expression `ListKeyboardDelegate.getKeyForSearch` and `useFilter.ts` use in react-aria.
`String.prototype.slice` counts UTF-16 code units; the collator compares collation elements. When the
query and the matched `textValue` normalize differently — a precomposed accented character on one
side, the decomposed base letter + combining mark on the other — the slice can land mid-grapheme and
compare a truncated fragment, producing a false negative even though the text visually *does* start
with the query.

hope-ui matches react-aria's behavior here rather than adding a normalization guard no upstream
typeahead/filter implementation carries. `create-list-typeahead.browser.test.tsx`'s "known
limitation" test pins the exact boundary: an item stored as decomposed `éclair` (7 UTF-16 units for 6
visible characters) does **not** match a query typed as the first three precomposed characters
(`écl`, 3 units) — confirmed via a same-normalization `collator.compare` check that the prefix is
genuinely valid once both sides share one form. Don't "fix" this test by changing its expectation;
fix the primitive (and drop the pin) if a normalization strategy is ever adopted.

## Provenance

`onMatch` and `collator` were added without porting any upstream file — the wrap-modulo loop and
buffer/timeout logic predate them and are untouched. No `@license` header or `NOTICE.md` row: this is
prose credit only (react-aria's `useTypeSelect`/`ListKeyboardDelegate` named above as the source of
the matching rules and the sliced-comparison expression), per CLAUDE.md's attribution policy.

## SSR

Typeahead runs only from keyboard events (client). It uses `setTimeout` for the buffer reset, cleaned
up via `onCleanup`; nothing touches the DOM or a timer at module scope, so it is inert during SSR.

## Rejected alternatives

### `toLowerCase().startsWith()` as the listbox's matching rule
**Why not:** it folds case but not diacritics, so a reader typing `cafe` never reaches an option
labelled `Café` — and on a French or Spanish list that is most of the options. `Listbox.Root` passes a
`createCollator({ usage: "search", sensitivity: "base" })` from `@hope-ui/i18n` instead, which folds
both. The plain comparison survives only as the fallback when no `collator` is given, so a consumer
outside a locale context still gets case-insensitive matching.

### A Unicode-normalization guard around the sliced prefix
**Why not:** the comparison here is the exact expression react-aria's `ListKeyboardDelegate` and
`useFilter` use, and no upstream typeahead or filter carries such a guard — adding one would make
hope-ui's matching quietly differ from the reference every other matching rule in this file is checked
against. The one false negative it would fix (a query and a `textValue` that normalize differently, so
the slice lands mid-grapheme) is **pinned by a test** instead, not silently tolerated: see *Collated
matching — a known, accepted limitation* above.
**Revisit if:** a normalization strategy is adopted across matching and filtering — then fix the
primitive and drop the pin, rather than editing the test's expectation.
