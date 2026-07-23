# ZagDialog vs. Dialog — comparison and verdict (Phase 3)

Scored against `packages/components/src/zag-dialog/` (built in Phase 2) and the evidence ledger
`zag-dialog-findings.md`. Ledger rows are cited as `A1`, `C3`, `D1` … rather than restated.

---

## Verdict: **NO-GO**

Do not adopt Zag.js for hope-ui's overlay layer, and do not adopt it for Dialog specifically.

**Decisive axis: 8 — maintenance**, and it fails on the spike's own terms. The question was never
"can Zag do this" — it can, and `ZagDialog` is feature-identical. The question was whether Zag
*reduces ongoing maintenance workload*. The measurement says it relocates that workload into code
hope-ui cannot reach:

- Owned code volume is a **wash** (−14%, axis 2) — not the reduction the premise assumed.
- To get that wash, hope-ui must permanently own a **746-line forked interpreter** it did not design,
  pinned in lockstep to one machine version.
- The **first real consumer** of that interpreter found **two upstream bugs in it** (`A1`, `A2`),
  both now permanent local deviations.
- One defect (`D1`) is in a transitive dependency, is not exported, is not deep-importable, and
  **cannot be fixed, reset, or worked around** from the component layer or from a consumer app. It
  is a shipping blocker on its own.
- Every accessibility regression (`C1`–`C5`) is a change hope-ui knows how to make and is not
  allowed to make.

The one change that would flip this is named at the bottom.

**Runner-up, and an independent blocker: axis 4.** `Dialog` runs 4 axe assertions with **zero**
allowances. `ZagDialog` runs 6 and needs an allowance on **all six**, one of them for
`aria-hidden-focus` (severity: serious) on every open modal. A library whose first adjective is
"accessible" cannot ship that, and the repo's own gate — `expectNoA11yViolations` fails on
`incomplete`, deliberately — would have to be weakened to let it through.

---

## 1. Feature parity

`ZagDialog` is feature-identical to `Dialog` from a consumer's seat, with one API move. The parity
is real: **all 9 stories ported one-to-one** (`Default`, `Sizes`, `PlacementTop`, `ScrollInside`,
`ScrollOutside`, `WithoutCloseButton`, `AlertDialog`, `WithForm`, `NonDismissible`), sharing the
same `dialog` recipe, and Storybook shows the same dialog from both stacks including the enter/exit
animation.

Ledger section **E** is the headline: opening/closing, Escape + focus restore (modal), focus
trapping, the `data-presence` lifecycle, `onOpenChange`, controlled `open`, `modal` precedence
through `withDefaults`, `closeOnEscape={false}`, `closeOnInteractOutside={false}`, scroll lock and
its restoration, `role="alertdialog"`, consumer `ref` merging, all nine recipe slots,
`showCloseButton`, `preventDefault()` as the cancel channel, and a consumer `aria-labelledby`
winning over `Title` — **all ported verbatim and passed with no edit.**

| Kind | Item | Ledger | Would a consumer notice? |
| --- | --- | --- | --- |
| Missing | No presence / exit timing in the machine | `B1` | No — `createPresence` supplies it |
| Missing | `inert` on background content | `C2` | **Yes** — background stays keyboard-reachable behind an open modal |
| Missing | A pointer-blocking backdrop element | `C3` | **Yes** — a consumer `Backdrop`'s own handlers and `:hover` are dead while modal |
| Missing | Focus restore for a **non-modal** dialog | `C5` | **Yes** — Escape strands focus on `<body>` instead of the trigger |
| Missing | Registered (never-dangling) labelling IDREFs | `C4` | Marginal — dangling `aria-describedby` for ≥1 frame |
| Extra | `tabIndex: -1` on content | `C10` | No — strict improvement, adopted free |
| Extra | `aria-modal="false"` when non-modal | `C9` | No — both spellings are correct ARIA |
| Extra | `data-scope`/`data-part`, `--layer-index`/`--z-index` | `C11` | No — DOM noise; the layer vars are a real nesting feature we lack |
| Extra | `persistentElements`, multi-trigger, `finalFocusEl`, `ids`, `dir`, … | `C12` | Not exposed. `persistentElements` and multi-trigger have no hope equivalent and are genuinely useful |
| Regression | `aria-controls` unconditional, incl. SSR | `C1` | **Yes** — dangling IDREF in shipped server HTML |
| Impossible | Honouring a consumer `id` on a part | `C6` | **Yes** — `id` is now silently dropped on all seven Zag-backed parts |
| Impossible (fatal) | Surviving the unmount of an open dialog | `D1` | **Yes** — every later dialog stops dismissing |
| Neutral | Synchronous state | `C7` | No user-visible defect; every test observation became `vi.waitFor` |

