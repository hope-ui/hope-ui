# CLAUDE.md

Operative index: the enforced rules, and where the rationale lives. Deep rationale is in
`__internal__/` (`plan.md`, `testing.md`, `solid-2.0-notes.md`, `definition-of-done.md`,
`theming.md`), plus a per-file usage doc per primitive under `__internal__/primitives/<src-path>/`.
End-user docs are separate: the website in `apps/docs/`.

## What this is

`hope-ui` — an elegant, themeable, accessible component library for **SolidJS 2.0 (beta)**, not 1.x.
Themeable components (Tailwind v4 + tailwind-variants) are the product, built over an **internal**
headless kernel (`@hope-ui/primitives`) that is an escape hatch, **not** a stability-promised API.
API-inspired by Base UI and React Aria — actively reference and adapt their code/reasoning.
Architecture: `__internal__/plan.md`. Build order: `__internal__/roadmap.md`.

**i18n provenance.** `@hope-ui/i18n`'s locale context is derived from React
Spectrum/`@react-aria/i18n` (Apache-2.0). **Do not rewrite it as a hand-rolled implementation** — the
deviations (SSR-safe seeding, `Symbol.for` dual-copy registry) are deliberate and documented in
`default-locale.ts`.

**`@solid-primitives` (`next` branch) is a dependency to adopt, not just reference.** Before writing
a new internal primitive, check it and record an *adopt / wrap / build-fresh-because* verdict
(`__internal__/solid-primitives-eval.md`). Anything adopted clears the full DoD through its consumer,
including the hydration round-trip. **Hazard:** an adopted dep creating a compute-form signal/memo
(`createSignal(fn)` / `createMemo`) must be **inlined** in the SSR harness — externalized, it resolves
a second `solid-js` copy and `_hk` diverges. `server.deps.inline` and the bridge's `ssr.noExternal`
both carry `/@solid-primitives\//`. Effect-only primitives are the safe bet.

**"SSR support" = "works in SolidStart"** — renders on the server, hydrates without mismatch, runs on
the client. Nothing broader. Verified with `renderToStringAsync`/`hydrate` from `@solidjs/web`;
`@solidjs/start` is not on solid-js 2.0 yet, so that round-trip is the coverage. Four rules protect
it: effect-gate DOM access; `createUniqueId` for ARIA-linking ids; gate server-side `Portal` behind
`isServer`; keep an `aria-controls` IDREF only while its target is mounted. Details:
`__internal__/plan.md` § SSR & hydration requirements.

**Ships JSX-preserved source only**, under the `"solid"` export condition — the consumer's
`vite-plugin-solid` compiles per environment. No dom-compiled fallback: a consumer without that
plugin fails loudly. See `__internal__/plan.md` § Distribution model.

## Commands

```bash
pnpm install              # install workspace deps
pnpm build                # turbo: build all packages (tsdown → JSX-preserved .jsx + .d.ts per subpath)
pnpm lint                 # biome check .
pnpm format               # biome format --write .
pnpm typecheck            # turbo: tsc --noEmit per package (reads sibling src, never dist — see below)
pnpm test                 # vitest run --project=unit    (node, no DOM, pure logic)
pnpm test:ssr             # vitest run --project=ssr     (node, SERVER builds of solid-js + @solidjs/web)
pnpm test:browser         # vitest run --project=browser (real Chromium, DOM + hydration)
pnpm storybook            # visual harness on :6006 (the only non-test feedback loop)
pnpm build:storybook      # static build, also the CI smoke test for the Storybook config
pnpm check:coverage-parity  # DoD: per-file test+doc (primitives/theming); per-folder test+doc+story+ssr+hydration (components); no flat sprawl
pnpm check:class-forwarding # fails if a part's `get class()` drops the consumer's class (or omits it and never reads it)
pnpm check:recipe-purity  # fails if a preset recipe computes a color (color-mix / alpha modifier / magic opacity)
pnpm check:rtl-safety     # fails on a physical directional class (pl-/pr-/left-/text-right/…), CSSOM write or CSS declaration — packages + apps/docs
pnpm changeset            # NOT needed while the repo is at v0.0.0 — see "Changesets"
```

Playwright's browser, installed once (CI does this automatically):
```bash
pnpm exec playwright install --only-shell chromium
```

Single test file or test:
```bash
pnpm exec vitest run --project=browser packages/components/src/button/__tests__/button.browser.test.tsx
pnpm exec vitest run --project=browser -t "fires onClick"
```

Single package:
```bash
pnpm --filter @hope-ui/components build
pnpm --filter @hope-ui/components typecheck
```

## Git conventions

