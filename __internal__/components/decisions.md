# `@hope-ui/components` — rejected alternatives

The component layer's decision log. `@hope-ui/primitives` and `@hope-ui/i18n` record their rejected
alternatives per file, in each primitive's usage doc; `@hope-ui/components` has no repo usage doc —
its API lives in the doc website (`apps/docs/`) — so its rationale collects here instead, keyed by
component rather than by file. Rules and entry shape: `__internal__/definition-of-done.md`
§ *Rejected alternatives*.

Two reasons it is one file rather than one section per component. A component is assembly + theme,
so its *behavior* rationale belongs to the primitive it composes, which already carries an enforced
section — a per-component rule would be answered by an escape hatch nearly every time. And the
decisions that are genuinely the component layer's are mostly **cross-cutting**: they were settled
once, on one component, and every later component inherited the answer.

Architecture rationale never goes in `apps/docs/`. That is the public API reference; this is not
for end users.

**This log is not enforced** — there is no per-file anchor to hang a check on. It is author
discipline, and it is seeded, not exhaustive: it holds the decisions recoverable from git history at
the time it was written, not every decision ever made.

## Cross-cutting

### `cx(ctx.slots.item(), props.class)` — appending the consumer's class after the slot fn
**Why not:** That second concat sits *outside* the recipe's `{ class }` seam, so tailwind-merge
never sees the consumer's utility and both conflicting classes ship, with the winner decided by
stylesheet order. `<Dialog.Content class="rounded-none">` shipped `rounded-xl` **and**
`rounded-none` while the docs promised the consumer's utility wins. The class now goes *through* the
slot fn as its argument — `ctx.slots.item(props.class)`, root `slots.root(merged.class)` — and `cx`
is no longer imported anywhere in the package; every import of it existed only for this pattern.
Enforced by `pnpm check:class-forwarding` plus a runtime pin, because every instance of this bug
family has been silent (a passing typecheck, a green suite, and docs promising the opposite).

### A root-only `class` option on `useSlots`
**Why not:** It had no slot to apply to on a component with no `root` slot — `DialogRootProps.class`
was a silent no-op. Removed with the slot-fn change above rather than special-cased.

### Reflexive `children()` on every component-capable slot
**Why not:** Each one adds a memo and shifts `_hk`, which is a path through the component tree — so
a blanket rule perturbs hydration keys on slots that never needed it. The operative trigger is
narrower than it first looked: **read more than once** in a render. A slot read exactly once needs
nothing, `<Show>` or not. Full procedure: `__internal__/solid-2.0-notes.md`.

### Per-part themeable props on multi-part components
**Why not:** A multi-part component keeps its themeable surface on the **root**, so a preset has one
place to reach (`defaultProps.calendar.prevIcon`) and a part cannot disagree with its own root.
Calendar's nav glyphs and Listbox's check glyph are both factories on the root's themeable props,
flowed to the parts through context.

### Glyphs defined at module scope in the component that uses them
**Why not:** A glyph defined locally cannot be overridden app-wide through the preset, only per
instance. Centralizing every built-in glyph into `src/icons/` (one self-contained `<svg>` per file
plus a barrel) is what let the check, chevrons, close X, loader and the four Alert status icons all
become preset-overridable. Scattered across five files they were not addressable at all.

## Alert

### `<Show>{(_present) => untrack(() => …)}</Show>` as the children owner
**Why not:** A compound `Root` that renders a styled element must resolve consumer children in an
owner **under** the provider, or the parts' `useContext` throws. The `untrack`/`_present` callback
blob achieved that, but only as a side effect of `<Show>`'s callback form. A real `AlertBody`
component declared inside `Root` gets it directly: its body runs once, needs no `untrack` hack, and
closes over `Root`'s locals — and the wrapper is `_hk`-transparent, so hydration is unaffected.

### An `AlertBody` at module scope
**Why not:** Everything it closes over would have had to be threaded through props instead.
Declaring it inside `Root` is what makes the prop boilerplate unnecessary.

