import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import { renderToStringAsync } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Alert } from "..";
import { Tree } from "./alert.ssr-entry";

// Alert reads its styling from the theme, so every render — server and client alike — needs a
// `<ThemeProvider>`. It emits no DOM, but it does occupy a position in the tree, and Solid matches
// server and client nodes by position, so it must wrap identically on both sides. Enforced by
// construction: this file and `alert.browser.test.tsx` import the same `Tree`.

describe("Alert SSR", () => {
  it("resolves renderToStringAsync without throwing", async () => {
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={hope}>
        <Alert.Root title="Heads up" description="Something happened." />
      </ThemeProvider>
    ));
    expect(typeof html).toBe("string");
  });

  it("paints the default variant's role color onto the icon/title, not the root", async () => {
    // In the `default` variant the role color rides the icon and title only; the surface stays neutral.
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={hope}>
        <Alert.Root colorScheme="danger" title="Payment failed" description="Try another card." />
      </ThemeProvider>
    ));
    expect(html).toContain('data-slot="alert"');
    expect(html).toContain('data-slot="alert-title"');
    expect(html).toContain('data-slot="alert-description"');
    expect(html).toContain("bg-surface-raised");
    expect(html).toContain("text-danger-emphasis");
    expect(html).not.toContain("bg-danger");
  });

  it("paints the solid variant's role fill onto the root", async () => {
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={hope}>
        <Alert.Root variant="solid" colorScheme="danger" title="Error" />
      </ThemeProvider>
    ));
    expect(html).toContain("bg-danger");
    expect(html).toContain("text-on-danger");
  });

  it("renders a built-in status glyph inside the host icon span", async () => {
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={hope}>
        <Alert.Root colorScheme="success" title="Saved" />
      </ThemeProvider>
    ));
    expect(html).toContain('data-slot="alert-icon"');
    expect(html).toContain("<svg");
  });

  it("wires the live-region role in server HTML but defers the aria links to the client", async () => {
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={hope}>
        <Alert.Root colorScheme="info" title="Note" description="Read this." />
      </ThemeProvider>
    ));
    expect(html).toContain('role="alert"');
    expect(html).toContain('data-presence="entered"');
    // The title and description register their ids only after the render pass, which never happens
    // on the server — so these links are absent here and appear once hydrated, in both forms.
    expect(html).not.toContain("aria-labelledby");
    expect(html).not.toContain("aria-describedby");
  });

  it("matches its server output byte for byte", async () => {
    // Only the `ssr` project can produce this: it is the one place `solid-js` *and* `@solidjs/web`
    // both resolve to their server builds, which is what makes the `_hk` attributes — the position
    // keys `hydrate()` matches server nodes on — real. Byte-exact on purpose: matching happens on
    // those keys, so "contains the right text" would not catch a shifted tree. Regenerate
    // deliberately with `pnpm exec vitest run --project=ssr -u`.
    const html = await renderToStringAsync(() => <Tree />);
    expect(html).toMatchInlineSnapshot(
      `"<div _hk=0020290 class="relative flex w-full items-start rounded-lg border transition-[opacity,translate] duration-200 ease-out motion-reduce:transition-none data-exiting:opacity-0 data-exiting:-translate-y-1 gap-2.5 p-3 text-sm bg-surface-raised text-foreground border-subtle" data-slot="alert" data-presence="entered" role="alert" ><span _hk=002029310 class="inline-flex shrink-0 items-center justify-center [&amp;_svg]:size-5 text-info-emphasis" data-slot="alert-icon" aria-hidden="true"><svg _hk=0020220 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg></span><div _hk=002029610 class="flex min-w-0 flex-1 flex-col gap-0.5" data-slot="alert-content"><div _hk=00202961330 id="0020296130" class="font-medium text-info-emphasis" data-slot="alert-title">Update available</div><p _hk=00202961630 id="0020296160" class="" data-slot="alert-description">A new version is ready to install.</p></div><button _hk=002029940 type="button" class="relative inline-flex items-center justify-center select-none outline-none transition-[background-color,box-shadow] duration-150 ease-out hover:not-data-pressed:bg-surface-adaptive-hovered data-pressed:bg-surface-adaptive-pressed focus-visible:ring-3 focus-visible:ring-focus-halo data-disabled:cursor-not-allowed data-disabled:pointer-events-none data-disabled:opacity-disabled size-6 rounded-md -me-1 -mt-1 ms-auto shrink-0" aria-label="Close" data-slot="alert-close-trigger" ><span _hk=00202991 data-slot="close-button-icon" class="pointer-events-none inline-flex items-center justify-center [&amp;_svg]:size-4"><svg _hk=002029920 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></span></button></div>"`,
    );
  });
});
