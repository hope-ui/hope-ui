# Session handoff: Dialog implementation (package restructure + primitives fixes)

Written at the end of a long session that (1) restructured the package layout per user
direction, (2) built the actual `Dialog` component, and (3) chased down several real
SolidJS 2.0 reactivity bugs along the way. This doc exists because the session ran long
and context needs to be handed off cleanly to a fresh session. **Read this before
touching Dialog, the primitives, or the Vitest config again.**

A ready-to-paste starting prompt for the next session is at the bottom of this file.

## Current status

- **Package restructure: done, committed, pushed** (`develop` @ `b3d0d9a` "Rename core
  to primitives, consolidate components into one package"). `@solid-zero/core` →
  `@solid-zero/primitives`; `@solid-zero/button` absorbed into a new
  `@solid-zero/components` package (`@solid-zero/components/button`, one subpath export
  per component instead of per-family packages — see CLAUDE.md/docs/plan.md, both
  already updated for this).
- **Dialog component: built and working, but UNCOMMITTED.** `packages/components/src/dialog/Dialog.tsx`
  exports `Dialog = { Root, Trigger, Portal, Backdrop, Popup, Title, Description, Close }`,
  composing `createFocusTrap`/`createDismissable`/`createPresence`/`createScrollLock`/
  `createComponentContext` from `@solid-zero/primitives`.
- **Dialog.browser.test.tsx: 10 passed, 1 skipped.** All real behavior is verified:
  open/close via trigger, Escape, outside-backdrop-click, Close button, focus trap,
  `aria-*` wiring, `onOpenChange`, controlled mode, axe a11y check. The 1 skipped test
  is the hydration round-trip — see "Known gap" below.
- **Dialog.test.tsx (unit project): 4/4 passing.** This correctly and genuinely
  verifies SSR doesn't crash using the *real* server build of `@solidjs/web`
  (`isServer: true` for real, not simulated) — including the critical case: an open
  dialog's `Dialog.Portal` must not crash `renderToStringAsync` (it throws server-side
  in this beta unless guarded — see CLAUDE.md's existing writeup on this).
- **Not started / not done:**
  - `Dialog.md` doc — **missing**, `check:coverage-parity` will fail CI until this
    exists.
  - `scripts/check-coverage-parity.mjs` extension to detect/require an SSR round-trip
    test reference — not started (was task #10 in this session's tracker).
  - A full, whole-repo pipeline run (`pnpm build && pnpm lint && pnpm typecheck && pnpm test && pnpm test:browser && pnpm check:coverage-parity`)
    has **not** been re-run since Dialog work started — only Dialog-specific test files
    were re-verified individually this session.
  - Nothing from the Dialog work is committed. `git status` on `develop` will show a
    large diff: the primitives fixes, test harness fixes, `vitest.config.ts` alias
    additions, `vite.config.base.ts` multi-entry support, and the entire
    `packages/components/src/dialog/` directory.
  - CLAUDE.md's "SolidJS 2.0 API differences" section has **not** been updated with the
    two new reactivity findings below (#3 and #5) — only the older, narrower Phase-0-era
    ref-timing finding is documented there currently.

## Key discoveries this session (read before touching primitives or Dialog again)

### 1. Package restructure (context, already fully committed)

`@solid-zero/core` → `@solid-zero/primitives`. Family-package plan
(`@solid-zero/overlays`, `@solid-zero/collections`, ...) replaced with a single
`@solid-zero/components` package, one subpath export per component
(`@solid-zero/components/button`, `@solid-zero/components/dialog`). User-directed:
avoids needing to remember which family package a component ships from. Every
component subpath is its own Vite build entry (see `vite.config.base.ts`'s `entries`
option), building to `dist/<name>/index.js` + matching `.d.ts`.

Also: every source subfolder now gets its own barrel `index.ts` (user-directed,
"always add a barrel index.ts export"). E.g. `packages/primitives/src/context/index.ts`
re-exports `context.ts`, and the package-level `src/index.ts` imports from the folder
root (`./context`) not the named file (`./context/context`).

### 2. Folder-per-unit layout + no Kobalte/Corvu references in code comments

Also from this session (before the rename): every primitive/component now lives in its
own lowercase folder under `packages/*/src` (colocating source, tests, `.md` doc, and a
barrel `index.ts`). Kobalte/Corvu mentions were removed from code comments and colocated
`.md` docs (kept in `CLAUDE.md` and `docs/plan.md` only, per explicit user instruction).

### 3. REAL bug: ref must be a signal AND tracked in `compute` when the ref-owning element is itself gated by the same signal

This is the one that cost the most time. Found while wiring `createFocusTrap`/
`createDismissable` into Dialog's `Popup`.

**The scenario:** `Popup`'s DOM element only exists as a *reactive consequence* of
`presence.mounted()` (via `<Show when={presence.mounted()}>`), which itself only
becomes true as a reactive consequence of `context.open()` becoming true. Meanwhile,
`createFocusTrap`/`createDismissable` *also* react to `context.open()` directly. When
`open` flips true, **multiple independent effects fire off the same signal change**:
presence's effect (which eventually creates the DOM node and assigns the ref, several
reactive layers deep through `Show` → `Dynamic` → `spread`'s own internal ref-assignment
effect) races against focus-trap's/dismissable's own effects (which need the ref
*immediately* upon activation).

If the ref is a plain closure over a `let` (`let el; ref={el}`) — or even a signal that
the primitive's effect *doesn't track* — and the primitive reads it only inside the
effect's *apply* phase (not tracking it in `compute`), that read might catch the ref
mid-race, before the sibling effect has actually assigned it — and since the effect's
*only* tracked dependency (`active`) isn't going to change again, it never gets a second
chance to see the populated ref. Symptom: Escape/outside-click/focus-trap silently do
nothing, forever, only for components whose ref-owning element is conditionally
rendered — worked fine in isolated primitive tests where the container was
unconditionally rendered.

**The fix**, now live in `packages/primitives/src/focus-trap/focus-trap.ts` and
`packages/primitives/src/dismissable/dismissable.ts`:

```ts
createEffect(
  // Track BOTH active() and ref() — ref must be a real signal accessor.
  () => [options.active(), options.ref()] as const,
  ([active, container]) => {
    if (!active || !container) return;
    // ...
  },
);
```

And at every call site, the ref must be `createSignal<HTMLElement>()` (a setter passed
to the JSX `ref`), never `let el; ref={el}`. This is now the pattern in
`Dialog.tsx`'s `Popup`/`Backdrop`, and in the standalone primitive test harnesses
(`focus-trap.browser.test.tsx`, `dismissable.browser.test.tsx`).

**Important for future primitives**: any `createXyz({ active, ref, ... })`-shaped
primitive that needs the ref *the moment* `active` becomes true must use this pattern.
`createPresence` is fine as-is *without* this pattern (doesn't need it — see next
point), which is why it wasn't touched.

### 4. Different, earlier bug (already documented in CLAUDE.md, don't re-break it)

CLAUDE.md already documents a narrower, different scenario: reading a *plain
non-signal* ref accessor inside a `compute` function captures `undefined` permanently
when a primitive activates on a component's very first render, because `compute` runs
synchronously at the moment `createEffect()` is *called* — before that component's own
later JSX (and its `ref` callback) has executed. That's about ordering *within a single
component's own synchronous setup*, not about racing *sibling* effects (which is #3
above). Both are real, both are now handled correctly by the current code (track `ref()`
in compute, but only because it's now always a real signal — see #3).

**Don't revert to reading `ref()` only in the effect's apply phase** — that was an
intermediate, *incorrect* fix attempted mid-session for #3 that broke the standalone
primitive tests in a different way (see git history / this session's transcript if
curious) before the real fix (signal + track-in-compute) was found.

### 5. NEW SolidJS 2.0 gotcha, not yet in CLAUDE.md: `[REACTIVE_WRITE_IN_OWNED_SCOPE]`

Solid 2.0 throws at runtime if you write to a signal owned by an **ancestor** reactive
scope directly from a **descendant** component's own synchronous render body. Hit in
`Dialog.Title`/`Dialog.Description`, which originally called `context.setTitleId(id)`
directly in their component body (to register their id with `Root`'s context, for
`Popup`'s `aria-labelledby`/`aria-describedby`).

**Fix**: defer the write into `onSettled`:

```tsx
onSettled(() => {
  context.setTitleId(id);
  return () => context.setTitleId(undefined);
});
```

Confirmed this doesn't cause an SSR/hydration mismatch *for Dialog specifically*,
because `Title`/`Description` only ever exist inside `Dialog.Portal`, which itself never
renders during SSR (see #7) — so there's no server-rendered `aria-labelledby` value for
a later client-only write to disagree with. **This reasoning would need re-checking for
any future component where a similar cross-scope write happens outside a
Portal-guarded subtree.**

**TODO for next session**: add this to CLAUDE.md's "SolidJS 2.0 API differences" list —
it's a general gotcha, not Dialog-specific. General rule: any primitive/component
where a descendant needs to register something into an ancestor-owned signal must do
so via `onSettled` (or another deferred mechanism), never directly in the descendant's
synchronous render body.

### 6. MAJOR infra gotcha (fixed, keep this fix): stale `dist/` builds silently shadow source edits

`@solid-zero/components` depends on `@solid-zero/primitives` as a real pnpm workspace
package (`workspace:*`), which resolves via package.json `exports`/`main` to
primitives' **built** `dist/index.js`, not live `src/`. Editing
`packages/primitives/src/**` has **zero** effect on `@solid-zero/components`'s tests
until `@solid-zero/primitives` is rebuilt.

This caused a very long, confusing debugging detour this session: a real primitive bug
(#3 above) was fixed in source, the standalone primitive tests (which import via a
relative path *within the same package*, bypassing package resolution entirely) went
green immediately — but Dialog's tests kept failing **identically**, because they were
silently still exercising the stale pre-fix `dist` build. Confirmed by checking file
mtimes (`dist` was ~44 minutes stale) after an extensive, otherwise-inconclusive
console-log/`window.__log` instrumentation trace.

**Fix, now live in `vitest.config.ts`**: a `resolve.alias` pointing the bare specifier
`@solid-zero/primitives` straight at `packages/primitives/src/index.ts`, for **both**
the `unit` and `browser` Vitest projects. Removes the "rebuild primitives before every
test run" step from the dev loop entirely. **This is durable, load-bearing
infrastructure — keep it.** If `@solid-zero/components` ever needs more than one
primitives-like dependency aliased this way, or if new packages are added that also
depend on `@solid-zero/primitives`'s *built* output, extend this pattern rather than
re-debugging the same staleness class of bug.

**If a similar "I fixed the primitive but the consuming component's test still fails
identically" symptom reappears**, check dist mtimes first, or just run
`pnpm --filter @solid-zero/primitives build` as an immediate diagnostic step, before
assuming the fix itself is wrong.

### 7. Separate infra gotcha (fixed, keep this fix): `@solidjs/web`'s environment-conditional resolution

`@solidjs/web`'s package.json `exports` resolve differently per environment: a "node"
condition → `dist/server.js` (real SSR string ops, `isServer: true`); a "browser"
condition → `dist/web.js`/`dist/dev.js` (real DOM ops, `isServer: false`, **hardcoded
per-build, not a runtime toggle**). Vite's default `resolve.conditions` includes
"browser" **regardless of Vitest's `test.environment: "node"` setting** — that setting
only swaps JS globals (whether `document` exists), not package `#exports` resolution.
Confirmed empirically: plain `resolve.conditions: ["node"]` / `ssr.resolve.conditions:
["node"]` on the `unit` project **silently did nothing** — no error, just ignored.

**The fix that actually worked**: an explicit `resolve.alias` in `vitest.config.ts`'s
`unit` project, pointing the bare specifier `@solidjs/web` directly at the real
resolved path of its "node" condition entry, computed via
`createRequire(pathToADependentPackage).resolve("@solidjs/web")`. This is why
`Dialog.test.tsx` (unit project) correctly exercises the real server code path — the
critical "`Portal` throws server-side" behavior is genuinely verified there, not
simulated.

### 8. KNOWN GAP (not fixed, deliberately deferred): the hydration round-trip test

> **Obsolete — the test is green. Read `docs/testing.md` and `docs/migration-2.0-stable.md`
> §4 instead.** Everything below is kept only as a record of what was tried, and it is wrong in
> three places. The "different module instances between the SSR render and the client hydrate"
> theory is disproved. The `isServer`/Portal analysis is not the cause — a Portal-free
> `Dialog.Root` + `Dialog.Trigger` failed identically. And the `createUniqueId cannot be used
> outside of a reactive context` error was never about hand-constructing the component tree: it
> is what you get when `@solidjs/web`'s externalized server build resolves its own `solid-js`
> import past Vite's alias, giving two `solid-js` instances with two `currentOwner`s. Fixed
> with `server: { deps: { inline: [...] } }` on a dedicated `ssr` Vitest project that resolves
> the server builds of *both* packages.

CLAUDE.md's originally-envisioned pattern: "call `renderToStringAsync` in the
unit/node project (no browser needed for that half)... then, in the browser project,
inject that server HTML into a container and call `hydrate()`". In practice, **calling
`renderToStringAsync` from *within* an actual browser test always resolves to
`@solidjs/web`'s client build**, where `isServer` is hardcoded `false` — so it does
*not* produce genuine server output. Any `isServer`-guarded branch (like
`Dialog.Portal`'s `if (isServer) return null`) takes the **client** branch even when
called via a function literally named `renderToStringAsync`. This makes a fully-correct
in-browser SSR+hydrate round trip **not achievable** for a Portal-using component by
simply calling `renderToStringAsync` from inside a browser test file.

**What was tried**: a custom Vitest browser `command` (`test.browser.commands` —
these run server-side, in real Node, via RPC back to the browser test). It dynamically
imported the *real* `dist/server.js` and the component's own *built* `dist/dialog/index.js`,
called the real `renderToStringAsync` there (genuine `isServer: true`), and shipped the
resulting HTML string back to the browser test to `hydrate()` against.

This got **past** the original hydration-mismatch symptom — confirming the
`isServer`-mismatch theory was the right diagnosis — but hit a **new, deeper** issue:
`createUniqueId cannot be used outside of a reactive context`, thrown when constructing
the component tree via plain `Component({...})` function calls (no JSX available in
that raw dynamic-import context — the tree has to be hand-built, calling `Dialog.Root`,
`Dialog.Trigger`, etc. directly as functions with a `get children()` getter for lazy
children, mirroring what JSX would compile to). Root cause not fully nailed down:
confirmed via source inspection that `renderToStream` (which `renderToStringAsync`
delegates to) *does* wrap its callback in its own `createRoot` internally, so the owner
context should exist — but something in `renderToStream`'s internal async component
resolution path (there's a `dynamic()`-style branch that special-cases values with a
`.then()` method, suggesting some component-resolution indirection that may run outside
strict synchronous continuity) appears to lose it before invoking the top-level render
callback in this specific dynamic-import-inside-a-command context. Not fully traced —
ran out of budget for this specific rabbit hole.

**Decision**: reverted the custom-command approach entirely (deemed disproportionate
effort/fragility for the remaining value, and too Dialog-specific to leave as permanent
shared infra). `vitest.config.ts` no longer has the `commands` block.
`Dialog.browser.test.tsx`'s hydration test is `it.skip`'d with a comment pointing at
this document, so it doesn't block the pipeline while being honest that it isn't
currently verifying what it claims to. **The actually-important property — SSR doesn't
crash, including the Portal-throws-on-server case — is already correctly, separately
verified for real in `Dialog.test.tsx` (unit project).** Only the narrower "hydrate
produces zero mismatch warnings and stays interactive" property is unverified for
Dialog specifically.

**Recommended paths forward, roughly in order of preference:**

a. **Try Vitest's built-in `readFile` browser command instead of a custom one.**
   `BrowserCommands` already exposes `readFile`/`writeFile`/`removeFile` (Node-side,
   via the same RPC mechanism) without needing a custom command definition. Have a
   plain top-level Node script (not invoked through a dynamic-import-inside-a-callback
   context — that structural difference may be exactly what avoids the
   `createUniqueId` owner-context loss) render the SSR fixture to a file, and have the
   browser test `commands.readFile(...)` it. Worth trying first since it's structurally
   different from what was attempted.
b. Root-cause the `createUniqueId`/owner-context loss properly (trace through
   `renderToStream`'s `dynamic()`-adjacent async resolution path in
   `@solidjs/web/dist/server.js`) and fix the custom-command approach for real. More
   effort, but would produce genuinely reusable infra for every future Portal-using
   component (Popover, Tooltip, ...).
c. Accept `it.skip` long-term for Portal-using components specifically, and document in
   CLAUDE.md that the in-browser half of the SSR/hydration DoD item isn't currently
   achievable for them without further infra work. Non-Portal components (Button, any
   future non-overlay component) don't hit this at all — `renderToStringAsync` called
   in-browser is "good enough" for them since there's no `isServer`-guarded branch to
   get wrong.

### 9. CSS-stacking test-harness gotchas (fixed; will recur for Popover/Tooltip)

A headless `Backdrop` has no default styles → zero-size div → Playwright's `.click()`
requires "visible" (non-zero bounding box) → needs explicit
`style={{ position: "fixed", inset: "0" }}` in test harnesses. Separately, once
`Backdrop` has `position: fixed` (creates a stacking context), it paints **above** a
`Popup` with no explicit `position` (defaults to `static`) **regardless of DOM order**
— CSS stacking rule: positioned elements paint above non-positioned ones in the same
stacking context even at `z-index: auto`. Fixed by also giving the test harness's
`Popup` `style={{ position: "relative" }}`.

**Future overlay-component tests (Popover, Tooltip, etc.) should give both
backdrop-like and popup-like test elements real CSS positioning from the start** to
avoid rediscovering this.

### 10. Vite multi-entry build support (new, durable infra)

`vite.config.base.ts`'s `createViteConfig` now accepts an optional
`{ entries: Record<string, string> }` option for packages publishing multiple subpath
exports. Each entry builds to `dist/<name>/index.js` + a matching `.d.ts` (via
`vite-plugin-dts` mirroring `src` structure under `entryRoot`). Single-entry packages
(`@solid-zero/primitives`) are unaffected — default is `{ index: "src/index.ts" } → dist/index.js`.

### 11. Unresolved, non-blocking lead: `STRICT_READ_UNTRACKED` warnings in `<Popup>`/`<Backdrop>`

Throughout this session's test runs, Solid's dev-mode console consistently warns
`[STRICT_READ_UNTRACKED] Reactive value read directly in <Popup>/<Backdrop> will not
update` — appearing very frequently but **never correlating with an actual test
failure** (all 10 non-skipped Dialog browser tests pass reliably, repeatedly). Not
root-caused. Best guess: related to how `merge(props, { get role() {...}, get
"data-status"() {...} })`-style getter objects flow through `renderElement` →
`Dynamic` → `spread()`'s own internal effects (recall `spread()`'s ref-handling effect
itself has this exact anti-pattern shape internally — `effect(() => { const r =
props.ref; ...}, () => {})` — reads `props.ref` in a compute-only-relevant way; maybe
other prop reads there hit a similar internal pattern for non-ref props too). Since it
doesn't currently manifest as an actual bug, this was **not** chased down this session
— flagging it here in case it becomes symptomatic later (e.g. if a future Popup-nested
reactive value stops updating correctly).

## Files touched this session (uncommitted, except where noted)

- **Committed already** (`b3d0d9a`): `packages/core` → `packages/primitives` rename,
  `packages/button` → `packages/components/src/button`, new `packages/components`
  package scaffold, `vite.config.base.ts` multi-entry support (added then), CLAUDE.md +
  docs/plan.md updates for the restructure.
- **Uncommitted**:
  - `packages/primitives/src/focus-trap/focus-trap.ts`,
    `packages/primitives/src/dismissable/dismissable.ts` — the ref-signal-tracking fix
    (#3 above).
  - `packages/primitives/src/focus-trap/focus-trap.browser.test.tsx`,
    `packages/primitives/src/dismissable/dismissable.browser.test.tsx` — updated to
    use signal-backed refs in their test harnesses.
  - `vitest.config.ts` — the two `resolve.alias` additions (#6, #7 above).
  - `packages/components/src/dialog/` — the entire new Dialog component: `Dialog.tsx`,
    `index.ts`, `Dialog.test.tsx`, `Dialog.browser.test.tsx`. **`Dialog.md` is
    missing.**
  - `packages/components/vite.config.ts`, `packages/components/package.json` — wired
    the `dialog` entry + `./dialog` subpath export.
  - This file (`docs/session-handoff-dialog.md`).

## Remaining TODOs, in priority order

1. Write `packages/components/src/dialog/Dialog.md` (API table, keyboard interaction
   table, ARIA pattern reference) — **required by `check:coverage-parity`, currently
   missing, will fail CI.**
2. Extend `scripts/check-coverage-parity.mjs` to detect/require an SSR round-trip test
   reference per component (per `docs/plan.md` Item 3) — not started.
3. Update CLAUDE.md's "SolidJS 2.0 API differences" list with findings #3 and #5 above.
4. Decide + implement (or explicitly defer, documented) the hydration round-trip test
   path forward — see #8's options.
5. Run the full pipeline across the whole repo (not just Dialog):
   `pnpm build && pnpm lint && pnpm typecheck && pnpm test && pnpm test:browser && pnpm check:coverage-parity`.
6. Commit + push. Suggested commit message shape: describe the Dialog component, the
   ref-signal-tracking primitive fix, the `REACTIVE_WRITE_IN_OWNED_SCOPE` finding, and
   the `vitest.config.ts` alias infra — see this doc's findings #3, #5, #6, #7 for the
   "why" content each commit-message paragraph would need.
7. Continue Phase 1 per `docs/plan.md`: Popover + Tooltip next (forces `createFloating`
   as independent of Dialog — "compose, don't inherit" check: Popover's source must
   have zero imports from `@solid-zero/components/dialog`).

---

## Starting prompt for the next session

Copy-paste this to resume:

```
Continue solid-zero work. Read docs/session-handoff-dialog.md first — it's a detailed
handoff from the session that built Dialog and fixed several real SolidJS 2.0
reactivity bugs (ref-signal-tracking races, REACTIVE_WRITE_IN_OWNED_SCOPE, a stale-dist
staleness class of bug, and @solidjs/web's environment-conditional resolution). Also
read CLAUDE.md and docs/plan.md as usual.

Current state: Dialog (packages/components/src/dialog/Dialog.tsx) is built and working
— 10/11 browser tests pass, 1 is deliberately it.skip'd (hydration round-trip, known
gap, see the handoff doc's finding #8 for options). The unit-project SSR test
(Dialog.test.tsx) passes 4/4 and genuinely verifies SSR doesn't crash. NOTHING from
this work is committed yet.

Do these in order:
1. Write packages/components/src/dialog/Dialog.md (API table, keyboard interaction
   table, ARIA pattern reference) — required by check:coverage-parity, currently
   missing.
2. Extend scripts/check-coverage-parity.mjs to detect/require an SSR round-trip test
   reference per component, per docs/plan.md's Item 3.
3. Update CLAUDE.md's "SolidJS 2.0 API differences" section with the handoff doc's
   findings #3 (ref must be a signal + tracked in compute when the ref-owning element
   is gated by the same signal) and #5 (REACTIVE_WRITE_IN_OWNED_SCOPE — descendant
   writes to ancestor-owned signals must go through onSettled).
4. Decide on the hydration round-trip test's path forward (handoff doc finding #8) —
   try option (a) there first (Vitest's built-in readFile browser command + a plain
   top-level Node script, structurally different from the reverted custom-command
   attempt) if you want to actually fix it; otherwise formally document the it.skip as
   a long-term decision in CLAUDE.md and move on. Don't sink more than ~30 minutes into
   this before falling back to the documented option.
5. Run the full pipeline across the whole repo (pnpm build/lint/typecheck/test/test:browser/check:coverage-parity)
   and fix anything red.
6. Commit and push once green. Ask before pushing if that's not already established as
   auto-approved for this session.
7. Then move on to Popover + Tooltip (Phase 1 step 3 per docs/plan.md) — forces
   createFloating as independent of Dialog. Verify the "compose, don't inherit" rule:
   Popover's source must have zero imports from @solid-zero/components/dialog.

Ask before making further architecture-level decisions (package structure, testing
infra) the way the previous session did for the primitives/components rename and the
Vite build-tool swap — those went through explicit user confirmation and shouldn't be
re-litigated without cause.
```
