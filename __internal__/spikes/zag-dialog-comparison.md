# ZagDialog vs. Dialog — comparison and verdict (Phase 3)

Scored against `packages/components/src/zag-dialog/` (built in Phase 2) and the evidence ledger
`zag-dialog-findings.md`. Ledger rows are cited as `A1`, `C3`, `G2` … rather than restated.

> **Revision note.** The first version of this document returned **NO-GO**, decisive axis
> *maintenance*, resting on two loads: a permanently-owned forked interpreter, and `D1` (a supposed
> unfixable `layerStack` leak). Both have since been checked and **both were wrong** — see ledger
> corrections `G1`–`G3`. The verdict below is the corrected one. The retraction is recorded rather
> than quietly overwritten, because "the spike's blocker did not reproduce" is itself a finding.

---

## Verdict: **CONDITIONAL GO** — the NO-GO is withdrawn

Zag.js is a defensible choice for hope-ui's overlay layer. It is no longer a reject; it is a
**priced trade** that the maintainer should make deliberately, on two named costs.

What changed:

| | Before | After |
| --- | --- | --- |
| The 746-line forked interpreter | permanently owned | **temporary** — upstream will ship a Solid 2.0 adapter when Solid 2.0 is stable, which is also hope-ui's own release gate (`G3`) |
| `C6` — consumer `id` on a part | "impossible; breaks three mechanisms at once" | **works** via the machine's `ids` prop; the spike never forwarded it (`G1`) |
| `D1` — unmount-while-open poisons the session | shipping blocker, unfixable | **does not reproduce.** Retracted (`G2`) |

Removing those leaves **no blocker standing**. What remains are two real costs:

1. **Accessibility (axis 4) — the decisive axis now.** Zag has no `inert`: verified,
   `@zag-js/aria-hidden@1.42.0` contains the string zero times. `Dialog` runs 4 axe assertions with
   **zero** allowances; `ZagDialog` runs 6 and needs one on **all six**, including
   `aria-hidden-focus` (serious) on every open modal. This is fixable in hope's layer, and the fix
   has a price: keep `createHideOutside` (255 lines) and `createFocusRestore` (55), plus an
   `aria-controls` override getter (~3 lines).
2. **Bundle (axis 9).** +13.4 KB gzipped per consumer, and 11 new packages. Not fixable at all.

**The trade, stated plainly:** hope-ui stops owning dialog *behavior* — the state machine, the
transitions, the edge cases, which is the workload that motivated the question — at a cost of
~310 retained kernel lines and ~13 KB of gzipped JavaScript per consumer. Steady state after the
official adapter lands, with the accessibility work priced in: **−39% owned lines.**

That is a genuine call, not a clear answer, and it is the maintainer's to make.

---

## 1. Feature parity

`ZagDialog` is feature-identical to `Dialog` from a consumer's seat. All 9 stories ported one-to-one
(`Default`, `Sizes`, `PlacementTop`, `ScrollInside`, `ScrollOutside`, `WithoutCloseButton`,
`AlertDialog`, `WithForm`, `NonDismissible`), sharing the same `dialog` recipe; Storybook shows the
same dialog from both stacks, enter/exit animation included.

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
| Regression | `aria-controls` unconditional, incl. SSR | `C1` | **Yes** — dangling IDREF in shipped server HTML. Fixable in the component layer |
| ~~Impossible~~ Delta | Consumer `id` on a part | `C6` → **`G1`** | **No** — works via `ids` on `Root`; the shape differs, the capability does not |
| ~~Impossible~~ Retracted | Surviving the unmount of an open dialog | `D1` → **`G2`** | **No** — does not reproduce |
| Neutral | Synchronous state | `C7` | No user-visible defect; every test observation became `vi.waitFor` |

**Verdict:** parity is achievable and proven. After `G1`/`G2`, the deltas a consumer would notice
reduce to **four accessibility/interaction regressions** — all of them in axis 4, all of them
fixable in hope's layer at a known price.

**Score: ✅ parity / ⚠️ four behavioral regressions, priced in axis 4.**

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

### Three scenarios, because the fork is temporary (`G3`)

| Scenario | Owned | vs. 1769 |
| --- | ---: | ---: |
| **Interim** — as built today, fork included | 730 + 746 = **1476** | −17% |
| **Steady state** — official adapter, a11y gaps left as-is | **730** | **−59%** |
| **Steady state, honest** — official adapter, a11y fixed in hope's layer (keep `createHideOutside` 255 + `createFocusRestore` 55 + ~40 wiring) | **1080** | **−39%** |