### Hand-rolled `data-slot` + slot-class markup for the auto-composed body
**Why not:** It made the auto path and the compound path two different implementations that had to
be kept in step — including two ARIA-linking mechanisms (`autoTitleId`/`autoDescriptionId`
pre-generation plus a `composed()` linker) for one job. Building the auto body from the real
`Alert.Icon`/`Content`/`Title`/`Description`/`Close` parts collapsed both paths into one: the parts
self-register their ids, and the pre-generation and linker were deleted outright.

### `data-state` for the presence lifecycle
**Why not:** The base preset reserves `data-presence` for the overlay lifecycle enum
(`entering|entered|exiting|exited`) with matching `data-entering`/`-entered`/`-exiting`/`-exited`
custom variants, deliberately separate from `data-state`. Alert wrote presence to `data-state` and
keyed its exit fade on a raw `data-[state=exiting]:` arbitrary variant, bypassing the preset and
diverging from Dialog's convention.

## Button

### Reading a JSX-as-prop slot raw
**Why not:** A JSX-element prop compiles to a lazy getter that runs `createComponent` on every read.
`loadingText` was read three ways in one render (loader placement, label gate, label render), so a
bare-element `loadingText` was constructed up to 3× and the extras discarded. Routing it through
`children()` once and reading the memoized accessor everywhere is pinned by
`button-slot-resolution.browser.test.tsx`, which counts real constructions — without it a
reintroduced raw multi-read is silent.

### Retuning `{role}-ghost-hovered`/`-pressed` instead of adding the `adaptive` variant
**Why not:** In hope's theme those tokens are the role's `-soft` shade (success = green-100 light /
green-950 dark), which is right for a ghost button on a neutral surface — and is *exactly* the
background of a `soft` Alert, so a `ghost success` button inside one washes to the alert's own fill
and hover appears to do nothing. Deepening the ghost ladder to survive that nesting would over-paint
the far more common untinted case, and no fixed shade can be correct on a surface the token author
has never seen. `adaptive` inverts the dependency: it asserts no color, so the surface supplies it.
The two are siblings, not replacements — `ghost` carries a role color on a neutral surface,
`adaptive` takes the surface's own on a tinted one.

### A `colorScheme: "inherit"` member rather than a new variant
**Why not:** It would make one axis mean two things — six members naming a role, one naming a
mechanism — and every `Record<ButtonColorScheme, …>` in every preset would owe an entry that cannot
have one. `adaptive` is a variant for the same reason `default` is: both are color-*independent*,
and the variant axis is where a recipe already expresses that.

### An `adaptive` variant that still honours `colorScheme`
**Why not:** `colorScheme` defaults to `primary`, so a plain `<Button variant="adaptive">` would
render violet text and lose the inherit-from-surface property that is the entire point. It would also
be a strictly worse `ghost` rather than its complement. Focus is deliberately *not* special-cased
either: `focus-halo` is violet in the light theme, so an `adaptive` button focused on a `bg-success`
surface gets a violet ring — CloseButton's existing, settled behavior (see *A bespoke `close-focus`
token* below), not a new question.

## CloseButton

### A `variant` / `colorScheme` axis
**Why not:** It would make every consumer configure what the surface already determines. The glyph
inherits `currentColor` and the hover/press wash and focus ring derive from it, so the control reads
correctly on light, soft, solid and dark surfaces with no configuration. Size (`sm|md|lg`) is the
only axis.

### Semantic tokens named after the component
**Why not:** `close-overlay-hovered`/`-pressed` were the only semantic tokens in the vocabulary named
after a single component, and `close-overlay-*` collided with the existing `surface-overlay`. They
became `surface-adaptive-hovered`/`-pressed` (values unchanged) — a token vocabulary is swap-safe
only if a third-party preset can implement it without knowing which component spends each token.
Button's `adaptive` variant is that rename paying off: a second component spends the pair with no
import from, and no knowledge of, CloseButton.

### A bespoke `close-focus` token
**Why not:** A close affordance has no reason to focus differently from every other control. Dropped
in favour of the shared `focus-halo` ring, the same one Button uses.

## Dialog

