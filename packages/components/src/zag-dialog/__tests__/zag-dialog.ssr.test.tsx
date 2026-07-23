import { renderToStringAsync } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Tree } from "./zag-dialog.ssr-entry";

// `Tree` (from `zag-dialog.ssr-entry.tsx`) is the single source of truth for the round-trip tree:
// `zag-dialog.browser.test.tsx` hydrates the very same render.
//
// Ported from `dialog.ssr.test.tsx`. One assertion had to be inverted — see
// `__internal__/spikes/zag-dialog-findings.md`.

describe("ZagDialog SSR", () => {
  it("resolves renderToStringAsync without throwing while closed", async () => {
    const html = await renderToStringAsync(() => <Tree />);
    expect(typeof html).toBe("string");
  });

  it("resolves renderToStringAsync without throwing while defaultOpen", async () => {
    // The critical case: @solidjs/web's Portal throws server-side, so an open dialog
    // (whose Backdrop/Content would otherwise portal into document.body) must not crash
    // the render. ZagDialog.Portal's isServer guard is what makes this pass.
    const html = await renderToStringAsync(() => <Tree defaultOpen />);
    expect(typeof html).toBe("string");
  });

  it("renders the trigger with aria-expanded reflecting the closed state", async () => {
    // Green only because the vendored adapter's `normalizeProps` now stringifies boolean `aria-*`
    // values. `getTriggerProps()` emits the *boolean* `false`, and neither Solid's SSR serializer
    // nor its client `spread` stringifies a falsy attribute value — they drop it, so before that
    // fix the server HTML shipped a collapsed trigger with no `aria-expanded` at all. The gap was
    // in the adapter, not the machine: React's DOM layer stringifies `aria-*` booleans, so it is
    // invisible upstream.
    const html = await renderToStringAsync(() => <Tree />);
    expect(html).toContain("Open dialog");
    expect(html).toMatch(/aria-expanded="false"/);
  });

  it("emits a dangling aria-controls on the closed trigger", async () => {
    // **Inverted from Dialog's `omits aria-controls from the closed trigger`.**
    // `getTriggerProps()` sets `aria-controls: dom.getContentId(scope)` unconditionally, and the
    // content element never exists server-side (the Portal renders nothing), so the shipped HTML
    // carries an IDREF that resolves to nothing. Pinned as-is rather than patched, because the
    // measurement is what the spike is for; the closed-state axe check in the browser suite is the
    // same defect seen from the a11y side.
    const html = await renderToStringAsync(() => <Tree />);
    expect(html).toMatch(/aria-controls="dialog:[^"]+:content"/);
  });

  it("omits portaled content from the SSR output even when defaultOpen", async () => {
    const html = await renderToStringAsync(() => <Tree defaultOpen />);
    expect(html).not.toContain("Dialog title");
  });

  it("matches its server output byte for byte", async () => {
    // The byte-exact half of the hydration round-trip. Regenerate with
    // `pnpm exec vitest run --project=ssr -u`.
    const html = await renderToStringAsync(() => <Tree />);
    expect(html).toMatchInlineSnapshot(
      `"<button _hk=00d010 data-scope="dialog" data-part="trigger" id="dialog:000:trigger" data-ownedby="000" aria-haspopup="dialog" type="button" aria-expanded="false" data-state="closed" aria-controls="dialog:000:content" >Open dialog</button>"`,
    );
  });
});