**Never add a `Co-Authored-By: Claude`, any `Co-authored-by`, or "Generated with Claude Code" trailer
to a commit message.** Commit messages carry the change rationale only.

## Third-party attribution

hope-ui is MIT. The references it ports from are not all MIT, so **adapting code and crediting a
reference are two different obligations** — `__internal__/reference-implementations.md` covers where to
look; this covers what you owe when you actually copy.

- **Designing against a reference's public API, ARIA pattern, or reasoning owes nothing.** Most files
  naming React Aria / Base UI / Angular Aria mid-body are in this bucket — leave them alone.
- **Reproducing its expression** (a data table, a function's structure and sequence, its comments)
  makes the file a derivative and triggers the upstream license. Adobe React Spectrum is
  **Apache-2.0**; Base UI and Angular Components are **MIT**.
- A derived file gets a **JSDoc header tagged `@license`** naming the upstream file, its copyright line,
  its license, and — Apache-2.0 §4(b) — *"This file has been modified from the original."* Copy the
  shape from `packages/i18n/src/direction.ts`.
- **The `@license` tag is load-bearing, not decoration.** hope-ui ships JSX-preserved source, and
  rolldown strips every unmarked block comment — an unmarked header vanishes from `dist/` and the
  published package becomes an unattributed derivative. `comments.legal` is pinned in
  `tsdown.config.base.ts` for the same reason.
- Add the file to the root [`NOTICE.md`](NOTICE.md) table **and** its package's `NOTICE.md`. A package
  that gains its first Apache-2.0 derivative also needs `LICENSE-APACHE-2.0.txt` copied in from
  `licenses/`, plus both added to its `package.json#files`.
- Never relicense: the MIT grant in `LICENSE.md` covers hope-ui's own code only.

## Code style

Names carry the meaning; comments are the exception.

- **Meaningful, unabbreviated names** (`previousFocus`, not `pf`). Single letters only for trivial
  loop indices or math.
- **Comments explain _why_, not _what_.** A comment restating the next line is noise — delete it.
  Keep them for rationale, non-obvious constraints, spec/issue links, and **the hazards this repo
  tracks (SSR/hydration, Solid 2.0)**.
- **A function needing a paragraph of comment is the problem.** Extract helpers, split
  responsibilities, rename. Refactor instead of annotating.

## Changesets

**At `v0.0.0`, do not create a changeset** — not on any commit or PR — unless expressly asked. Don't
nudge for one. When asked, run `pnpm changeset`. Once past `v0.0.0`, a changeset accompanies every PR
touching a published package.

## Definition of Done (enforced, not a guideline)

Full rationale: `__internal__/definition-of-done.md`. **Read `__internal__/testing.md` before writing
any test.**

Two granularities:

- **`@hope-ui/primitives` / `@hope-ui/theming` — PER SOURCE FILE.** Every file except `index.ts` needs
  item 1. `@hope-ui/primitives` also needs item 2.
- **`@hope-ui/components` — PER COMPONENT FOLDER.** A leaf `src/<name>/` is **one** component even
  when split across `<name>-<part>.tsx` files with the namespace object assembled in `index.ts`. The
  **folder** needs items 1, 3, 4. Splitting a part into its own file adds no test/story burden.

The set:
1. `Foo.test.tsx` (unit/node) and/or `Foo.browser.test.tsx` — browser required for anything touching
   focus/keyboard/pointer. Lives in a `__tests__/` subfolder of the source file's own directory;
   per-package locations in `__internal__/definition-of-done.md`.
2. **`@hope-ui/primitives` and `@hope-ui/i18n` only:** a `Foo.md` usage doc (API, keyboard
   interaction table, ARIA pattern) at `__internal__/<pkg>/<relative-src-path>/Foo.md`, mirroring the
   src path. **Exception:** `packages/primitives/src/internal/` needs a test but **no** `.md`; the
   composed families (`dialog`, `calendar`, `listbox`, `modal-backdrop`) and `utils/` still do.
   `@hope-ui/theming` and `@hope-ui/components` carry no repo usage doc — their API is in
   `apps/docs/`.
3. **`@hope-ui/components` only:** one `*.stories.tsx` per folder, colocated in `src/`.
4. **`@hope-ui/components` only:** an SSR test (`*.ssr.test.tsx` *calling* `renderToStringAsync`) and
   a hydration test (`*.browser.test.tsx` *calling* `hydrate`) — one of each per folder.

`pnpm check:coverage-parity` (`scripts/check-coverage-parity.mjs`) enforces the above, plus:
- Every browser test calling `mount()` also calls `expectNoA11yViolations` at least once (both from
  `@hope-ui/internal-test-utils`). A test rendering nothing is exempt.
- "Calls" = outside a comment, string, or `it.skip`, and not merely imported.

Also required:
- **Rejected alternatives:** every `.md` under `__internal__/primitives|i18n` ends with a
  `## Rejected alternatives` section — one `### <alternative>` + `**Why not:** <consequence>` entry
  per shape that was genuinely on the table (`**Revisit if:**` optional), so the reasoning outlives
  the commit message that holds it. Divergence from React Aria / Base UI / Zag / Kobalte is the case
  most worth recording. **Never invent one** — a file with no contested alternative takes
  `<!-- no-rejected-alternatives: <reason> -->` instead (reason mandatory, ≥ 4 words; never both).
  Enforced by `pnpm check:coverage-parity`, keyed off the doc tree, so a doc-exempt `internal/` doc
  written anyway still owes one. Component/theming rationale goes in
  `__internal__/components/decisions.md`, not `apps/docs/`. See `__internal__/definition-of-done.md`.
- `expectNoA11yViolations` fails on axe **violations** *and* **`incomplete`** results. Name a
  genuinely undecidable one in `allowIncomplete` at the call site with a reason; never silence the
  category. See `__internal__/internal-test-utils/axe/axe.md`.
- `mount()` fails the test on `STRICT_READ_UNTRACKED` or `REACTIVE_WRITE_IN_OWNED_SCOPE`. A
  deliberate untracked read is spelled `untrack(...)`. See
  `__internal__/internal-test-utils/mount/mount.md`.
- **Recipe purity:** a preset recipe (`packages/presets/**/recipes/`) references *finished*
  `--hope-*` tokens only — never `color-mix`, an alpha modifier (`bg-x/50`), or a magic opacity
  (`opacity-90`). Derived colors (focus halo, scrim) are authored as tokens in the preset's
  `theme.css`. Enforced by `pnpm check:recipe-purity`. See `__internal__/theming.md`.
- **RTL-aware recipes:** every directional class a recipe/component/story emits is **logical** —
  `ps-`/`pe-`/`ms-`/`me-`/`start-`/`end-`/`border-s`/`rounded-s`/`text-start`, never the `l`/`r`
  physical twin — and no CSSOM write reaches for `.style.paddingRight`. A physical utility never
  fails loudly; it mis-paints for every RTL reader while every test stays green. Tailwind v4's
  `px-`/`mx-`/`inset-x-`/`border-x-`/`space-x-`/`divide-x-` are **already logical** — don't "fix"
  them. A deliberate flip is spelled `rtl:`/`ltr:`; the named escape hatch is an `rtl-ok: <reason>`
  comment. Enforced by `pnpm check:rtl-safety` **and**, per preset recipe,
  `assertLogicalPropertyConformance` (`@hope-ui/theming/conformance`) — the latter is what reaches a
  third-party preset and a `compoundVariant`-assembled class. See `__internal__/theming.md`.
- Stories pin known-but-unfixed behavior where a human can see it. **Don't "fix" a story by deleting
  it** — fix the component and rename the story. Current example: Dialog's `Modal with an
  unpositioned Popup (content is unclickable — by design)`.
- Hydration goes through a shared render entry
  `src/<component>/__tests__/<component>.ssr-entry.tsx` exporting the `Tree` both halves use — **no
  committed fixture file**. Sharing one `Tree` keeps the `ssr` and `browser` halves structurally
  identical, which matters because **`_hk` keys are a path through the component tree**: a component
  inserted before `Dialog.Trigger`, even one rendering nothing, shifts the trigger's key. Mechanics:
  `__internal__/testing.md`.

## Leaf source folders stay flat-free

A `src/<name>/` folder holds only its implementation file(s), `index.ts`, and — components only —
`*.stories.tsx`. Compound components **split parts across files** here (`<name>-root.tsx`,
`<name>-context.ts`, …) with the namespace object assembled in `index.ts`. No subfolders. Splitting
is encouraged; a single 600-line file is worse.

`@hope-ui/primitives` / `@hope-ui/theming` / `@hope-ui/i18n` do the same one level up: every part
file sits **flat** in its top-level folder, with the family's tests in that folder's single
`__tests__/`. The only nested source sub-folders are `calendar/utils/`, `i18n/locales/`,
`theming/src/recipes/` — each with its **own** `__tests__/`.

Tests, `__fixtures__/`, `__screenshots__/` go under `__tests__/`; primitives/i18n usage `.md` under
`__internal__/<pkg>/<path>/`. **Never drop a test, fixture, or doc file flat beside source** —
`pnpm check:coverage-parity` fails it in any leaf under `primitives`, `components`, `theming`,
`i18n`, `internal-test-utils`.

## Components may write literal host elements

Write literal host elements where they read best. `renderElement` (`@hope-ui/primitives/render`) is
the `as`/render-prop polymorphism helper and the owner of ref merging — reach for it when a component
exposes `as`/`render`, not per element.

## Every public part forwards its DOM props and takes `render`

A part a consumer writes in JSX and that renders a host element owes them **two** things: the native
attributes it doesn't consume (`id`, `style`, `data-*`, `aria-*`, `ref`, event handlers), and a
`render` prop to re-target the element. The **only** exemption is a part that renders no element of
its own (`Dialog.Root`, `Dialog.Portal`) — "the element is structural", "the tag matters here", and
"nobody will need it" are not exemptions; `Calendar.Grid`'s `<table>` takes one.

### `render` — the polymorphism mechanism (there is no `as` prop)

`render?: RenderProp<<Name>ElementProps>`, omitted from what's forwarded, and passed to
`renderElement` as `render: merged.render` (or `props.render` where the part doesn't merge defaults).
Type it over the part's **own** element props and give `renderElement` the matching generics
(`renderElement<CalendarRootElementProps, HTMLDivElement>`), so `render={(p) => <div {...p} />}`
compiles with no cast. Re-targeting a *different* tag is the case that casts, at the call site —
`renderAsAnchor` in the Button tests is the shape to copy.

Part hooks type their props over `HTMLElement` while the public surface names the real element, and
`ref` is the one key that won't line up between them. Cast the **props** at the `renderElement` call
(`as unknown as <Name>ElementProps`) rather than widening the public `render` type — a `render` typed
over `HTMLElement` pushes a cast onto every consumer instead.

Two things a `render` test must cover, because both fail silently: the **computed props survive** the
swap (the ARIA and the keymap ride on them — assert behavior, not just the tag), and the **internal
ref survives** it. `renderElement` collapses internal + consumer refs into one function ref, so a
target that drops it disables whatever the ref powers — Calendar's abandonment policy and direction
warning, Listbox's scroll container — with no error. Pick the render target for validity too:
`role="listbox"` on a `<section>` is an axe `aria-allowed-role` violation.

### Forwarding the rest

- **Declare it** with a private `type <Name>ElementProps = JSX.HTMLAttributes<HTMLXElement>` alias
  above the interface, and extend it — `Omit`-ting the primitive's option keys when the part has any
  (`Omit<CalendarRootElementProps, keyof CreateCalendarOptions | "children">`). Button, Badge, Alert,
  CloseButton, Calendar.Root and Listbox.Root all spell it this way.
- **Route it through the part hook** when one exists — `createXPart(state, omit(props, "render",
  "class"))` — never merged onto the element behind the hook's back. The hook owns the precedence:
  its `role`/ARIA/`data-*` win, the fallbacks it writes as `props.foo ?? …` defer to a consumer's,
  and its handlers compose via `composeEventHandlers` (consumer first, `preventDefault()` cancels).
  With no hook, `const rest = omit(props, …)` then `merge(rest, { … })` in the component.
- **An attribute the component must own** (`aria-hidden` on `Listbox.ItemIndicator`, `data-slot`
  everywhere) goes in the object merged *after* `rest`, with a comment saying why it isn't forwardable.
- **`class` is the one attribute the part computes rather than forwards, and it goes through the slot
  fn**: `class={ctx.slots.item(props.class)}` (root: `slots.root(merged.class)`). Never
  `cx(ctx.slots.item(), props.class)` — a second concat *outside* the recipe's `{ class }` seam, so
  tailwind-merge never sees the consumer's utility and both conflicting classes ship. `useSlots` has
  no root-only `class` option; the argument is the whole mechanism. Dropping it (`merge(rest, { get
  class() { return ctx.slots.icon(); } })`, five Alert parts) type-checks fine, so it is **enforced**:
  `pnpm check:class-forwarding` fails a `get class()` whose slot fn takes no consumer class, and an
  `omit(props, …, "class")` with no matching read. An element with no consumer to forward from
  (`CalendarCell`, built from a model) is exempted with a `class-forwarding-ok: <reason>` comment on
  the getter. The runtime counterpart —
  `packages/components/src/__tests__/part-class-forwarding.browser.test.tsx` — asserts the class on
  the element for every part it lists; **add each new part to it**, the script cannot see the DOM.

**Extending the native attributes is not forwarding, and nothing fails when they diverge.** Both
shipped bugs were silent: `Calendar.Root` declared no native attributes *and* called
`createCalendarGroup(state)` with none, `Listbox.ItemIndicator` declared only `children` and rendered
a hard-coded `<span>` — in both, every consumer attribute vanished with green tests, a passing
typecheck, and docs promising the opposite. So **pin it with a test that asserts the attributes are on
the element**, not on the props type. The hand-kept `omit` list this creates is a known cost with its
own roadmap entry (§3) — mirror the existing lists until that lands.

## The Solid internals this codebase leans on are pinned

`packages/primitives/src/__tests__/solid-contract.test.ts` (unit, client build),
`solid-contract.ssr.test.tsx` (server builds), `solid-contract.browser.test.tsx` (browser, client
build) are characterization tests pinning the undocumented `solid-js`/`@solidjs/web` behaviors listed
in `__internal__/solid-2.0-notes.md`, each with a comment naming the code that depends on it
(`withDefaults`, `createControllableState`, `createComponentContext`, `createFocusRestore`,
`renderElement`'s ref merging, `Dynamic` → `_hk`). `@solidjs/web` renames runtime helpers within the
beta line (`use`→`ref`, `addEventListener`→`addEvent`), so a stable-release break surfaces as a red
test with a pointer. **Add to them rather than re-deriving a behavior in a comment.**

## Architecture

pnpm workspace, Turborepo pipeline.

- **`packages/i18n` (`@hope-ui/i18n`)** — dependency-free locale layer: locale + reading-direction
  context, built-in message catalog + `t` resolver. Imports nothing from `@hope-ui/*`, so it sits at
  the bottom of the graph; `@hope-ui/primitives` (calendar) and `@hope-ui/components` (close-button)
  depend on it, end users import `I18nProvider` from it. Single root barrel, no subpaths.
  `__internal__/i18n/`.

- **`packages/primitives` (`@hope-ui/primitives`)** — the behavior kernel. Internal/advanced
  (unstable): signatures may churn between minors. Nothing here is duplicated per-component.

  Every file lives under exactly one **top-level `src/` folder**; only top-level folders carry a
  barrel and a subpath export.
  - `dialog/` — `createDialog` **hook family**: root state hook + one hook per part
    (`createDialogTrigger`, `createDialogContent`, `createDialogBackdrop`, `createDialogPortal`,
    `createDialogTitle`, `createDialogDescription`, `createDialogCloseTrigger`), each in a flat
    `dialog/dialog-<part>.ts`. Each part hook takes the `createDialog` state + its props and owns
    that part's effects/registration/prop-precedence — so the effect stack lives in
    `createDialogContent`. Modeled on React Aria's `useDialog`/`useOverlay*` split.
    `__internal__/primitives/dialog/dialog-root.md`.
  - `calendar/` — `createCalendar` hook family (month/year/decade, single/range/multiple) over
    `@internationalized/date`; same shape as `dialog/`. Reads locale + `t` from `@hope-ui/i18n`.
  - `listbox/` — `createListbox` hook family (root/item/group/group-label/separator) over the
    collection + navigation kernel.
  - `modal-backdrop/` — `ModalBackdrop`, the kernel's only DOM-rendering component.
  - `render/` — `renderElement`: the render-prop/`as`-polymorphism primitive every component part
    routes through, and the owner of ref merging. Modeled on Base UI's `useRender` idea, not its
    code. `__internal__/primitives/render/render.md`.
  - `utils/` — `withDefaults` (**the only correct way to apply prop defaults under 2.0**),
    `composeEventHandlers`, `createKeyboardHandler`, `runIfFunction`, `compareByIdOrReference`.
  - `internal/` — the `createX` behavior primitives: `createComponentContext`,
    `createControllableState`, `createPresence`, `createAutoFocus`, `createFocusTrap`,
    `createFocusRestore`, `createHideOutside`, `createDismissable`, `createScrollLock`,
    `createFloating`, `createPress`, `createButton`, `createRegisteredId`,
    `createRegisteredElement`, plus the collection/navigation family (`createCollection`,
    `createVirtualCollection`, `createListFocus`, `createListNavigation`, `createListTypeahead`,
    `createListSelection`, `createListExpansion`, `createGridNavigation`).
    Docs under `__internal__/primitives/internal/`; read the ref/`createEffect` timing gotcha in
    `__internal__/solid-2.0-notes.md` before writing another one.

  **Modality is four mechanisms, not one** — each verified against the installed Chromium. Any modal
  layer (Popover, Select) composes all four, which is why `ModalBackdrop` is in the kernel rather
  than inside Dialog:
  - `createHideOutside` → `aria-hidden` (accessibility tree) **and** `inert` (focus order + hit
    testing) outside the popup. Neither alone suffices: `aria-hidden` leaves the background focusable
    and clickable; `inert` does **not** remove content from the accessibility tree as far as ARIA
    tooling is concerned (a role query still finds an `inert` button, but not an `aria-hidden` one).
  - `createFocusTrap` → Tab cycling inside the popup.
  - `ModalBackdrop` → blocks the pointer unconditionally. Needed because `inert` only blocks the
    pointer on elements the layer actually marked, so anything inserted before the
    `MutationObserver` sees it would be clickable.

  Two consequences that bite:
  - `ModalBackdrop` and any consumer backdrop must be **spared** from `inert` — an inert element is
    transparent to hit testing, so a backdrop that hid itself silently stops blocking.
  - `createHideOutside` must do **nothing** until its `target` resolves — a run without the popup in
    the spared set makes the popup itself inert, blurring whatever the focus trap just focused and
    stranding focus on `<body>` permanently.

  A modal popup must be positioned or it paints beneath the backdrop:
  `__internal__/primitives/modal-backdrop/modal-backdrop.md`.

  **No primitive keeps cross-instance state at module scope.** A consumer can end up with two
  installed copies, and two module-scope ref counts each believing they own `document.body` is an
  unreproducible field bug. `createScrollLock` and `createHideOutside` store counts on
  `document.body`/the element under a `Symbol.for(...)` key (cross-realm global symbol registry).
  Pinned by `scroll-lock.browser.test.tsx` importing a separate module instance
  (`./scroll-lock?instance=2`).

- **`packages/components` (`@hope-ui/components`)** — every public component, one subpath export each
  (`@hope-ui/components/button`, `.../dialog`). No root `.` export, so importing one component never
  pulls in another's code. Rationale: `__internal__/plan.md` § Publishing strategy.

- **`packages/theming` (`@hope-ui/theming`)** — the theming contract and dependency-inversion seam:
  `ThemeProvider` + `useRecipe`, the closed hand-declared `RecipeRegistry` and the type-only
  `ThemeablePropsRegistry` for per-component `defaultProps` (**declared, not module-augmented**), the
  `SlotRecipeFn` shape, a contract-version constant, the `SemanticColorContract` vocabulary, the
  Tailwind seam (`tv`/`cn`/`cx`), and a conformance kit on `@hope-ui/theming/conformance`. Components
  read recipes through it, presets implement it, neither knows the other. Depends on
  `@hope-ui/primitives` for `createComponentContext` — **which is why primitives cannot fold into
  components** (`components → theming → components`). `__internal__/theming.md`.

- **`packages/presets` (`@hope-ui/presets`)** — concrete presets, per-preset subpaths;
  `@hope-ui/presets/hope` is the default. A preset = a JS entry (`definePreset` over the recipe map)
  + `tailwind.css` (maps semantic tokens to utilities via `@theme inline`) + `theme.css`. **hope
  authors its `--hope-*` values in CSS** (`:root` + `.dark`), so `<ThemeProvider preset={hope}>`
  renders **no DOM**. `theme.css` is a **separate opt-out import**; `tailwind.css` deliberately does
  not import it. Raw scales come from Tailwind; swap-safety is enforced only on the semantic
  vocabulary via `checkSemanticTokenConformance` — a missing `--hope-*` token compiles a referencing
  utility to an unresolved `var(--…)`. `__internal__/theming.md`.

- **`packages/internal-test-utils`** (private) — `mount()` (renders into a detached,
  document-attached container) and `expectNoA11yViolations()` (axe-core against a mounted container).

**Primitives own ALL a11y + business logic; components are assembly + theme only.** The a11y and
behavior a component ships must be reproducible with the **primitives alone** — so
`@hope-ui/components` is only (a) assembly of primitive part-hooks into JSX and (b) recipe/theme
consumption (`useRecipe`/`useSlots`/`cx`).

- **Presence, focus, dismissal, scroll-lock, ids, ARIA roles/attributes, controlled state live in the
  primitive.** Creating a `createPresence`/`createFocusTrap` or computing an ARIA attribute *in the
  component* means it's in the wrong layer — move it into the `createX` hook (a per-part hook, or the
  root state hook when it must be shared/eager). **A test running in node is not a reason to keep
  logic out of a primitive** — convert the test to a browser test. Worked example:
  `__internal__/plan.md`.
- **Composition over inheritance.** A component context *holds* the primitive state as a field
  (`{ state: CreateDialogReturn; slots }`); it never `extends` it. Parts read `ctx.state.*` for
  behavior and `ctx.slots.*` for classes.

**Composition rule.** Compose behavior from `@hope-ui/primitives`, styling through
`@hope-ui/theming`. A component **may** import a sibling component's subpath (`Dialog.CloseTrigger`
renders `@hope-ui/components/close-button`). Two constraints: **no circular** component imports, and
**never couple a component's behavior to a heavier sibling** — Popover composes
`createFloating`/`createDismissable`/`createPresence` directly, not through Dialog's modal machinery.
Sibling subpaths stay external in the tsdown build (`neverBundle: [/^@hope-ui\//]`).

**Porting rule — port the hooks a reference composes.** When the source being adapted (React Aria,
Angular Aria, floating-ui, Base UI) calls a hook this kernel lacks, **port that hook first**, as its
own primitive with its own DoD. Never substitute a narrower hand-rolled stand-in: needing
`useLongPress` means building `createLongPress`, not a `setTimeout` in the consumer. Check
`packages/primitives/src/internal/` first — the hook may already exist. Rationale:
`__internal__/reference-implementations.md` § References policy.

## SolidJS 2.0 (beta) — differences from 1.x that matter here

Pinned via the `pnpm-workspace.yaml` catalog, in lockstep across `solid-js` / `@solidjs/signals` /
`@solidjs/web`. **Full repros and fixes: `__internal__/solid-2.0-notes.md`.**

- `render`, `Dynamic`, `Portal`, `JSX` types come from **`@solidjs/web`**. `jsxImportSource` and the
  `solid.moduleName` override point there.
- Published build = tsdown (rolldown + oxc), JSX preserved, **no Solid compiler**. Tests + Storybook
  compile JSX with `vite-plugin-solid@3.0.0-next.5` + `babel-preset-solid@2.0.0-beta.x`. The 1.x
  preset (`tsup`/`esbuild-plugin-solid`, `unplugin-solid`) emits `use`/`addEventListener` instead of
  `ref`/`addEvent` and fails to load `ref=` — **never use those toolchains to compile JSX here.**
- A `createEffect(compute, effect)` compute function must **never** read a plain (non-signal) ref
  accessor — read the ref in the *effect* callback.
- When the ref-owning element is conditionally rendered by the signal the primitive reacts to, back
  the ref with `createSignal` and **track it in `compute`**:
  `createEffect(() => [options.active(), options.ref()] as const, ([active, container]) => { … })`.
- `mergeProps`/`splitProps` are gone → `merge` and `omit` from `solid-js`.
- **`merge` resolves keys by presence, not value — never use it for defaults.** Use
  `withDefaults(props, { … })` (resolves each key with `??`).
- **Merged props are the source of truth — never touch raw `props` after merging.** `withDefaults`
  copies nothing; it exposes defaults as *getters over a new object*. Merge once at the top, then
  feed **that** result to every downstream op (`omit`/`splitProps`, spread, destructure, computed
  props, event compose). `omit(props, …)` silently drops the default; `omit(merged, …)` carries it.
  No type error, no test failure unless a test exercises the prop-omitted path. Correct shape:
  `dialog-trigger.ts`.
- Internal computed props **fall back** to the consumer's (`props["aria-labelledby"] ??
  context.titleId()`), never overwrite. Only consumer-uncontrolled props (`aria-modal`,
  `data-presence`) stay component-owned.
- A signal write isn't visible to a plain read until the next flush — **client build only**. Use
  `flush(() => setV(2))` in tests.
- `createSignal(fn)` creates a **memo**, not a signal holding a function. Box generic values as
  `createControllableState` does.
- Sibling effects run/clean up in creation order on re-run, **LIFO on owner disposal** — see
  `__internal__/primitives/internal/create-focus-restore.md`.
- `onMount` → `onSettled`. `createEffect` takes a split `(depsFn, computeFn)` form. `createContext`
  returns the Provider directly (`<XContext value={…}>`). `useContext` throws by default. `applyRef`
  flattens ref arrays and skips falsy — no `mergeRefs`. `renderElement` collapses internal + consumer
  refs into a single function ref, so it works with any render target, not just host elements
  (`__internal__/primitives/render/render.md`).
- A descendant writing an ancestor-owned signal in its synchronous render body throws
  `[REACTIVE_WRITE_IN_OWNED_SCOPE]` — defer via `onSettled`, or use `createRegisteredId`.
- `solid-refresh` HMR breaks prop forwarding for imported components → `refresh: { disabled: true }`
  in `vitest.config.ts`.
- Browser tests import `page` from `vitest/browser`.
- **`children()` decision procedure.** A component arriving via a **prop/getter**
  (`startDecorator={<Icon/>}`, `loadingText`) is created on *every* read. Resolve it once with
  `children()` and read the resolved accessor everywhere — **iff it is read more than once** in a
  render. That covers both reasons: repeated construction, and the hydration case
  (`<Show when={x != null}>` + `{x}`, whose `when`-gate read builds and discards a component whose
  `_hk` client and server place differently). A slot read **exactly once — `<Show>` or not — needs
  nothing**; nor does a static child. Full procedure + non-triggers:
  `__internal__/solid-2.0-notes.md`.

## In development, `@hope-ui/*` always resolves to `src` — never a sibling's `dist`

`package.json#exports` points at `dist/` because that's what consumers install. **Nothing in this
repo may follow it.** A stale `dist/` masquerades as the current API: add an export to
`@hope-ui/primitives` and, until someone rebuilds, `@hope-ui/components` can't see it — or keeps
compiling against the old implementation with tests passing.

Three places redirect to source; **all three must stay in sync when a package is added**:
- `tsconfig.base.json` `paths` (editor + `tsc --noEmit`). Relative paths resolve against the config
  that declares them, so these are repo-root-relative.
- `vitest.config.ts` `resolve.alias` (all projects).
- `.storybook/main.ts` `viteFinal` alias.

`turbo.json`'s `typecheck` task therefore has **no** `dependsOn: ["^build"]`. **If you need a build to
make an import resolve, the resolution config is what's wrong.**

The build never follows `paths`: tsdown emits the `.d.ts` and keeps sibling `@hope-ui/*` external
(`deps.neverBundle` in `tsdown.config.base.ts`), so declarations reference them by bare specifier.

## test/Storybook share one Solid compiler config

Two pipelines compile this repo's JSX: the tests (`vitest.config.ts`) and Storybook
(`.storybook/main.ts`). A mismatch surfaces as a runtime error deep inside `@solidjs/web`, not a
config error. Both import `solidPluginOptions()` from the root `solid-babel-options.ts` — **don't
respell the options anywhere.** Full writeups: `__internal__/migration-2.0-stable.md` §6.

- **`storybook-solidjs-vite` adds its own unconfigured `vite-plugin-solid`** unless a plugin named
  `solid` is already in `config.plugins`, and its `viteFinal` runs *before* ours — so
  `.storybook/main.ts` filters theirs out and substitutes ours. Adding ours without removing theirs
  double-compiles every file; leaving theirs re-enables `solid-refresh` and its prop-forwarding bug.
  `Button.stories.tsx`'s "Children reach the DOM (solid-refresh canary)" story catches that
  regression — don't delete it.
- **`vite-plugin-solid` auto-injects `@testing-library/jest-dom/vitest` as a bare setup specifier**
  into any non-browser Vitest project whenever it can `require.resolve` that optional peer. Vitest
  resolves it against the repo root, pnpm doesn't expose it there, and the whole `unit` project dies
  with `Cannot find module '<root>/@testing-library/jest-dom/vitest'`. The only opt-out is a
  setup-file path matching `/jest-dom/`, hence the empty root `vitest.setup.jest-dom-optout.ts`. If a
  new devDependency breaks an unrelated test project, check `vite-plugin-solid`'s `config()` hook
  first.

## Testing stack specifics

Full explanation: `__internal__/testing.md`.

- Three projects in `vitest.config.ts`, split by **module resolution**: `unit` (node, no DOM, client
  builds), `ssr` (node, **server** builds of `solid-js` *and* `@solidjs/web`), `browser` (real
  Chromium via `@vitest/browser-playwright`, client builds). File suffix picks the project. Anything
  asserting on build-specific behavior goes in the `solid-contract.*` files.
- `unit` is `environment: "node"`, **not jsdom** — jsdom can't be trusted for focus/keyboard/pointer,
  so those live in `browser`. With no `document`, writing one in the wrong project is impossible.
- **`environment: "node"` does not change package resolution.** It swaps JS globals; Vite's
  `resolve.conditions` still includes `browser`, so a node project silently gets browser builds
  unless you alias them.
- **Aliasing `@solidjs/web` to its server build is not enough.** It's externalized and loaded by
  Node, so its own `import { createRoot } from "solid-js"` bypasses the alias → two `solid-js`
  instances, two `currentOwner`s. Symptom: `createUniqueId cannot be used outside of a reactive
  context`. Fix: `server: { deps: { inline: [...] } }` on the `ssr` project. Both commented in
  `vitest.config.ts`.
- CI installs only `chromium-headless-shell` (`playwright install --with-deps --only-shell`), so
  `headless: true` is **required** in the browser project config.
- No `passWithNoTests`.
