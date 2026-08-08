# `createTagsInputInput`

The text field of the [tags-input hook family](tags-input-root.md): the widget's single tab stop, the
only place text becomes tags, and the bridge into the chip row.

```ts
function createTagsInputInput<V = string>(
  state: CreateTagsInputReturn<V>,
  props?: Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue"> & {
    value?: string;                            // controlled draft text
    defaultValue?: string;                     // uncontrolled initial draft, default ""
    onValueChange?: (value: string) => void;
    blurBehavior?: "keep" | "add" | "clear";   // default "keep"
  },
): {
  props: Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "ref">;
  setRef: (element: HTMLInputElement) => void;
  value: Accessor<string>;
  setValue: (value: string) => void;
  isComposing: Accessor<boolean>;
};
```

`value` here is the **draft text** — the half-typed tag — not the tag list. The tag list is the root's
`value`, and the two never mix: text only becomes a tag through `state.add`.

`setRef` does two jobs, and dropping it breaks both silently. It registers the element as
`state.inputElement()`, which is what `state.focusInput()` focuses — so every `D10` path and every
arrow-past-the-end no-ops without it — and it hands the element to `createTextInput`, whose reconcile
effect owns every write to `input.value` after the first.

## Keyboard (`D5`)

| Key | Behavior |
| --- | --- |
| printable | types |
| the delimiter character | commits what is in the field; **never typed literally** |
| `Enter`, field has text | commit, `preventDefault()` |
| `Enter`, field empty | *unbound, no `preventDefault()`* — the enclosing form submits |
| `Backspace`, field empty | remove the **last** chip, one step |
| `Backspace`, field has text | *unbound* — it deletes a character |
| `ArrowLeft` at a collapsed caret 0 with tags present (LTR) | focus the **last** chip |
| `ArrowRight` in the same position (RTL) | the same, mirrored |
| `Home` / `End` / `Delete` | *unbound* — the field's own caret keys |
| `Escape` | *unbound* — it must reach an enclosing Dialog |
| paste | splice at the caret, then commit the whole field |

Consumer handlers compose in front of every one of these (`composeEventHandlers`), so a
`preventDefault()` in `onKeyDown` cancels the whole map at once.

### The IME guard returns before anything else

```ts
if (textInput.isComposing() || event.keyCode === 229) return;
```

A CJK candidate confirmation arrives as `Enter`, so committing on it turns a half-typed word into a
tag. **Both** channels are checked: `isComposing()` is `createTextInput`'s own truth, tracked from
`compositionstart`/`compositionend`; `keyCode === 229` is the legacy backstop for Safari and older
WebKit, which report an IME-consumed key that way before `isComposing()` has flipped. Base UI checks
the same value in `ComboboxInput.tsx`. No test that types ASCII can ever catch a regression here,
which is why both channels have their own browser test.

### Enter on an empty field is deliberately unhandled

No binding and no `preventDefault()`, so a tags input inside a `<form>` still submits it — the same
line `createComboboxInput` draws for a closed combobox, and pinned the same way: by asserting a real
`submit` handler fires. Enter *with* text commits and cancels, so the one key never does both.

### The delimiter is a commit key, not a character

It always `preventDefault()`s, so the delimiter never lands in the field as literal text. With nothing
typed there is nothing to commit and **no rejection to report** — a stray comma just disappears rather
than firing `onReject("empty")` once per keypress. `"empty"` is reserved for *"you asked to commit
nothing"*: whitespace-only text on Enter, or a direct `state.add("")`.

The character compared against is `state.delimiter()`, read back per keystroke. A delimiter longer than
one character never matches a keypress (`KeyboardEvent.key` is one character for printable input), so
such a widget commits on Enter and on paste only.

### The bridge arrow flips with the reading direction

The arrow that reaches the chip row is the one moving the caret **toward the start of the text** —
ArrowLeft in LTR, ArrowRight in RTL. It is mirrored by hand here rather than delegated to
`navigation.onKeyDown`, because that handler stops at the ends and has no way to redirect into a text
field. The row itself applies the same flip through `createListNavigation`'s `textDirection`, so both
sides of the boundary agree.

