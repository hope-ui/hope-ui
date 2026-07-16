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

## ⚠️ The hydration-id / transform-boundary hazard (measured, the hard way)

A primitive that creates a **compute-function signal or memo** in the component body —
`createSignal(fn)` / `createMemo(fn)` — participates in Solid's hydration id allocation
(`hydratedCreateSignal`/`hydratedCreateMemo`), consuming an id and **shifting every subsequent
`_hk`**. That alone is fine *if server and client shift together*. The hazard is that **they don't,
when the code lives in an un-transformed `node_modules` dependency:**

Measured directly with `controlled-signal` in `createDialog` (all four combinations):

| Where the `createSignal(fn)` lives | Server `_hk` (SSR render) | Client `_hk` (hydration) | Round-trip |
| --- | --- | --- | --- |
| In-repo `src` (compiled by our `vite-plugin-solid`) | `2010` | `2010` | ✅ symmetric |
| `node_modules` dependency (not compiled by it) | **`1010`** | **`2010`** | ❌ asymmetric |

The client's runtime `hydratedCreateSignal` always consumes the id. The **server** only emits the
matching id when the code is compiled by hope-ui's Solid pipeline; an untransformed dependency
skips it. So the packaged dep produces `1010` on the server but the client asks for `2010` — a
divergence **no fixture can reconcile** (proven both ways: a client tree expecting `2010` passes
hydration but fails the byte-for-byte SSR assertion at `Received: 1010`). This holds however the
server HTML is produced — the generation bridge renders through the same server pipeline, so it
reproduces the `1010` the inline SSR snapshot pins.

It is **not yet certain** whether this is a general property of our SSR harness (manual server-build
alias + selective `inline`, not a full SolidStart graph) or something a real SolidStart build would
also hit — but in this repo's setup it is disqualifying. **Lesson: any adopted `node_modules`
primitive that creates a compute-form signal/memo must be proven against the hydration round-trip
before adoption; source that looks SSR-innocent can still fail it.** (I initially misread this twice —
first as a plain rejection, then as "SSR-safe, just regenerate the fixture" from an in-repo mimic that
wasn't faithful to the packaged dep. The table above is the settled result.)

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
- **`createControllableState` ← `controlled-signal`: REJECTED (breaks hydration in this setup).**
  `createControllableSignal` backs its state with a compute-function signal
  (`createSignal(fn, { ownedWrite: true })`). Adopted as the packaged dependency, it hits the
  transform-boundary hazard above: server emits the Dialog trigger at `_hk=1010`, the client hydrates
  expecting `2010` — an asymmetry no fixture reconciles. Reverted. Rather than vendoring the upstream
  source in-repo (which *is* symmetric), kept hope-ui's Base-UI-modeled boxing implementation, which is SSR-safe, zero-dep,
  and *more* capable — it stores function-valued `T` (upstream's setter treats a function as an
  updater). This is the proof the full-DoD-wrap hydration gate earns its keep: unit tests were green;
  only the hydration round-trip caught it.
- **`createComponentContext` ← `context`: kept.** `createContextProvider` uses a factory-Provider
  model that doesn't match hope-ui's raw-`Context` + `<Ctx value={…}>` usage, and ours already
  adds the one thing of value (a friendlier missing-Provider error). Adopting is a lateral refactor
  for negative value. `createOptionalContextProvider` / `createLayeredContext` / `MultiProvider`
  remain future candidates for compound components.
- **`composeEventHandlers` ← `props.combineHandlers`: kept.** A runtime dependency for a ~5-line
  helper is net-negative. `props.combineProps` (smart `on*`/`class`/`style` merge) is a candidate for
  `renderElement`'s prop-merge later.
- **`renderElement` ref-merge ← `refs.mergeRefs`: kept for now**, a future consideration only.
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