The third row is the number to plan against. It is a real reduction, and the *kind* of code it
removes matters more than the count: what goes is dialog **behavior** — the state machine, the
transitions, the ordering hazards this repo has spent months finding. What stays is assembly,
theming, and the two a11y primitives hope already owns and trusts.

Two caveats that survive:

- **`create-presence.ts` (249 lines) is not removed by adoption** (`B1`). Zag ships no presence for
  dialog, and `@zag-js/presence` is animation-name based while the hope recipe uses transitions.
  Adopting Zag's presence would mean rewriting every recipe's exit animation as `@keyframes`.
- **The interim is real but self-liquidating**, and hope-ui already carries the fork today
  (committed at `e235acf`) regardless of this decision.

**Score: ✅ — a genuine reduction, once the fork retires.**

---

## 3. Public API delta

Almost nothing. `ZagDialogRootProps` is `DialogRootProps` prop for prop: `open`, `defaultOpen`,
`onOpenChange`, `modal`, `closeOnEscape`, `closeOnInteractOutside`, `role`, `slotClasses`, `class`,
plus the recipe variants. Zag's `{ open }` payload is unwrapped at the boundary
(`zag-dialog-root.tsx:136`) so `onOpenChange` still hands the consumer a bare boolean.

| Delta | Docs/examples affected |
| --- | --- |
| `initialFocus` moves `Content` → `Root` (`C8`) | **Yes** — every example using it, and its `PropsTable` row |
| A consumer `id` on a part becomes `ids={{ content: … }}` on `Root` (`G1`) | **Yes** — one documented shape change. Not a lost capability |
| `onOpenChange` payload | No — adapted away |

**Answer, plainly:** documentation needs **two props re-shaped**, both Root-ward, both one-time.
That is a small cost, and the `id` row is no longer the silent contract break the first draft
called it — `ZagDialog` would simply expose `ids`, which the spike neglected to forward.

**Score: ✅ two documented moves, no lost capability.**

---

## 4. Accessibility — **the decisive axis**

### Axe, side by side — fresh run, `--project=browser`

| | Dialog | ZagDialog |
| --- | --- | --- |
| Tests | 40 passed / 0 skipped | 39 passed / 4 skipped (43) |
| `expectNoA11yViolations` call sites | 4 | 6 |
| …needing an allowance | **0** | **6 — all of them** |
| Allowed rules | — | `aria-valid-attr-value` (closed, ×3), `aria-hidden-focus` (open, ×3) |

Neither allowance is the sanctioned "axe cannot decide and it is fine here" kind that
`__internal__/internal-test-utils/axe/axe.md` describes:

- **`aria-valid-attr-value`** (`C1`) — the closed trigger ships `aria-controls="dialog:…:content"`
  pointing at an element that does not exist, in the client DOM *and* in the server HTML.
- **`aria-hidden-focus`**, severity **serious** (`C2`) — *"ARIA hidden element must not be focusable
  or contain focusable elements."* Raised on **every open modal**.

### The four modality mechanisms

| Mechanism | Dialog | ZagDialog | Result |
| --- | --- | --- | --- |
| Focus trap | `createFocusTrap` | `@zag-js/focus-trap`, derived from `modal` | Equivalent for modal; **worse** for non-modal (`C5`) |
| Dismissal | `createDismissable` | `@zag-js/dismissable` | Equivalent |
| Scroll lock | `createScrollLock` (`Symbol.for` on `document.body`) | `@zag-js/remove-scroll` (module-scope `lockMap`) | Equivalent behavior, cross-instance-unsafe storage |
| Background neutralisation | `aria-hidden` **+ `inert`** + a real `ModalBackdrop` element | `aria-hidden` **only**, + `pointer-events:none`/`data-inert` on `<body>` | **Worse** (`C2`, `C3`) |

Two verified differences:

1. **Background content behind a modal ZagDialog stays in the tab order.**
   `zag-dialog.browser.test.tsx:495` asserts `container.hasAttribute("inert") === false`, then
   focuses a background button: focus genuinely lands there and the trap's `focusin` handler yanks
   it back. With `inert` the element is unreachable in the first place. The end state looks
   identical; the mechanism is strictly weaker, and axe correctly flags it.
2. **A consumer's `Backdrop` is transparent to the pointer while modal** (`C3`, test at line 551).
   `@zag-js/dismissable` restores `pointer-events: auto` on the *layer node* only — the content.
   Backdrop and Positioner are `layerStyleTargets`: `--layer-index`/`--z-index` bookkeeping and no
   pointer restoration. A consumer's `onPointerDown`, `onClick` and `:hover` on the scrim are
   **dead**, while dismissal still works (Zag listens on the document) — so nothing *looks* broken.