The guard is a **collapsed** caret at 0 (`selectionStart === selectionEnd === 0`): with a selection
running back to the start, the arrow is still collapsing it, and jumping to a chip would swallow that.
It lands via `navigation.last()`, so a disabled tail chip is skipped on the way in.

## Every path funnels through `state.add`

Enter, the delimiter key, a paste and a blur commit all call `state.add(text)` and assign the
`inputText` it hands back. `D4`'s policy — the split, `parse`, the dedupe, the `max` partial-accept,
and which text survives a rejection — is decided once in the root; a path that reimplemented any part
of it would drift from the other three. **Paste is the case that proves it:** the accepted tags appear,
the remainder comes back joined by the delimiter, and `onReject("max", …)` fires **once** with the
whole tail, with none of that logic living here.

A paste is spliced into the draft at the caret before committing, so pasting `ple,Banana` after typing
`Ap` produces the same tags typing it would have.

## Focus-within is the widget's, not this element's

This is the half `createTagsInputList` deliberately left open. That element observes focus crossing
*its own* boundary, so focus leaving the **field** for good is a transition it has no event for; this
hook owns the mirror:

- `focus` → `state.focus.setFocused(true)`.
- `blur` → defer, then ask *"is the active element this field, or inside `state.listElement()`?"* If
  not, `setFocused(false)` and apply `blurBehavior`.

Both parts read the *other's* element off the root, which is why `listElement` and `inputElement` are
readable there. Without the pair, `aria-live` stays `"polite"` forever once the user has typed once,
and the chip highlight lingers after they tab away.

**Deferred rather than read off `event.relatedTarget`**, for the reason `calendar-group.ts` measured:
removing a chip destroys the element that had focus, which blurs with a null `relatedTarget` — at that
instant indistinguishable from tabbing away — and the focus re-homing that follows lands in the same
flush. The whole body is `untrack`ed, because `createListFocus` moves DOM focus from inside its own
effect, so a plain read here would become a dependency of that effect (`[STRICT_READ_UNTRACKED]`,
which `mount()` fails on).

### Arriving at the field drops the chip highlight

`onFocus` also calls `focus.focusIndex(-1)` — `D10`'s invariant ("the caret is in the field, so no chip
is highlighted") applied to *every* arrival, not only the ones `state.focusInput()` routes. Without it,
tabbing away from a chip and back lands on the field — the widget's single tab stop — with a chip still
painting `data-active`, and Backspace-on-empty then refusing to remove anything because it sees an
active index.

## `blurBehavior`

Default **`"keep"`**, and it only ever runs on a blur that genuinely leaves the widget. Clicking a
chip's ✕ blurs this field, and `"add"` would commit a half-typed draft as a side effect of deleting a
*different* tag. The ✕ cancels its own `pointerdown` so focus never actually moves — but the rule must
not depend on that, so the same deferred check gates both the flag and the behavior.

The consequence worth knowing: focus that leaves the widget **from a chip** never re-blurs this field,
so `blurBehavior` does not fire on that path. The draft survives, which is the conservative outcome for
all three settings.

## Attributes

| Attribute | Value |
| --- | --- |
| `id` | consumer's, else `` `${state.id()}-input` `` |
| `type` | consumer's, else `text` |
| `disabled` / `readonly` | consumer's, else the widget's `D7` state |
| `aria-invalid` / `aria-describedby` | consumer's, else the widget's `D7` pass-throughs |
| `autocomplete` / `autocorrect` / `autocapitalize` / `spellcheck` | `off` / `off` / `none` / `"false"`, all `??` fallbacks |

`spellcheck` is the **string** `"false"`: it is an *enumerated* attribute, so a JS `false` serializes
to an absent attribute — and an absent one inherits, which on a text input means enabled. Same trap,
and the same fix, as `combobox-input.ts`. What it costs otherwise is macOS Safari autocorrecting a
half-typed email address into a different, valid-looking one.

