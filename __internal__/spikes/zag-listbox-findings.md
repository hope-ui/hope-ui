# ZagListbox — seam ledger and verdict

`packages/components/src/zag-listbox/` is a collection-driven listbox whose behavior comes from
`@zag-js/listbox@1.42.0` through the vendored Solid 2.0 adapter (`@hope-ui/primitives/zag-solid`),
sharing the *same* hope `listbox` recipe and importing **nothing** from `@hope-ui/primitives/listbox`.

Unlike `ZagDialog`, it does **not** preserve hope's public API. Zag's collection model was adopted
whole (`collection({ items, itemToValue, … })` in, `<For each={collection.items}>` out, selection
carried as collection keys), because bridging it to hope's self-registering `<Listbox.Item>` children
would have *manufactured* the impedance layer this spike exists to measure — and would have kept
hope's collection kernel alive to feed the bridge, destroying the volume result.

**The one question:** does the SolidJS-idiom seam (axis 10 of `zag-dialog-comparison.md`) cost less
the second time, or more? Verdict in section **G**. Sections **A**–**F** are the evidence: one row per
thing that had to change, with why.

---

## A. Fixes that landed in the vendored adapter

**Zero new defects; one workaround relocated.**

`ZagDialog` — the fork's *first* consumer — turned up two genuine adapter defects (`A1` boolean
`aria-*` stringification, `A2` `createTrack` running untracked). The second consumer, exercising a
completely different machine with a completely different concern (collections, typeahead, roving
`aria-activedescendant` instead of overlays, focus traps and scroll locks), turned up **no new
defect**. Both of ZagDialog's fixes were load-bearing here: `zag-listbox.ssr.test.tsx`'s
`aria-selected="false"` × 3 assertion is green only because of `A1`, and `mount()` is silent only
because of `A2`.

| # | What | Why it happened | Fix |
| - | ---- | --------------- | --- |
| A3 | **`mergeProps` construction now runs `untrack`ed in the fork**, so a Zag-backed component needs **no** `untrack` to merge part props. | Building the getter set calls each accessor source once, to enumerate its keys. That is a reactive read, and a Zag part calls `mergeProps` from a *component render body* — one of Solid 2.0's strict-read-labelled phases — so every merged part emitted a `[STRICT_READ_UNTRACKED]`. It is a false positive **by construction**: the read is one-shot and structural, and `untrack` covers only synchronous construction, so the per-key getters stay fully reactive. Exactly the same class as `A2`, one layer down. **Verified against the published `@zag-js/solid@1.42.0` tarball:** upstream's `merge-props.ts` imports only `@zag-js/core`, no `untrack` — because **Solid 1.x has no strict-read phase at all**. In 2.0 the diagnostic is opt-in per phase (`setStrictRead(label)` for component bodies and `<For>`/`repeat` callbacks; `untrack(fn)` with no label clears it). The read is identical in both versions; only 2.0 reports it. | `merge-props.ts` wraps construction in `untrack`; recorded in `machine.md`'s deviation table and `merge-props.md`. |

**This widens the fork's revert surface by one row** — accepted deliberately, because the
alternative is every future Zag-backed component owning the same wrapper. It is also **upstreamable**:
the coming official Solid 2.0 adapter will need it too.

`ZagDialog` predates the fix and still carries its own `mergePartProps` wrapper (untouched — the
spike is additive). It now double-`untrack`s, which is harmless, and it can be deleted whenever that
constraint lifts.

## B. Workarounds the component layer had to carry