### A bespoke close button inside Dialog
**Why not:** It would have been a second implementation of an icon-only, self-labelling, surface-
adaptive button. `Dialog.CloseTrigger` **is** a `CloseButton` (it extends `CloseButtonProps`), and
`createDialogCloseTrigger` was slimmed to own only the close `onClick` — `type` and the label come
from `CloseButton` + `createButton`.

The accepted cost is that `Dialog.CloseTrigger` now requires a `ThemeProvider`, and the repo rule that a
component may import a sibling component's subpath dates from this change. Its two constraints — no
circular component imports, and never couple a component's behavior to a heavier sibling — are what
keep that from becoming a licence to compose anything with anything.

## Select

### A `Select.Item index` prop, so virtual mode works
**Why not:** `index` is a *mechanism*, not information the author has, and the whole reason
`Select.Item` takes `item` is that a row can then sit anywhere in the subtree — which is what makes
grouping a plain nested `<For>` rather than a library-emitted wrapper. Reintroducing `index` for the
one mode that needs it would put both on the public surface and make "provide exactly one of" the
API's first sentence.

The cost is real and is paid deliberately: **Select has no virtual mode.** `indexOfValue` is `-1` by
construction in virtual mode, so an item-only row could never register there — it would dev-warn per
row and silently do nothing. So `estimateSize`/`overscan` are `Omit`-ted from `SelectRootProps`,
which turns that into a compile error instead. A virtualized picker is `Listbox`'s job, and
`Listbox.Item` keeps its `index` for exactly this reason.

**Revisit if:** a virtualized Select is actually asked for. The honest shape would be a separate
`Select.VirtualItem` part, not a second meaning for `item`.

### A `matchTriggerWidth` recipe variant, mirroring Popover's `matchAnchorWidth`
**Why not:** Popover has two genuinely competing widths (shrink-wrapped, or pinned to the anchor),
which is why its recipe spends compound variants keeping the losing one from ever being emitted. A
Select has **one**: the popup matches the trigger, always. Making that an axis would introduce the
base-width-beaten-by-a-variant-width override that machinery exists to prevent, in exchange for an
option nobody picking a Select wants. `w-(--anchor-width)` therefore sits alone in the `positioner`
base, and a consumer who needs something else overrides that slot.

### A `placeholder` recipe slot for the empty value
**Why not:** Nothing extra is *rendered* when the selection is empty — the same element shows
different text — so a slot would be a second class list for one element. `createComboboxValue`
already writes a present-empty `data-placeholder`, so the recipe styles one `data-placeholder:`
variant on the `value` slot. Same argument Listbox's contract makes against a `selectionMode` variant:
a state is not a slot.

### Deriving `Select.List`'s iteration from `state.list.indexed` instead of putting `items` on context
**Why not:** The kernel's source is **flattened** into navigation order, which is exactly what the
keymap needs and exactly what `Select.List` must not iterate — the group boundaries are gone from it.
`createDataCollection` does expose a `groups()` accessor, but it is not on the abstract
`IndexedItemSource` the listbox return is typed at, so reaching it means casting the source back to a
concrete implementation inside a component. The consumer's own array is the only place the grouped
shape still exists, so `Select.Root` puts it on the context and `Select.List` iterates that —
`Listbox.Root` already iterates its own `merged.items` the same way.

## TagsInput

Settled **before** any TagsInput code was written, because a decision is free to change as a doc and
expensive to change as shipped code. Two references were on the table and neither solves the
combination: Base UI's chip row is welded to Combobox and cannot hold a value the popup never offered
(so it cannot do email entry), and React Aria's TagGroup-plus-ComboBox is a Storybook story rather
than a component, with no keyboard bridge between the input and the chips. Every divergence from
either is recorded below.

The decisions carry the ids `D1`–`D12`, which the part hooks, their usage docs and the build's
validation gates all cite:

| id | Decided |
| --- | --- |
| D1 | `TagsInput.List` is `role="toolbar"`; each chip is `role="group"` named from its own text; the ✕ is a real `<button>` with `aria-labelledby="<own id> <itemText id>"` → *"Remove Apple"* |
| D2 | The **input is the widget's single tab stop**; chips are always `tabindex="-1"`, reached by ArrowLeft from a caret at position 0, or by pointer |
| D3 | The tag type is a generic `V`, with `parse` **conditionally required** for any `V` other than `string` |
| D4 | A rejected add fires `onReject({ reason, text })` with `reason: "duplicate" \| "max" \| "invalid" \| "empty"`; `parse` is the single normalization seam; equality is literal by default |
| D5 | Enter commits when the input has text and is **unbound when it is empty**, so the enclosing form still submits; an in-progress IME composition returns before anything else |
| D6 | Native submission is **one `<input type="hidden" name={name}>` per tag**, plus one clipped `required` text input, reusing `createHiddenSelect` unchanged |
| D7 | Field wiring (label / description / error linking) waits for `createFormControl`; TagsInput takes `aria-describedby`, `aria-invalid`, `invalid`, `required`, `readOnly` and `disabled` as ordinary props now |
| D8 | `TagsInput.ItemDelete` is its own part, **not** a `CloseButton` |
| D9 | The live region is container attributes on `TagsInput.List` (`aria-live="polite"` only while focus is within, `aria-relevant="additions"`, `aria-atomic="false"`), not `createAnnounce` |
| D10 | Keyboard removal lets `createListFocus`'s re-homing move focus to the survivor; a pointer removal clears the active index **first**, then focuses the input |
| D11 | `ItemDelete` / `List` / `Control` — the repo's existing row and container vocabulary |
| D12 | The three `tagsInput` i18n strings are **written** per locale, not ported from React Aria's `intl/tag/` JSON |

The ARIA shape D1 lands, so the entries below read against something concrete:

```html
<div role="toolbar" aria-live="polite" aria-relevant="additions" aria-atomic="false">
  <div role="group" aria-label="Apple" tabindex="-1" data-active>
    <span id="t0-text">Apple</span>
    <button id="t0-del" tabindex="-1" aria-labelledby="t0-del t0-text">✕</button>
  </div>
</div>
<!-- a plain textbox, deliberately not role="combobox" -->
<input aria-label="Add a tag" />
```

### `role="list"` / `listitem` on the chip row, or role-less `div`s (D1)
**Why not:** NVDA and JAWS intercept arrow keys in *browse mode* and only hand them to the app in
*focus mode*, which they enter for `grid` / `toolbar` / `listbox` / `menu` / `tree` — not for a plain
`div`, and not for `list`/`listitem`. A role-less chip row cannot be arrowed through by a Windows
screen-reader user, and every keyboard test still passes. That silence is why both references reach
for an unusual role, and why the row carries `toolbar` rather than the semantically tempting `list`.

### React Aria's `role="grid"` / `row` / `gridcell` for the chip row (D1)
**Why not:** `useTagGroup` composes `useGridList` + `useGridListItem` wholesale, so the porting rule
(*port the hooks a reference composes; never substitute a narrower hand-rolled stand-in*) makes
`createGridList` — over the existing `create-grid-navigation.ts`, with its own test, usage doc and
rejected-alternatives section — a prerequisite build before any TagsInput code. What that buys is a
positional announcement and Tab-between-two-focusables-inside-one-row. The ✕'s *"Remove Apple"* label
is **identical** in both shapes (`useTag.ts:126` spells the same `aria-labelledby` pair), the
positional count adds nothing over the name for a row whose only action is "remove this one", and a
chip holds exactly one focusable. The grid shape also needs `display: contents` on the row to keep the
horizontal flex layout, which is load-bearing and historically fragile in browser accessibility trees.
The accepted cost: a chip announces as a named group rather than "row 1 of 3". The payoff is that the
chip row composes **only shipped primitives** — `createDataCollection` + `createListFocus` +
`createListNavigation` + `createButton` — so TagsInput adds no kernel row.
**Revisit if:** a chip ever needs two focusables (a clickable label plus the ✕). That is the trigger
to build `createGridList`, not this.

