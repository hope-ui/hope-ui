# `createTagsInputItem`

One chip: a removable tag. Part of the [tags-input hook family](tags-input-root.md). It publishes its
element into the tag collection, names itself from its own text, and owns the **chip half** of the
keyboard map — the field half is `createTagsInputInput` (Phase 4).

```ts
function createTagsInputItem<V = string>(
  state: CreateTagsInputReturn<V>,
  props: JSX.HTMLAttributes<HTMLElement> & {
    ref: Accessor<HTMLElement | null | undefined>; // the chip element (a real signal accessor)
    item: V;                                       // the tag this chip renders
    // …plus any other HTML attributes to spread through
  },
): {
  props: Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> & {
    "data-active"?: string; "data-disabled"?: string; "data-duplicate"?: string;
  };
  isActive: Accessor<boolean>;
  isDisabled: Accessor<boolean>;
  isDuplicate: Accessor<boolean>;
  label: Accessor<string>;
};
```

`ref` is a control prop (the element accessor the hook reacts to); the consumer still wires
`ref={setRef}` on the element itself, and `props` omits `ref` so it can be spread onto any element.

**There is no `index` prop, and no `value` / `label` / `disabled` prop.** The chip is handed the tag
it renders and resolves everything else from the root: its position through `indexOfValue`, its text
through `itemToLabel`, its disabled state through `isItemDisabled`. Same shape as `Listbox.Item`, and
the same reason — the root already knows all of it.

## `resolveTagsInputItem`, the id scheme

This file also exports the helper the other three chip parts share:

```ts
resolveTagsInputItem(state, () => props.item)
// → { index, id, textId, deleteId }   — all accessors
```

Every id derives from the **collection's** generated id for that tag (`indexed.items()[index].id`),
by suffix: `<chip>`, `<chip>-text`, `<chip>-delete`. That is what lets `.ItemText` and `.ItemDelete`
point at each other with no per-chip context and no prop between them. The scheme lives in one place
on purpose: spelled out in three files, it breaks the ✕'s accessible name the first time one of them
drifts.

## ARIA

| Attribute | Value |
| --- | --- |
| `role` | `group`, component-owned |
| `aria-label` | the tag's text, falling back to the consumer's |
| `aria-disabled` | `"true"` on a disabled chip |
| `tabindex` | `-1`, **always**, component-owned (`D2`) |
| `data-active` | present while this chip is active *and* the widget holds focus |
| `data-disabled` / `data-duplicate` | the `isItemDisabled` / `D4` duplicate-flash state |
| `id` | the generated chip id, falling back to the consumer's |

`role="group"` needs an accessible name, and the chip's own text is it. Every other native attribute
is forwarded, and `onFocus` / `onKeyDown` are composed behind the consumer's, so their
`preventDefault()` cancels the built-in behavior.

## `tabindex` is a constant, and that is the divergence (`D2`)

Every other collection row in this kernel asks `focus.getItemTabIndex(item)`. This one never does —
the text field is the widget's single tab stop, so Tab crosses the whole control in one press
regardless of how many tags are in it. The focus instance is still used for everything else: which
chip is active, the deferred `.focus()` behind a move, and the re-homing that survives a removal.

A consumer's `tabindex` is dropped rather than forwarded, because honoring a `0` would put every chip
in the tab order — the exact cost `D2` exists to avoid. The browser test asserts both halves: the
attribute stays `-1` after navigation, **and** `focus.getItemTabIndex` is never called.

## Registration

```ts
createEffect(
  () => [handle.index(), props.ref()] as const,
  ([at, element]) => {
    if (at < 0 || !element) return;
    state.indexed.registerElement(at, element);
    return () => state.indexed.unregisterElement(element);
  },
);
```

Two details carry over from [`listbox-item.md`](../listbox/listbox-item.md) unchanged: the index is
**tracked in the `compute`** (it is a memo read, and reading it in the body is
`[STRICT_READ_UNTRACKED]`, which `mount()` fails a test on — and tracking it is what re-registers a
chip under its new index when a tag ahead of it leaves), and the teardown addresses the **element**,
never the index this run registered under.

One detail does not carry over: **a negative index is not warned about here.** `createListboxItem`
warns because an `item` outside `items` is an authoring mistake; a tags input's chips are rendered
*from* the tag array, so a transient `-1` is the normal frame in which a tag leaves the array before
`<For>` disposes its row. Warning on it would fire on every removal.

## Keyboard

| Key | Behavior |
| --- | --- |
| `Backspace` / `Delete` | remove this chip. **Auto-repeat allowed** |
| `ArrowRight` (LTR) | next chip; past the last ⇒ the text field |
| `ArrowLeft` (LTR) | previous chip; past the first ⇒ the text field |
| RTL | Left/Right swap |
| `Home` / `End` | first / last chip — logical, so RTL does **not** swap them |
| `Enter` | return focus to the field, `preventDefault()`. Neither commits nor submits |
| `Escape` | return focus to the field, **without** `preventDefault()` |
| printable | return focus to the field and let the character type there |