| # | Workaround | Why Zag forces it | New, or a repeat? |
| - | ---------- | ----------------- | ----------------- |
| B1 | ~~**`mergePartProps` imported from `zag-dialog/`.**~~ **Eliminated — the parts call the fork's `mergeProps` directly.** | `connect()` returns a plain object computed eagerly at call time, so it cannot be spread without freezing state; the adapter's `mergeProps` re-lazifies it. The wrapper existed only to `untrack` its key-enumeration pass — which belongs in the fork, and is now there (`A3`). | **Better than a repeat: gone.** The component layer carries **zero** merge machinery and **zero** merge-related `untrack`. Proven by rebuilding all 8 parts on the bare `mergeProps`: 8/8 tests green, `mount()` silent. |
| B2 | **`untrack` around `useMachine(...)` in `Root`.** | The adapter seeds the machine's bindables by reading its props memo straight from the render body. Same cause as ZagDialog's `B5`, same one-line shape. | **Repeat, free.** One call site, copied. |
| B3 | **`hidden` stripped from `getItemIndicatorProps()`; the glyph is `<Show>`-gated on `itemState().selected` instead.** | `[hidden] { display: none }` is a UA rule any explicit `display` beats, and the recipe's `itemIndicator` slot is `absolute right-2 flex …`. Left alone, the check glyph would be permanently visible on **every** row. | **Repeat of ZagDialog's `B2`, verbatim, one component later.** Different machine, different part, identical defect. |
| B4 | **`data-active` re-derived per item from `api().highlightedValue`.** | The shared recipe styles the active row with the preset's registered `data-active:` variant. Zag emits `data-highlighted`, and on a *different condition*: `isHighlighted && (inputFocused ? contentFocused : focusVisible)`. **Measured:** hovering a row gives `data-highlighted=false` and the row would carry no marker at all, so the shared recipe would paint nothing under the mouse. | **New**, and the only genuinely new seam. One override getter, per item. |
| B5 | **`highlightOnHover` defaulted to `true`** via `withDefaults`. | Zag defaults it **off**, so a mouse would move the pointer over rows and highlight nothing. hope's `Listbox` highlights on real pointer movement. | **New**, trivial (one `withDefaults` key). |
| B6 | **The `ItemGroup` ⇄ `ItemGroupLabel` link is a hand-repeated string.** | `getItemGroupProps({ id })` and `getItemGroupLabelProps({ htmlFor })` each derive their ids from a key the consumer types twice. hope's `Listbox.GroupLabel` *registers* its own id onto the group via `createRegisteredId`, so the link cannot be mistyped and cannot dangle. | **New**, but it is a *removal* of hope code, not an addition — the registration seam disappears. Cost is moved to the consumer. |
| B7 | **A `trackFocusVisible()` warm-up at story-module scope — without it every story crashes.** See below. | Storybook 10.5 replaces `HTMLElement.prototype.focus` with an **accessor**; `@zag-js/focus-visible` reads that property **off the prototype**, so the getter runs with `this === HTMLElement.prototype` and `ownerDocument` throws `Illegal invocation`. | **New, and the most serious thing this spike found.** 3 lines + a dependency pin. |

### B7 in full — Zag crashes Storybook, and Storybook is this repo's only non-test feedback loop

This is worth its own section because it is the one finding that **stopped the deliverable working**,
and because it was missed on the first pass: the stories were written, typechecked and shipped
**without ever being opened**. Every story threw `[REACTIVITY_HALTED] TypeError: Illegal invocation`
and rendered nothing.

The mechanism, verified in the browser rather than inferred:

| Step | Evidence |
| --- | --- |
| Storybook 10.5's `enhanceContext` loader redefines `HTMLElement.prototype.focus` as an accessor | `storybook/dist/csf/index.js`: `get() { return this.ownerDocument?.defaultView ? … : noopFocus }` |
| The listbox machine runs `trackFocusVisible` as an unconditional effect | `listbox.machine.mjs`, `effects: ["trackFocusVisible"]` |
| `@zag-js/focus-visible`'s `setupGlobalFocusEvents` reads the property **off the prototype** | `let focus = win.HTMLElement.prototype.focus` |
| So the getter runs with `this === HTMLElement.prototype`; `ownerDocument` is a native accessor that rejects a non-element receiver | measured: prototype read → `TypeError: Illegal invocation`; the *same getter* with a real element receiver → fine |
| Zag wraps only the following `defineProperty` in a `try`, not the read | `focus-visible/dist/index.mjs:73–84` |
| The throw escapes into the machine's effect and Solid halts the whole reactive system | `[REACTIVITY_HALTED]`, story renders nothing |

