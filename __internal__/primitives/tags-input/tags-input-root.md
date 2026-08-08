# `createTagsInput` (tags-input hook family)

The headless behavior core of a tags input — a row of removable chips in front of a text field, the
control email recipients and keyword entry are built from. It **composes** already-shipped `internal/`
primitives (`createControllableState`, `createDataCollection`, `createListFocus`,
`createListNavigation`, `createTextDirectionWarning`) into one root state hook plus one hook per part.
No new behavior primitive: roadmap #11's `createTagsState` was retired in place, and this family is
the reason it stayed retired. Exported as one subpath, `@hope-ui/primitives/tags-input`.

The **component-layer and cross-cutting decisions live in `__internal__/components/decisions.md`
§ TagsInput**, as `D1`–`D12`; this file cites them by id and records only the behavior rationale that
is the primitive's own. The two references it was designed against — Base UI's Combobox chip row and
React Aria's TagGroup — are compared there.

| Hook | Owns |
| ---- | ---- |
| `createTagsInput(options)` | Shared state: the tag array, the collection, focus + horizontal navigation, the whole text→tag policy (`D3`/`D4`), the `D7` field pass-throughs. Renders nothing. Call **once**. |

The part hooks (`createTagsInputList`, `createTagsInputItem`, `createTagsInputItemDelete`,
`createTagsInputInput`, …) land in later phases and each take this state plus their own props.

## The tags **are** the data

There is no separate `items` option, and that is the difference from `createListbox`. A listbox's
options exist whether or not a row is mounted, so its collection is fed a list the consumer supplies;
a tags input's chips are 1:1 with the value and always mounted, so `createDataCollection` reads
`value()` directly:

```ts
createDataCollection<V>({ items: tags, itemToValue, itemToLabel, isItemDisabled, scrollElement })
```

Two things follow. A chip resolves its own position through `indexOfValue(itemToValue(item))`, so
there is no `index` prop on the public API — the same shape `Listbox.Item` uses. And add / remove /
dedupe are **policy over an array**, not a state machine: `createControllableState<V[]>` holds it,
and everything else in this file is a rule about what may enter or leave it.

## `createTagsInput(options)`

```ts
function createTagsInput<V = string>(options: {
  // the tag array
  value?: V[];                                   // controlled; pass a getter for reactive control
  defaultValue?: V[];                            // default []
  onChange?: (value: V[]) => void;

  // the collection
  itemToValue?: (item: V) => string;             // default String(item)
  itemToLabel?: (item: V) => string;             // default: itemToValue
  isItemDisabled?: (item: V) => boolean;         // default false
  isItemEqualToValue?: (a: V, b: V) => boolean;  // default itemToValue(a) === itemToValue(b)

  // text → tag policy  (D3 / D4)
  parse?: (text: string) => V | null;            // default text.trim() — REQUIRED for a non-string V
  delimiter?: string;                            // default ","
  max?: number;                                  // default: unlimited
  onReject?: (rejection: { reason; text }) => void;

  // navigation
  dir?: "ltr" | "rtl";                           // default: useLocale().direction()

  // the field  (D7)
  disabled?: boolean;                            // default false
  readOnly?: boolean;                            // default false
  required?: boolean;                            // default false
  invalid?: boolean;                             // default false
  "aria-invalid"?: JSX.AriaAttributes["aria-invalid"];
  "aria-describedby"?: string;

  id?: string;
}): CreateTagsInputReturn<V>;
```

Returned surface: `id`; `value` / `setValue`; `indexed`, `indexOfValue`; the sub-instances `focus`
and `navigation`; `add`, `removeAt`, `remove`, `removeLast`, `clear`; the resolved mappers
`itemToValue`, `itemToLabel`, `isItemDisabled`, `isItemEqualToValue`; `max`, `isFull`, `delimiter`;
`duplicateValue`, `isDuplicate`, `clearDuplicate`; `disabled`, `readOnly`, `required`, `invalid`,
`ariaInvalid`, `ariaDescribedBy`, `isInteractive`; `direction`; `setListElement`, `listElement`,
`inputElement`, `setInputElement`, `focusInput`.

`listElement` and `inputElement` are readable, not just writable, because the widget's focus-within
flag is decided by **two** parts that each straddle the other's boundary: the chip row asks *"is the
active element inside me **or** is it the field?"*, and the field asks the mirror question. Neither
element can see the other's subtree without this. See
[`tags-input-input.md`](tags-input-input.md) § Focus-within is the widget's.

`name` / `form` are deliberately absent: native submission is `D6`, and the hidden-field phase adds
them alongside the code that reads them rather than shipping two unread options ahead of it.

