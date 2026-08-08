import { renderToStream } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Tree } from "./dialog.ssr-entry";

// `dialog.browser.test.tsx` hydrates this exact `Tree`. Solid matches server and client nodes by
// position, so sharing one definition keeps the two halves structurally identical by construction.

describe("Dialog SSR", () => {
  it("resolves renderToStream without throwing while closed", async () => {
    const html = await renderToStream(() => <Tree />);
    expect(typeof html).toBe("string");
  });

  it("resolves renderToStream without throwing while defaultOpen", async () => {
    // The critical case: `@solidjs/web`'s Portal throws server-side, so an open dialog — whose
    // Backdrop and Content would otherwise portal into `document.body` — must not crash the render.
    // `Dialog.Portal`'s server guard is what makes this pass.
    const html = await renderToStream(() => <Tree defaultOpen />);
    expect(typeof html).toBe("string");
  });

  it("renders the trigger with aria-expanded reflecting the closed state", async () => {
    const html = await renderToStream(() => <Tree />);
    expect(html).toContain("Open dialog");
    expect(html).toMatch(/aria-expanded="false"/);
  });

  it("omits aria-controls from the closed trigger, so the server HTML has no dangling IDREF", async () => {
    // `Dialog.Portal` never renders server-side, so there is no element for `aria-controls` to point
    // at — and an id reference that resolves to nothing is invalid per ARIA.
    const html = await renderToStream(() => <Tree />);
    expect(html).not.toMatch(/aria-controls/);
  });

  it("omits portaled content from the SSR output even when defaultOpen", async () => {
    const html = await renderToStream(() => <Tree defaultOpen />);
    expect(html).not.toContain("Dialog title");
  });

  it("matches its server output byte for byte", async () => {
    // Only the `ssr` project can produce this: it is the one place `solid-js` *and* `@solidjs/web`
    // both resolve to their server builds, which is what makes the `_hk` attributes — the position
    // keys `hydrate()` matches server nodes on — real. Byte-exact on purpose: matching happens on
    // those keys, so "contains the right text" would not catch a shifted tree.
    //
    // Inline rather than a committed `.html`, so a hydration subject costs zero fixture files. The
    // bridge renders this same `<Tree />` fresh for the browser test, so the two cannot drift.
    // Regenerate deliberately with `pnpm exec vitest run --project=ssr -u`.
    const html = await renderToStream(() => <Tree />);
    expect(html).toMatchInlineSnapshot(
      `"<button _hk=002010 type="button" aria-haspopup="dialog" aria-expanded="false" >Open dialog</button>"`,
    );
  });
});