**The fix is a warm-up, not a patch.** `setupGlobalFocusEvents` is once-per-window
(`listenerMap.get(win)` guards it) and story modules evaluate *before* Storybook's loaders run, so
calling `trackFocusVisible({ onChange(){} })` at module scope succeeds while `focus` is still a plain
data property and makes every later call an early return. Nothing is monkey-patched by hope, and
Storybook's own instrumentation still installs correctly on top.

**Why it matters to the verdict, and why it is not a "story bug":**

- It is a **dependency-interop defect between two dependencies**, neither of them hope's, and neither
  of them fixable here. hope's handmade `Listbox` cannot hit it — the kernel reads no prototype.
- It does **not** affect a real app; nothing patches `focus` there. It is strictly a
  **development-harness** cost — which is exactly the cost that matters most in this repo, where
  CLAUDE.md names Storybook "the only non-test feedback loop".
- It generalises: `trackFocusVisible` is in `listbox`, `select`, `combobox`, `menu`, `tabs` and more.
  **Every** Zag component with focus-visible tracking needs this warm-up, so it is a genuine
  **per-component recurring cost** — the third such row, alongside `B3` and `C2`.
- It was invisible to the entire automated suite: 7 browser tests, axe, SSR, hydration, `mount()`'s
  diagnostics — all green, because Vitest does not patch `focus`. **Only opening the page found it.**

