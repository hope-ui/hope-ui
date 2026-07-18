# Evaluating `@solid-primitives` before building a primitive

`@solid-primitives` (the `next` branch, tracking SolidJS 2.0 beta) is the community-standard,
SolidJS-team-adjacent set of low-level primitives. It is a first-class source to adopt from — but on
hope-ui's terms, which are stricter than most consumers'.

## The practice

**Before writing a new internal primitive, check the `@solid-primitives` `next` branch for a package
that already solves it.** Record a verdict — *adopt*, *wrap*, or *build-fresh-because* — so the same
package isn't re-evaluated from scratch later. Packages:
<https://github.com/solidjs-community/solid-primitives/tree/next/packages/>

Anything adopted is **full-DoD-wrapped**: it must clear hope-ui's existing gates through the
composing component — an SSR test, a **byte-for-byte hydration fixture with no mismatch**, a baseline
axe pass, and a clean `STRICT_READ_UNTRACKED`/`REACTIVE_WRITE_IN_OWNED_SCOPE` run. Trusting upstream
coverage is not enough; hope-ui's differentiator is that it *guarantees* this end to end.

Two mechanical requirements for any adoption:

- **Version:** the `next`-branch packages peer-depend on `solid-js ^2.0.0-beta.17`; the workspace
  catalog is aligned to `2.0.0-beta.17` so they resolve to a single `solid-js` instance
  (`pnpm why solid-js` must report one version). Adopted packages are published prereleases — pin
  the exact version.
- **SSR test resolution:** add the package to the `ssr` project's `server.deps.inline` in
  `vitest.config.ts`, or its own `import ... from "solid-js"` bypasses the server-build alias and
  loads a second `solid-js` copy (symptom: `createUniqueId cannot be used outside of a reactive
  context`).

## ⚠️ The compute-form-signal hydration hazard — and why it was a harness-config artifact, not a real defect

A primitive that creates a **compute-function signal or memo** in the component body —
`createSignal(fn)` / `createMemo(fn)` — participates in Solid's hydration id allocation
(`hydratedCreateSignal`/`hydratedCreateMemo`), consuming an id and **shifting every subsequent
`_hk`**. That is fine as long as server and client shift together. This was originally recorded as a
"transform-boundary hazard" — the claim that an *un-transformed* `node_modules` dependency skips the
id on the server while the client consumes it. **That framing was wrong.** (Verified 2026-07 by
spiking the published `@solid-primitives/controlled-signal@1.0.0-next.2` dist through both a faithful
real-consumer harness and our own `ssr` + `browser` projects.)

**What was actually happening.** Our SSR harness (the `ssr` Vitest project and the hydration-fixture
bridge) aliases `solid-js`/`@solidjs/web` to their *server* builds, but by default **externalizes**
third-party deps. An externalized dep's own `import { createSignal } from "solid-js"` never sees that
alias — Node resolves a *second* `solid-js` copy — so the dep's compute-form signal runs against a
different runtime than the app and **fails to consume its hydration id on the server**. The root
drops from `_hk=1` to `_hk=0` and every subsequent `_hk` shifts down one versus the client. This is
the **same "two `solid-js` instances" trap** the config already documents for `@solidjs/web` itself
([`vitest.config.ts`], [`vitest-aliases.ts`]), one level out — it has nothing to do with JSX
compilation (a `create*` primitive has no JSX for `vite-plugin-solid` to transform anyway).

Measured directly with the published `controlled-signal` dist, `createSignal(fn, { ownedWrite: true })`:

| How our SSR harness loads the dep | Server root `_hk` | Client root `_hk` | Round-trip |
| --- | --- | --- | --- |
| **Externalized** (old default) | **`_hk=0`** | `_hk=1` | ❌ asymmetric (the false alarm) |
| **Inlined** (`server.deps.inline` / `ssr.noExternal` += `/@solid-primitives\//`) | `_hk=1` | `_hk=1` | ✅ symmetric |
| Faithful real-consumer render (subprocess, real dist, no aliases) | `_hk=1` | `_hk=1` | ✅ symmetric |