### Grid roles hand-rolled over `createGridNavigation` (D1)
**Why not:** Exactly the shape the porting rule forbids — a narrower stand-in for the hooks the
reference composes. It would ship only with a written exemption, and the semantics it buys are the
ones already rejected above.

### A roving tab stop on the chip row (D2)
**Why not:** Tab must cross the whole field in one press. `createListFocus.getItemTabIndex()` is
therefore deliberately **not** consulted — the hook is used for the active item, the deferred
`.focus()` and the focus re-homing after a removal, never for the tab order. This is the rule Combobox
already pins in its SSR test: *the input is the widget's single tab stop, server-side too — otherwise
a page that has not hydrated yet takes three Tab presses to cross one field.*
**Divergence from React Aria:** its TagGroup makes tags tabbable because it is standalone and has no
input to own the tab stop. Matches Base UI.

### `string`-only tags (Zag's shape) (D3)
**Why not:** Simpler surface, but the multi-select Combobox integration would then have to stringify
`V` and keep its own value→item map to render labels and to deselect, so the composition stops being
plain; display-text ≠ stored-value becomes impossible, which is what email chips need. With a generic
`V` the integration renders `state.list.value()` and the ✕ calls `selection.deselect` with no
stringify or lookup map in between. `createTagsInput<V>` takes `itemToValue` / `itemToLabel` /
`isItemEqualToValue` — the kernel's one equality vocabulary — plus `parse` for the text→tag direction,
and the conditional type is what keeps a string from silently masquerading as `V`:

```ts
type ParseProp<V> = string extends V
  ? { parse?: (text: string) => V | null }
  : { parse: (text: string) => V | null };
```

`parse` defaults to `(text) => text.trim() as V`, correct for `V = string`; an object tag with no
parser is a compile error. Returning `null` rejects the text as D4's `"invalid"`. The cost is that
every part hook carries `<V>` and object tags owe one more prop. React Aria's TokenField carries
`{ text, value? }` per token for the same reason, and its own source admits the lookup direction is
unfinished.

### A silent no-op on a rejected add (D4)
**Why not:** The user's Enter appears to do nothing, and there is no channel to say "already added" /
"limit reached". `onReject({ reason, text })` is that channel, with four reasons — `"duplicate"`,
`"max"`, `"invalid"`, `"empty"`. The input text is then **kept** for `max` / `invalid` (the intent is
unmet and the user can fix it) and **cleared** for `duplicate` (the value is already on screen as a
chip, and the *existing* chip carries `data-duplicate` until the next input event or the next
successful add, so the recipe can flash it).

### A boolean return from the add call (D4)
**Why not:** A boolean cannot say *why*, and a Solid component API has no natural return channel for
what is an event.

### All-or-nothing paste when the paste would exceed `max` (D4)
**Why not:** It throws away a 20-address paste over one overflow. The accepted shape is
**partial-accept** up to the limit, with the remainder going back into the input joined by the
delimiter, plus one `onReject("max", remainder)` — TokenField's "the trailing empty part stays
editable" idea, so the user sees exactly what did not fit and can act on it.

### A separate `sanitize` / `sanitizeValue` prop beside `parse` (D4)
**Why not:** Two normalization seams drift — one runs on paste but not on typing, or vice versa.
`parse` is the **single** seam (default `text.trim()`), serving both typing and pasting, which is the
transferable idea from TokenField's tokenizer.

### Case-folding in the default duplicate check (D4)
**Why not:** `"Apple"` and `"apple"` are two distinct keywords, and folding two distinct email
addresses into one is a bug. The default stays literal —
`isItemEqualToValue ?? (a, b) => itemToValue(a) === itemToValue(b)` — and the seam to change it is
`isItemEqualToValue`, which the kernel already speaks.

### Zag's `allowOverflow` — accept past `max` and mark the field invalid (D4)
**Why not:** It makes `max` advisory and pushes the invalid state onto the consumer, who today has
nowhere to put it (see D7: nothing in this catalog wires `aria-invalid` yet).
**Revisit if:** `createFormControl` lands and `aria-invalid` is wired — a soft max becomes expressible
then.

