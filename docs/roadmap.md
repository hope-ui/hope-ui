# hope-ui build roadmap

The component surface to build, ordered by implementation complexity, plus the kernel primitives
still missing to support it.

This **supersedes the phase/build-order roadmap in [`docs/plan.md`](plan.md)** ("Button → Dialog →
Popover/Tooltip → Listbox"). That ordering was set at repo creation and no longer holds — `plan.md`
stays as the architecture/SSR/distribution reference, but the *order of work* is defined here.

**Source of the component list:** the [Chakra UI v3 component overview](https://chakra-ui.com/docs/components/concepts/overview),
verbatim, since hope-ui is a Panda-based Chakra-DX system.

**Standing decisions:**
- **Carousel — excluded.** Not building it.
- **Toast — a port of [Sonner](https://github.com/emilkowalski/sonner)** (emilkowalski/sonner), not a from-scratch design.
- Every component ships the full Definition of Done (tests in the applicable Vitest projects, `.md`,
  a Storybook story, and — for anything with hydratable markup — the SSR + hydration round-trip).

**Status legend:** ✅ done · ⚠️ exists but needs rework · ⛔ excluded · ★ Sonner port
**Complexity tiers:** **T0** static/styled · **T1** simple stateful · **T2** composite behavioral ·
**T3** collection/floating-heavy · **T4** specialist.

**Already in place:**
- Components: `Box` ✅, `Button` ⚠️, `Dialog` ⚠️ (+ `ModalBackdrop` in the kernel).
- Kernel primitives: `createCollection`, `createVirtualCollection`, `createListFocus`,
  `createListNavigation`, `createListTypeahead`, `createListSelection`, `createListExpansion`,
  `createGridNavigation`, `createComponentContext`, `createControllableState`, `createDismissable`,
  `createFocusTrap`, `createFocusRestore`, `createHideOutside`, `createScrollLock`, `createPresence`,
  `createRegisteredId`, `createRegisteredElement`; utils `renderElement`, `withDefaults`,
  `composeEventHandlers`, `createKeyboardHandler`, `compareByIdOrReference`.
- Styling / color-mode / theme handled by `@hope-ui/themes` + `@hope-ui/theming`.

---

## 1. Component roadmap (by implementation complexity)

### T0 — Static / styled (no behavior; pure Panda + a role/semantics)

| Component | Chakra group | Notes |
|---|---|---|
| Box | Layout | ✅ done |
| Flex · Stack · Grid · SimpleGrid · Wrap · Group · Center · Container · AspectRatio · Bleed · Float | Layout | Styled layout primitives |
| Separator | Layout | `role="separator"` |
| Text · Heading · Code · Em · Kbd · Mark · Link · List · Blockquote · Prose | Typography | |
| Icon · Checkmark · Radiomark | Data/Utility | SVG wrappers |
| Badge · Card · Stat · Timeline · DataList · Tag *(display only)* | Data Display | |
| Spinner · Skeleton · Status · EmptyState | Feedback | |
| VisuallyHidden · SkipNav · ClientOnly · Show · For · Presence | Utility | Thin wrappers over SolidJS / existing `createPresence` |
| Theme · ColorSwatch | Utility/Form | Defer styling to `@hope-ui/theming` |

### T1 — Simple stateful (one piece of state, basic ARIA, controllable)

| Component | Chakra group | Kernel deps | Notes |
|---|---|---|---|
| Button | Buttons | `createPress`* | ⚠️ rework: proper press/keyboard handling |
| CloseButton · IconButton · DownloadTrigger | Buttons | — | |
| LinkOverlay · Highlight | Typography | — | Text splitting for Highlight |
| Switch · Checkbox · CheckboxCard · Radio/RadioGroup · RadioCard | Forms | `createControllableState`, roving for RadioGroup | |
| Input · Textarea · PasswordInput · NativeSelect | Forms | `createFormControl`* | |
| Field · Fieldset | Forms | `createFormControl`* | Label/description/error id linking — many consumers |
| SegmentedControl | Forms | `createListFocus`/`Navigation` | Roving group |
| Collapsible | Disclosure | `createPresence` | |
| Breadcrumb | Disclosure | — | |
| Progress · ProgressCircle | Feedback | — | |
| Alert | Feedback | live-region optional | |
| Avatar · Image | Data Display | — | Image fallback logic |
| Marquee | Data Display | `createElementSize`* | |
| QRCode | Data Display | — | Wraps a QR gen lib |
| Table | Data Display | — | Static; sorting → T2 |
| Tag *(closable)* | Data Display | — | |
| LocaleProvider · FormatNumber · FormatByte | i18n | `Intl` | |
| EnvironmentProvider | Utility | `createEnvironmentContext`* | |
| Steps · Pagination | Disclosure | `createStepsState`* / `createPaginationState`* | Mostly state math |

### T2 — Composite behavioral (multiple parts; roving / floating / expansion)

| Component | Chakra group | Kernel deps | Notes |
|---|---|---|---|
| Tabs | Disclosure | `createListFocus` + `createListNavigation` | Roving + follow-focus selection |
| Accordion | Disclosure | `createListExpansion` | ✅ kernel ready |
| Tooltip · ToggleTip | Overlays | `createFloating`*, `createTimer`* | Open/close delay |
| Popover | Overlays | `createFloating`*, `createDismissable`, `createFocusTrap` | The "compose, don't inherit from Dialog" proof |
| HoverCard | Overlays | `createFloating`*, `createHoverIntent`* | |
| Dialog | Overlays | (kernel complete) | ⚠️ rework |
| Drawer | Overlays | Dialog kernel | Dialog variant + slide presence |
| ActionBar | Overlays | `createFloating`* | |
| Slider | Forms | `createDragState`*, `createNumberState`* | Pointer + keyboard + range |
| RatingGroup | Forms | roving + half-step | |
| NumberInput | Forms | `createNumberState`*, `createTextInput`* | |
| PinInput | Forms | `createPinInputState`* | Multi-field focus/paste |
| Editable | Forms | `createEditableState`* | |
| TagsInput | Forms | `createTagsState`*, `createTextInput`* | |
| CodeBlock | Typography | — | Wraps a syntax highlighter |

### T3 — Collection / floating-heavy (collection + popover + typeahead/selection)

| Component | Chakra group | Kernel deps | Notes |
|---|---|---|---|
| **Listbox** | Collections | `createCollection` + `list-focus/navigation/selection/typeahead` | ✅ **kernel ready — the first component to cash in this work** |
| Select | Collections | Listbox + `createFloating`* + `createFormControl`* | Trigger + popover + Listbox |
| Combobox | Collections | Listbox + `createFloating`* + `createTextInput`* | Async filter, typeahead |
| Menu | Overlays | `createCollection` + `createFloating`* + `createHoverIntent`* + expansion (submenus) | |
| FileUpload | Forms | `createFileUploadState`* | Drag-drop + validation |
| Toast ★ | Feedback | `createTimer`*, `createDragState`*, `createLiveRegion`* | Port of Sonner (stacking, swipe, pause-on-hover) |
| OverlayManager | Overlays | `createOverlayStack`* | Z-index / nesting / dismiss order |
| ScrollArea | Layout | `createElementSize`*, `createDragState`* | Custom scrollbars |
| Splitter | Layout | `createDragState`*, `createElementSize`* | Resizable panes |
| TreeView | Collections | `createTreeCollection`* (+ nav + expansion) | Hierarchical |

### T4 — Specialist (heavy domain logic)

| Component | Chakra group | Kernel deps | Notes |
|---|---|---|---|
| Calendar | Date & Time | `createDateState`* + `createGridNavigation` | Month grid, min/max, ranges, i18n |
| DatePicker | Date & Time | Calendar + `createFloating`* + `createTextInput`* | |

⛔ **Excluded — not building:** Carousel, ColorPicker, RichTextEditor, FloatingPanel, Clipboard, Portal (SolidJS `Portal` is used directly).

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
| 4 | `createElementSize` | ResizeObserver-backed element measurement | ScrollArea, Splitter, Marquee, positioning | T1 |
| 5 | `createFormControl` — **adopt `@solid-primitives/a11y`** (hydration-gated; *not* the `form` pkg's `createForm`) | label / description / error id linking + `data-invalid`/`required`/`disabled`/`readonly` | Field, Fieldset, **all form inputs** | T1–T2 |
| 6 | `createStepsState` · `createPaginationState` | small state machines | Steps, Pagination | T1 |
| 7 | `createPress` | unified pointer/keyboard/touch press (cancel-on-drag-out) | Button + every pressable *(ref: react-aria `usePress`)* | T2 |
| 8 | `createFloating` | `@floating-ui/dom` wrapper: placement, flip/shift, arrow, autoUpdate | Tooltip, Popover, HoverCard, Menu, Select, Combobox, ToggleTip, DatePicker | T2 |
| 9 | `createHoverIntent` | hover open/close intent + submenu safe-triangle | Menu, HoverCard, Tooltip *(port Astryx `useMenuHover`)* | T2 |
| 10 | `createTextInput` | controlled value + composition/selection handling | Input, Textarea, Combobox, TagsInput, NumberInput | T2 |
| 11 | `createNumberState` | parse / format / clamp / step (Intl) | NumberInput, Slider | T2 |
| 12 | `createEditableState` · `createPinInputState` · `createTagsState` | field-specific interaction state | Editable, PinInput, TagsInput | T2 |
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