**Verdict:** parity is achievable, and the port proves it. The deltas a consumer would notice are
**four accessibility/interaction regressions plus one correctness defect** — not feature gaps.

**Score: parity ✅ / behavioral fidelity ❌.**

---

## 2. Code volume — owned vs. depended-on

### Owned (lines hope-ui writes, reviews, and maintains)

| | Lines |
| --- | ---: |
| **Handmade — today** | |
| `packages/primitives/src/dialog/` | 560 |
| `packages/components/src/dialog/` (excl. stories) | 560 |
| Kernel primitives used, dialog-exclusive: `create-{focus-trap,hide-outside,dismissable,scroll-lock,focus-restore}` + `modal-backdrop` | 649 |
| Kernel primitives used but **shared** — `create-presence` (Alert), `create-registered-id` (Alert, Listbox), `create-controllable-state` (Alert, Calendar) | 361 *(not attributable)* |
| **Total, dialog-attributable** | **1769** |
| **Zag — as built** | |
| `packages/components/src/zag-dialog/` (15 files, excl. stories) | 730 |
| `packages/primitives/src/zag-solid/` — **forked interpreter, permanently owned** | 746 |
| `create-presence.ts` — still required (`B1`) | *(shared, unchanged)* |
| **Total, dialog-attributable** | **1476** |

**Net: −293 owned lines (−14%).** A wash, not a reduction — and this is Zag's *best* case, because
Dialog is the machine with no collection axis.

Three things the raw number hides, all of which matter more than the number:

- **The 746 lines are not equivalent lines.** They are a state-machine interpreter forked from
  upstream, whose correctness this repo cannot verify against a spec — only against upstream's own
  test suite and, now, one consumer. The 649 lines they displace are primitives hope-ui designed,
  documented per-file, and pinned with characterization tests.
- **The fork amortizes; the defects do not.** Adopt more Zag components and the 746 lines spread
  thinner — with an official adapter the same accounting reads **−1039 lines (−49%)**, a real win.
  But `@zag-js/dismissable` (`D1`) and the missing `inert` (`C2`) are shared infrastructure behind
  *every* Zag overlay machine, so "adopt more to amortize the interpreter" **widens** the blast
  radius of the two findings that block shipping.
- **`create-presence.ts` (249 lines) is not removed by adoption** (`B1`). Zag ships no presence for
  dialog, and `@zag-js/presence` is animation-name based while the hope recipe uses transitions.

**Score: neutral. Volume is not the argument for or against.**

---

## 3. Public API delta

Almost nothing, and that is a genuine result. `ZagDialogRootProps` is `DialogRootProps` prop for prop:
`open`, `defaultOpen`, `onOpenChange`, `modal`, `closeOnEscape`, `closeOnInteractOutside`, `role`,
`slotClasses`, `class` — plus the recipe variants. Zag's `{ open }` payload is unwrapped at the
boundary (`zag-dialog-root.tsx:136`) so `onOpenChange` still hands the consumer a bare boolean.

Three deltas:

| Delta | Docs/examples affected |
| --- | --- |
| `initialFocus` moves `Content` → `Root` (`C8`) | **Yes** — every example using it, and its `PropsTable` row |
| A consumer `id` on any part is **dropped outright** (`C6`) | **Yes** — this is silent. No warning, no type error; the id simply does not appear. The supported route is the machine's `ids` prop on `Root` — a Root-level prop for a Content-level concern |
| `onOpenChange` payload | No — adapted away |

**Answer, plainly:** documentation would need **one prop moved** and **one new caveat documented**.
That is a small, one-time cost. The `id` drop is the worse of the two — not because it is large, but
because it is a hope-ui contract (*"an internal value never silently discards the consumer's"*)
being broken silently, and it cannot be fixed without breaking Zag's `getElementById` element lookup.

**Score: ✅ near-parity, one documented move, one silent contract break.**

