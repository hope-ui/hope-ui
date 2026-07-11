# Definition of Done (enforced, not a guideline)

Full rationale for the summary in CLAUDE.md § *Definition of Done*.

Every source file under `packages/*/src/` (except `index.ts`) must have:
1. A matching test file: `Foo.test.tsx` (unit/node) and/or `Foo.browser.test.tsx`
   (real-browser — required for anything touching focus/keyboard/pointer behavior,
   since jsdom cannot be trusted for that). The test may sit **beside** the source (the
   primitives' layout) or in a sibling **`__tests__/`** folder in the same directory (the
   components' layout — it keeps the family folder free of test/fixture visual noise).
   `check:coverage-parity` accepts either location.
2. A matching `Foo.md` doc (API, keyboard interaction table, ARIA pattern reference)
   colocated in the same `src/` directory (docs stay beside the source, not in `__tests__/`).
3. **`@hope-ui/components` only:** a matching `Foo.stories.tsx`, colocated in the same
   `src/` directory. Components are what a human has to look at; pure primitives aren't.
   Stories are excluded from `dist/` (see `vite-plugin-dts`'s `exclude` in
   `vite.config.base.ts`) and from the `build` task's turbo `inputs`.

`pnpm check:coverage-parity` (`scripts/check-coverage-parity.mjs`) enforces this in CI
and fails the build if any is missing. This exists because Kobalte's test coverage is
inconsistent (concentrated gaps in exactly the highest a11y-risk components) and Corvu
has no automated tests at all — see `docs/plan.md` for the specifics.

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
call site with a reason; never silence the category. See `axe.md`.

`mount()` (also from `@hope-ui/internal-test-utils`) **fails the test** on a
`STRICT_READ_UNTRACKED` or `REACTIVE_WRITE_IN_OWNED_SCOPE` diagnostic. Both were
documented in prose here and emitted 170 times a run, so the next real one was invisible.
A deliberate untracked read is spelled `untrack(...)`; anything still warning is
unreviewed. See `mount.md`.

Every component (not needed for pure internal primitives with no DOM output) also
needs an SSR **and** a hydration round-trip test, and `check:coverage-parity` enforces
both: a `Foo.ssr.test.tsx` that *calls* `renderToStringAsync`, and a
`Foo.browser.test.tsx` that *calls* `hydrate`. "Calls" means outside a comment, outside a
string, outside an `it.skip`, and not merely imported — every one of those loopholes was
live at some point, and Dialog exercised three at once while the docs claimed it had a
hydration test.

**Read `docs/testing.md` before writing any test.** Three Vitest projects, one job and
one module resolution each: `unit` (node, no DOM, client builds, pure logic), `ssr`
(node, **server** builds of `solid-js` *and* `@solidjs/web`, the HTML a server sends),
`browser` (real Chromium, client builds, DOM/focus/pointer/axe/hydration). The file
suffix picks the project: `Foo.test.tsx`, `Foo.ssr.test.tsx`, `Foo.browser.test.tsx`.

Hydration is two environments by definition, so the two projects cooperate through a
committed fixture: `src/<component>/__tests__/__fixtures__/<component>-ssr.html` is genuine
server output, asserted byte-for-byte by `Foo.ssr.test.tsx` and hydrated by
`Foo.browser.test.tsx` (both under the component's `__tests__/`). Corrupt the fixture and both halves go red. The browser half must
assert no `console.error`/`console.warn`, exactly one of the element, and that the
surviving node **is the same object** as the server's — a silent fallback to a client
render otherwise looks identical to success.

Hydration keys (`_hk`) are a path through the component tree, so the `ssr` and `browser`
test files must define structurally identical trees. Inserting a component before
`Dialog.Trigger` — even one that renders nothing — shifts the trigger's key.