### Enter mapped to a commit unconditionally, React Aria TokenField's shape (D5)
**Why not:** TokenField can, because its whole content model is one `contentEditable`; a TagsInput
inside a `<form>` cannot — swallowing Enter on an empty input breaks form submission. The map is
therefore: an in-progress IME composition **returns first, before anything else**; Enter with text
commits and calls `preventDefault()`; Enter on an empty input is **unbound with no `preventDefault()`**
so the form submits; Enter on a focused chip returns focus to the input and commits nothing. The
empty-input rule is the same line `createComboboxInput` already draws for a closed combobox. The IME
guard checks **both** channels — `textInput.isComposing()` is `createTextInput`'s own truth,
`keyCode === 229` is the legacy/Safari backstop Base UI checks in `ComboboxInput.tsx` — because
committing on a CJK candidate confirmation turns a half-typed word into a tag.

### `blurBehavior` defaulting to `"add"` (D5)
**Why not:** Clicking a chip's ✕ blurs the input, so `"add"` would commit a half-typed draft as a side
effect of deleting a *different* tag. `blurBehavior?: "keep" | "add" | "clear"` defaults to `"keep"`.

### One delimited hidden value, `"a,b,c"` (D6)
**Why not:** A tag containing the delimiter corrupts the submission silently, and the server re-parses
what the client already parsed. One `<input type="hidden" name={name}>` per tag submits
`tags=a&tags=b`, read back with `FormData.getAll("tags")` — how HTML expresses a repeated field.

### `HiddenSelect` for the hidden form value (D6)
**Why not:** It needs an `<option>` set, and a TagsInput has none — its values are authored by the
user rather than chosen from a list. The *hook* is reused unchanged: `createHiddenSelect` is already
element-agnostic (`HiddenFormControl = HTMLSelectElement | HTMLInputElement`) and owns exactly the two
behaviors needed — the form-scoped `reset` listener restoring `defaultValue`, and cancelling the
`invalid` report so focus lands somewhere visible. `required` is the clipped
`<input type="text" required tabindex="-1">` whose value is empty exactly when the tag list is, which
`hidden-select.tsx`'s fallback path already does. So no new primitive.
*Follow-up, not in scope:* `createHiddenSelect` is now a misnomer; a rename to `createHiddenFormField`
would be a pure rename plus a doc move.

### No hidden form value at all, Combobox's answer (D6)
**Why not:** Combobox's reason is that it holds the *filtered* option set, so a hidden field would drop
options as the user typed. A TagsInput holds exactly what it will submit, so the reason does not
transfer.

### Pulling `createFormControl` forward, ahead of TagsInput (D7)
**Why not:** It is a **gated adopt** of `@solid-primitives/a11y`, and the gate is a hydration
round-trip on a `Field` component that does not exist yet — so pulling it forward turns a bounded
component build into "build Field, clear the gate, and rebuild in-repo effect-only if it fails", a
sequencing risk on TagsInput's critical path with no upside for the chip row. TagsInput's own ARIA is
complete without it: the chip names, the ✕ labels and the live region are TagsInput's, while
`createFormControl` adds *field* chrome (label / description / error linking) shared with Input,
Textarea, NumberInput, Select, Combobox and Listbox — a cross-cutting retrofit, cheaper done once
across six components than special-cased on one. Select, Combobox and Listbox wire no
`aria-describedby` and no `aria-invalid` today; TagsInput joins that queue rather than forking it.
The mitigation is part of the plan: `createTagsInput` takes `aria-describedby`, `aria-invalid`,
`invalid`, `required`, `readOnly` and `disabled` as ordinary props now, resolved with the repo's
`props.x ?? computed` fallback rule, so the retrofit is a wiring change rather than an API break.

