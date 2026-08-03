import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import { renderToStringAsync } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { CloseButton } from "../close-button";
import { Tree } from "./close-button.ssr-entry";

// CloseButton reads its styling from the theme, so every render — server and client alike — needs a
// `<ThemeProvider>`. It emits no DOM, but it does occupy a position in the tree, and Solid matches
// server and client nodes by position, so it must wrap identically on both sides. Enforced by
// construction: this file and `close-button.browser.test.tsx` import the same `Tree`.

describe("CloseButton SSR", () => {
  it("resolves renderToStringAsync without throwing", async () => {
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={hope}>
        <CloseButton />
      </ThemeProvider>
    ));
    expect(typeof html).toBe("string");
  });

  it("emits a native <button type=button> with the root slot marker", async () => {
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={hope}>
        <CloseButton />
      </ThemeProvider>
    ));
    expect(html).toContain('data-slot="close-button"');
    expect(html).toContain('type="button"');
  });

  it("renders the built-in X inside the host icon-slot span", async () => {
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={hope}>
        <CloseButton />
      </ThemeProvider>
    ));
    expect(html).toContain('data-slot="close-button-icon"');
    expect(html).toContain("<svg");
  });

  it("self-labels from the localized `common.close` (default locale = English)", async () => {
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={hope}>
        <CloseButton />
      </ThemeProvider>
    ));
    expect(html).toContain('aria-label="Close"');
  });

  it("paints the recipe classes (currentColor wash + focus ring) into the server output", async () => {
    // Turning props into classes is a pure function of those props, so the server emits exactly what
    // the client would — which is the whole of theming's SSR requirement.
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={hope}>
        <CloseButton size="lg" />
      </ThemeProvider>
    ));
    expect(html).toContain("bg-surface-adaptive-hovered");
    expect(html).toContain("ring-focus-halo");
    expect(html).toContain("size-8");
  });

  it("lets a consumer aria-label override the localized default", async () => {
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={hope}>
        <CloseButton aria-label="Dismiss" />
      </ThemeProvider>
    ));
    expect(html).toContain('aria-label="Dismiss"');
    expect(html).not.toContain('aria-label="Close"');
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
    const html = await renderToStringAsync(() => <Tree />);
    expect(html).toMatchInlineSnapshot(
      `"<div _hk=000><!--$--><button _hk=0050 type="button" class="relative inline-flex shrink-0 items-center justify-center select-none outline-none transition-[background-color,box-shadow] duration-150 ease-out hover:not-data-pressed:bg-surface-adaptive-hovered data-pressed:bg-surface-adaptive-pressed focus-visible:ring-3 focus-visible:ring-focus-halo data-disabled:cursor-not-allowed data-disabled:pointer-events-none data-disabled:opacity-disabled size-6 rounded-md" aria-label="Close" data-slot="close-button" ><span _hk=002 data-slot="close-button-icon" class="pointer-events-none inline-flex items-center justify-center [&amp;_svg]:size-4"><svg _hk=0030 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></span></button><!--/--><!--$--><button _hk=00a0 type="button" class="relative inline-flex shrink-0 items-center justify-center select-none outline-none transition-[background-color,box-shadow] duration-150 ease-out hover:not-data-pressed:bg-surface-adaptive-hovered data-pressed:bg-surface-adaptive-pressed focus-visible:ring-3 focus-visible:ring-focus-halo data-disabled:cursor-not-allowed data-disabled:pointer-events-none data-disabled:opacity-disabled size-6 rounded-md" aria-label="Close" data-slot="close-button" ><span _hk=007 data-slot="close-button-icon" class="pointer-events-none inline-flex items-center justify-center [&amp;_svg]:size-4"><svg _hk=0080 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" data-custom-icon="true"><path d="M6 18 18 6M6 6l12 12"></path></svg></span></button><!--/--></div>"`,
    );
  });
});
