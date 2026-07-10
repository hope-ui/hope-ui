# SSR fixtures

`button-ssr.html` is the **genuine server output** of `renderToStringAsync(() => <Button>Click me</Button>)`.

It exists because a real SSR → hydrate round-trip cannot be written inside a single Vitest
project. Two files consume it, and between them they make it a real test rather than a
snapshot nobody reads:

- `../Button.test.tsx` (unit project — `@solidjs/web` resolves to its **server** build) asserts
  the fixture is byte-for-byte what the server actually renders today. Change `Button.tsx` in a
  way that alters its markup and this goes red.
- `../Button.browser.test.tsx` (browser project — `@solidjs/web` resolves to its **client**
  build) hydrates that exact string with `hydrate()` and asserts there is no mismatch, no
  duplicated DOM, and that the result is interactive.

Neither project can do both halves: the client build's `renderToStringAsync` is a stub that
`console.error`s and returns `undefined`, and the server build has no DOM to hydrate into.

The `_hk=…` attribute is Solid's hydration key. `hydrate()` collects them with
`gatherHydratable()`, which does `element.querySelectorAll("*[_hk]")` — so the fixture must
keep them verbatim. Do not prettify this file.

**Dialog has no such fixture**, and its hydration test is `it.skip`'d. See
`docs/migration-2.0-stable.md` §4 for the verified reason: any component calling
`createUniqueId()` cannot round-trip through these two projects, because `solid-js`'s server
and client builds allocate ids from different counters.