### `V` is generic, and `parse` is conditionally required (`D3`)

```ts
type TagsInputParseOption<V> = string extends V
  ? { parse?: (text: string) => V | null }
  : { parse:  (text: string) => V | null };

type CreateTagsInputOptions<V> = CreateTagsInputBaseOptions<V> & TagsInputParseOption<V>;
```

The default parser returns `text.trim()`, which is only a valid `V` when `V` is string-like. For any
other `V` the conditional makes `parse` **required**, so an object tag with no parser is a compile
error instead of a string silently masquerading as `V` until something reads a property off it.

The two halves are **intersected** rather than written as one top-level conditional, and that is
load-bearing: TypeScript infers nothing from a parameter whose whole type is a deferred conditional,
so the conditional form would break `V` inference from `value`/`defaultValue` and force every call
site to write `createTagsInput<Email>(…)` by hand. Intersecting leaves the base as an inference
source and defers only the `parse` obligation. Inside the hook the options widen back to the base in
one assignment — the conditional constrains the call site, never the body.

## One entry point for text

Every path that turns text into tags — Enter, a delimiter keypress, a paste, a blur commit — calls
`add(text)`. Nothing else may write a tag from text, because the four rules below are only correct
if they run together:

1. **split** on `delimiter`, then drop parts that are whitespace-only. Typing `apple,` is a commit,
   not a commit plus a mistake — so an empty part fires nothing.
2. **empty** — every part was dropped ⇒ `onReject({ reason: "empty" })`, field cleared. This is
   *"you asked to commit nothing"*, which a whitespace-only field is and an empty one never reaches
   (`D5` leaves Enter on an empty input unbound so the form can submit).
3. **max** — the list is at the limit ⇒ stop, and hand the whole untouched tail back (below).
4. **invalid** — `parse` returned `null` ⇒ reject, keep the text.
5. **duplicate** — the parsed tag equals one already present ⇒ reject, drop the text, mark the
   existing chip.

`max` is checked **before** the parse/duplicate pair so the stop is clean: everything from the
overflow point on is returned verbatim, un-parsed and un-judged, which is exactly what the user has
to see again. Duplicates spend no budget — a value already on screen never needed a slot.

`add` returns what the caller needs and nothing it can get wrong:

```ts
{ added: readonly V[]; inputText: string; rejections: readonly TagsInputRejection[] }
```

`inputText` is `D4`'s *"kept for `max`/`invalid`, cleared for `duplicate`"* rule already applied —
the refused texts re-joined by the delimiter. The input part assigns it and asks no questions, which
is why Enter, paste and a delimiter keypress cannot drift apart.

### `max` is partial-accept, with the remainder re-joined

A paste of twenty addresses into a field with three slots left keeps the three and returns
`"…,…,…,…"` — seventeen entries, one string, **one** `onReject({ reason: "max", text })`. One
rejection per lost tag would turn a single overflow into seventeen toasts.

### The duplicate flash (`data-duplicate`)

A refused duplicate marks the chip it **collided with**, not the text that was refused, so the recipe
can flash the thing already on screen. The marker clears on the next `input` event
(`clearDuplicate()`, called by the input part) or on the next **successful** add. An add that only
failed leaves it alone — the user has not typed since, so the flash is still current.

It is held as the chip's `itemToValue` **string**, not as the tag: `createSignal` treats a
function-valued argument as a *compute function* under Solid 2.0, so a `createSignal<V>()` would
invoke a callable tag and store its return. A string sidesteps the boxing `createControllableState`
otherwise needs, and it survives the tag array being rebuilt under it. `isDuplicate(item)` compares
those strings.

## Equality is the kernel's existing vocabulary

