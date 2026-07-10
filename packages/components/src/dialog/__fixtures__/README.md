# SSR fixtures

`dialog-ssr.html` is the **genuine server output** of a closed `<FullDialog />` — which is only
the trigger, because `Dialog.Portal` never renders server-side (`@solidjs/web`'s `Portal`
throws there).

Produced and asserted byte-for-byte by `../Dialog.ssr.test.tsx` (the `ssr` project), hydrated
by `../Dialog.browser.test.tsx` (the `browser` project). See `../button/__fixtures__/README.md`
for why the two halves cannot live in one project, and `docs/testing.md` for the full picture.

`_hk=1010` is Solid's hydration key for the trigger. It is *not* arbitrary: it is a path
through the component tree, so inserting any component before `Dialog.Trigger` in either test's
`FullDialog` changes it. Both files carry a comment saying so.

That number is also the punchline of a long-standing bug. The hydration test was `it.skip`'d
for months with a recorded root cause of "separate Vite builds → different `@solidjs/web`
module instances", and the error it reported was *"Unable to find DOM nodes for hydration key:
1010"*. The key was always right. What was wrong was that the `ssr` half of the harness didn't
exist yet: `solid-js` resolved to its browser build, where `createUniqueId()` returns
`cl-${counter++}` and consumes no child id, so every key the server emitted was off by one from
what the client asked for.

**Do not prettify this file, and do not add a trailing newline.**