**The fix** is one line, kept in lockstep in two places: add `/@solid-primitives\//` to the `ssr`
project's `server.deps.inline` and to the bridge's `ssr.noExternal`. (Non-anchored on purpose:
Vitest matches `server.deps.inline` against the dep's resolved absolute *path*, so a `^`-anchored
pattern silently never matches — itself a wrong-red footgun.) With that, the published dist
round-trips cleanly through our real `ssr` + `browser` projects (silent hydration, full node reuse,
no a11y violations).

**Lesson (revised).** The hazard is real but **cheap to neutralise**: any adopted dep that creates a
render-body compute-form signal/memo must be **inlined** in the SSR harness *and* proven against the
hydration round-trip — it is not "un-reconcilable" and does not disqualify adoption. Effect-only
deps (no render-body signal/memo, e.g. `a11y/createAnnounce`) never hit it, which is why the calendar
adopted a11y without issue while `controlled-signal` looked broken: same root cause, opposite
outcome. **Do not repeat the original mistake of measuring an externalized dep and blaming the
primitive.**

> A guard worth adding: cross-check the bridge's server render against a pristine-subprocess render
> so a mis-configured inline fails as a hard error instead of a silent asymmetric `_hk`.

## Current verdicts

### Tier A — leaf utilities (adopt when a component needs one)
No existing primitive was replaced (the `controlled-signal` reference adoption broke hydration — see
below), but these are the first to reach for when the relevant component gets built, each subject to
the hydration-id hazard and full-DoD-wrap above. **Effect-only primitives (no render-body
signal/memo) are the safe bet; anything creating a compute-form signal/memo must clear the hydration
round-trip first:**

`state-machine`, `list-state`, `selection`, `pagination`, `range` (Select/Combobox/Menu/Slider);
`intersection-observer` / `resize-observer` / `mutation-observer`, `media`, `keyboard`,
`event-listener`, `scroll` (position), `storage`, `i18n`, `refs`, `props`; `a11y`
(`createFormControl`, `createAnnounce`, `createReducedMotion`). Effect-only primitives (no
render-body memo) are the safest bet.

### Tier A — evaluated, adopt-candidate
- **`Field`/`Fieldset` ← `a11y/createFormControl`: ADOPT (hydration-gated), not the `form` package.**
  `@solid-primitives/a11y` exports exactly the field-ARIA wiring hope-ui's `Field` needs —
  `createFormControl` + `createFormControlInput` + `FormControlContext`/`useFormControl`: it
  registers label/description/error ids, computes the `aria-labelledby`/`aria-describedby` chains,
  and exposes `data-invalid`/`data-required`/`data-disabled`/`data-readonly`. So **do not hand-roll
  `createFormControl`.** `@solid-primitives/form` is **out of scope**: its headline `createForm`
  (values/validation/touched/submit/`toFormData`) is a form-state engine a headless component
  library must not own — consumers bring their own; its `createFormControl` is the same primitive as
  a11y's, so `a11y` is the leaner dependency. **Gate:** `createFormControl` likely builds the
  describedby chain with a render-body `createMemo`, so it must clear the `Field` hydration
  round-trip (the transform-boundary hazard above) before adoption. If it fails, fall back to an
  in-repo **effect-only / getter-based** version — ids via `createUniqueId` (symmetric), describedby
  as a plain getter, no memo — rebuilt from the pattern, not copied.

### Calendar family — evaluated, decided (built 2026-07)

