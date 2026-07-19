import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import { renderToStringAsync } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { CloseButton } from "../close-button";
import { Tree } from "./close-button.ssr-entry";

// CloseButton reads its styling through `useSlots`/`useRecipe`, so every render — SSR and hydration
// alike — must sit under a `<ThemeProvider>` fed the `hope` preset. `hope`'s token overrides are empty
// (values live in CSS), so the provider takes the zero-DOM branch and emits no `<style>`, leaving the
// output byte-identical. Wrapping a subtree in the provider also shifts its hydration keys (`_hk`), so
// this render and the one `close-button.browser.test.tsx` hydrates must be structurally identical,
// `<ThemeProvider>` included — enforced by construction: both import the same `Tree` from
// `close-button.ssr-entry.tsx`, the single source of truth. See docs/theming.md.

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
    // The glyph is an <svg> (the hand-inlined Lucide `x`), nested inside the icon-slot span.
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
    // The recipe is a pure, deterministic class mapper, so its classes appear in the server HTML
    // exactly as on the client — the whole of theming's SSR requirement.
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={hope}>
        <CloseButton size="lg" />
      </ThemeProvider>
    ));
    expect(html).toContain("bg-close-overlay-hovered");
    expect(html).toContain("ring-close-focus");
    // `lg` box metrics.
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
    // The byte-exact half of the hydration round-trip, and only the `ssr` project can produce it:
    // this is the one place `solid-js` *and* `@solidjs/web` both resolve to their server builds, so
    // this is genuine server output, hydration keys (`_hk`) and all. Byte-exact on purpose —
    // `hydrate()`'s `gatherHydratable()` matches on `_hk`, so "contains the right text" is not enough.
    //
    // An **inline** snapshot, not a committed `.html` file: the exact same `<Tree />` is rendered fresh
    // into the `browser` project by the hydration-fixture bridge (see `vitest-hydration-bridge.ts`), so
    // the snapshot below and what `close-button.browser.test.tsx` hydrates cannot drift. Regenerate
    // deliberately with `pnpm exec vitest run --project=ssr -u`.
    const html = await renderToStringAsync(() => <Tree />);
    expect(html).toMatchInlineSnapshot(
      `"<div _hk=000><!--$--><button _hk=0050 type="button" class="relative inline-flex shrink-0 items-center justify-center select-none outline-none transition-[background-color,box-shadow] duration-150 ease-out hover:not-data-pressed:bg-close-overlay-hovered data-pressed:bg-close-overlay-pressed focus-visible:ring-3 focus-visible:ring-close-focus data-disabled:cursor-not-allowed data-disabled:pointer-events-none data-disabled:opacity-disabled size-6 rounded-md" aria-label="Close" data-slot="close-button" ><span _hk=002 data-slot="close-button-icon" class="pointer-events-none inline-flex items-center justify-center [&amp;_svg]:size-4"><svg _hk=0030 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></span></button><!--/--><!--$--><button _hk=00a0 type="button" class="relative inline-flex shrink-0 items-center justify-center select-none outline-none transition-[background-color,box-shadow] duration-150 ease-out hover:not-data-pressed:bg-close-overlay-hovered data-pressed:bg-close-overlay-pressed focus-visible:ring-3 focus-visible:ring-close-focus data-disabled:cursor-not-allowed data-disabled:pointer-events-none data-disabled:opacity-disabled size-6 rounded-md" aria-label="Close" data-slot="close-button" ><span _hk=007 data-slot="close-button-icon" class="pointer-events-none inline-flex items-center justify-center [&amp;_svg]:size-4"><svg _hk=0080 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" data-custom-icon="true"><path d="M6 18 18 6M6 6l12 12"></path></svg></span></button><!--/--></div>"`,
    );
  });
});
