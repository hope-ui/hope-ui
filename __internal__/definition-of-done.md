# Definition of Done (enforced, not a guideline)

Full rationale for the summary in CLAUDE.md § *Definition of Done*.

The DoD is enforced at two granularities, so a compound component (`Alert`, `Dialog`) can split its
parts across many files in one leaf folder without multiplying the test/doc/story burden:

- **`@hope-ui/primitives` / `@hope-ui/theming` — PER SOURCE FILE.** Each source file (except
  `index.ts`) needs item 1 (a test). `@hope-ui/primitives` additionally needs item 2 (a usage doc);
  `@hope-ui/theming` does **not** — its public API is documented in the doc website (`apps/docs/`).
- **`@hope-ui/components` — PER COMPONENT FOLDER.** A leaf `src/<name>/` folder is **one** component,
  even when its parts live in many `src/<name>/<name>-<part>.tsx` files with the namespace object
  assembled in the barrel `index.ts` (`export const Foo = { Root, … }`). The **folder** collectively
  needs items 1, 3–4 (a test, a story, and the SSR/hydration round-trip); its public API is
  documented in the doc website, so **no** repo usage doc is required. A part file carries no
  test/story requirement of its own.

The set:
1. A matching test file: `Foo.test.tsx` (unit/node) and/or `Foo.browser.test.tsx`
   (real-browser — required for anything touching focus/keyboard/pointer behavior,
   since jsdom cannot be trusted for that), in a **`__tests__/`** subfolder of the source file's own
   directory. This keeps the leaf folder free of test/fixture visual noise;
   `check:coverage-parity`'s flat-free rule fails a test dropped beside the source. Where
   `__tests__/` sits per package:

   | Package | `__tests__/` lives at |
   |---|---|
   | `@hope-ui/components` | the component leaf — `src/<name>/__tests__/` |
   | `@hope-ui/primitives` | the family folder — `dialog/__tests__/`, `internal/__tests__/`, … |
   | `@hope-ui/theming` / `@hope-ui/i18n` | the `src` level — `theming/src/__tests__/`, `i18n/src/__tests__/` |
   | kept sub-folders | their own — `calendar/utils/__tests__/`, `i18n/locales/__tests__/`, `theming/src/recipes/__tests__/` |

2. **`@hope-ui/primitives` and `@hope-ui/i18n` only:** a matching `Foo.md` usage doc (API, keyboard
   interaction table, ARIA pattern reference) at `__internal__/<pkg>/<relative-src-path>/Foo.md`
   (`__internal__/primitives/…` / `__internal__/i18n/…`) — out of the source tree entirely,
   mirroring the src path.

   **Exception:** files under `packages/primitives/src/internal/` — the advanced/unstable behavior
   kernel — require a test but **not** a `.md`, and `check:coverage-parity` no longer asks for one.
   The composed families (`dialog`, `calendar`, `listbox`, `combobox`, `popover`, `hidden-select`,
   `modal-backdrop`), `render/` and the `utils/` helpers still carry one, since those are the surface
   an advanced consumer actually composes.

   Every such doc also carries a **`## Rejected alternatives`** section — the shapes that were
   genuinely on the table and what happened when they lost. See *Rejected alternatives* below.

   `@hope-ui/theming` and `@hope-ui/components` carry **no** repo usage doc; their public API is
   documented in the doc website (`apps/docs/`).
3. **`@hope-ui/components` only:** a `*.stories.tsx`, colocated in the `src/` leaf directory (one per
   folder). Components are what a human has to look at; pure primitives aren't. Stories (and tests)
   never reach `dist/` — tsdown only builds the `package.json` `hope.entries` files — and are excluded
   from the `build` task's turbo `inputs`.
4. **`@hope-ui/components` only:** an SSR test (`*.ssr.test.tsx` calling `renderToStringAsync`) and a
   hydration test (`*.browser.test.tsx` calling `hydrate`) — one of each per folder (see the SSR round
   trip below).