- **`Calendar` announcer ← `a11y/createAnnounce`: ADOPTED.** The screen-reader live-region announcer
  the calendar uses for period/view/selection changes (replaces the Angular original's CDK
  `LiveAnnouncer`). It is **effect-only** — no render-body signal/memo — so it is on the safe side of
  the hydration-id hazard: it builds its live regions with `document.createElement` guarded by
  `isServer` (no-op server-side), appends them to `document.body` outside the component tree, and
  registers `onCleanup`. `createCalendar` additionally guards the call on `typeof document` so the
  Node `unit` project (client build, no DOM) doesn't hit `document.createElement`. Cleared the
  calendar hydration round-trip (no console error/warn, byte-for-byte fixture).
- **`@solid-primitives/i18n`: REMOVED (was re-exported; replaced by an in-house catalog + resolver).**
  Originally the i18n module re-exported the `@solid-primitives/i18n` `translator`/`flatten`/
  `resolveTemplate` seam. It has been dropped as a dependency in favour of hope-ui's own centralized
  message API — a built-in en/fr catalog (`messages.ts`) plus a `t()` resolver (`translate.ts`)
  exposed on the `I18nProvider` context — ported from the maintainer's Angular predecessor's
  `I18nService`. Two reasons: (1) remove the runtime dependency, and (2) `@solid-primitives/i18n`'s
  `translator` **memoizes** (a compute-form signal), and a memoized translator in a render path is
  exactly the transform-boundary hydration hazard this doc catalogs. The in-house `t()` is a plain
  function that reads the locale accessor on each call — never a `createMemo` — so it is hydration-safe
  by construction and can be called directly in the calendar's render path (which previously had to
  avoid the translator by using a plain `CalendarMessages` dictionary; that dictionary is now gone,
  replaced by `t('calendar.*')`). The locale/direction *context*
  (`I18nProvider`/`useLocale`/`createDefaultLocale`) remains **derived from
  React Spectrum/`@react-aria/i18n`**; see the CLAUDE.md i18n provenance note.
- **`@solid-primitives/date`: REJECTED.** Date math stays `@internationalized/date` (immutable,
  date-only `CalendarDate`, locale-aware, React Aria's substrate; every pure calendar util depends
  only on it). `@solid-primitives/date` is `Date`-based/mutable and, as a `node_modules` reactive
  primitive, would risk the transform-boundary hazard for no benefit.

### Button / pressable family — evaluated, decided (built 2026-07)

- **`createPress` ← no `@solid-primitives` package: BUILD-FRESH.** There is no unified press engine
  in the `next` branch. The closest leaf utilities (`event-listener`, `keyboard`,
  `pointer`/`mouse-position`) are lower-level: adopting them would still leave the *entire* press
  state machine — pointer/touch/mouse/keyboard/SR-virtual-click normalization into one `onPress`,
  cancel-on-drag-out with re-arm, scroll cancel, focus-on-press normalization, and touch
  text-selection suppression — to write by hand. `keyboard` is a global-shortcut/held-keys tracker,
  not an element-scoped Enter/Space activation contract. So the press engine is built fresh,
  API-modeled on React Aria `usePress` (its behavior, not its code). It is **effect-free** (only a
  plain-value `createSignal(false)` for `isPressed` — not a compute-form signal/memo — plus
  event-driven `document` listeners added imperatively during an active press and torn down on
  `pointerup`/cancel/`onCleanup`), so it is hydration-safe by construction: `isPressed` starts
  `false` on both server and initial client, and the consumer surfaces it as `data-pressed` only
  when truthy, so the server and initial-client markup carry no press attribute. No module-scope
  state (the transient press bookkeeping is a closure `let` per instance).
- **`createButton` ← no `@solid-primitives` package: BUILD-FRESH.** The element-aware button
  behavior layer (native `<button>` vs `render`-ed anchor/generic) is modeled on Base UI
  `useButton` (the `native` boolean + ref-for-event-time-refinement split). No `@solid-primitives`
  equivalent; it composes `createPress` and adds only render-time static a11y props plus a
  client-only `createEffect` for the dev mismatch warning.

