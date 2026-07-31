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

### A bespoke `close-focus` token
**Why not:** A close affordance has no reason to focus differently from every other control. Dropped
in favour of the shared `focus-halo` ring, the same one Button uses.

## Dialog

### A bespoke close button inside Dialog
**Why not:** It would have been a second implementation of an icon-only, self-labelling, surface-
adaptive button. `Dialog.Close` **is** a `CloseButton` (it extends `CloseButtonProps`), and
`createDialogCloseTrigger` was slimmed to own only the close `onClick` — `type` and the label come
from `CloseButton` + `createButton`.

The accepted cost is that `Dialog.Close` now requires a `ThemeProvider`, and the repo rule that a
component may import a sibling component's subpath dates from this change. Its two constraints — no
circular component imports, and never couple a component's behavior to a heavier sibling — are what
keep that from becoming a licence to compose anything with anything.
