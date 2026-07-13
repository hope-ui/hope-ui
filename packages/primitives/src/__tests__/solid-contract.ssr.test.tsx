import { Dynamic, renderToStringAsync } from "@solidjs/web";
import { createUniqueId } from "solid-js";
import { describe, expect, it } from "vitest";

/**
 * The **server-build** half of the Solid contract. This file only means anything in the `ssr`
 * Vitest project, which is the one place `solid-js` *and* `@solidjs/web` both resolve to their
 * `dist/server.js` entries — the same pair a SolidStart server process loads.
 *
 * Its sibling `solid-contract.browser.test.tsx` pins the client-build behaviors (`applyRef`).
 *
 * See `docs/testing.md` and `docs/migration-2.0-stable.md` §2.
 */

describe("@solidjs/web server-build contract", () => {
  it("renders a host element through Dynamic, with a hydration key", async () => {
    // Depended on by: `renderElement` (packages/primitives/src/utils/render/render.tsx), the
    // `as`/render-prop polymorphism helper. Everything it renders goes through `<Dynamic>`, and
    // server-side `dynamic()` calls `ssrElement(component, props, undefined, true)` — the
    // trailing `true` is what emits the `_hk` hydration key those elements hydrate against. If
    // stable drops the key, elements rendered through `renderElement` stop hydrating. See
    // docs/migration-2.0-stable.md §3.
    const html = await renderToStringAsync(() => (
      <Dynamic component="span" id="pinned">
        hi
      </Dynamic>
    ));

    expect(html).toContain("<span");
    expect(html).toContain('id="pinned"');
    expect(html).toContain(">hi<");
    expect(html).toMatch(/_hk=\d+/);
  });
});

describe("solid-js server-build contract", () => {
  it("makes createUniqueId consume a hydration child id, exactly as the hydrating client does", async () => {
    // The behavior that kept Dialog's hydration round-trip impossible for months, once the
    // `ssr` project stopped being a hybrid.
    //
    // `createUniqueId()` is three different functions depending on the build:
    //   server build:                `getNextChildId(owner)`            — consumes an id
    //   client build, hydrating:     `sharedConfig.getNextContextId()`  — consumes an id
    //   client build, not hydrating: `` `cl-${counter++}` ``            — consumes nothing
    //
    // The first two bottom out in the same `nextChildIdFor(owner)`. So a server render and a
    // hydrating client walk the same counter, and their `_hk` keys line up — but only if the
    // SSR half genuinely runs the server build. While `vitest.config.ts` aliased
    // `@solidjs/web` and left `solid-js` on its browser build, the SSR half took the
    // `cl-${counter++}` branch, consumed nothing, and every key after the first
    // `createUniqueId()` was off by one.
    //
    // Observable proof: the id must *not* look like `cl-N`, and calling it must shift the
    // hydration key of the element rendered after it.
    const withoutId = await renderToStringAsync(() => <Dynamic component="span">hi</Dynamic>);
    const withId = await renderToStringAsync(() => {
      const id = createUniqueId();
      expect(id).not.toMatch(/^cl-/);
      return <Dynamic component="span">hi</Dynamic>;
    });

    const keyOf = (html: string) => html.match(/_hk=(\S+)/)?.[1];

    expect(keyOf(withoutId)).toBeDefined();
    expect(keyOf(withId)).toBeDefined();
    expect(keyOf(withId)).not.toBe(keyOf(withoutId));
  });
});
