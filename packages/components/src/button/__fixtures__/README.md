# SSR fixtures

`button-ssr.html` is the **genuine server output** of
`renderToStringAsync(() => <Button>Click me</Button>)`.

It exists because an SSR → hydrate round-trip cannot happen inside a single Vitest project:
the server render needs `solid-js` and `@solidjs/web` resolved to their **server** builds, and
the hydrate needs a real browser with their **client** builds. So two projects share one file:

- `../Button.ssr.test.tsx` (the `ssr` project) asserts the fixture is byte-for-byte what the
  server actually renders today. Change `Button.tsx` in a way that alters its markup and this
  goes red.
- `../Button.browser.test.tsx` (the `browser` project) hydrates that exact string and asserts
  there is no mismatch, no duplicated DOM, and that the result is interactive.

The `_hk=…` attribute is Solid's hydration key. `hydrate()` collects them with
`gatherHydratable()`, which does `element.querySelectorAll("*[_hk]")` — so the fixture must
keep them verbatim. **Do not prettify this file, and do not add a trailing newline.**

See `docs/testing.md`.