### Can it be fixed, and what does it cost?

**Not upstream-cheaply, but yes in hope's layer.** Verified: `@zag-js/aria-hidden@1.42.0` exports
exactly one symbol, `ariaHidden`, and the string `inert` appears **zero times** in its compiled
output. (`data-inert` in `@zag-js/dismissable` is an unrelated marker attribute on `<body>`.)
`dialog.machine.mjs:179` calls `ariaHidden(getElements, { defer: true })` with no prop, option, or
alternative export to redirect it. *(This corrects the ledger's `C2`, which claims an `inertOthers`
export exists.)*

So the fix is hope-side, and it is bounded:

| Gap | Fix | Cost |
| --- | --- | ---: |
| `C1` `aria-controls` | an override getter in `mergePartProps`'s `overrides` source (last-defined wins for plain keys) | ~3 lines |
| `C2` no `inert` | keep `createHideOutside`, run it beside the machine | 255 lines retained |
| `C5` non-modal restore | keep `createFocusRestore`, gated on `open()` | 55 lines retained |
| `C3` dead consumer Backdrop | a `pointer-events: auto` override, fighting Zag's `MutationObserver` on `style` | messy — the one with no clean fix |

`C3` is the residue: it has no tidy answer, and it means a consumer-authored interactive scrim is
not supported the way it is today.

**Score: ❌ worse than the handmade kernel — and the axis the decision now turns on.** It is a cost,
not a blocker: three of the four gaps close for ~310 retained lines, which is exactly what the
axis-2 "steady state, honest" row prices in.

---

## 5. SSR + hydration

**Passed first try, and it remains the strongest result in the spike.** Both suites green (6 SSR
tests each; hydration exercised in the browser project). What survived unaided: the adapter's boxed
`bindable`, a machine started in `onSettled`, `use-sync-external-store`'s boxed snapshot, and
`createUniqueId()` feeding the machine's scope id.

### What it cost

- **Zero SSR-specific workarounds in the component.** `ZagDialog.Portal` keeps the same `isServer`
  guard `Dialog.Portal` has.
- **One bug fix was load-bearing** — `A1`. `zag-dialog.ssr.test.tsx:25` is green *only* because the
  fork's `normalizeProps` stringifies boolean `aria-*`. Before it, the server HTML shipped a
  collapsed trigger with **no `aria-expanded` at all**. Found by SSR, invisible upstream.
- **One assertion inverted** — `C1`, `zag-dialog.ssr.test.tsx:37`.

### What remains risky

- **`_hk` is allocated differently.** Dialog's trigger is `_hk=002010`, ZagDialog's `_hk=00d010`,
  because `Root` allocates a `createUniqueId()` for the machine scope before the trigger renders.
  Stable today, but the hydration key now depends on **where in `Root`'s body that allocation sits**
  — a fragility hope's Dialog does not have.
- **Payload weight.** One closed trigger is **99 bytes** for Dialog and **237 bytes** for ZagDialog
  — **2.4×**, from `data-scope`, `data-part`, `id`, `data-ownedby`, `data-state` and the dangling
  `aria-controls`. Per part, on every server-rendered page.

**Score: ✅ — the axis Zag most clearly passes.**

---

## 6. Theming friction

Both stacks resolve **the same `dialog` recipe** through the same `useDefaults`/`useSlots`/`cx`;
`ZagDialog` registers no new recipe. All nine slots and their `data-slot` markers ported unchanged
(`E`). Visual output is identical — which is what makes the rest of the comparison meaningful.

Three permanent seams:

1. **Presence — the headline (`B1`).** The machine ships no exit timing: `connect()` emits `hidden`
   + `data-state` and nothing else. hope's recipe animates with CSS *transitions* keyed on
   `data-entering:`/`data-exiting:` (→ `[data-presence]`); `@zag-js/presence` keys off
   `animationName` + `animationend`. So the styling contract stays hope's, and the attribute a
   recipe reads is supplied by hope's kernel, not by the machine.
2. **Two parallel attribute vocabularies.** Every part carries `data-slot` *and*
   `data-scope`/`data-part`, plus `data-state` alongside `data-presence` (`C11`).
3. **`hidden` must be stripped, and inline styles collide with the reactive binding.** `B2`:
   `omit(…, "hidden")` in both `Backdrop` and `Content`. Separately, Zag writes
   `--layer-index`/`--z-index` **imperatively** into the same `style` Solid binds reactively, and
   `pointer-event-outside.mjs` runs a `MutationObserver` on `style` to re-apply `pointer-events`.
   Two writers on one attribute, one watching the other. It works because `mergePartProps` composes
   `style` across sources — a seam hope-ui would own for every future Zag component.