**`required` is deliberately absent.** The field is empty the moment a tag is committed, so a native
`required` here would block every submit of a form that already holds three tags. `D6` puts it on a
clipped control whose value tracks the tag list instead (`HiddenTagsField`).

**There is no `role`,** and no built-in accessible name. An `<input type="text">` is already a
`textbox`; a redundant explicit role buys nothing. The name is the consumer's — an `aria-label` or an
`aria-labelledby` — the same obligation `createComboboxInput` documents, and axe `label` reports it
when a tree forgets.

## SSR

Every attribute is a pure read, and `createTextInput`'s `value` is a one-time untracked snapshot for
the initial markup — no effect writes it, so the server's HTML and the first client render agree. The
handlers attach on hydration; `setRef` never runs on the server.

## Rejected alternatives

### `createTextInput` created by the root and handed in as a control prop, the way `createComboboxInput` takes one

**Why not:** Combobox has a reason this family does not. Its `inputValue` is a *root-level* prop
because the filtered collection derives from it and has to be readable before the input part mounts —
so the instance has to exist one layer up (in Combobox's case, in the **component** root, which is
where `createTextInput` is actually called). `createTagsInput` deliberately owns no text value at all:
`tags-input-root.md` § "One entry point for text" is built on `add(text)` being the only way text
becomes a tag, and the root surface has no `inputValue`. Adding one to hand the input part a shared
instance would mean amending the shipped root with an `inputValue`/`onInputValueChange` pair that
nothing else reads, and moving draft-text state up a layer for no consumer.

Nor does the Combobox integration need it. That composition reuses the **chip row** hooks
(`createTagsInputItem` and friends) alongside `createComboboxInput`; it never renders this part, so
there is nothing for it to reach inside.

**Revisit if:** a later phase gives the root a text-derived concern — an async validator keyed on the
draft, say, or a suggestion list filtered by it. That is the same shape as Combobox's filter, and it
would move the instance up for the same reason.

### Highlight-then-delete: Backspace on an empty field marks the last chip, a second Backspace removes it

**Why not:** only the one-step form exists upstream — Base UI removes on the first Backspace
(`ComboboxInput.tsx:386-409`), and React Aria's TagGroup has no input to press Backspace in. A two-step
gesture would be ours alone to justify, it costs a second keypress on the common path, and nothing asks
for it. The safety it buys is already there: the tag is one `Ctrl+Z`-shaped `setValue` away for a
controlled consumer, and the removal is announced by the focus move.

### Committing on `Tab`, the way `createComboboxInput` does

**Why not:** those are different gestures. A Combobox commits the *suggestion it is already showing*,
so Tab-to-accept is unambiguous. Here Tab would turn arbitrary half-typed text into a tag purely
because the user moved on — the same objection that makes `blurBehavior` default to `"keep"`. A
consumer who wants it sets `blurBehavior="add"`, which covers Tab and the pointer-away case with one
rule instead of two.

### Reading the draft from `textInput.value()` instead of `event.currentTarget.value` in the keymap

**Why not:** a Solid 2.0 signal write is invisible to a plain read until the next flush, so a keystroke
and a commit landing in the same flush would commit the *previous* text. The DOM value is the user's
truth at the instant the key arrives, and every write still goes back through `textInput.setValue` so
the reconcile effect stays the single writer.

### Letting the input own the `required` attribute, and dropping `D6`'s clipped control

**Why not:** it would make a form with three tags unsubmittable, because the visible field is empty
exactly when the widget is at its most valid. Nothing fails loudly — the browser just refuses to submit
and points its validation bubble at a field the user considers finished.

### Handling the delimiter in `onBeforeInput` rather than as a keydown binding

**Why not:** `beforeinput` is where a *pasted or IME-inserted* delimiter would also surface, which
sounds like an advantage until it collides with the two paths that already handle those. Paste is
committed wholesale (with the caret splice and the `max` remainder), and an IME candidate containing a
delimiter must not commit mid-composition at all. Binding the keydown keeps the delimiter a
**keystroke** gesture and leaves the other two paths to the code that already owns them.