### `TagsInput.ItemDelete` rendering `@hope-ui/components/close-button` (D8)
**Why not:** `Dialog.CloseTrigger` and `Alert.CloseTrigger` both do, and the chip ✕ cannot, because it
needs three things CloseButton cannot express: `aria-labelledby="<own id> <itemText id>"` →
*"Remove Apple"* (CloseButton's label is a flat `common.close` with no way to compose the row's text);
`tabindex="-1"`, since the chip row is not in the tab order (D2) while CloseButton is a real tab stop;
and metrics tied to `tagsInput`'s `size` rather than `closeButton`'s independent `sm`/`md`/`lg` axis,
whose `sm` is already a 24px box with a 16px glyph — too large inside an `sm` chip. The accepted cost
is one more slot pair on the `tagsInput` recipe (`itemDelete` + `itemDeleteIcon`), and a preset that
restyles CloseButton app-wide does not reach chip ✕s. A deliberate divergence from the two shipped
`CloseTrigger` parts.

### `createAnnounce` for the added-tag announcement (D9)
**Why not:** It appends its regions to `document.body` outside the tree and announces a *message you
compose*. That is right for Calendar's "3 dates selected"; here the thing to announce is the chip
element that just appeared, and `aria-relevant="additions"` announces it verbatim with no string to
compose and none to localize. So `TagsInput.List` carries the container attributes directly —
React Aria's `useTagGroup.ts:154-162`, which Base UI has no analogue for. Removals need no
announcement: the focus move is the announcement. `aria-live` is gated on focus-within so an
*external* value change (a server push, a `<Combobox>` pick made elsewhere) cannot talk over the user.

### Letting the focus re-homing effect run during a pointer removal (D10)
**Why not:** With a non-negative active index, the re-homing effect fires on the collection change
and — in roving mode — sets `pendingFocus`, yanking DOM focus onto a survivor chip while the user
expects to keep typing. So a ✕ click calls `focus.focusIndex(-1)` **before** the removal (making that
effect return early on `activeAt < 0`), removes, then focuses the **input**; it mirrors Base UI's
`clearActiveIndexForRemovedItem` + `inputRef.current?.focus()`. Keyboard removal is the opposite: let
`createListFocus`'s re-homing move focus to the survivor, and **verify TagsInput inherits it rather
than re-deriving it** — React Aria (`useListState.ts:105-148`) and Base UI
(`getIndexAfterChipRemoval`) agree, which is why that re-homing exists as a primitive at all.
**Divergence from React Aria** on both counts: it leaves focus on the row after a pointer removal and
focuses the *container* when the row empties (`useTagGroup.ts:143-150`). Both are right for a
standalone TagGroup with no input; a TagsInput has one, and it is where typing continues.

### Wrapping arrow navigation at the ends of the chip row (D10)
**Why not:** React Aria's TagGroup wraps (`shouldFocusWrap: true`) because there is nowhere else for
focus to go. Here there is: `wrap: false`, and arrowing past either end returns to the **input** —
implemented by peeking (`navigation.peekNext() < 0` → focus the input) rather than moving-then-reading,
because a Solid 2.0 signal write is invisible to a plain read until the next flush. `listbox-root.ts`
uses the same trick for shift+arrow. Base UI does not wrap either.

### `ItemDeleteTrigger` (Ark) or `ChipRemove` (Base UI) for the ✕ part (D11)
**Why not:** The `Item*` prefix is already the repo's shared row vocabulary (`ItemText`,
`ItemIndicator`), and `Combobox.Clear` shows the `Trigger` suffix is not required on every action
button. `List` for the chip container matches `Combobox.List` / `Select.List` as "the collection
container", and `Control` for the bordered shell matches `Combobox.Control`.

### Porting React Aria's `intl/tag/` translations for the three `tagsInput` strings (D12)
**Why not:** It ships them for 34 locales, but copying that JSON makes `@hope-ui/i18n` an Apache-2.0
derivative owing an `@license` header, a `NOTICE.md` row in two places and `LICENSE-APACHE-2.0.txt` in
the package — for three short functional strings hope can write itself in the twelve locales it
actually ships. Reproducing the *idea* of a keyboard-only remove description owes nothing. The keys are
`tagsInput.removeLabel`, `tagsInput.removeDescription` and `tagsInput.clearLabel`; contract and
per-locale rationale live in `__internal__/i18n/`, and `CLAUDE.md` § Third-party attribution is the
rule this follows.