---

## 4. Accessibility

### Axe, side by side — fresh run, `--project=browser`

| | Dialog | ZagDialog |
| --- | --- | --- |
| Tests | 40 passed / 0 skipped | 39 passed / **4 skipped** (43) |
| `expectNoA11yViolations` call sites | 4 | 6 |
| …needing an allowance | **0** | **6 — all of them** |
| Allowed rules | — | `aria-valid-attr-value` (closed, ×3), `aria-hidden-focus` (open, ×3) |

Neither allowance is the sanctioned "axe cannot decide and it is fine here" kind that
`__internal__/internal-test-utils/axe/axe.md` describes. Both are real findings being pinned:

- **`aria-valid-attr-value`** (`C1`) — the closed trigger ships `aria-controls="dialog:…:content"`
  pointing at an element that does not exist, in the client DOM *and* in the server HTML.
- **`aria-hidden-focus`**, severity **serious** (`C2`) — *"ARIA hidden element must not be focusable
  or contain focusable elements."* Raised on **every open modal**.

### The four modality mechanisms

| Mechanism | Dialog | ZagDialog | Result |
| --- | --- | --- | --- |
| Focus trap | `createFocusTrap` | `@zag-js/focus-trap`, derived from `modal` | Equivalent for modal; **worse** for non-modal (`C5`) |
| Dismissal | `createDismissable` | `@zag-js/dismissable` | Equivalent, plus `D1` |
| Scroll lock | `createScrollLock` (`Symbol.for` on `document.body`) | `@zag-js/remove-scroll` (module-scope `lockMap`) | Equivalent behavior, cross-instance-unsafe storage |
| Background neutralisation | `aria-hidden` **+ `inert`** + a real `ModalBackdrop` element | `aria-hidden` **only**, + `pointer-events:none`/`data-inert` on `<body>` | **Worse** (`C2`, `C3`) |

**Is it better or worse? Worse, and materially so.** Two verified differences:

1. **Background content behind a modal ZagDialog stays in the tab order.**
   `zag-dialog.browser.test.tsx:495` (*"hides the page behind from assistive technology while modal,
   but leaves it focusable"*) asserts `container.hasAttribute("inert") === false` and then focuses a
   background button: focus genuinely lands there and the trap's `focusin` handler yanks it back.
   With `inert` the element is unreachable in the first place. The end state looks identical; the
   mechanism is strictly weaker, and axe correctly flags it.
2. **A consumer's `Backdrop` is transparent to the pointer while modal** (`C3`,
   `zag-dialog.browser.test.tsx:551`). `@zag-js/dismissable` restores `pointer-events: auto` on the
   *layer node* only — the content. Backdrop and Positioner are `layerStyleTargets`: they receive
   `--layer-index`/`--z-index` bookkeeping and no pointer restoration. So a consumer's
   `onPointerDown`, `onClick` and `:hover` on the scrim are **dead**, while dismissal still works
   (Zag listens on the document) — so nothing *looks* broken.

The one upside: no backdrop element means no backdrop-vs-`inert` interaction to get wrong (CLAUDE.md
records that as a hazard hope-ui had to learn).

### Is the `inert` gap fixable without forking the machine?

**No, and it is worse than the ledger implies.** The ledger says `@zag-js/aria-hidden` has an
`inertOthers` export the machine simply doesn't call. **That is not true of `1.42.0`** — verified:
`@zag-js/aria-hidden@1.42.0/dist/index.d.mts` exports exactly one symbol, `ariaHidden`, and the
string `inert` appears **zero times** in its compiled output. (`data-inert` in
`@zag-js/dismissable` is an unrelated marker attribute on `<body>`, not the `inert` property.)
`dialog.machine.mjs:179` calls `ariaHidden(getElements, { defer: true })` and there is no prop, no
option, and no alternative export to redirect it.

So the options are: fork `@zag-js/dialog`, patch `@zag-js/aria-hidden`, or re-implement `inert`
layering in hope's component layer — i.e. keep `createHideOutside` (255 lines) plus a
`MutationObserver` duplicating what the machine already does. **Correct that ledger row.**

**Score: ❌ — the clearest regression in the spike, and an independent blocker.**

---

## 5. SSR + hydration