`pnpm check:coverage-parity` (`scripts/check-coverage-parity.mjs`) enforces this in CI
and fails the build if any is missing. Its purpose is to guarantee that test, doc, and
story coverage never drifts behind the source.

## Leaf source folders stay flat-free

Also enforced by `check:coverage-parity`, and the reason item 1 puts tests in `__tests__/`.

A `src/<name>/` folder holds only its implementation file(s), `index.ts`, and — for
`@hope-ui/components` — its `*.stories.tsx`. A compound component **splits its parts across files**
here (`<name>-root.tsx`, `<name>-icon.tsx`, a shared `<name>-context.ts`, …), with the namespace
object assembled in the barrel `index.ts` — **no subfolders**. That split is encouraged, not sprawl:
keeping a single 600-line file is worse, and by the per-folder granularity above it adds no
test/story burden.

The `@hope-ui/primitives` / `@hope-ui/theming` / `@hope-ui/i18n` families follow the same discipline
one level up: every part file sits **flat** in its top-level folder (`dialog/dialog-content.ts`,
`internal/create-focus-trap.ts`, `theming/src/preset.ts`, `i18n/src/translate.ts`), with the whole
family's tests consolidated in that folder's single `__tests__/`. The only nested source sub-folders
are a handful of deliberately-kept data/util groupings — `calendar/utils/`, `i18n/locales/`,
`theming/src/recipes/` — each with its **own** `__tests__/` for its files. Never a per-part folder.

Everything non-source still has a home: tests, `__fixtures__/` and `__screenshots__/` live in a
`__tests__/` subfolder; each primitives or i18n usage `.md` lives under `__internal__/<pkg>/<path>/`.
**Never drop test, fixture, or doc files flat beside source** — a flat `*.test.*`, a flat
`<name>.md`, or a flat `__fixtures__/` in any leaf under `primitives`, `components`, `theming`,
`i18n`, or `internal-test-utils` fails the build.

## The rules layered on top of the file set

Stories are also where known-but-unfixed behavior gets pinned somewhere a human can see
it. Don't "fix" a story by deleting it; fix the component and rename the story.

**Nothing currently does this, and that is a gap rather than a milestone.** Dialog's
`Modal with an unpositioned Content` was the example, and it was dropped in a stories rewrite. What
it pinned is still true — an unpositioned modal popup paints under the backdrop and stops taking
clicks (`__internal__/primitives/modal-backdrop/modal-backdrop.md` § *The popup must be positioned*)
— so the failure mode is now documented in prose and visible nowhere.

Every browser test that calls `mount()` **must** also call `expectNoA11yViolations`
(both from `@hope-ui/internal-test-utils`) at least once, so a baseline axe-core check
runs by default. `check:coverage-parity` enforces exactly that pairing: "renders real
DOM" isn't mechanically decidable, but `mount()` is the harness that does it, so calling
one obliges you to call the other. A browser test that renders nothing (e.g.
`solid-contract.browser.test.tsx`) stays exempt without an allowlist to maintain.

`expectNoA11yViolations` fails on axe **violations** *and* on **`incomplete`** results —
the rules axe ran but couldn't decide. When axe genuinely cannot judge one
(`color-contrast` over an unresolvable background), name it in `allowIncomplete` at the
call site with a reason; never silence the category. See `__internal__/internal-test-utils/axe/axe.md`.

`mount()` (also from `@hope-ui/internal-test-utils`) **fails the test** on a
`STRICT_READ_UNTRACKED` or `REACTIVE_WRITE_IN_OWNED_SCOPE` diagnostic. A deliberate untracked read is
spelled `untrack(...)`; anything still warning is unreviewed. See
`__internal__/internal-test-utils/mount/mount.md`.

