# hope-ui build roadmap

The component surface to build, ordered by implementation complexity, plus the kernel primitives
still missing to support it.

This **supersedes the phase/build-order roadmap in [`docs/plan.md`](plan.md)** ("Button → Dialog →
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

**Status legend:** ✅ done · ⚠️ exists but needs rework · ⛔ excluded · ★ Sonner port
**Complexity tiers:** **T0** static/styled · **T1** simple stateful · **T2** composite behavioral ·
**T3** collection/floating-heavy · **T4** specialist.

**Already in place:**
- Components: `Button` ⚠️, `Dialog` ⚠️, `Calendar` ✅ (+ `ModalBackdrop` in the kernel). All are
  behavior-only today — none consumes `useRecipe`/`hope` styling yet; the first to do so proves the
  recipe pattern end-to-end.
- Kernel primitives: `createCollection`, `createVirtualCollection`, `createListFocus`,
  `createListNavigation`, `createListTypeahead`, `createListSelection`, `createListExpansion`,
  `createGridNavigation`, `createComponentContext`, `createControllableState`, `createDismissable`,
  `createFocusTrap`, `createFocusRestore`, `createHideOutside`, `createScrollLock`, `createPresence`,
  `createRegisteredId`, `createRegisteredElement`; utils `renderElement`, `withDefaults`,
  `composeEventHandlers`, `createKeyboardHandler`, `compareByIdOrReference`.
- Styling / theming: **Tailwind v4 + `tailwind-variants`** via `@hope-ui/theming` (`tv`/`cn`/`cx` +
  `useRecipe` + the semantic-token contract); the default visual identity is **`@hope-ui/presets/hope`**.
  Dark mode via a `.dark` class.

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
| Badge · Tag *(display)* | Data display | 5/5 · 4/5 | closable Tag → T1 |
| Card | Data display | 5/5 | |
| Avatar · AvatarGroup | Data display | 5/5 | image fallback |
| Alert | Feedback | 5/5 | `role="alert"`; dismissible → T1 |
| Skeleton · Spinner | Feedback | 5/5 · 4/5 | |
| Progress · ProgressCircle | Feedback | 5/5 · 2/5 | `aria-valuenow` |
| EmptyState | Feedback | 4/5 | |
| Timeline | Data display | 4/5 | |
| VisuallyHidden | Utility | a11y | screen-reader-only |

### T1 — Simple stateful (one piece of state, basic ARIA, controllable)

| Component | Category | In | Kernel deps | Notes |
|---|---|---|---|---|
| Button · IconButton · ButtonGroup | Buttons | 5/5 | `createPress`* | ⚠️ Button rework: press/keyboard |
| CloseButton | Buttons | 2/5 | — | |
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
| Accordion | Disclosure | 5/5 | `createListExpansion` | ✅ kernel ready |
| Tooltip | Overlays | 5/5 | `createFloating`*, `createTimer`* | open/close delay |
| Popover | Overlays | 5/5 | `createFloating`*, `createDismissable`, `createFocusTrap` | the "compose, don't inherit from Dialog" proof |
| HoverCard | Overlays | 2/5 | `createFloating`*, `createHoverIntent`* | |
| Dialog | Overlays | 5/5 | (kernel complete) | ⚠️ rework |
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
| **Listbox** | Collections | core | `createCollection` + `list-focus/navigation/selection/typeahead` | underlies Select/Combobox; ✅ **kernel ready — first to cash in** |
| Select | Collections | 5/5 | Listbox + `createFloating`* + `createFormControl`* | trigger + popover + Listbox |
| Combobox / Autocomplete | Collections | 5/5 | Listbox + `createFloating`* + `createTextInput`* | filter + typeahead |
| MultiSelect | Collections | 3/5 | Combobox (multiple) | |
| Menu / DropdownMenu | Overlays | 5/5 | `createCollection` + `createFloating`* + `createHoverIntent`* + submenus | |
| ContextMenu | Overlays | 2/5 | Menu variant (pointer-anchored) | |
| NavigationMenu | Navigation | 3/5 | `createCollection` + `createFloating`* | mega-menu nav |
| CommandPalette | Navigation | 2/5 | Combobox-based | ⌘K launcher |
| Toast ★ | Feedback | 5/5 | `createTimer`*, `createDragState`*, `createLiveRegion`* | Sonner port (stacking, swipe, pause-on-hover) |
| FileUpload | Forms | 4/5 | `createFileUploadState`* | drag-drop + validation |
| OverlayManager | Overlays | infra | `createOverlayStack`* | z-index / nesting / dismiss order |
| TreeView | Collections | 4/5 | `createTreeCollection`* (+ nav + expansion) | hierarchical |

### T4 — Specialist (heavy domain logic)

| Component | Category | In | Kernel deps | Notes |
|---|---|---|---|---|
| Calendar | Date & Time | 4/5 | `createDateState`* + `createGridNavigation` | ✅ month grid, min/max, ranges, i18n |
| DatePicker | Date & Time | 4/5 | Calendar + `createFloating`* + `createTextInput`* | |
| TimePicker | Date & Time | 3/5 | `createTextInput`* + segments | |

⛔ **Excluded — not building:** Carousel, Watermark, Masonry, Affix, Clipboard, FloatingPanel, Portal (SolidJS `Portal` is used directly), and all layout components (Box/Flex/Grid/Stack/Container/…).

⏸ **Deferred — heavy / enterprise (likely a later or commercial line):** DataGrid/DataTable, Charts, RichTextEditor (Nuxt "Editor"), ColorPicker, Cascader/TreeSelect, Transfer, Mentions, Tour, Popconfirm. Nuxt's Page*/Dashboard*/AI-Chat*/Content* blocks are templates — out of scope for a component kernel.

---

## 2. Kernel primitives we still need (by implementation complexity)

Everything the overlay/collection kernel already provides is listed under *Already in place* above.
These are the gaps, ordered by build complexity. `*` marks the ones referenced in the component
tables.

| # | Primitive (proposed) | Purpose | Consumers | Tier |
|---|---|---|---|---|
| 1 | `createEnvironmentContext` | `document`/`window` for portals in shadow DOM / iframe | EnvironmentProvider, every portal/floating layer | T1 |
| 2 | `createLiveRegion` | polite/assertive `aria-live` announcer | Toast, Combobox status, form errors *(port Astryx `useAnnounce`)* | T1 |
| 3 | `createTimer` | pausable timeout (pause-on-hover, restart) | Toast auto-dismiss, Tooltip/HoverCard delays | T1 |
| 4 | `createElementSize` | ResizeObserver-backed element measurement | ScrollArea, Splitter, positioning | T1 |
| 5 | `createFormControl` — **adopt `@solid-primitives/a11y`** (hydration-gated; *not* the `form` pkg's `createForm`) | label / description / error id linking + `data-invalid`/`required`/`disabled`/`readonly` | Field, Fieldset, **all form inputs** | T1–T2 |
| 6 | `createStepsState` · `createPaginationState` | small state machines | Steps, Pagination | T1 |
| 7 | `createPress` | unified pointer/keyboard/touch press (cancel-on-drag-out) | Button + every pressable *(ref: react-aria `usePress`)* | T2 |
| 8 | `createFloating` | `@floating-ui/dom` wrapper: placement, flip/shift, arrow, autoUpdate | Tooltip, Popover, HoverCard, Menu, Select, Combobox, NavigationMenu, DatePicker | T2 |
| 9 | `createHoverIntent` | hover open/close intent + submenu safe-triangle | Menu, HoverCard, Tooltip *(port Astryx `useMenuHover`)* | T2 |
| 10 | `createTextInput` | controlled value + composition/selection handling | Input, Textarea, Combobox, TagsInput, NumberInput | T2 |
| 11 | `createNumberState` | parse / format / clamp / step (Intl) | NumberInput, Slider | T2 |
| 12 | `createPinInputState` · `createTagsState` | field-specific interaction state | PinInput, TagsInput | T2 |
| 13 | `createDragState` | pointer drag / resize / swipe | Slider thumb, Splitter, Toast swipe, ScrollArea | T3 |
| 14 | `createFileUploadState` | file selection, drag-drop, accept/size validation | FileUpload | T3 |
| 15 | `createOverlayStack` | z-index / nesting / dismissal-order coordination | OverlayManager, nested Dialog/Popover/Menu | T3 |
| 16 | `createTreeCollection` | hierarchical collection: levels, expand-aware flat nav | TreeView *(builds on `createCollection` + nav + expansion)* | T3 |
| 17 | `createDateState` | calendar model: month grid, min/max, ranges, disabled dates, i18n | Calendar, DatePicker *(pairs with `createGridNavigation`)* | T4 |

**Covered by existing primitives (no new work):** open/close state → `createControllableState`
(+ `createPresence`); roving focus / typeahead / arrow nav / 2D grid → the list-\* + grid kernel;
dismiss / focus-trap / scroll-lock / focus-restore / modal-hide → the overlay kernel;
value equality → `compareByIdOrReference`.

---

## Suggested first moves

Not prescriptive, but the natural sequence given what's now landed:
1. **Listbox** — cashes in the navigation kernel; the first component to force the *component*-level
   SSR + hydration DoD onto `createCollection`.
2. **`createFloating`** — unblocks the entire overlay/popup column (Tooltip, Popover, Menu, Select,
   Combobox, …). Adopt `@floating-ui/dom` as an optional peerDependency, same pattern as
   `@tanstack/virtual-core`.
3. **`createFormControl`** — unblocks every form input; **adopt `@solid-primitives/a11y`** rather
   than build (verdict in [`solid-primitives-eval.md`](solid-primitives-eval.md)), gated on the
   `Field` hydration round-trip.

From there the T1/T2 backlog can be parallelized.