**Passed first try, and that is the strongest result in the spike.** Both suites are green
(6 SSR tests each; hydration exercised in the browser project). What survived the round-trip
unaided: the adapter's **boxed `bindable`** signal, a machine started in `onSettled`,
`use-sync-external-store`'s boxed snapshot, and `createUniqueId()` feeding the machine's scope id.

### What it cost

Close to nothing at the seam, and one real bug elsewhere:

- **Zero SSR-specific workarounds in the component.** `ZagDialog.Portal` keeps the same `isServer`
  guard `Dialog.Portal` has; nothing else was needed.
- **One bug fix was load-bearing** — `A1`. `zag-dialog.ssr.test.tsx:25` is green *only* because the
  fork's `normalizeProps` now stringifies boolean `aria-*`. Before that, the server HTML shipped a
  collapsed trigger with **no `aria-expanded` at all**: Zag emits the boolean `false`, and Solid's
  SSR serializer drops falsy attribute values exactly as its client `spread` does. Found by SSR,
  fixed in the adapter, invisible upstream.
- **One assertion inverted** — `C1`, `zag-dialog.ssr.test.tsx:37`, from Dialog's *"omits
  `aria-controls` from the closed trigger"* to *"emits a dangling `aria-controls`"*.

### What remains risky

- **`_hk` is allocated differently.** The byte-exact snapshots diverge in the key itself —
  Dialog's trigger is `_hk=002010`, ZagDialog's is `_hk=00d010`, because `Root` allocates a
  `createUniqueId()` for the machine scope before the trigger renders. It is stable *today*, but it
  means the hydration key now depends on **where in `Root`'s body the scope id is allocated** — a
  fragility hope's Dialog does not have. Any future adapter change that allocates an id (or stops)
  shifts every downstream key.
- **The boxed `bindable` is a deviation, not upstream's shape.** It passes, but it is 746 lines of
  forked interpreter standing between the machine and Solid's hydration — and the fork carries no
  upstream test for the SSR round-trip, because upstream has none.
- **Payload weight.** The server HTML for one closed trigger is **99 bytes** for Dialog and
  **237 bytes** for ZagDialog — **2.4×**, from `data-scope`, `data-part`, `id`, `data-ownedby`,
  `data-state` and the dangling `aria-controls`. Per part, on every server-rendered page.

**Score: ✅ — the axis Zag most clearly passes.**

---

## 6. Theming friction

Both stacks resolve **the same `dialog` recipe** through the same `useDefaults`/`useSlots`/`cx`, and
`ZagDialog` registers no new recipe. All nine slots and their `data-slot` markers ported unchanged
(`E`). Visual output is identical — that is what makes the rest of the comparison meaningful.

The friction is in three places:

1. **Presence — the headline (`B1`).** Zag's dialog machine ships **no** exit timing: `connect()`
   emits `hidden` + `data-state="open"|"closed"` and nothing else. hope's recipe animates with CSS
   *transitions* keyed on `data-entering:`/`data-exiting:` (→ `[data-presence]`), while
   `@zag-js/presence` — what Ark composes — keys off `getComputedStyle().animationName` +
   `animationend`. Adopting Zag's presence would mean **rewriting every recipe's exit animation as
   `@keyframes`**, across the whole component set, or keeping `createPresence`. The spike kept
   `createPresence`. So the styling contract stays hope's, and the state attribute a recipe reads
   (`data-presence`) is supplied by hope's kernel — not by the machine.
2. **Two parallel attribute vocabularies.** Every part now carries hope's `data-slot` *and* Zag's
   `data-scope`/`data-part`, plus `data-state` alongside `data-presence` (`C11`). Harmless, but a
   consumer inspecting the DOM sees two naming systems and has to know which one the recipe reads.
3. **`hidden` must be stripped, and inline styles collide with the reactive binding.** `B2`:
   `[hidden] { display: none }` is a UA rule any explicit `display` beats, and every hope dialog
   slot sets one — so `omit(…, "hidden")` in both `Backdrop` and `Content`. Separately, Zag writes
   `--layer-index`/`--nested-layer-count`/`--z-index` **imperatively** into the same `style` property
   Solid binds reactively (`layer-stack.mjs`'s `syncLayers`, and `pointer-event-outside.mjs` runs a
   `MutationObserver` on `style` to re-apply `pointer-events` when something else writes it). Two
   writers on one attribute, one of them watching for the other. It works here because
   `mergePartProps` composes `style` across sources rather than letting the last win — but that is a
   seam hope-ui would own and would have to keep working for every future Zag component.

