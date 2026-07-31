# hope-ui build roadmap

The component surface to build, ordered by implementation complexity, plus the kernel primitives
still missing to support it.

This **supersedes the phase/build-order roadmap in [`__internal__/plan.md`](plan.md)** ("Button → Dialog →
Popover/Tooltip → Listbox"). That ordering was set at repo creation and no longer holds — `plan.md`
stays as the architecture/SSR/distribution reference, but the *order of work* is defined here.

**Positioning.** hope-ui is an **elegant, themeable, full-featured** component library for
**SolidJS 2.0** — the MUI/Mantine niche the Solid ecosystem is missing, not a headless/copy-paste
kit. You install it, import a component, and it looks great out of the box under the default
**`@hope-ui/presets/hope`** preset. The engine underneath is **Tailwind v4 + `tailwind-variants`**
recipes plus the multi-theme seam (`@hope-ui/theming`) — an implementation detail the consumer never
has to think about.

**How a component is built:** compose behavior from **`@hope-ui/primitives`** (hope-ui's own headless
kernel — **never** Kobalte or another headless lib), render each part through `renderElement`, and
compute its `class` from a `tailwind-variants` slot recipe read via `useRecipe`. Styling lives in the
theme; the component stays presentation-agnostic and forwards the consumer's `class`.

**Source of the component list:** aggregated from the catalogs of **Ant Design · Mantine · MUI ·
shadcn/ui · Nuxt UI** (§1 shows per-library presence) — the set apps need ~90% of the time — then
mapped onto hope-ui's kernel. It is no longer the Chakra v3 list.

**Standing decisions:**
- **Layout components — excluded.** No `Box`/`Flex`/`Stack`/`Grid`/…; consumers compose layout with
  Tailwind utilities (`class="flex flex-col gap-2"`). A deliberate departure from the style-props era.
- **Carousel — excluded.** Not building it.
- **Toast — a port of [Sonner](https://github.com/emilkowalski/sonner)** (emilkowalski/sonner), not a from-scratch design.
- Heavy/enterprise components (Data Grid, Charts, Rich Text Editor, date-range pickers, Tree View)
  are **deferred** — candidates for a later, possibly separately-versioned/commercial line.
- Every component ships the full Definition of Done (tests in the applicable Vitest projects, `.md`,
  a Storybook story, and — for anything with hydratable markup — the SSR + hydration round-trip).

**Status legend:** ✅ shipped (full DoD, styled) · ⚠️ exists but incomplete (needs rework or styling) ·
⛔ excluded · ★ Sonner port. A "kernel ready" note means the primitive is done but the component
isn't built — it carries no ✅.
**Complexity tiers:** **T0** static/styled · **T1** simple stateful · **T2** composite behavioral ·
**T3** collection/floating-heavy · **T4** specialist.

**Kernel & styling already in place** (per-component status lives in the §1 tables below — this is
infrastructure, deliberately *not* a growing component tracker):
- Kernel primitives: `createCollection`, `createVirtualCollection`, `createListFocus`,
  `createListNavigation`, `createListTypeahead`, `createListSelection`, `createListExpansion`,
  `createGridNavigation`, `createComponentContext`, `createControllableState`, `createDismissable`,
  `createAutoFocus`, `createFocusTrap`, `createFocusScope`, `createFocusRestore`,
  `createHideOutside`, `createScrollLock`,
  `createPresence`, `createFloating`, `createPress`, `createButton`, `createRegisteredId`,
  `createRegisteredElement`; utils `renderElement`, `withDefaults`, `composeEventHandlers`,
  `createKeyboardHandler`, `compareByIdOrReference`. Plus `ModalBackdrop`, the kernel's only
  DOM-rendering component.
- **Adopted, not in-repo:** `createAnnounce` (`@solid-primitives/a11y`) — the polite/assertive live-region
  announcer, in use by `createCalendar`. Call it directly rather than wrapping it; it is why #2 is retired.
- Styling / theming: **Tailwind v4 + `tailwind-variants`** via `@hope-ui/theming` (`tv`/`cn`/`cx` +
  `useRecipe` + the semantic-token contract); the default visual identity is **`@hope-ui/presets/hope`**.
  Dark mode via a `.dark` class. The recipe pattern is proven end-to-end — Button, Badge, Alert,
  CloseButton, and Dialog all consume it.

---

## 1. Component roadmap (by implementation complexity)

**Aggregated** from the catalogs of **Ant Design · Mantine · MUI · shadcn/ui · Nuxt UI**. The **In**
column = how many of those five ship an equivalent (a rough demand signal; hope-specific infra is
marked `infra`/`a11y`/`core`). Rows are ordered by hope's implementation complexity and mapped onto
`@hope-ui/primitives`. Layout components are omitted by decision (Tailwind utilities).

### T0 — Static / styled (no behavior; a recipe + a role/semantics)

**Layout is not here** — consumers compose layout with Tailwind utilities (see Standing decisions).

| Component | Category | In | Notes |
|---|---|---|---|
| Text · Heading · Code · Kbd · Blockquote | Typography | 5/5 | text semantics (Kbd/Code/Blockquote in Mantine/shadcn) |
| Separator | Utility | 5/5 | `role="separator"` |
| Icon | Media | 2/5 | SVG wrapper (Ant, Nuxt) |
| Badge ✅ · Tag *(display)* | Data display | 5/5 · 4/5 | Badge shipped; closable Tag → T1 |
| Card | Data display | 5/5 | |
| Avatar · AvatarGroup | Data display | 5/5 | image fallback |
| Alert ✅ | Feedback | 5/5 | `role="alert"`; compound + convenience, dismissible via `Alert.Close` |
| Skeleton · Spinner | Feedback | 5/5 · 4/5 | |
| Progress · ProgressCircle | Feedback | 5/5 · 2/5 | `aria-valuenow` |
| EmptyState | Feedback | 4/5 | |
| Timeline | Data display | 4/5 | |
| VisuallyHidden | Utility | a11y | screen-reader-only |

### T1 — Simple stateful (one piece of state, basic ARIA, controllable)

| Component | Category | In | Kernel deps | Notes |
|---|---|---|---|---|
| Button ✅ · IconButton · ButtonGroup | Buttons | 5/5 | `createPress` | Button shipped (press/keyboard via `createPress`); `iconOnly` covers icon-only buttons; ButtonGroup pending |
| CloseButton ✅ | Buttons | 2/5 | — | surface-adaptive; reused by `Dialog.Close` & `Alert.Close` |
| Input · Textarea · PasswordInput | Forms | 5/5 | `createFormControl`* | |
| Checkbox · CheckboxGroup | Forms | 5/5 | `createControllableState` | |
| Radio / RadioGroup | Forms | 5/5 | `createControllableState` + roving | |
| Switch | Forms | 5/5 | `createControllableState` | |
| Field · Fieldset · Label | Forms | 4/5 | `createFormControl`* | label/description/error id-linking |
| Toggle · ToggleGroup | Forms | 3/5 | — | pressed state |
| SegmentedControl | Forms | 2/5 | `createListNavigation` | roving group |
| Table *(basic)* | Data display | 5/5 | — | sorting/selection → T3 |
| Collapsible | Disclosure | 5/5 | `createPresence` | |
| Breadcrumb | Navigation | 5/5 | — | |
| Steps/Stepper · Pagination | Navigation | 4/5 · 5/5 | `createStepsState`* / `createPaginationState`* | state math |
| Image | Media | 3/5 | — | lazy + fallback |
| Theme / ColorMode | Utility | 5/5 | — | dark-mode + theme context |
| EnvironmentProvider | Utility | 2/5 | `createEnvironmentContext`* | portal/floating DOM root (shadow DOM / iframe) |
| I18nProvider *(re-export)* | i18n | — | primitives' `I18nProvider` | re-exported same-named; locale + reading-direction — not a new component |

### T2 — Composite behavioral (multiple parts; roving / floating / expansion)

| Component | Category | In | Kernel deps | Notes |
|---|---|---|---|---|
| Tabs | Navigation | 5/5 | `createListNavigation` | roving + follow-focus |
| Accordion | Disclosure | 5/5 | `createListExpansion` | kernel ready |
| Tooltip | Overlays | 5/5 | `createFloating`*, `createTimer`* | open/close delay |
| Popover ✅ | Overlays | 5/5 | `createFloating`, `createDismissable`, `createAutoFocus`, `createFocusRestore`, `createFocusScope`, `createKeepVisible`, `createPresence` | the "compose, don't inherit from Dialog" proof, landed — styled API (10 compound parts + `popover` recipe). **Non-modal v1:** no focus trap, scroll lock, hide-outside or backdrop; a `modal` mode is later work. Opened **inside** a modal it is a first-class layer above it (#18/#19/#20) — spared, focusable, and it takes the first Escape alone |
| HoverCard | Overlays | 2/5 | `createFloating`*, `createHoverIntent`* | |
| Dialog ✅ | Overlays | 5/5 | (kernel complete) | styled API landed (compound parts + `dialog` recipe) |
| Drawer / Sheet | Overlays | 5/5 | Dialog kernel | Dialog variant + slide presence |
| Slider · RangeSlider | Forms | 5/5 | `createDragState`*, `createNumberState`* | pointer + keyboard |
| Rating | Forms | 4/5 | roving + half-step | |
| NumberInput | Forms | 4/5 | `createNumberState`*, `createTextInput`* | |
| PinInput / OTP | Forms | 3/5 | `createPinInputState`* | multi-field focus/paste |
| TagsInput | Forms | 2/5 | `createTagsState`*, `createTextInput`* | |
| Menubar | Navigation | 3/5 | `createFloating`* + collection | application menubar |
| ScrollArea | Utility | 3/5 | `createElementSize`* | custom scrollbars |
| Splitter / Resizable | Utility | 3/5 | `createDragState`*, `createElementSize`* | resizable panes |

### T3 — Collection / floating-heavy (collection + popover + typeahead/selection)

| Component | Category | In | Kernel deps | Notes |
|---|---|---|---|---|
| Listbox ✅ | Collections | core | `createDataCollection` / `createVirtualCollection` + `list-focus/navigation/selection/typeahead` | styled API landed (compound parts + `listbox` recipe), **data** and virtual modes, native-form submission through the shared `HiddenSelect` (a real clipped `<select>`: autofill, working `required`, form reset). Underlies Select/Combobox via the combobox kernel (#21) |
| Select | Collections | 5/5 | **combobox kernel** (#21) + `createFormControl`* | button focus owner; adds trigger typeahead + hidden select |
| Combobox | Collections | 5/5 | **combobox kernel** (#21) + `createTextInput`* + `createAnnounce` | input focus owner; adds the filter seam + the announcer |
| Autocomplete | Collections | 2/5 | Combobox, minus selection state | **not a rename of Combobox** — free-text value, list is suggestions. See #21 |
| Menu / DropdownMenu | Overlays | 5/5 | `createCollection` + `createFloating`* + `createHoverIntent`* + submenus | |
| ContextMenu | Overlays | 2/5 | Menu variant (pointer-anchored) | |
| NavigationMenu | Navigation | 3/5 | `createCollection` + `createFloating`* | mega-menu nav |
| CommandPalette | Navigation | 2/5 | Combobox-based | ⌘K launcher |
| Toast ★ | Feedback | 5/5 | `createTimer`*, `createDragState`*, `createAnnounce` | Sonner port (stacking, swipe, pause-on-hover) |
| FileUpload | Forms | 4/5 | `createFileUploadState`* | drag-drop + validation |
| OverlayManager | Overlays | infra | the three shipped layer registries (#18/#19/#20) | z-index only — nesting and dismiss order are already in the kernel |
| TreeView | Collections | 4/5 | `createTreeCollection`* (+ nav + expansion) | hierarchical |

### T4 — Specialist (heavy domain logic)

| Component | Category | In | Kernel deps | Notes |
|---|---|---|---|---|
| Calendar ⚠️ | Date & Time | 4/5 | `createDateState`* + `createGridNavigation` | behavior complete (month grid, min/max, ranges, i18n, React Aria one-band selection + keyboard auto-advance); **recipe styling pending** — the only unstyled component |
| DatePicker | Date & Time | 4/5 | Calendar + `createFloating`* + `createTextInput`* | |
| TimePicker | Date & Time | 3/5 | `createTextInput`* + segments | |

**Calendar — known React Aria gaps, deliberately deferred** (the one-band selection model and the
keyboard auto-advance have shipped; these have not):
- **Drag-select.** RA's `usePress` `shouldCancelOnPointerExit: !!state.anchorDate`
  (`useCalendarCell.ts:205`) plus stately's `isDragging`, touch-drag timer, and
  `isRangeBoundaryPressed` (press an existing range's endpoint to re-anchor and drag it).
  `createPress` has no `shouldCancelOnPointerExit`, so by the porting rule this starts by **extending
  `createPress`** — it is a real feature, not a rewiring.
- **`data-outside-visible-range` and `data-invalid`.** RAC emits both, we emit neither. `data-invalid`
  needs a validation-state concept the calendar doesn't have yet.

⛔ **Excluded — not building:** Carousel, Watermark, Masonry, Affix, Clipboard, FloatingPanel, Portal (SolidJS `Portal` is used directly), and all layout components (Box/Flex/Grid/Stack/Container/…).

⏸ **Deferred — heavy / enterprise (likely a later or commercial line):** DataGrid/DataTable, Charts, RichTextEditor (Nuxt "Editor"), ColorPicker, Cascader/TreeSelect, Transfer, Mentions, Tour, Popconfirm. Nuxt's Page*/Dashboard*/AI-Chat*/Content* blocks are templates — out of scope for a component kernel.

---

## 2. Kernel primitives we still need (by implementation complexity)

Everything the overlay/collection kernel already provides is listed under *Already in place* above.
These are the gaps, ordered by build complexity. `*` marks the ones referenced in the component
tables. A gap identified later is **appended rather than renumbered**, so a row number stays a
stable reference and the ordering claim holds within the original survey.

| # | Primitive (proposed) | Purpose | Consumers | Tier |
|---|---|---|---|---|
| 1 | `createEnvironmentContext` | `document`/`window` for portals in shadow DOM / iframe | EnvironmentProvider, every portal/floating layer | T1 |
| 2 | ~~`createLiveRegion`~~ | **Retired in place — already solved, don't build it.** `@solid-primitives/a11y`'s `createAnnounce` was **adopted** (verdict in [`solid-primitives-eval.md`](solid-primitives-eval.md)) and ships in `createCalendar` for period/view/selection announcements — effect-only, `isServer`-guarded, live regions appended outside the component tree, hydration round-trip cleared. It exports `AnnouncePoliteness` (polite/assertive), which is the whole of what this row asked for. A new caller calls it directly, as `calendar-root.ts` does; the `typeof document` guard there is for the Node `unit` project (client build, no DOM) and every caller repeats it. The number is kept so cross-references stay valid | Toast, Combobox status, form errors — all via `createAnnounce` | — |
| 3 | `createTimer` | pausable timeout (pause-on-hover, restart) | Toast auto-dismiss, Tooltip/HoverCard delays | T1 |
| 4 | `createElementSize` | ResizeObserver-backed element measurement | ScrollArea, Splitter, positioning | T1 |
| 5 | `createFormControl` — **adopt `@solid-primitives/a11y`** (hydration-gated; *not* the `form` pkg's `createForm`) | label / description / error id linking + `data-invalid`/`required`/`disabled`/`readonly` | Field, Fieldset, **all form inputs** | T1–T2 |
| 6 | `createStepsState` · `createPaginationState` | small state machines | Steps, Pagination | T1 |
| 7 | `createFloating` ✅ | `@floating-ui/dom` wrapper: placement, flip/shift, arrow, autoUpdate, opt-in `size` | Tooltip, Popover, HoverCard, Menu, Select, Combobox, NavigationMenu, DatePicker | T2 |
| 8 | `createHoverIntent` | hover open/close intent + submenu safe-triangle | Menu, HoverCard, Tooltip *(port Astryx `useMenuHover`)* | T2 |
| 9 | `createTextInput` | controlled value + composition/selection handling | Input, Textarea, Combobox, TagsInput, NumberInput | T2 |
| 10 | `createNumberState` | parse / format / clamp / step (Intl) | NumberInput, Slider | T2 |
| 11 | `createPinInputState` · `createTagsState` | field-specific interaction state | PinInput, TagsInput | T2 |
| 12 | `createDragState` | pointer drag / resize / swipe | Slider thumb, Splitter, Toast swipe, ScrollArea | T3 |
| 13 | `createFileUploadState` | file selection, drag-drop, accept/size validation | FileUpload | T3 |
| 14 | ~~`createOverlayStack`~~ | **Retired in place — never build this.** Nesting is shipped as **three separate registries**: #18 (dismissal order), #19 (`aria-hidden`/`inert`), #20 (focus containment). Merging them would be a bug, not a simplification: a Dialog with `dismissOnEscape: false` still participates in hide-outside *and* focus-scope ordering but must never win Escape. react-aria keeps its three apart for the same reason and centralizes nothing — [`reference-implementations.md`](reference-implementations.md) §1. The number is kept so cross-references stay valid | — see #18/#19/#20 | — |
| 15 | `createTreeCollection` | hierarchical collection: levels, expand-aware flat nav | TreeView *(builds on `createCollection` + nav + expansion)* | T3 |
| 16 | `createDateState` | calendar model: month grid, min/max, ranges, disabled dates, i18n | Calendar, DatePicker *(pairs with `createGridNavigation`)* | T4 |
| 17 | `createAutoFocus` ✅ | Move focus into a container on activation **without** trapping it — including the `tabindex="-1"` fallback for a container with no focusable descendant, and its cleanup. Extracted from `createFocusTrap`, whose own doc comment had named the gap and named Popover as the caller, and which now composes it rather than welding the two together | Popover (a non-modal layer must not trap), and `createFocusTrap` itself | T1 |
| 18 | `createDismissable` — **nested layer ordering** ✅ ✳︎ | An activation-order stack on `document`, so only the **topmost** open layer consumes Escape or an outside pointerdown, plus a layers-above clause that stops a press inside an upper layer counting as "outside" for the one below. Ported from react-aria `useOverlay`'s `visibleOverlays`, with Base UI `useDismiss`'s `bubbles` for the opt-back-in vocabulary (defaults deviate: neither channel bubbles). Two deliberate divergences from upstream — document-level Escape, and a single-phase pointer guard — are recorded in [`reference-implementations.md`](reference-implementations.md) §1. Now an attributed Apache-2.0 derivative | nested Popover-in-Dialog (pinned by `popover-in-dialog.browser.test.tsx` and Popover's `InsideADialog` story), Menu, Select, ContextMenu | T2 |
| 19 | `createHideOutside` — **nested `aria-hidden`/`inert`** ✅ ✳︎ | `observerStack` (only the innermost layer observes, out-of-order closes included) + a dynamic `keepVisible`/`createKeepVisible` + `TOP_LAYER_ATTRIBUTE`, the declarative always-visible marker. The two cover opposite orderings: registration reaches a layer opening *after* the modal, the marker reaches a modal opening *after* the layer — which no registration can. `Popover.Positioner` calls `createKeepVisible`; the marker ships wired to nothing, as the third-party/toast escape hatch. Now an attributed Apache-2.0 derivative | same as #18 | T2 |
| 20 | `createFocusScope` ✅ | The third registry: a container stack answering **"did focus land in me, or in a layer opened above me?"** (`containsSelfOrAbove`). `createFocusTrap` composes it and consults it instead of `container.contains`, so a Dialog stops yanking focus out of a Popover portaled above it — which, with `closeOnFocusOutside`, used to close that Popover ~3ms after it opened. Moves no focus and cages nothing; Tab still leaves a non-modal layer freely. The *idea* is react-aria's `focusScopeTree`/`isElementInChildOfActiveScope`, but the implementation shares no expression with it: **not derivative, prose credit only** | same as #18 | T2 |
| 21 | `primitives/src/combobox/` — the **combobox kernel** | The shared half of Select and Combobox, named after the **ARIA pattern** (APG 1.2 gives both `role="combobox"` on the focus owner, `aria-expanded`/`aria-controls` → a `role="listbox"` popup, `aria-activedescendant` on the active option). Owns: open state + `focusStrategy` (open onto first/last/selected), the trigger's `role`/`aria-*`, the keymap (ArrowDown/Up, Alt+Arrow, Enter, Escape), the `isFocused` paint-gate plumbing between focus owner and list, `allowsEmptyCollection`, `shouldCloseOnSelect`. **Input-agnostic by construction — it never owns a text value.** See § "The combobox kernel" below for why that constraint is the whole point | Select, Combobox, Autocomplete, CommandPalette | T3 |

✳︎ Extensions to a **shipped** primitive, not new ones — and deliberately three registries rather
than one (see #14).

**Covered by existing primitives (no new work):** open/close state → `createControllableState`
(+ `createPresence`); roving focus / typeahead / arrow nav / 2D grid → the list-\* + grid kernel;
dismiss / focus-trap / scroll-lock / focus-restore / modal-hide → the overlay kernel;
value equality → `compareByIdOrReference`; live-region announcements → `createAnnounce` (see #2).

### The combobox kernel (#21) — three public components, one ARIA pattern

**Select, Combobox and Autocomplete are three components, not two and not one.** Both references we
track ship all three under those names, and `Autocomplete` means something *different* from
`Combobox` in each — so renaming Combobox to Autocomplete would collide, not clarify:

- **React Aria:** four hooks — `useSelect`, `useComboBox`, `useAutocomplete`, `useSearchAutocomplete`.
  Its `useAutocomplete` is a generic *filter wrapper over any collection* (command palettes,
  filterable menus), not the input-plus-listbox widget.
- **Base UI:** `Autocomplete` has `clear`/`input-group`/`value` and **no `item-indicator`** — no
  selection state at all. Its value is free text; the list is suggestions. Combobox commits to an item.

**The kernel is named for the pattern, and stays input-agnostic — this is the load-bearing
constraint.** Base UI built the same shared kernel (`combobox/root/AriaCombobox.tsx`, 1782 lines);
`ComboboxRoot` (176 lines) and `AutocompleteRoot` (289) are thin wrappers over it. But
`SelectRoot` — 757 lines — **does not import it**, and shares only `internals/`. The reason is that
`AriaCombobox` is built around an input value, and Select has none: no `inputValue`, no
filtered-vs-original collection, no `commit`/`revert`/`allowsCustomValue`. Routing Select through it
would be exactly what [`CLAUDE.md`](../CLAUDE.md) forbids — *"never couple a component's behavior to
a heavier sibling."*

So hope-ui's kernel is scoped **below** Base UI's: open state + ARIA + keymap + activedescendant
wiring, and nothing that presumes a text value. That is small enough for Select to compose it, which
is the one thing Base UI's split gives up — two independent keyboard/ARIA implementations that can
drift. The trade is that the name overpromises: someone opening `primitives/src/combobox/` will
expect filtering and find none. **That absence is the design, not an omission** — the filter seam
belongs to Combobox, and must be pulled by a real input value rather than guessed at from Select's
side. State it in the folder's usage doc so it isn't "fixed".

Consequences already applied above: `MultiSelect` is gone from T3 (it is
`selectionMode="multiple"`, a prop `createListbox` already takes, not a component), and Select's
kernel deps are the kernel + `createFormControl`, not Listbox + `createFloating` assembled by hand.

---

## 3. Cross-cutting engineering tasks

Not components and not primitives — repo-wide seams that get more expensive per component built.

### Splitting a styled Root's props: replace the hand-kept `omit` list

Every styled Root that forwards native attributes onto its element has to separate "an option the
primitive consumes" from "an attribute the consumer wants on the DOM node". Today that separation is
a literal key list passed to `omit(merged, …)`, hand-copied from the primitive's `CreateXOptions`
interface — `Calendar.Root` (29 keys) and `Listbox.Root` (27) carry one each, and every future
compound root that **renders an element** (Select, Combobox, Menu, Tabs, Accordion, …) will need its
own. `Popover.Root` is the counter-example and the cheapest fix available: it renders no element at
all, exactly as `Dialog.Root` doesn't, so it has nothing to subtract from and keeps no list. Stated
in `popover-root.md` so the absence isn't read as an oversight and "fixed".

*(Those two counts are as measured. They are also the section's own point in miniature — they were
written as 28 and 26, and each drifted by one the next time an option was added.)*

**It drifts in both directions, silently.**
- A key **missing** from the list leaks into the DOM as a junk attribute (`commitbehavior="reset"`).
  No type error, no failing test — `omit`'s parameters are strings with no relationship to the
  interface. Pinned today only by a test naming the string-valued options one by one
  (`calendar.browser.test.tsx` § "does not leak createCalendar options onto the element"), which a
  new boolean- or object-valued option walks straight past.
- A key **wrongly present** silently drops an attribute the consumer passed. c64bc5d caught this one
  live: `dir` reached Listbox's element only by being *absent* from its list, so making that list
  exhaustive over the option keys — a natural tidy-up — would have split the layout from the keyboard
  for every RTL reader, with every test still green.

**Constraints on any fix.** It must not copy props (`omit`/`withDefaults` return getter proxies, and
the controllable-state getters have to stay live — [`CLAUDE.md`](../CLAUDE.md) § "Merged props are
the source of truth"), must not resolve anything eagerly in the component body, and must survive the
JSX-preserved build.

**Candidate directions, none chosen:**
1. Each primitive exports the key list as a `const` tuple beside its options interface, with a
   type-level exhaustiveness assertion (`satisfies readonly (keyof CreateCalendarOptions)[]` plus a
   "no key missed" mapped type). Drift becomes a compile error, and the two edits land in one file.
2. A shared `splitThemeableProps(merged, keys)` helper so the split is written once rather than
   per root, orthogonal to where the keys come from.
3. Invert it: the part hook takes the whole merged object and drops what it recognizes, so no
   consumer of the kernel maintains a list at all.

Whatever lands should be enforced by the type system or a `scripts/check-*.mjs`, not by a comment —
the current defense is two comments telling the next reader not to tidy.

---

## Suggested first moves

Not prescriptive, but the natural sequence given what's now landed:
1. ~~**Listbox**~~ — **done.** Cashed in the navigation kernel and forced the *component*-level
   SSR + hydration DoD onto `createCollection`.
2. ~~**`createFloating`**~~ — **done.** `@floating-ui/dom` went in as an optional peerDependency, same
   pattern as `@tanstack/virtual-core`; the entire overlay/popup column (Tooltip, Popover, Menu,
   Select, Combobox, …) is now unblocked. Usage:
   [`create-floating.md`](primitives/internal/create-floating.md).
3. **`createFormControl`** — unblocks every form input; **adopt `@solid-primitives/a11y`** rather
   than build (verdict in [`solid-primitives-eval.md`](solid-primitives-eval.md)), gated on the
   `Field` hydration round-trip. Same package as the already-adopted `createAnnounce`, so no new
   dependency.
4. **`scrollIndexIntoView` on `createCollection`** — small, and Select cannot ship without it.
   `createListFocus` calls it only when a row's `element()` is `null` (a virtualized row outside the
   window), and `createCollection` never implements it at all — so a **mounted** list scrolls nothing.
   Roving mode has been hiding this: a native `.focus()` scrolls on its own. Activedescendant mode —
   which is what Select and Combobox use — moves no DOM focus, so an offscreen highlighted option
   stays offscreen, with every test green.
5. **The combobox kernel (#21)**, then **Select**, then **Combobox**. Steps 3–4 are the only hard
   blockers for Select; 5 is what stops Select and Combobox growing two keyboard/ARIA
   implementations that drift.

From there the T1/T2 backlog can be parallelized.