**Recipe purity** (`pnpm check:recipe-purity`, `scripts/check-recipe-purity.mjs`): a preset recipe
under `packages/presets/**/recipes/` references *finished* `--hope-*` tokens only — never
`color-mix`, an alpha modifier (`bg-x/50`), or a magic opacity (`opacity-90`). A recipe that computes
a color applies a fixed rule to a base it doesn't own, so a consumer redefining that token gets a
broken result. Derived colors (`focus-halo`, `scrim`) are authored as tokens in the preset's
`theme.css`, where it owns the raw scale. See `__internal__/theming.md`.

**RTL safety** (`pnpm check:rtl-safety`, `scripts/check-rtl-safety.mjs`): every class a recipe,
component or story emits is direction-relative — `ps-`/`pe-`/`ms-`/`me-`/`start-`/`end-`/`border-s`/
`rounded-s`/`text-start`, never their `l`/`r` physical twins — and no CSSOM write reaches for
`.style.paddingRight` and friends. A physical utility never fails loudly: it mis-paints for every
RTL reader while the variant matrix, the snapshots and axe all stay green. Tailwind v4's axis
shorthands (`px-*`, `mx-*`, `inset-x-*`, `border-x-*`, `space-x-*`, `divide-x-*`) are already
logical and are not flagged. A deliberate physical class is spelled with an `rtl:`/`ltr:` variant,
or exempted by an `rtl-ok: <reason>` comment on the line. Preset recipes additionally run
`assertLogicalPropertyConformance` (`@hope-ui/theming/conformance`) over their variant matrix, which
is what reaches a third-party preset and a `compoundVariant`-assembled class. See
`__internal__/theming.md` ("RTL-aware recipes").

**Class forwarding** (`pnpm check:class-forwarding`, `scripts/check-class-forwarding.mjs`): a part's
`get class()` folds the consumer's `class` into its slot fn — `ctx.slots.item(props.class)`, root
`slots.root(merged.class)`. Two source shapes fail it: a slot call with an empty argument list inside
that getter, and an `omit(props, …, "class")` with no matching `props.class`/`merged.class` read
(the part that renders no slot class at all, like `Dialog.Trigger`). Both drop the consumer's class
while type-checking, passing the component's suite, and leaving the docs promising the merge — which
is how it shipped in five `Alert` parts, after the same family hit `Calendar.Root` and
`Listbox.ItemIndicator`. A slot call in a JSX attribute (`class={slots.label()}`) is **not** flagged:
that is a component's internal chrome — Button's label/decorators, Badge's dot — which no consumer
can address. An element with no consumer at all (`CalendarCell`, built by `Calendar.Grid` from a
model) is exempted by a `class-forwarding-ok: <reason>` comment on the getter or its comment block.

The script is static, so it is paired with a runtime pin,
`packages/components/src/__tests__/part-class-forwarding.browser.test.tsx`, which renders every
public part with a probe class and asserts it **on the element**. Neither subsumes the other: the
script sees every file but no DOM, the test sees the DOM but only the parts it lists by hand — so
**a new part is added to that test**, and the script covers whoever forgets.

Every component (not pure internal primitives with no DOM output) also needs an SSR **and** a
hydration round-trip test, and `check:coverage-parity` enforces both: a `Foo.ssr.test.tsx` that
*calls* `renderToStringAsync`, and a `Foo.browser.test.tsx` that *calls* `hydrate`. "Calls" means
outside a comment, outside a string, outside an `it.skip`, and not merely imported.

