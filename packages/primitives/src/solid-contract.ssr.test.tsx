import { Dynamic, insert, renderToStringAsync, setAttribute, spread, template } from "@solidjs/web";
import { createUniqueId } from "solid-js";
import { describe, expect, it } from "vitest";

/**
 * The **server-build** half of the Solid contract. This file only means anything in the `ssr`
 * Vitest project, which is the one place `solid-js` *and* `@solidjs/web` both resolve to their
 * `dist/server.js` entries — the same pair a SolidStart server process loads.
 *
 * Its mirror image is `solid-contract.browser.test.tsx`, which asserts the same four DOM
 * helpers are real implementations in the client build. The asymmetry between the two files
 * *is* the invariant `scripts/check-dist-imports.mjs` enforces.
 *
 * See `docs/testing.md` and `docs/migration-2.0-stable.md` §2.
 */

describe("@solidjs/web server-build contract", () => {
  // Depended on by: every component, and this is the entire basis of the
  // "no literal host JSX element" invariant (CLAUDE.md; `scripts/check-dist-imports.mjs`).
  //
  // `vite-plugin-solid` is configured with neither `generate` nor `hydratable`, i.e.
  // `generate: "dom"`, which compiles a literal `<div/>` into a module-scope `_$template()`
  // call plus `_$insert()`. Those four helpers are throwing stubs on the server, so a single
  // literal host element in any component would throw *at import* under SSR.
  //
  // It works today only because every host element routes through
  // `renderElement` → `<Dynamic>` → `createComponent`, and `Dynamic` handles SSR at runtime.

  it("exports template/insert/spread/setAttribute as throwing stubs", () => {
    const clientOnly = { template, insert, spread, setAttribute };

    for (const [name, helper] of Object.entries(clientOnly)) {
      expect(() => (helper as () => void)(), `${name} should be a server-side notSup stub`).toThrow(
        /Client-only API called on the server side/,
      );
    }
  });

  it("renders a host element through Dynamic, with a hydration key", async () => {
    // Server-side `dynamic()` calls `ssrElement(component, props, undefined, true)` — the
    // trailing `true` is what emits the `_hk` hydration key. If stable drops the key, the
    // single `generate: "dom"` build stops being able to hydrate and we need a second,
    // `generate: "ssr"` + `hydratable: true` build. See docs/migration-2.0-stable.md §3.
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
