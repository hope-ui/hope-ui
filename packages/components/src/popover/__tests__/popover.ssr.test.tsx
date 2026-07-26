import { renderToStringAsync } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Tree } from "./popover.ssr-entry";

// `Tree` (from `popover.ssr-entry.tsx`) is the single source of truth for the round-trip tree:
// `popover.browser.test.tsx` hydrates the very same render. Hydration keys are allocated by walking
// the tree, so sharing one definition keeps the two halves structurally identical by construction.

describe("Popover SSR", () => {
  it("resolves renderToStringAsync without throwing while closed", async () => {
    const html = await renderToStringAsync(() => <Tree />);
    expect(typeof html).toBe("string");
  });

  it("resolves renderToStringAsync without throwing while defaultOpen", async () => {
    // The critical case: @solidjs/web's Portal throws server-side, so an open popover (whose
    // Positioner/Content would otherwise portal into document.body) must not crash the render.
    // `Popover.Portal`'s `isServer` guard is what makes this pass — and `createFloating` must not
    // reach for the DOM on the server either.
    const html = await renderToStringAsync(() => <Tree defaultOpen />);
    expect(typeof html).toBe("string");
  });

  it("renders the trigger with aria-expanded reflecting the closed state", async () => {
    const html = await renderToStringAsync(() => <Tree />);
    expect(html).toContain("Open popover");
    expect(html).toMatch(/aria-expanded="false"/);
  });

  it("omits aria-controls from the closed trigger, so the server HTML has no dangling IDREF", async () => {
    // `Popover.Portal` never renders server-side, so there is no popup element for a closed (or even
    // a `defaultOpen`) popover's `aria-controls` to point at in the SSR output. Shared with Dialog;
    // the open-server case is documented in `popover-trigger.md` rather than papered over with an
    // `isServer` import inside a primitive.
    const html = await renderToStringAsync(() => <Tree />);
    expect(html).not.toMatch(/aria-controls/);
  });

  it("omits portaled content from the SSR output even when defaultOpen", async () => {
    const html = await renderToStringAsync(() => <Tree defaultOpen />);
    expect(html).not.toContain("Popover title");
  });

  it("matches its server output byte for byte", async () => {
    // The byte-exact half of the hydration round-trip, and only the `ssr` project can produce it:
    // the one place `solid-js` *and* `@solidjs/web` both resolve to their server builds, which is
    // what makes `_hk` — the hydration key `popover.browser.test.tsx` hydrates against — real.
    // Byte-for-byte on purpose: `hydrate()`'s `gatherHydratable()` matches on `_hk`, so "contains
    // the right text" is not enough.
    //
    // An **inline** snapshot, not a committed `.html` file, so a hydration subject adds zero
    // committed fixture files at any scale. The hydration-fixture bridge renders this same `<Tree />`
    // fresh into the `browser` project (see `vitest-hydration-bridge.ts`), so the snapshot below and
    // what the browser test hydrates cannot drift. Regenerate with `pnpm exec vitest run --project=ssr -u`.
    const html = await renderToStringAsync(() => <Tree />);
    expect(html).toMatchInlineSnapshot(
      `"<button _hk=00h010 type="button" aria-haspopup="dialog" aria-expanded="false" >Open popover</button>"`,
    );
  });
});