Not a workaround but worth recording: **`mergePartProps`'s doc comment is now scoped wrong.** It
documents ZagDialog's policy of stripping `id` from every part — a policy `G1` in the ZagDialog
ledger later showed was never necessary. ZagListbox deliberately does not strip `id` and exposes
Zag's `ids` prop instead, which is the sanctioned mechanism. The helper lives in another component's
folder (untouchable under this spike's constraints), so the comment stands and now describes only one
of its two consumers. A shared helper wants a shared home.

## C. Behavior / API deltas, measured

| # | hope `Listbox` | `ZagListbox` | Verdict |
| - | -------------- | ------------ | ------- |
| C1 | The `role="listbox"` element **is** `Listbox.Root`. | Zag's anatomy is `root > label + content`; `content` is the `role="listbox"` element. | **Delta.** One extra DOM node per listbox, one extra part in every consumer's tree, and the recipe's `root` slot has to land on `Content` while Zag's `root` part goes unstyled (the recipe has no slot for it). |
| C2 | Named with `aria-label`/`aria-labelledby`; no label part. | `getContentProps()` emits `aria-labelledby="listbox:<id>:label"` **unconditionally**, whether or not a `Label` was rendered. **Measured:** with no `Label`, the IDREF resolves to nothing and axe raises `aria-valid-attr-value` (critical). | **Regression, and an exact repeat of ZagDialog's `C1`.** Pinned by `dangles aria-labelledby when no Label is rendered`. Same ~3-line override-getter fix; neither spike took it. |
| C3 | Items self-register, so navigation and the DOM cannot disagree. | The machine navigates over collection **data**. A `<Show>`-gated row is still a navigation stop, and `aria-activedescendant` points at an id that does not exist while it is highlighted. | **Regression, time-boxed** (it clears on the next move). See section **D** — this was the pre-registered functional probe, and it is **not** fatal. |
| C4 | `selectionMode: "single" \| "multiple" \| "none"`. | `"single" \| "multiple" \| "extended"`. No `none`; `extended` (modifier-key multi-select) has no hope equivalent. | **Delta both ways.** `extended` is a real feature hope lacks. |
| C5 | `value` is `V[]` — the consumer's own item objects. `onChange(value: V[])`. | `value` is `string[]` — collection **keys**. `onValueChange({ value, items })`. | **Public API delta**, deliberate (this spike went full-Zag). |
| C6 | `Listbox.Separator` (a `role="presentation"` hairline) with a recipe slot. | No separator part in the anatomy. | **Missing.** The recipe's `separator` slot is unreachable; a consumer writes the element by hand. |
| C7 | `name`/`form`/`required` → one hidden input per selected value, over the full set. | Nothing. | **Missing.** Native form submission would be hope-layer code again. |
| C8 | Virtual mode (`items` + `estimateSize` → `createVirtualCollection`). | Not built. Zag exposes `scrollToIndexFn` as the integration point, so it is reachable, but the windowing itself would still be hope's. | **Missing, reachable.** Out of scope per the brief. |
| C9 | `<V>` flows through the component as a generic, cast once through context. | No cast needed — because `CollectionItem` is `any`. | **Not a win.** The generic does not need to travel through context because the item type was erased at the collection's door. |
| C10 | — | `data-scope`/`data-part` on every part, `data-layout`, `data-value`, `--column-count`, `data-activedescendant`. | **Neutral.** DOM noise beside `data-slot`; `data-activedescendant` is a genuinely useful styling hook. |
| C11 | — | `collection` is a **required** prop, so `meta.args` is mandatory for every Storybook story. hope's `Listbox.Root` has no required prop. | **Neutral, small.** A real consequence of data-down. |
| C12 | — | Unexposed Zag extras: grid collections (`gridCollection`, two-axis arrow navigation), `getInputProps` (a combobox-grade filter input), `selectAll`, `valueAsString`, `scrollToIndexFn`. | **Extra**, and `getInputProps` + grid layout are substantial features with no hope equivalent. |

Two claims that **did not survive measurement** and are recorded here rather than quietly dropped —
the discipline `G` of the ZagDialog ledger asks for:

- *"Zag's typeahead lands on disabled rows because it never consults `getItemDisabled`."* **False.**
  Measured: both `getNextValue` and the typeahead search skip disabled entries, exactly as hope's
  `skipDisabled` does. The test now pins the correct behavior.
- *"Focusing a listbox that already has a selection highlights nothing in Zag but highlights the
  selected row in hope."* **False on both halves.** Measured `[false, false]` for hope too — its
  default roving focus puts DOM focus on the row, so focusing the container does nothing either.

## D. The functional probe — collection data vs. rendered DOM

The pre-registered "stop and report in an hour if it is fatal" probe. Run first, against a raw
machine with no component layer, then re-run through the finished component.

| Probe | Result |
| ----- | ------ |
| A `<Show>`-gated row: does the machine navigate onto it? | **Yes.** `getNextValue` is a pure index walk over the collection. |
| Does navigation then get stuck? | **No.** The next arrow moves straight past it. |
| What is the cost? | `aria-activedescendant` points at a non-existent id while the missing row is highlighted (`document.getElementById(…) === null`, asserted). |
| An item wrapped in a consumer component? | **Works.** Ordinary JSX composition; the machine never inspects the tree. |
| A collection swapped at runtime? | **Works.** The collection prop is read through the props accessor and `<For>` re-renders. |

**Not fatal.** The spike continued. The finding is `C3`: rendered structure must mirror collection
data, or the ARIA link dangles — a *discipline* the consumer must keep, where hope's self-registering
items keep it by construction.

## E. What came through unchanged

- **SSR → hydrate passed on the first try, across N items.** The open question going in was `_hk`
  stability with a `<For>` under a machine that allocates a `createUniqueId()` before the rows render.
  `zag-listbox.ssr.test.tsx` pins the bytes; `hydrateFixture` claims every node.
- **axe is clean with no allowances** on the full anatomy (`Root`/`Label`/`Content`/`Item`/`ItemText`/
  `ItemIndicator`) — against ZagDialog, where **all six** call sites needed one. The listbox closure
  pulls no `@zag-js/aria-hidden`, so the `inert`/`aria-hidden-focus` cost that dominated ZagDialog's
  axis 4 simply is not on this axis. The one allowance in the suite is the deliberate `C2` pin.
- **`mount()` reports zero `STRICT_READ_UNTRACKED` / `REACTIVE_WRITE_IN_OWNED_SCOPE`** with one
  `untrack` in the component layer.
- Keyboard navigation, typeahead, disabled skipping, single and multiple selection, `defaultValue`,
  controlled `value`, click selection, and the `data-*` state markers all worked with no edit.

**Verified by hand in Storybook** (after `B7`), not only by the suite: all five stories render; the
`Default` panel is **pixel-identical to hope's `Listbox` Default story**, which is the whole point of
sharing the recipe; selection, `Home`/`End`, typeahead and `Enter` all behave; arrow navigation skips
the disabled row; and exactly one row carries `data-active` at a time, painted by the shared recipe
(`oklch(0.97 0 0)` — confirmed in computed styles, since it is too subtle to read in a screenshot).

## F. The three pre-registered tables

### F1. Seam — the primary question

| Metric | ZagDialog | ZagListbox |
| --- | ---: | ---: |
| `untrack` **call sites** in the component layer | 2 (Root seed; `mergePartProps`) | **1** (Root seed only) — the merge `untrack` moved into the fork (`A3`) |
| `mergePartProps` | written once — 48 raw, **15 code** (65% comment), 7 parts | **0 — the helper no longer exists.** Parts call the fork's `mergeProps` directly (`A3`) |
| New seam machinery | — | **none** |
| New per-item `untrack` | — | **none** |
| Collection mirrored into a Solid store to stay reactive | — | **no** |
| Component source, raw / **code** (excl. stories/tests) | 731 / **473** (15 files) | 609 / **405** (10 files) |
| Element lookups by DOM id in the machine (`getById`) | 8 | 6 |
| `untrack` in the handmade counterpart | 0 (`components/dialog` + `primitives/dialog`) | 4 — all deliberate untracked reads *inside effects*, each with a rationale comment; none suppressing a render-body snapshot read |
| Lines of harness workaround needed to make the **stories** run | 0 | **3 + a dependency pin** (`B7`) |

Against the pre-registered criteria: **amortizes** on every clause, and on one clause it did better
than "amortize" — the helper was not merely reused, it was **deleted**, its `untrack` pushed down
into the fork where every future Zag component gets it free (`A3`). `untrack` call sites went
*down*, not up; no per-item helper, no memoization layer, no store mirror. The one new *reactivity* seam is `B4` (`data-active`), a single override getter, and it
exists because the recipe is shared — not because items are a collection.

The pre-registered criteria did not anticipate `B7`, which is a seam of a different kind: not between
Zag and Solid, but between Zag and the **dev harness**. It costs 3 lines, and it recurs.

### F2. Granularity — the mechanism under test

200 items. Counters supplied by the test (neither component modified): `classReads` = the consumer
`class` prop, read once per item prop-set recomputation on **both** stacks; `itemToValue` = the
collection identity fn, which `getItemState` calls on every `getItemProps`/`getItemTextProps`/
`getItemIndicatorProps`, so on the Zag side it **is** the `getItemProps` count.

| One arrow-key focus move, 200 rows | ZagListbox | hope `Listbox` |
| --- | ---: | ---: |
| item prop-set recomputations (`classReads`) | **400** (2 per row) | **200** (1 per row) |
| `getItemProps` / `getItemState` (`itemToValue`) | **8 004** | **0** |
| DOM attribute writes (MutationObserver) | 6 | 4 |

| One selection, 200 rows | ZagListbox | hope `Listbox` |
| --- | ---: | ---: |
| item prop-set recomputations | **400** | **200** |
| `itemToValue` | **8 028** | 800 |
| DOM attribute writes | 3 | 2 |

**Decomposed.** Re-running the Zag harness with the same 200-item collection but only **1** row
rendered gives `itemToValue` = 46 and `classReads` = 2 per arrow move. So:

- **machine-internal collection walking** ≈ 46 per arrow move, independent of how many rows render
  (`getNextValue` → `indexOf` → `findIndex` over the whole collection, plus `syncHighlightedItem`);
- **per rendered row** = (8 004 − 46) / 199 = **40.0 `getItemState` computations, per row, per
  keystroke**, and 2 prop-set reads.

The 40 is exactly explained, and the explanation is the seam: `mergePartProps` defines one lazy
getter **per key**, and each getter re-invokes its whole source object. One prop-set read of an item
therefore calls `getItemProps` once for each of its ~20 keys; two reads per state change gives 40.
ZagDialog paid this too — 7 singleton parts × ~20 keys ≈ 140 calls per state change — where it was
invisible. At 200 items it is 8 000.

**Two results, and they point opposite ways.**

1. **The axis-10 "O(N) vs O(1)" prediction does not survive measurement.** hope's `Listbox` is
   O(N) here as well, at 1 read per row against Zag's 2. Solid's `spread` is **one effect per
   element that reads all of that element's props**, and every row subscribes to the shared active
   signal through its own `data-active` — so every row's effect re-runs on every highlight move, in
   both stacks. Fine-grained-ness in Solid is per *element*, not per *attribute*. The "Solid's
   fine-grained updates are O(1)" half of the claim was wrong.
2. **What is real, and larger than predicted, is the cost of each of those reads.** hope's item
   getters are id comparisons against a signal — the counted collection fn is never called at all
   during navigation. Zag rebuilds the row's full `ItemState` forty times per row per keystroke.
   That is not O(N) vs O(1); it is O(N)·40 vs O(N)·1, and the constant is the seam's, not the
   machine's.

**Nothing user-visible.** DOM writes are 6 vs 4 — Solid's `spread` diffs before writing, so the
recomputation is pure CPU. Nothing in the 200-row story looks or feels wrong.

### F3. Volume

> **Counted two ways.** Raw `wc -l` includes comments and blank lines, and this repo mandates dense
> *why*-comments — so a raw count rewards whichever side is worse documented. **Code lines** below are
> exact, produced with TypeScript's own scanner (a `//` inside a string is never miscounted); a line
> carrying both code and a trailing comment counts as code. Comment density turns out to be
> comparable on both sides (25–37%), so the ratios barely move — but the raw figures alone were not a
> sound basis and are no longer quoted on their own.

Deletable under full-Zag adoption, **verified independently**:

| | Raw | **Code** | Comment % |
| --- | ---: | ---: | ---: |
| `packages/components/src/listbox/` (excl. stories) | 634 | 361 | 37% |
| `packages/primitives/src/listbox/` | 692 | 463 | 25% |
| Listbox-only kernel: `create-list-{navigation,selection,typeahead}` + `create-virtual-collection` | 776 | 521 | 25% |
| **Total deletable** | **2 102** | **1 345** | 29% |

The brief's attribution holds. Verified: `createCollection` (150) and `createListFocus` (261)
**stay** — `calendar-root.ts` imports both directly, and `createGridNavigation` (calendar's) composes
them. One caveat the brief did not name: `create-grid-navigation.ts` imports the **type**
`TextDirection` from `create-list-navigation.ts`, so that type has to move before the file can be
deleted. Trivial, but it is not a clean `git rm`.

| Scenario | Owned (raw) | vs. 2 102 | Owned (**code**) | **vs. 1 345** |
| --- | ---: | ---: | ---: | ---: |
| As built (fork already owned for ZagDialog) | 609 | −71% | **405** | **−70%** |
| …plus the a11y/feature gaps closed in hope's layer (`C2` override; a `Separator` part; native-form hidden inputs) | ≈ 700 | −67% | ≈ **460** | **−66%** |

**But the two sides are not feature-equal**, and the honest reading has to say so: ZagListbox ships
no virtualization, no native-form integration and no separator, where hope's total includes all
three. Netting those out, the like-for-like reduction is smaller — call it roughly **−55%** against a
feature-matched Zag listbox. It is still the largest volume result either spike has produced, and
much larger than ZagDialog's −39%, because a collection kernel is a *lot* of code and Zag's
collection is genuinely complete.

### F4. Bundle (not pre-registered; measured because it is cheap and it moved)

`esbuild --bundle --minify`, `solid-js`/`@solidjs/web` external.

| Graph | Minified | Gzipped |
| --- | ---: | ---: |
| hope kernel: `primitives/listbox` + the 6 kernel primitives | 13 786 B | **5 289 B** |
| `@zag-js/listbox` closure (8 packages) | 36 931 B | 11 450 B |
| …+ the forked adapter (shared with ZagDialog) | **46 567 B** | **14 944 B** |

**3.4× minified, 2.8× gzipped — +9.7 KB gzipped**, against ZagDialog's +13.4 KB. Installed: 8
packages / ~1.6 MB, of which **4 are new** (`listbox`, `collection`, `anatomy`, `focus-visible`);
`core`/`types`/`utils`/`dom-query` were already in the ZagDialog closure. Shipped source:
`dist/zag-listbox/index.jsx` is 10 663 B against `dist/listbox/index.jsx`'s 12 750 B — smaller, which
is the feature-gap caveat showing up again.

The per-component bundle cost does **not** compound the way the ledger's first draft assumed: the
second component's marginal cost is only its own machine plus what it does not already share.

---

## G. Verdict on the one question

> **Does the SolidJS-idiom seam cost less the second time, or more?**

### **It amortizes — decisively, on the pre-registered criteria — and the axis-10 claim needs correcting in two directions at once.**

**Amortizes, measured against exactly what was pre-registered:**

| Pre-registered "amortizes if…" | Result |
| --- | --- |
| `mergePartProps` reused verbatim | ✅ **exceeded** — the helper was eliminated outright, its `untrack` moved into the fork (`A3`), so the component layer carries no merge machinery at all |
| `untrack` call sites stay ~2, nothing per-item | ✅ **1** — fewer than Dialog's 2 |
| No new seam machinery | ✅ none |
| *(compounds if)* items need a per-item `untrack` or their own merge helper | ❌ did not happen |
| *(compounds if)* `getItemProps` churn forces a memoization layer hope must own | ❌ did not happen |
| *(compounds if)* the collection must be mirrored into a Solid store | ❌ did not happen |

Adding the second component cost **405 code lines of assembly and one `untrack`**. It also cost zero
new adapter *defects*, which is the strongest single signal in the ledger: the fork's first consumer
found two, the second found none — and the one fork change it did make (`A3`) **removed** a
per-component workaround rather than adding one. The seam is a **fixed cost, paid once**, and it got
cheaper, not dearer, on the second component.

**But there is a recurring floor, and it is three rows, not zero:**

- `B3` — `hidden` losing to an explicit `display`, ZagDialog's `B2` in a different machine on a
  different part. Not a coincidence: Zag's "always mount, hide with `hidden`" convention collides
  with hope's recipes, which set `display` on nearly every slot. **Expect this on every component.**
- `C2` — an unconditional labelling IDREF that dangles when its target is not rendered, ZagDialog's
  `C1` exactly. Also not a coincidence: Zag derives ids from a scope rather than registering them, so
  "does the target exist?" is a question the machine structurally cannot answer.
- `B7` — **new, and the one that actually broke something.** Zag's focus-visible tracking crashes
  under Storybook 10.5. It applies to every Zag component that tracks focus visibility (`listbox`,
  `select`, `combobox`, `menu`, `tabs`, …), so it is per-component too.

Three recurring rows, ~5 lines each, each with a known fix. That is still the shape of an amortizing
cost with a small floor rather than a compounding one — **but the floor is real, it grew between
component #1 and component #2, and it grows by *category*, not just by line count.** Each of the
three is a different class of collision (styling convention, id strategy, host-environment
assumptions), which is the honest reason not to extrapolate a flat per-component number from two
data points.

**And the axis-10 mechanism itself was half wrong.** The claim was that Zag is O(N) where Solid is
O(1). Measured, both are O(N) in prop-set recomputations — Solid's per-element spread effect makes
every row re-run on a shared-signal change no matter who wrote the component. What is real is a
**40× constant** on each of those recomputations, and that constant belongs to `mergePartProps`'
per-key-getter design, not to Zag's framework-agnosticism. So the axis is simultaneously:

- **less structural** than claimed — it is a property of the reconciling helper, and a helper that
  memoised `getItemProps` per `(item, state)` would collapse the 40 toward 1, at the cost of hope
  owning exactly the memoization layer this spike listed as a "compounds" signal;
- **more consequential at scale** than Dialog could show — 8 000 full item-state rebuilds per
  keystroke at 200 rows, invisible in the DOM and invisible in a 7-part overlay.

**A method failure worth recording, because it extends the ZagDialog lesson.** The stories were
written, typechecked, linted and committed **without ever being opened**, and every one of them
crashed (`B7`). Nothing in the automated suite could have caught it — 7 browser tests, axe, SSR,
hydration and `mount()`'s diagnostics were all green, because Vitest does not patch
`HTMLElement.prototype.focus`. The ZagDialog ledger's lesson was *measure, don't reason about a
dependency's source*; this one extends it: **a story is a deliverable, not a checkbox — open it.** A
DoD item verified only by a file-existence check (`check:coverage-parity`) is verified in name only.

### What this changes about the recommendation

The ZagDialog comparison said *"decide it on component #6, not on Dialog"*, and named axis 10 as the
one cost that is structural, unpriceable and multiplied per component. **On this evidence it is none
of those three.** It is a fixed seam cost, already paid, with a small recurring floor (`B3`/`C2`) and
one *priceable* scaling constant that a better merge helper could largely remove.

Against that, the two costs this spike did **not** improve on are the ones that were already priced:
the bundle toll (+9.7 KB gz here) and the public-API delta (large, because going full-Zag is a
different component). And the axis-4 accessibility cost that dominated ZagDialog **does not
generalise** — it belonged to `@zag-js/aria-hidden` and the modality mechanisms, which a listbox
never touches. ZagListbox's axe is clean with no allowances.

**What the maintainer should conclude:** Zag's per-component cost is lower than Dialog implied, and
the argument against adoption can no longer rest on axis 10. If adoption is rejected, it should now be
rejected on bundle weight, on the public-API migration, and on the judgement that hope-ui's identity
is a Solid-native library — not on a seam that measurably did not compound.

**What it does not settle:** a floating component. Popover/Select add imperative `style` writes
against a reactive binding (axis 6) and the whole modality stack (axis 4) on top of a collection.
Nothing here speaks to either.

---

## H. Housekeeping

**Test budget.** The brief targeted ~250–300 lines. The instrument came to 355 (browser) + 52 (SSR) +
63 (the shared `ssr-entry`). The overrun is entirely the granularity harness: measuring both stacks
needs two complete 200-row applications plus a profiling helper, ~110 lines that produce the one
number the spike turns on. The rest is at budget — no parity port was written.

**Revert surface.** One `git rm -r` plus five reversions, all mechanical:

```
git rm -r packages/components/src/zag-listbox/
```
then revert `packages/primitives/src/zag-solid/merge-props.ts` (the `A3` `untrack` — **the one
non-additive change this spike makes**; it is shared code `ZagDialog` also runs, and its own
`mergePartProps` would become load-bearing again on revert),
`packages/components/package.json` (one `hope.entries` line, one `exports` block, two
dependency lines plus the `@zag-js/focus-visible` devDependency from `B7`), `pnpm-workspace.yaml`
(three catalog pins, three `minimumReleaseAgeExclude` lines),
`vitest-hydration-bridge.ts` (one `HYDRATION_ENTRIES` line), `pnpm-lock.yaml` (via `pnpm install`),
and this file plus the axis-10/recommendation edits in `zag-dialog-comparison.md` and the
"second consumer" note in `__internal__/primitives/zag-solid/machine.md`. Nothing under
`packages/components/src/{listbox,dialog,zag-dialog}/` or `packages/primitives/src/{listbox,dialog}/`
was touched; the adapter is unchanged.

**Suite state at the end of the spike.** `pnpm test` 395/395, `pnpm test:browser` 553 passed / 4
skipped (ZagDialog's known four), `pnpm test:ssr` 60/61 — the one failure is
`calendar.ssr.test.tsx > matches its server output byte for byte`, confirmed pre-existing by
re-running it on a stashed tree. `typecheck`, `lint`, `check:coverage-parity` and
`check:recipe-purity` all pass. All five stories verified by hand in a running Storybook, with zero
console errors — see the note at the end of §E, and `B7` for why that check was not optional.