`isItemEqualToValue ?? ((a, b) => itemToValue(a) === itemToValue(b))` — the same two-prop shape
`createListSelection` speaks, and the reason `compareByIdOrReference` (deleted in #23) is not reached
for. The default is **literal**: `"Apple"` and `"apple"` are two tags, because folding two distinct
email addresses into one is a bug (`D4`). `isItemEqualToValue` is the seam to change that, and it is
also what lets a controlled consumer hand back freshly-built objects each render without every
comparison failing on reference.

## Focus: roving mode, but no roving tab stop

```ts
createListFocus<V>({ source, focusMode: () => "roving", disabled, element: listElement, itemToValue })
createListNavigation<V>({ focus, orientation: () => "horizontal", wrap: () => false, textDirection })
```

`"roving"` because the active chip takes **real DOM focus** — that is what makes ArrowLeft from the
text field land somewhere a screen reader announces. But `D2` says the field is the widget's single
tab stop, so the item part hook never consults `focus.getItemTabIndex()`; every chip is
`tabindex="-1"` unconditionally. The focus instance is used for the active item, the deferred
`.focus()`, and the re-homing that survives a removal (#22).

`wrap: false` is likewise not "no wrapping" but "wrapping is the part hook's job to redirect": past
either end, focus returns to the **text field**. The part peeks (`navigation.peekNext() < 0`) instead
of moving and reading back, because a Solid 2.0 signal write is invisible to a plain read until the
next flush — the same trick `listbox-root.ts` uses for shift+arrow. A wrapping navigation would leave
the part no way to tell *"there is another chip"* from *"you are at the end"*.

`focusInput()` packages `D10`'s ordering as one call: **drop the chip highlight, then focus the
field.** The order is the whole point. With a non-negative active index, `createListFocus`'s re-homing
effect fires on the next tag-array change and — in roving mode — pulls DOM focus onto a surviving
chip while the user expects to keep typing. Clearing the index first makes that effect return early
on `activeAt < 0`. Every pointer removal path goes through it.

## Reading direction

`direction()` resolves the consumer's `dir` prop, else `useLocale().direction()`, and is threaded
into `createListNavigation` as `textDirection` — which is what flips ArrowLeft/ArrowRight for the
chip row. **It drives behavior only and is never written to the DOM;** the layout mirrors from the
cascade, so a `dir` on an ancestor reaches the row on its own. Same line as `createListbox`; full
comparison in `../internal/create-text-direction-warning.md`.

The dev warning is created with **no `active` gate**, unlike Listbox's (`orientation ===
"horizontal"`). A chip row is always horizontal, so a split between the locale the keymap mirrors
against and the direction the browser paints in is always observable — and always silent otherwise.

## Keyboard

The root hook **binds no keys**: the keymap belongs to the part hooks, which is where the event
target lives. What it owns is the operation each key lands on, so the table below is the contract the
later phases are written against rather than a description of this file.

| Key | Focus in the field | Focus on a chip | Root call |
| --- | --- | --- | --- |
| printable | types | return focus to the field, then the key types | `focusInput()` |
| `Enter` | text ⇒ commit; empty ⇒ the form submits (`D5`) | return focus to the field | `add(text)` / `focusInput()` |
| delimiter char | commit each complete part; the trailing remainder stays editable | — | `add(text)` |
| `Backspace` | empty field, no chip highlighted ⇒ remove the last chip | remove this chip | `removeLast()` / `removeAt(i)` |
| `Delete` | — | remove this chip | `removeAt(i)` |
| `ArrowLeft` (LTR) | caret at 0 with tags present ⇒ focus the last chip | previous chip; past the first ⇒ the field | `navigation.prev()` / `focusInput()` |
| `ArrowRight` (LTR) | — | next chip; past the last ⇒ the field | `navigation.next()` / `focusInput()` |
| RTL | Left/Right swap — `createListNavigation`'s `textDirection` already does it | | |
| `Home` / `End` | caret keys, unbound | first / last chip | `navigation.first()` / `.last()` |
| `Escape` | **unbound** — it must reach an enclosing Dialog | return focus to the field | `focusInput()` |
| paste | split, parse, partial-accept to `max`, remainder back in the field | — | `add(text)` |

Disabled chips are neither removable nor navigable: `isItemDisabled` feeds `createDataCollection`,
`createListFocus`'s default `skipDisabled: true` makes navigation step over them, and `removeAt`
refuses one outright — from every path, `remove` and `removeLast` included. `clear()` keeps them for
the same reason: removing them there would be the one way to delete a tag the widget says cannot be
deleted.

## ARIA

The chip row's shape is `D1` — `role="toolbar"` on the row, `role="group"` on each chip named from
its own text, and a real `<button>` for the ✕ carrying `aria-labelledby="<own id> <itemText id>"` so
it announces *"Remove Apple"*. Those attributes are written by the **part hooks**; this file's ARIA
surface is two resolved values the field parts read:

- `ariaInvalid()` — the consumer's `aria-invalid`, else `"true"` while `invalid`, else `undefined`.
- `ariaDescribedBy()` — the consumer's `aria-describedby`, passed through untouched.

Both follow the house rule that an internal computed value **falls back to** the consumer's rather
than overwriting it. They exist now rather than after `createFormControl` lands so that the retrofit
(`D7`) is a wiring change, not an API break; nothing in this catalog wires either attribute yet.

`disabled` / `readOnly` / `required` are held here too, and `isInteractive()` (`!disabled &&
!readOnly`) is the one gate every mutation checks — `add`, `removeAt`, `clear`. A refused mutation
under that gate fires **no** rejection: nothing was judged, the widget simply does not take input,
and `add` hands the field's text straight back.

## Call it once, in an owner scope

It creates signals, effects and a `createUniqueId()`, so it belongs at the top of a component body or
inside a `createRoot`. Calling it twice creates two independent tag lists.

## SSR

Everything here is data. The tag array, the collection and every derived accessor resolve with no
DOM, and the three DOM-touching dependencies all no-op server-side: `createTextDirectionWarning`
returns before `getComputedStyle` when no element has registered, `createListFocus`'s deferred
`.focus()` never resolves an element, and `createDataCollection`'s scroll helper is untracked and
element-gated. So the chips render server-side from `value`/`defaultValue` — which is what makes the
component layer's hydration round-trip (`D9`'s `aria-live` starting at `off`) a real one rather than
a closed-popup no-op.

## Rejected alternatives

### A `createTagsState` kernel primitive (roadmap #11)

**Why not:** it was retired in place, and building this hook is what confirmed the retirement. Every
piece it would have owned already exists: the array is `createControllableState<V[]>`, add/remove are
array operations, dedupe is the `itemToValue`/`isItemEqualToValue` vocabulary the kernel already
speaks, `max` is a length check, and roving focus plus focus-after-removal are `createListFocus`. A
primitive whose whole body is five calls to other primitives is a name, not a mechanism — and it
would have owed its own test, usage doc and rejected-alternatives file to say so.

### `add` returning nothing, with the caller reading state back

**Why not:** the caller — the input part — has to decide what the field now holds, and `D4` makes
that decision depend on *why* each candidate was refused (`max`/`invalid` come back, `duplicate` and
`empty` do not). Reading it back off state would mean re-deriving the rule in a second place, and a
Solid 2.0 write is invisible to a plain read until the next flush, so the read would see the
pre-write list anyway. The returned `inputText` is the rule already applied.

This is **not** the boolean return `D4` rejects. That one was about the *consumer*-facing channel,
where a boolean cannot say why and `onReject` is the answer; this is the kernel handing its own part
hook a computed result.

### Separate `add(text)` and `addMany(texts)` entry points

**Why not:** the delimiter makes them the same operation — `add("apple")` is the one-part case of
`add("a,b,c")` — and two entry points is two places for the `max`/duplicate interaction to diverge.
The single-tag path costs one `split` returning a one-element array.

### `delimiter` on the input part hook, where the splitting happens

**Why not:** `D4` makes the overflow remainder **one joined string**, so the code that decides what
did not fit is the code that has to join it. Splitting it across two hooks would put `add`'s output
in one and the separator it must use in the other, and a mismatch between them (an input hook
splitting on `;` while the root re-joins on `,`) would silently corrupt exactly the text the user is
being asked to fix. The part reads `state.delimiter()` back to split.

### `delimiter: null` to turn splitting off

**Why not:** `withDefaults` resolves every default with `??`, so `null` is indistinguishable from
absent and would silently become `","` — the precise trap `withDefaults` exists to close, re-created
by an option whose "off" value is nullish. A tag containing the delimiter goes in through `setValue`
instead, which bypasses the whole pipeline by design.
**Revisit if:** a real case wants it, in which case `delimiter` resolves outside `withDefaults` with
an explicit `=== undefined` test, the way `createControllableState` distinguishes `null` from
uncontrolled.

### Holding the duplicate marker as the tag itself

**Why not:** `createSignal(fn)` builds a *memo* under Solid 2.0, so a signal over an unconstrained
`V` invokes a callable tag and stores its return value. Dodging that means boxing, the way
`createControllableState` does — but the marker only ever needs an identity to compare chips by, and
`itemToValue` already produces one that is a string, unique per tag, and stable across the array
being rebuilt. Pinned by the callable-`V` case in `tags-input-root.test.ts`.

### One `onReject` per tag lost to `max`

**Why not:** a twenty-address paste into three free slots would fire seventeen times, and a consumer
wiring `onReject` to a toast gets seventeen toasts for one mistake. It is one overflow; the remainder
is one string, and it is already in the field for the user to look at.

### Firing `"empty"` for each empty part of a split

**Why not:** `apple,` is how a delimiter commit *looks* — the user typed the separator and the field
is now empty. Rejecting the trailing part would fire a rejection on the happy path of the most common
gesture the widget has. `"empty"` fires once, and only when **every** part was empty.

### `items` as a separate option, mirroring `createListbox`

**Why not:** a tags input's chips are 1:1 with its value and always mounted, so a second list could
only ever be a copy of the first — and the two would drift the moment a controlled consumer moved
`value` without moving `items`. `createListbox` needs the split because its options exist while its
popup is shut; nothing here is ever unmounted-but-present.
