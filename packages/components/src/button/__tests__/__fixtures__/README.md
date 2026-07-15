# SSR fixtures

`button-ssr.html` is the **genuine server output** of
`renderToStringAsync(() => <ThemeProvider preset={hope}><Button>Click me</Button></ThemeProvider>)`.
It leads with the provider's token `<style>` (`hope` authors its palette in TS, so the provider
inlines the `--hope-*` custom properties), followed by the `<button>`.

It exists because an SSR → hydrate round-trip cannot happen inside a single Vitest project: the
server render needs `solid-js` and `@solidjs/web` resolved to their **server** builds, and the
hydrate needs a real browser with their **client** builds. So two projects share one file:

- `../Button.ssr.test.tsx` (the `ssr` project) **generates and guards** it, via
  `toMatchFileSnapshot`. Change `Button.tsx` in a way that alters its markup and this goes red.
- `../Button.browser.test.tsx` (the `browser` project) hydrates that exact string and asserts
  there is no mismatch, no duplicated DOM, and that the result is interactive.

The `_hk=…` attribute is Solid's hydration key. `hydrate()` collects them with
`gatherHydratable()`, which does `element.querySelectorAll("*[_hk]")`.

**Never hand-edit this file.** It is written by a real server render. To update it after an
intentional markup change:

```bash
pnpm exec vitest run --project=ssr -u
```

Under `CI=true`, a missing or stale fixture fails rather than being written.

See `docs/testing.md`.