Disabled chips are skipped by navigation (`createListFocus`'s `skipDisabled`, on by default) and
refuse removal from every path — the hook checks, and `state.removeAt` checks again.

### Arrowing past the ends peeks rather than moves

`createListNavigation` is created with `wrap: false`, so `peekNext()` / `peekPrev()` answer `-1` at
the ends — that is the signal to call `state.focusInput()` instead of moving. Peeking rather than
moving-and-reading-back is load-bearing: a Solid 2.0 signal write is invisible to a plain read until
the next flush, so `navigation.next()` followed by `focus.activeIndex()` would report the chip the
user just left. `listbox-root.ts` uses the same trick for shift+arrow.

Left/Right are mirrored **here** rather than delegated to `navigation.onKeyDown`, which has no way to
redirect into the field.

### A printable key is not swallowed

The handler moves focus to the field and returns **without** `preventDefault()`. Focus moves during
`keydown`, so the browser dispatches the resulting text insertion to the newly focused element and
the character lands in the field — the key the user pressed is not lost. Base UI's
`ComboboxChip.tsx` does the same; React Aria's TagGroup has no equivalent, because it has no field to
type into.

## Removal, and which focus path runs (`D10`)

**Keyboard — inherited, not re-derived.** Backspace/Delete call `removeAt` and stop.
`createListFocus`'s re-homing effect notices the active row is gone, walks the *previous* ordering for
the nearest surviving focusable neighbor, and moves focus there. React Aria (`useListState`) and Base
UI (`getIndexAfterChipRemoval`) agree on that rule, which is why it exists as a primitive.

The one case it cannot answer is **no survivor** — the last chip, or nothing but disabled chips left
— where `setActive(-1)` leaves DOM focus on an element that is about to be destroyed and the browser
drops it to `<body>`. So the hook peeks **before** the removal (`peekNext() >= 0 || peekPrev() >= 0`)
and, when nothing survives, focuses the field afterwards. `peek` skips disabled chips on exactly the
terms the re-homing walk does, so the two never disagree about whether a survivor exists.

**Pointer** is the opposite ordering and lives in
[`tags-input-item-delete.md`](tags-input-item-delete.md).

## The highlight follows focus

`data-active` (and the returned `isActive`) is `focus.isActive(item) && focus.isFocused()` — the
active chip **only while the widget holds focus**, so the highlight never lingers after focus leaves.
`.List` drives the focus half; see [`tags-input-list.md`](tags-input-list.md).

`onFocus` syncs the active index to real DOM focus, `untrack`ed in full: `createListFocus` moves focus
from inside its own effect, so every read here would otherwise become a dependency of that effect.
Solid's `onFocus` binds the non-bubbling native event, so the ✕ inside the chip cannot reach it.

## SSR

Registration runs in an effect, which never runs server-side, so no chip publishes an element during
SSR. Everything else is a pure data read and **does** render: the role, the name, `aria-disabled`,
`tabindex` and every `data-*` are all correct in the server HTML, because the tag array is the data.

## Rejected alternatives

### Consulting `focus.getItemTabIndex()` like every other collection row

**Why not:** it returns `0` for the roving tab stop, which is exactly the tab order `D2` refuses. The
text field is the widget's single tab stop so that Tab crosses the whole control in one press; a
roving stop would cost one press per tag, and — because it is *also* what the SSR markup carries —
would cost it on a page that has not hydrated yet. The rest of the focus instance is still used.

### A dev warning when the chip's index resolves to `-1`

**Why not:** `createListboxItem` warns because a row whose `item` is outside `items` is unreachable
forever. Here the chips are rendered *from* the tag array, so `-1` is the normal frame in which a
removed tag has left the array and `<For>` has not yet disposed its row — the warning would fire on
every successful removal and teach readers to ignore it.

### Ignoring `event.repeat` on Backspace/Delete

**Why not:** holding Backspace to clear a row of chips is a real gesture, and a repeat guard breaks it
**silently** — every single-press test still passes. React Aria spells the opposite intent explicitly
(`allowRepeats: true` on the same two keys). Pinned by a browser test that dispatches keydowns with
`repeat: true`.

### Re-implementing the focus move after a keyboard removal

**Why not:** it already exists. `createListFocus` caches the previous key ordering and walks it
forward-then-backward for the nearest surviving focusable row, which is the rule both references
independently landed on. Re-deriving it here would mean a second copy that silently disagrees the
first time a disabled tag sits next to the removed one — the case the shared `isFocusable` check
already covers.

### `preventDefault()` on Escape

**Why not:** Escape has one meaning across the whole widget — it must reach an enclosing Dialog, the
line `createComboboxInput` already draws for the field. Claiming it on a chip would make
Escape-from-a-chip behave differently from Escape-from-the-field, and a user inside a dialog would
have to press it twice. The chip returns focus to the field *and* lets the key travel.

### `aria-labelledby` at the chip's own text element instead of `aria-label`

**Why not:** it would name the group from the element that already sits inside it, which reads the
same but breaks the moment a component renders decorative content (an avatar, a count) into the chip
alongside the text: the name would then be whatever the ✕ is *not* pointing at. `aria-label` from
`itemToLabel` is the one value that is right regardless of what the chip renders — and it is the value
the ✕'s second id resolves to anyway.

### Wiring `tagsInput.removeDescription` as an `aria-describedby` on the chip

**Why not:** React Aria attaches *"Press Delete to remove tag"* to the row **only for keyboard and
virtual-cursor modality** (`useTag.ts:96-104`), demoting it for touch — where the instruction is
false. Reproducing that gate needs an interaction-modality primitive this kernel does not have, and
the porting rule forbids a hand-rolled stand-in (a "last input type" guess), so shipping it means
building `createInteractionModality` with its own Definition of Done. Ungated, it reads a keyboard
instruction to every touch user on every chip — the harm the gate exists to prevent. It also needs a
rendered description element per chip, which the part anatomy has no part for. The i18n key ships
unused, the way `tagsInput.clearLabel` does until Phase 4.
**Revisit if:** `createInteractionModality` lands for another component — `createPress` already
distinguishes pointer from keyboard activation internally and is the natural place to lift it from.