**Score: ⚠️ — no visual difference; three permanent seams.**

---

## 7. Escape hatches

| # | What we want | Real option | **Phase 2/3 outcome** |
| - | --- | --- | --- |
| `A1` | Stringify boolean `aria-*` | upstream PR (affects 1.x too) | Fixed in the fork; **file upstream now** |
| `A2` | `untrack` the `track` callback | upstream, into the coming 2.0 adapter | Fixed in the fork; carry until it lands |
| `C1` | `aria-controls` only while open | component-layer override getter | Available, ~3 lines. Not taken by the spike |
| `C2` | `inert` alongside `aria-hidden` | keep `createHideOutside` beside the machine; upstream is the real fix | Available, 255 lines retained |
| `C5` | Non-modal focus restore | keep `createFocusRestore` | Available, 55 lines retained |
| `C3` | Pointer-live consumer `Backdrop` | override fighting Zag's `MutationObserver`, or fork | **No clean option** |
| `C6` | Consumer `id` on a part | **the `ids` prop — supported, works** (`G1`) | Expose `ids` on `Root` |
| `B3`/`B4` | Hold hope's `alertdialog` defaults | pass explicitly, always (`compact()` drops omitted keys) | Prop, on every render |
| `D1` | — | **retracted** (`G2`) | Not a finding |

**The pattern has inverted from the first draft.** Of the nine rows, **seven** have a real option
inside hope's own layer or upstream; only `C3` has none. The earlier "five of nine lead to a
regression or a deeper fork" reading was an artifact of `C6` and `D1`, both now corrected.

**Score: ✅ with one residue (`C3`).**

---

## 8. Maintenance

This was the first draft's decisive axis, on the premise that the fork was permanent. `G3` removes
that premise.

### What adoption actually commits to

1. **A 746-line forked interpreter, for a bounded interval.** `@zag-js/core` ships **no**
   interpreter — the runtime *is* the adapter (313–391 lines in every framework upstream ships), so
   "thin adapter" is false and adoption does mean owning a runtime. But upstream will publish a
   Solid 2.0 adapter once Solid 2.0 is stable, and **hope-ui does not publish before then either** —
   the repo targets 2.0 beta, `@solidjs/start` is blocked on the same milestone. The fork's lifetime
   and hope-ui's pre-release window are the same window.
2. **Version lockstep, then normal dependency management.** `@zag-js/dialog@1.42.0` pins every
   sibling exactly, and the fork is pinned to the `core`/`types`/`utils` it was cut from. After the
   official adapter lands this becomes ordinary version management.
3. **Upstream drift.** Prior measurement: upstream's Solid adapter took **9 commits in 12 months**
   (~6 substantive). The uncovered category is untyped *behavior* change — real, but it is the risk
   profile of any dependency, not of a fork.

### The Phase 2 data point, re-weighed

The first real consumer found two defects in the fork (`A1`, `A2`). That was scored as evidence of
an ongoing burden; it reads differently now. `A1` is an **upstream bug that predates the fork** and
affects every Solid Zag user on 1.x today — hope-ui found it because it runs axe, which upstream
does not. That is a contribution, not a tax. `A2` is Solid-2.0-specific and belongs in the adapter
upstream is going to write.

### What genuinely remains

Three dependencies in every Zag overlay's closure keep **module-scope cross-instance state** —
`@zag-js/dismissable` (`layerStack`), `@zag-js/remove-scroll` (`lockMap`), `@zag-js/focus-trap`
(`trapStack`) — the exact pattern CLAUDE.md forbids in the kernel, where `createScrollLock` and
`createHideOutside` key their counts off `document.body` under `Symbol.for`. **The observation
stands; the impact does not** (`G2`). Two installed copies remain a theoretical hazard, unmeasured
here.

**Score: ⚠️ acceptable — bounded fork, normal dependency risk afterwards. No longer decisive.**

---

## 9. Bundle size

Measured after `pnpm build`, plus an `esbuild --bundle --minify` of each behavior graph with
`solid-js`/`@solidjs/web` external.

### Shipped source (tsdown output; the consumer's `vite-plugin-solid` compiles it)

| | `index.jsx` | `index.d.ts` |
| --- | ---: | ---: |
| `dist/dialog/` | 7,083 B | 5,499 B |
| `dist/zag-dialog/` | **11,902 B** | 6,379 B |

### Behavior layer, minified / gzipped — the number that matters