**Score: ⚠️ — no visual difference; three permanent seams, one of which (presence) means the
theming contract stays hope's regardless.**

---

## 7. Escape hatches

For each thing hope-ui would want to change, the *real* option — and what Phase 2 actually had to
take.

| # | What we want | Prop? | Component patch? | Fork? | Upstream PR? | **Phase 2 took** |
| - | --- | --- | --- | --- | --- | --- |
| `A1` | Stringify boolean `aria-*` | ✗ | possible but wrong layer | — | ✅ right fix | **Fixed in the fork** — a permanent local deviation until upstreamed |
| `A2` | `untrack` the `track` callback | ✗ | ✗ | — | ✅ (Solid-2.0-specific) | **Fixed in the fork** — permanent deviation |
| `C1` | `aria-controls` only while open | ✗ — no prop | ✅ an override getter in the `overrides` source of `mergePartProps` (last-defined wins for plain keys) | — | ✅ ideal | **Neither** — pinned as a finding, allowance added to 3 axe calls |
| `C2` | `inert` alongside `aria-hidden` | ✗ | ⚠️ only by re-implementing `createHideOutside` + a `MutationObserver` beside the machine | ✅ `@zag-js/dialog` or `@zag-js/aria-hidden` | ✅ the real fix | **Neither** — allowance added to 3 axe calls |
| `C3` | Pointer-live consumer `Backdrop` | ✗ | ⚠️ a `pointer-events: auto` override the machine's `MutationObserver` may fight | ✅ | ✅ | **Neither** — every outside-click test re-aimed at `<html>` |
| `C6` | Honour a consumer `id` on a part | ⚠️ the `ids` prop on `Root` — wrong level, and unexposed | ✗ — the machine finds elements by `getElementById`; letting an `id` through breaks the dismiss layer, the trap, and the aria-hiding at once | ✅ | ✅ | **Strip `id`** in all seven Zag-backed parts (`B7`) |
| `C5` | Restore focus for a non-modal dialog | ✗ — `restoreFocus` is honoured only *inside* the trap | ⚠️ re-add `createFocusRestore` on top | ✅ | ✅ | **Neither** — inverted the test |
| `B3`/`B4` | Hold hope's `alertdialog` defaults | ✅ pass explicitly, always | — | — | — | **Prop, on every render** — `compact()` drops omitted keys, so "explicitly, always" is the only spelling |
| `D1` | Reset / not leak `layerStack` | ✗ | ✗ | ✅ **only** by patching `@zag-js/dismissable` | ✅ **the only real fix** | **Nothing possible** — 4 tests skipped |

**`D1` is the one with no hatch at all**, and it is worth being precise about why (verified against
the installed `1.42.0`):

- `layerStack` lives at module scope in `layer-stack.mjs`.
- The package's public surface is `trackDismissableElement`, `trackDismissableBranch`, and **types
  only** from `layer-stack` (`LayerStyleTarget`, `LayerType`). The object itself is not exported.
- The `exports` map is `{ ".": …, "./package.json": … }` — a deep import to `dist/layer-stack.mjs`
  is blocked outright.
- `layerStack.remove(node)` exists, but is reachable only through the cleanup a layer registration
  hands back. Once an entry is orphaned, nothing in userland can drop it.

So a consumer app that route-changes with a dialog open has **no recovery short of a page reload**,
and hope-ui has no way to guard against it, detect it, or warn about it.

**Pattern worth naming:** of the nine rows, **two** were fixable where the spike could reach them
(both inside the fork), **two** are propped, and **five** required either accepting a regression or
forking further. That ratio *is* the adoption cost.

**Score: ❌ — the hatches that exist mostly lead further into the fork.**

---

## 8. Maintenance — **the decisive axis**

### What adoption commits hope-ui to

1. **A 746-line forked interpreter**, indefinitely. `@zag-js/core` ships **no** interpreter — the
   runtime *is* the adapter (313–391 lines in every framework upstream ships). "Thin adapter" is
   false; adoption means owning a state-machine runtime.