### Tier A — evaluated, kept (build-fresh / no swap)
- **`createControllableState` ← `controlled-signal`: KEPT (not adopted) — hydration objection
  retracted; ours is simply better for our needs.**
  `createControllableSignal` backs its state with a compute-function signal
  (`createSignal(fn, { ownedWrite: true })`). This was originally recorded as REJECTED because the
  packaged dep "broke hydration" (`_hk=1010` server vs `2010` client). **That was a harness-config
  artifact, not a defect** — the dep was *externalized*, so its `solid-js` escaped our server-build
  alias (see the corrected hazard section above). Re-spiked 2026-07: the published
  `1.0.0-next.2` dist round-trips cleanly through our real `ssr` + `browser` projects once
  `@solid-primitives/*` is inlined, and through a faithful subprocess-render harness with no config
  at all. So adoption is **viable**. It is still **not adopted**, for the same standing reason it was
  never a swap worth making: hope-ui's Base-UI-modeled boxing implementation is zero-dep and *more*
  capable — it stores function-valued `T` (upstream's setter treats a function as an updater and
  cannot). The lasting takeaway is about the **harness**, not the primitive: inline adopted
  compute-form-signal deps, and never blame a primitive for an externalization artifact.
- **`createComponentContext` ← `context`: kept.** `createContextProvider` uses a factory-Provider
  model that doesn't match hope-ui's raw-`Context` + `<Ctx value={…}>` usage, and ours already
  adds the one thing of value (a friendlier missing-Provider error). Adopting is a lateral refactor
  for negative value. `createOptionalContextProvider` / `createLayeredContext` / `MultiProvider`
  remain future candidates for compound components.
- **`composeEventHandlers` ← `props.combineHandlers`: kept.** A runtime dependency for a ~5-line
  helper is net-negative. `props.combineProps` (smart `on*`/`class`/`style` merge) is a candidate for
  `renderElement`'s prop-merge later.
- **`renderElement` ref-merge ← `refs.mergeRefs`: kept**, a future consideration only.
  `renderElement` merges to a single function ref via `applyRef`, so no `mergeRefs` dependency is
  warranted.
- **`withDefaults` ← `props.combineProps`: kept.** `combineProps` resolves by key *presence*, not
  `??` — wrong for defaults.
- **`createRegisteredId` / `createRegisteredElement`: kept.** No equivalent.

### Tier B — overlay/modality behaviors: kept, with reasons
solid-primitives covers more of this layer than first assumed, but each swap costs a specific
quality decision hope-ui made deliberately:
- **Focus trap + restore stay split.** `focus/createFocusTrap` welds restore in; the split exists so
  a non-modal Popover/Tooltip can restore focus *without* trapping. Ours also re-queries focusables
  live per Tab, so it needs no `MutationObserver`.
- **`createHideOutside` keeps `inert`.** `interaction/createHideOutside` sets `aria-hidden` only;
  ours layers `aria-hidden` + `inert`, because `aria-hidden` alone leaves the background focusable and
  clickable.
- **`createDismissable` kept** — it bundles outside-press *and* Escape (`interaction` omits Escape)
  and is wired into the `inert`/backdrop modality.
- **`createScrollLock` kept** — stores its ref-count on `document.body` under a `Symbol.for` key to
  survive duplicate installed copies; `scroll/createPreventScroll`'s cross-instance safety is
  unaudited.
- **`presence`: kept, hardened.** Ours reads the real computed duration and waits on
  `transitionend`/`animationend` (single source of truth = the CSS); `@solid-primitives/presence` is
  timer-driven and needs a JS duration mirroring the CSS. We ported its good ideas instead — a
  `transitioncancel`/`animationcancel` + duration-derived `setTimeout` backstop, an `initialEnter`
  option, and a generic item-swap (`createPresenceItem`/`mountedItem`). See `create-presence.md`.

### Tier C — no equivalent
`inert` layering specifics, `ModalBackdrop`, the composed modal orchestration — built regardless.
