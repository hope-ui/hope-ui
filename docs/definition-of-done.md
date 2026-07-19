# Definition of Done (enforced, not a guideline)

Full rationale for the summary in CLAUDE.md § *Definition of Done*.

Every source file under `packages/*/src/` (except `index.ts`) must have:
1. A matching test file: `Foo.test.tsx` (unit/node) and/or `Foo.browser.test.tsx`
   (real-browser — required for anything touching focus/keyboard/pointer behavior,
   since jsdom cannot be trusted for that), in a **`__tests__/`** subfolder of the leaf
   directory (`Foo/__tests__/Foo.test.tsx`). This keeps the leaf folder free of test/fixture
   visual noise; `check:coverage-parity`'s flat-free rule fails a test dropped beside the source.
2. A matching `Foo.md` doc (API, keyboard interaction table, ARIA pattern reference) at
   `docs/usage/<pkg>/<relative-src-path>/Foo.md` — out of the source tree entirely, the path
   mirroring package + src path so the primitives/ and components/ `dialog` docs never collide.
3. **`@hope-ui/components` only:** a matching `Foo.stories.tsx`, colocated **beside the source**
   in the same `src/` leaf directory. Components are what a human has to look at; pure primitives aren't.
   Stories (and tests) never reach `dist/` — tsdown only builds the `package.json`
   `hope.entries` files — and are excluded from the `build` task's turbo `inputs`.

`pnpm check:coverage-parity` (`scripts/check-coverage-parity.mjs`) enforces this in CI
and fails the build if any is missing. Its purpose is to guarantee that test, doc, and
story coverage never drifts behind the source — see `docs/plan.md` for the specifics.

Stories are also where known-but-unfixed behavior gets pinned somewhere a human can see
it. Don't "fix" a story by deleting it; fix the component and rename the story. Dialog's
`Modal with an unpositioned Popup (content is unclickable — by design)` is the current
example: it reproduces a real, documented consequence of the pointer-blocking
`ModalBackdrop` rather than a defect, and exists so the failure mode is visible somewhere.

Every browser test that calls `mount()` **must** also call `expectNoA11yViolations`
(both from `@hope-ui/internal-test-utils`) at least once, so a baseline axe-core check
runs by default. `check:coverage-parity` enforces exactly that pairing: "renders real
DOM" isn't mechanically decidable, but `mount()` is the harness that does it, so calling
one obliges you to call the other. A browser test that renders nothing (e.g.
`solid-contract.browser.test.tsx`) stays exempt without an allowlist to maintain.

`expectNoA11yViolations` fails on axe **violations** *and* on **`incomplete`** results —
the rules axe ran but couldn't decide. When axe genuinely cannot judge one
(`color-contrast` over an unresolvable background), name it in `allowIncomplete` at the
call site with a reason; never silence the category. See `docs/usage/internal-test-utils/axe/axe.md`.

`mount()` (also from `@hope-ui/internal-test-utils`) **fails the test** on a
`STRICT_READ_UNTRACKED` or `REACTIVE_WRITE_IN_OWNED_SCOPE` diagnostic. Both were
documented in prose here and emitted 170 times a run, so the next real one was invisible.
A deliberate untracked read is spelled `untrack(...)`; anything still warning is
unreviewed. See `docs/usage/internal-test-utils/mount/mount.md`.

Every component (not needed for pure internal primitives with no DOM output) also
needs an SSR **and** a hydration round-trip test, and `check:coverage-parity` enforces
both: a `Foo.ssr.test.tsx` that *calls* `renderToStringAsync`, and a
`Foo.browser.test.tsx` that *calls* `hydrate`. "Calls" means outside a comment, outside a
string, outside an `it.skip`, and not merely imported — every one of those loopholes was
live at some point, and Dialog exercised three at once while the docs claimed it had a
hydration test.

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
memo and shifts `_hk`. Full decision procedure: `docs/solid-2.0-notes.md` (search "`children()`
decision procedure").

**Read `docs/testing.md` before writing any test.** Three Vitest projects, one job and
one module resolution each: `unit` (node, no DOM, client builds, pure logic), `ssr`
(node, **server** builds of `solid-js` *and* `@solidjs/web`, the HTML a server sends),
`browser` (real Chromium, client builds, DOM/focus/pointer/axe/hydration). The file
suffix picks the project: `Foo.test.tsx`, `Foo.ssr.test.tsx`, `Foo.browser.test.tsx`.

Hydration is two environments by definition, and the two halves are decoupled so neither needs
a committed file. Each subject has a **render entry**,
`src/<component>/__tests__/<component>.ssr-entry.tsx`, exporting the `Tree` it renders. The `ssr`
test `toMatchInlineSnapshot()`s that render (byte-exact regression, living inside the `.tsx`), and
the `browser` test hydrates the *same* `Tree` against genuine server HTML served fresh by the
hydration-fixture bridge — `import ssr from "virtual:hydration-fixture?id=<component>"`, rendered
in-process by a nested SSR server (see `vitest-hydration-bridge.ts` and `docs/testing.md`). Sharing
one `Tree` keeps the two halves structurally identical by construction, and there are **zero
committed fixture files at any component count**. The browser half (via `hydrateFixture` from
`@hope-ui/internal-test-utils`) asserts no `console.error`/`console.warn`, no element added or
dropped, and that every server node **is the same object** as before — a silent fallback to a
client render otherwise looks identical to success.

Hydration keys (`_hk`) are a path through the component tree, so a component inserted before
`Dialog.Trigger` — even one that renders nothing — shifts the trigger's key. The shared `Tree` is
what makes the server render and the client hydrate impossible to drift apart.