2. **Version lockstep.** `@zag-js/dialog@1.42.0` pins every sibling to exact `1.42.0`, and the fork
   is pinned to the `core`/`types`/`utils` it was cut from. A machine upgrade is an
   adapter-compatibility question, every time.
3. **Upstream drift on an untyped surface.** Prior measurement: upstream's Solid adapter took
   **9 commits in 12 months (~6 substantive)**. The uncovered category is not signature changes —
   TypeScript catches those — it is untyped *behavior* changes in the interpreter.

### What Phase 2 added to that picture

**The first real consumer of the fork found two defects in it** (`A1`, `A2`), both requiring a
permanent local deviation:

- `A1` is not a migration artifact — it is an **upstream `@zag-js/solid` bug**, latent because no
  Zag Solid component is exercised against axe. Every boolean `aria-*` the machine emitted was
  malformed: `aria-modal=""` on every open modal, and **no `aria-expanded` at all** on a collapsed
  trigger.
- `A2` is Solid-2.0-specific and would have to be upstreamed *into a 2.0 adapter that does not yet
  exist*.

Extrapolate honestly: two bugs from one component in one week of exercise, in code that had
previously passed upstream's own machine test suite. The next component (Popover, Select, Menu) is
new machine surface over the same interpreter, and there is no reason to expect the rate to drop.

### The comparison that settles it

The handmade kernel's equivalent bugs are the ones CLAUDE.md already records — the `inert`/backdrop
interaction, `createHideOutside` running before its target resolves, presence latching on a lazily
mounted part. Every one of those was **found, fixed, and pinned with a test in this repo, in hours**.
`D1` is the same class of bug — cross-instance module state, which CLAUDE.md forbids in the kernel
for exactly this reason (`createScrollLock` and `createHideOutside` key their counts off
`document.body` under `Symbol.for`) — and it is **unfixable**, indefinitely, because it lives one
package out.

`@zag-js/remove-scroll` (`lockMap`) and `@zag-js/focus-trap` (`trapStack`) hold module-scope state of
the same kind. That is three dependencies, in the closure of *every* Zag overlay machine, holding
state hope-ui's own rules would reject.

**That is the whole verdict in one sentence: adoption trades "bugs we fix in an afternoon" for
"bugs we file and wait on."** The spike's motivation was less maintenance work; the measurement is
less maintenance *control*, at a code-volume wash.

**Score: ❌ decisive.**

---

## 9. Bundle size

Measured after `pnpm build`, plus an `esbuild --bundle --minify` of each behavior graph with
`solid-js`/`@solidjs/web` external.

### Shipped source (what tsdown emits; the consumer's `vite-plugin-solid` compiles it)

| | `index.jsx` | `index.d.ts` |
| --- | ---: | ---: |
| `dist/dialog/` | 7,083 B | 5,499 B |
| `dist/zag-dialog/` | **11,902 B** | 6,379 B |

**+68%** on the component entry — the `mergePartProps` seam, the `untrack` wrappers, and the machine
prop adaptation.

### Behavior layer, minified / gzipped — the number that matters

| Graph | Minified | Gzipped |
| --- | ---: | ---: |
| hope kernel: `primitives/dialog` + the 8 `create-*` + `modal-backdrop` | **9,254 B** | **3,535 B** |
| `@zag-js/dialog` closure alone (9 packages) | 40,542 B | 13,404 B |
| …+ forked adapter + `createPresence` (what ZagDialog actually pulls) | **50,199 B** | **16,979 B** |

**5.4× minified, 4.8× gzipped.** A consumer importing one Dialog ships **~13.4 KB more gzipped
JavaScript** than they do today, for a dialog with *fewer* working accessibility mechanisms.

Most of it is `@zag-js/dom-query` (161 KB of raw dist JS — a general-purpose DOM toolkit) and
`@zag-js/focus-trap` (53 KB), pulled in wholesale because the machine imports from their barrels.

### Installed weight

The `@zag-js/dialog` closure is **11 packages / ~1.7 MB** installed
(`dialog`, `core`, `types`, `utils`, `dom-query`, `dismissable`, `interact-outside`, `aria-hidden`,
`focus-trap`, `remove-scroll`, `anatomy`) against **zero** new dependencies on the handmade side.

**Score: ❌ — a clear, large regression in the number end users pay.**

---

## Scorecard

