import { renderToStream } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Tree } from "./popover.ssr-entry";

// `Tree` (from `popover.ssr-entry.tsx`) is shared with `popover.browser.test.tsx`, which hydrates
// this exact render. Solid allocates hydration keys by walking the tree, so sharing one definition
// keeps the two halves structurally identical by construction.

describe("Popover SSR", () => {
  it("resolves renderToStream without throwing while closed", async () => {
    const html = await renderToStream(() => <Tree />);
    expect(typeof html).toBe("string");
  });

  it("resolves renderToStream without throwing while defaultOpen", async () => {
    // The critical case: @solidjs/web's Portal throws server-side, so an open popover — whose
    // Positioner/Content would otherwise portal into `document.body` — must not crash the render.
    // `Popover.Portal`'s server guard is what makes this pass, and the positioning layer must not
    // reach for the DOM on the server either.
    const html = await renderToStream(() => <Tree defaultOpen />);
    expect(typeof html).toBe("string");
  });

  it("renders the trigger with aria-expanded reflecting the closed state", async () => {
    const html = await renderToStream(() => <Tree />);
    expect(html).toContain("Open popover");
    expect(html).toMatch(/aria-expanded="false"/);
  });

  it("omits aria-controls from the closed trigger, so the server HTML has no dangling IDREF", async () => {
    // `Popover.Portal` never renders on the server, so there is no popup element for `aria-controls`
    // to point at — and an id reference to an element that does not exist is invalid ARIA.
    const html = await renderToStream(() => <Tree />);
    expect(html).not.toMatch(/aria-controls/);
  });

  it("omits portaled content from the SSR output even when defaultOpen", async () => {
    const html = await renderToStream(() => <Tree defaultOpen />);
    expect(html).not.toContain("Popover title");
  });

  it("matches its server output byte for byte", async () => {
    // Byte-for-byte on purpose: hydration matches server nodes on the `_hk` attribute below (the
    // per-node hydration key), so "contains the right text" would not catch a shifted key. Only the
    // `ssr` test project can produce these bytes — it is the one place both `solid-js` and
    // `@solidjs/web` resolve to their server builds, which is what makes `_hk` appear at all.
    //
    // An **inline** snapshot rather than a committed `.html` file, so a hydration subject costs zero
    // fixture files. The browser test hydrates a fresh render of this same `<Tree />`, so the two
    // cannot drift. Regenerate with `pnpm exec vitest run --project=ssr -u`.
    const html = await renderToStream(() => <Tree />);
    expect(html).toMatchInlineSnapshot(
      `"<button _hk=00h010 type="button" aria-haspopup="dialog" aria-expanded="false" >Open popover</button>"`,
    );
  });
});
