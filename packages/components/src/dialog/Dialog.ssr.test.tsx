import { renderToStringAsync } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Dialog } from "./Dialog";

/**
 * Structurally identical to `Dialog.browser.test.tsx`'s `FullDialog`, which hydrates the
 * fixture this file produces. Keep them in step: a change here that alters the server markup
 * fails the fixture assertion below, and a change *there* that alters the component tree fails
 * the hydration test — hydration keys are allocated by walking the tree.
 */
function FullDialog(props: { defaultOpen?: boolean }) {
  return (
    <Dialog.Root defaultOpen={props.defaultOpen}>
      <Dialog.Trigger>Open dialog</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.Title>Dialog title</Dialog.Title>
          <Dialog.Description>Dialog description</Dialog.Description>
          <Dialog.Close>Close</Dialog.Close>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

describe("Dialog SSR", () => {
  it("resolves renderToStringAsync without throwing while closed", async () => {
    const html = await renderToStringAsync(() => <FullDialog />);
    expect(typeof html).toBe("string");
  });

  it("resolves renderToStringAsync without throwing while defaultOpen", async () => {
    // The critical case: @solidjs/web's Portal throws server-side, so an open dialog
    // (whose Backdrop/Popup would otherwise portal into document.body) must not crash
    // the render. Dialog.Portal's isServer guard is what makes this pass.
    const html = await renderToStringAsync(() => <FullDialog defaultOpen />);
    expect(typeof html).toBe("string");
  });

  it("renders the trigger with aria-expanded reflecting the closed state", async () => {
    const html = await renderToStringAsync(() => <FullDialog />);
    expect(html).toContain("Open dialog");
    expect(html).toMatch(/aria-expanded="false"/);
  });

  it("omits aria-controls from the closed trigger, so the server HTML has no dangling IDREF", async () => {
    // `Dialog.Portal` never renders server-side, so there is no popup element for a closed
    // (or even a `defaultOpen`) dialog's `aria-controls` to point at in the SSR output.
    const html = await renderToStringAsync(() => <FullDialog />);
    expect(html).not.toMatch(/aria-controls/);
  });

  it("omits portaled content from the SSR output even when defaultOpen", async () => {
    const html = await renderToStringAsync(() => <FullDialog defaultOpen />);
    expect(html).not.toContain("Dialog title");
  });

  it("matches the committed SSR fixture byte for byte", async () => {
    // Half of the hydration round-trip, and only the `ssr` project can run it: this is the one
    // place `solid-js` *and* `@solidjs/web` both resolve to their server builds, which is what
    // makes `_hk` — the hydration key `Dialog.browser.test.tsx` hydrates against — real.
    //
    // `toMatchFileSnapshot`, so the fixture is *generated* by a real server render rather than
    // hand-written — nobody should ever be guessing an `_hk` key. It writes the file on first
    // run, fails on any drift, and under `CI=true` fails rather than writing. Update it
    // deliberately with `pnpm exec vitest run --project=ssr -u`.
    //
    // Byte-for-byte on purpose. `hydrate()`'s `gatherHydratable()` matches on the `_hk`
    // attribute, so "contains the right text" is not enough.
    const html = await renderToStringAsync(() => <FullDialog />);
    await expect(html).toMatchFileSnapshot("./__fixtures__/dialog-ssr.html");
  });
});