| Axis | Result |
| --- | --- |
| 1. Feature parity | ✅ parity / ❌ four noticeable behavioral regressions |
| 2. Code volume | ➖ wash (−14% owned; −49% *if* the fork went away) |
| 3. Public API delta | ✅ one prop moved, one silent contract break |
| 4. Accessibility | ❌ **independent blocker** — 6/6 axe calls need allowances vs. 0/4 |
| 5. SSR + hydration | ✅ passed first try — Zag's strongest axis |
| 6. Theming friction | ⚠️ identical output; three permanent seams |
| 7. Escape hatches | ❌ 5 of 9 lead to a regression or a deeper fork; `D1` has none |
| 8. **Maintenance** | ❌ **decisive** |
| 9. Bundle size | ❌ +13.4 KB gzipped per consumer, +11 packages |

---

## Recommendation

**Do not adopt.** Delete the spike, keep the two adapter fixes.

Dialog was chosen because it is Zag's **best case** — no collection axis, the machine hope-ui would
most want, the smallest dependency closure. It still lands here. Nothing further up the roadmap
(Popover, Menu, Select, Combobox) is a *better* case, and all of them sit on the same
`@zag-js/dismissable` / `focus-trap` / `remove-scroll` infrastructure that `D1` indicts.

**The single change that would flip it: upstream shipping an official `@zag-js/solid` for SolidJS 2.0.**

That is the one because it is what makes every other cost *permanent* rather than *negotiable*:

- It deletes 746 owned lines and turns axis 2 from −14% into **−49%** — a real reduction, which is
  the entire premise being tested.
- It converts `A1` and `A2` from permanent local deviations into ordinary upstream bug reports.
- It moves hope-ui from **owner** to **consumer** of the runtime — which *is* the value proposition.

Being honest about what it would not fix: `D1` and the `inert` gap (`C2`) would still have to land
upstream, and each is an independent shipping blocker today. So the flip condition is properly
stated as: **an official Solid 2.0 adapter, *plus* `@zag-js/dismissable` moving `layerStack` off
module scope (or exporting a reset), *plus* `inert` alongside `aria-hidden` in the modal path.** If
those three land, this is worth re-measuring — with Dialog, using this same ledger.

Until then the answer is the same one the Select spike reached, for a different and stronger reason:
that spike was dominated by `@zag-js/collection`, a component-specific mismatch. This one is about
the runtime and the shared overlay infrastructure, which is the part that would not have gone away.

### Keep regardless of the verdict

Two Phase 2 outputs outlive the spike and should **not** be reverted:

- **`A1`** — `normalizeProps` stringifying boolean `aria-*` (`packages/primitives/src/zag-solid/normalize-props.ts`).
- **`A2`** — `createTrack` running its callback `untrack`ed (`packages/primitives/src/zag-solid/track.ts`).

Both are correct fixes to a vendored fork that stays in the tree, both have tests
(`normalize-props.test.ts`), both are recorded in `machine.md`'s deviation table, and both are worth
upstreaming — `A1` especially, since it affects **every** Solid Zag consumer today, on 1.x as much as
on 2.0.

### Revert surface

`git rm -r packages/components/src/zag-dialog/` plus four small reversions:
`packages/components/package.json` (the `zag-dialog` entry/export and the `@zag-js/dialog` dependency),
`pnpm-workspace.yaml` (the four catalog pins), `vitest-hydration-bridge.ts` (one `HYDRATION_ENTRIES`
line), and `pnpm-lock.yaml`. `packages/components/src/dialog/` and `packages/primitives/src/dialog/`
were never touched. **Do not revert** the two `zag-solid` fixes or their docs.

### One ledger correction

`zag-dialog-findings.md` row `C2` states that `@zag-js/aria-hidden`'s `inertOthers` export exists and
the machine simply calls `ariaHidden` instead. **That is not true of `1.42.0`**: the package exports
exactly one symbol (`ariaHidden`) and its compiled output contains the string `inert` zero times.
Adding `inert` is not a matter of calling a different export — it requires forking the machine or the
package. The row understates the cost; axis 4 above scores it correctly.

---

## Footnote: the pre-existing SSR failure

`pnpm test:ssr` has one failure, `calendar.ssr.test.tsx > matches its server output byte for byte`.
Verified pre-existing on a clean tree with everything stashed. Not the spike's, not tracked here.