**Component-capable slots carry an extra, conditional obligation** (author discipline —
`check:coverage-parity` can't detect it, since it needs type + control-flow analysis). A slot
whose content can be a component arriving via a **prop/getter** (`startDecorator={<Icon/>}`,
`loadingText`) is created lazily on every read. The single operative trigger is **read more than
once** in a render; resolve it once with `children()`, read the resolved accessor everywhere, and
prove the guarantee(s) that apply:
- Multi-read that is the **`<Show when={x != null}>` + `{x}` idiom** — the SSR + hydration
  round-trip above already covers it (without the fix the `when`-gate read mis-keys the body node
  and it mis-hydrates; `button-icons`/`badge-icons`).
- Any **multi-read** (a `!= null` gate + the render, a placement decision, …) — also add a
  **single-creation test** that counts real constructions, like
  `button-slot-resolution.browser.test.tsx`. Without it a reintroduced raw multi-read silently
  builds the component `N` times and passes every other check.

A slot read **exactly once — inside a `<Show>` or not — needs nothing** (a single read inside a
`<Show>` hydrates cleanly; the hydration hazard is the *second*, `when`-gate read, not the
`<Show>`), nor does a static/directly-written child — a reflexive `children()` there only adds a
memo and shifts `_hk`. Full decision procedure: `__internal__/solid-2.0-notes.md` (search "`children()`
decision procedure").

## Rejected alternatives

A usage doc records *what* a primitive does — API, keyboard table, ARIA pattern — but on its own it
never records *why it has that shape*. That reasoning lives in commit messages, PR threads, and one
person's head, and it decays the fastest of anything in the repo. The failure mode is specific: a
maintainer reads a strange-looking primitive, finds no reason for the strangeness, assumes it is
accidental, and "simplifies" it straight back into the bug it was written to avoid.

So every `.md` under `__internal__/primitives/` and `__internal__/i18n/` ends with:

```markdown
## Rejected alternatives

### <the alternative, named as a thing, not a sentence>
**Why not:** <the concrete consequence — a bug, a constraint, an SSR/a11y/perf failure>
**Revisit if:** <the condition that would flip the decision>
```

- **One entry per option that was actually on the table.** Not a survey of everything imaginable —
  an entry for a shape nobody seriously proposed is noise that makes the real ones cheaper to skim
  past.
- **`Why not:` names a consequence, not a taste.** "Diverges `_hk` on hydration", not "felt
  cleaner". If the sentence would still read true with the subject swapped out, it isn't a
  consequence.
- **`Revisit if:` is optional.** Plenty of rejections have no honest revisit condition —
  `element.scrollIntoView()` will never stop walking every scrollable ancestor. Write one when the
  decision genuinely hangs on something that could change (an upstream fix, a Solid release, a
  second consumer); leave it out otherwise. Manufacturing one to fill the template is the same
  failure as inventing the entry.
- **Rejecting prior art is the most valuable case.** Where this kernel deliberately does *not*
  follow React Aria / Base UI / Zag / Kobalte, that divergence is exactly the history worth keeping
  — it is what a maintainer will otherwise "fix" by porting the upstream shape back in.
  `calendar-group.md`'s two entries (`createDismissable`, and React Aria's VoiceOver virtual-click
  guard) are the model.

**Never invent an entry.** Recover real history from `git log` / `git blame` on the source file,
from `plan.md` / `roadmap.md` / `solid-2.0-notes.md` / `reference-implementations.md`, and from
rationale already sitting in the doc's own prose or in source comments. If none of that turns up a
contested decision, use the escape hatch. Fabricated rationale is strictly worse than none: the next
reader cites it as fact.

**Move rationale, don't copy it.** A section that *is* a rejection (`## Why not
element.scrollIntoView()`) becomes an entry outright. Where the long form is load-bearing
explanatory prose the surrounding doc still needs, the entry states the consequence in one sentence
and links to it — a pointer, not a second copy that drifts.

### The escape hatch

A file whose shape had no contested alternative carries, instead of the section:

```markdown
<!-- no-rejected-alternatives: <reason> -->
```

The reason is **mandatory and at least four words**, enforced, so it cannot decay into a blanket
`n/a`. It says what made the shape uncontested, or points at the doc that owns the contested
decision — the per-locale catalogs (`i18n/locales/*.md`) are the archetype: the choices that were
argued (locale prefix matching and the fallback chain, one shared plural template vs a function per
locale) belong to `catalogs.md` and `messages.md`, not to `fr.md`.

A file may not carry both the hatch and the section; that combination is a hatch someone forgot to
delete.

### What is enforced

`pnpm check:coverage-parity` reads every `.md` under `__internal__/primitives/` and
`__internal__/i18n/` and fails on: a missing section with no hatch, a section with no `###` entry
beneath it, an entry with no `**Why not:**` line, a hatch whose reason is under four words, and a
file carrying both. Fenced code blocks are blanked first (`blankFencedCode`, the markdown analogue
of `blankNonCode`), so a doc can *show* the heading or the hatch in an example without thereby
satisfying the rule — as this file and `CLAUDE.md` both do.

The rule lives in `scripts/lib/rejected-alternatives.mjs`, not in the check script, and is pinned by
`scripts/lib/__tests__/rejected-alternatives.test.mjs` — as is every other rule enforced on this
page. All four checks are structured that way (executable walks; `scripts/lib/` decides) and all
four carry tests, because what they guard fails **silently**: a stub section reads as recorded
history while recording nothing, a physical `pr-8` mis-paints for every RTL reader, a dropped
`class` type-checks and passes the suite. If the *checker* regresses, nothing says so. How to write
one: `__internal__/testing.md` § *Testing a check script*.

The check is keyed off the **doc tree**, not off `REQUIRES_DOC`. A `packages/primitives/src/internal/`
file is doc-*exempt* (item 2's exception) — but the docs written there anyway are the longest and
most contested in the repo (`create-floating.md`, `create-dismissable.md`, `create-hide-outside.md`),
so exempting them would exempt precisely the history most at risk. The rule is therefore "a doc that
exists carries the section", not "a doc that was required carries the section". Writing an optional
`internal/` doc still costs a section; deleting one to dodge that is not a trade anyone should make.

### `@hope-ui/components` and `@hope-ui/theming`

Both have contested decisions worth keeping, and neither gets a per-file section.

Per-file is wrong there: by the layering rule, a component is assembly + theme, so its *behavior*
rationale belongs to the primitive it composes — which already carries an enforced section. A
per-component rule would be answered by an escape hatch nearly every time, which is exactly the
decay this rule exists to prevent.

But the component layer does own real, currently-unrecorded decisions — Alert's compound
context/children owner, CloseButton's surface-adaptive `currentColor` with no `variant`, the
`solid·outline·soft·ghost·link` variant vocabulary. Those go in **one decision log per package**,
`__internal__/components/decisions.md`, using the same entry shape but keyed by component rather
than by file. Never in `apps/docs/` — that is the public API reference, and architecture rationale
on the doc website is both wrong for the audience and a commitment we don't want to make.
`@hope-ui/theming` gets its own log when it has a second entry to put in one.

The log is **author discipline, not enforced**: there is no per-file anchor to hang it on, and a
per-folder check that cannot tell whether a component *had* a contested decision would only
manufacture escape hatches.

## The three test projects, and the SSR round trip

**Read `__internal__/testing.md` before writing any test.** Three Vitest projects, one job and one
module resolution each; the file suffix picks the project (`Foo.test.tsx`, `Foo.ssr.test.tsx`,
`Foo.browser.test.tsx`).

Each subject has a **render entry**, `src/<component>/__tests__/<component>.ssr-entry.tsx`, exporting
the `Tree` it renders; the `ssr` test inline-snapshots that render and the `browser` test hydrates the
*same* `Tree` against genuine server HTML rendered fresh in-process by the hydration-fixture bridge.
Sharing one `Tree` keeps the two halves structurally identical by construction, with **zero committed
fixture files at any component count**.

That matters because **hydration keys (`_hk`) are a path through the component tree**: a component
inserted before `Dialog.Trigger` — even one that renders nothing — shifts the trigger's key.

Mechanics — the bridge, everything `hydrateFixture` asserts, and the step-by-step for adding a
round-trip to a new component — are in `__internal__/testing.md` § *Writing a hydration test*.