| Graph | Minified | Gzipped |
| --- | ---: | ---: |
| hope kernel: `primitives/dialog` + the 8 `create-*` + `modal-backdrop` | **9,254 B** | **3,535 B** |
| `@zag-js/dialog` closure alone (9 packages) | 40,542 B | 13,404 B |
| …+ forked adapter + `createPresence` (what ZagDialog pulls) | **50,199 B** | **16,979 B** |

**5.4× minified, 4.8× gzipped** — **~13.4 KB more gzipped JavaScript** per consumer importing one
Dialog. Most of it is `@zag-js/dom-query` (161 KB raw dist JS, a general-purpose DOM toolkit) and
`@zag-js/focus-trap` (53 KB), pulled in wholesale via their barrels.

Installed: **11 packages / ~1.7 MB** against **zero** new dependencies today.

Note this cost does **not** shrink when the fork retires — and unlike axis 4 it has no hope-side fix.

**Score: ❌ — the cost with no remedy.**

---

## Scorecard

| Axis | First draft | Corrected |
| --- | --- | --- |
| 1. Feature parity | ✅ / ❌ four regressions + one impossible | ✅ / ⚠️ four regressions, priced |
| 2. Code volume | ➖ wash (−14%) | ✅ **−39%** steady state, honest |
| 3. Public API delta | ⚠️ one silent contract break | ✅ two documented moves |
| 4. Accessibility | ❌ independent blocker | ❌ **decisive**, but priced at ~310 lines |
| 5. SSR + hydration | ✅ | ✅ |
| 6. Theming friction | ⚠️ | ⚠️ |
| 7. Escape hatches | ❌ 5 of 9 dead-end | ✅ 8 of 9 have an option |
| 8. Maintenance | ❌ **decisive** | ⚠️ acceptable — fork is bounded |
| 9. Bundle size | ❌ | ❌ **the cost with no remedy** |

---

## Recommendation

**Withdraw the NO-GO.** Zag.js is a viable foundation for hope-ui's overlay layer, and Dialog — its
best case, with no collection axis — clears every bar that actually blocks shipping.

**Decisive axis: 4 (accessibility)**, because it is the only axis where Zag is worse in a way that
touches the product's first claim, and because its price is now known rather than feared: **~310
retained kernel lines** (`createHideOutside` + `createFocusRestore`) plus a 3-line `aria-controls`
override closes three of the four gaps and returns every axe assertion to zero allowances. `C3` — a
consumer-authored interactive `Backdrop` — is the one gap with no clean fix, and it is the single
thing worth deciding consciously.

The trade, in one line: **hope-ui stops owning dialog behavior (−39% owned lines, and the removed
lines are the hard ones) in exchange for ~13 KB gzipped per consumer and a scrim that can no longer
carry its own handlers.**

### Do this next, in order

1. **File `A1` upstream** against `@zag-js/solid`. It affects every Solid Zag consumer on 1.x today
   and is independent of everything else here.
2. **Un-skip the four tests** (`G2`). They are blocked by transient cross-test timing, not a product
   defect — most likely `layerStack.recentlyRemoved`, which clears on `nextTick`. Add a tick between
   them and confirm. This closes the last open question in the ledger.
3. **Run the axis-4 experiment**: layer `createHideOutside` + `createFocusRestore` back onto
   `ZagDialog` and add the `aria-controls` override, then re-run both axe suites with **no**
   allowances. If they go green, the 4/9 costs are exactly as priced above and the decision reduces
   to bundle size versus behavior-maintenance relief.
4. **Expose `ids` on `ZagDialog.Root`** and drop the `id`-stripping in the seven parts (`B7`), which
   `G1` shows was never necessary.

Only then is the go/no-go a one-variable decision. **Adoption remains a separate phase** — nothing
here authorises it.

### Keep regardless of the outcome

- **`A1`** — `normalizeProps` stringifying boolean `aria-*`.
- **`A2`** — `createTrack` running its callback `untrack`ed.

Both are correct fixes to a fork that stays in the tree until upstream ships, both have tests, both
are in `machine.md`'s deviation table.

### What this revision should teach the next spike

Three findings drove the first verdict; **two of the three were wrong**, and both errors ran the
same direction — from *reasoning about* the dependency's source instead of *measuring* it. `C6` was
derived by reading `dialog.dom.mjs` and inferring that a consumer id must break the lookup; a
five-line probe showed `ids` resolving both sides through the same function. `D1` was derived from a
test that passed, without checking whether it passed **in isolation** — it does not. A finding that
says "impossible" or "unfixable" deserves a probe before it reaches a verdict, and a test whose
premise is a *defect* must be run alone before it is believed.
