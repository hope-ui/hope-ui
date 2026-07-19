import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import { renderToStringAsync } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Alert } from "..";
import { Tree } from "./alert.ssr-entry";

// Alert reads its styling through `useSlots`/`useRecipe`, so every render — SSR and hydration alike —
// must sit under a `<ThemeProvider>` fed the `hope` preset. `hope`'s token overrides are empty (its
// values live in CSS), so the provider takes the zero-DOM branch and emits no `<style>`, leaving the
// output byte-identical. This render and the one `alert.browser.test.tsx` hydrates must be
// structurally identical, `<ThemeProvider>` included — enforced by construction: both import the same
// `Tree` from `alert.ssr-entry.tsx`, the single source of truth. See docs/theming.md.

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
    // default + danger: the role color rides the icon + title slots; the root stays the raised surface.
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
    // The role fill never lands on the root in the default variant.
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

  it("wires the live-region role and the aria label/description links in the server HTML", async () => {
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={hope}>
        <Alert.Root colorScheme="info" title="Note" description="Read this." />
      </ThemeProvider>
    ));
    expect(html).toContain('role="alert"');
    expect(html).toContain('data-state="entered"');
    // The auto-composed title/description ids are linked directly in the server markup.
    expect(html).toContain("aria-labelledby");
    expect(html).toContain("aria-describedby");
  });

  it("matches its server output byte for byte", async () => {
    // The byte-exact half of the hydration round-trip, and only the `ssr` project can produce it:
    // this is the one place `solid-js` *and* `@solidjs/web` both resolve to their server builds, so
    // this is genuine server output, hydration keys (`_hk`) and all. Byte-exact on purpose —
    // `hydrate()`'s `gatherHydratable()` matches on `_hk`. Regenerate deliberately with
    // `pnpm exec vitest run --project=ssr -u`.
    const html = await renderToStringAsync(() => <Tree />);
    expect(html).toMatchInlineSnapshot(
      `"<div _hk=0040290 class="relative flex w-full items-start rounded-xl border bg-clip-padding transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none data-[state=exiting]:opacity-0 data-[state=exiting]:-translate-y-1 gap-3 p-4 text-sm bg-surface-raised text-foreground border-subtle" data-slot="alert" data-state="entered" role="alert" aria-labelledby="002" aria-describedby="003" ><span _hk=00402930 data-slot="alert-icon" class="inline-flex shrink-0 items-center justify-center [&amp;_svg]:size-5 text-info-emphasis" aria-hidden="true"><svg _hk=0040223 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle _hk=0040220 cx="12" cy="12" r="10"></circle><path _hk=0040221 d="M12 16v-4"></path><path _hk=0040222 d="M12 8h.01"></path></svg></span><div _hk=00402960 data-slot="alert-content" class="flex min-w-0 flex-1 flex-col gap-1"><!--$--><div _hk=004029630 data-slot="alert-title" id="002" class="font-medium text-info-emphasis">Update available</div><!--/--><!--$--><div _hk=004029660 data-slot="alert-description" id="003" class="">A new version is ready to install.</div><!--/--></div><button _hk=004029940 type="button" class="relative inline-flex items-center justify-center select-none outline-none transition-[background-color,box-shadow] duration-150 ease-out hover:not-data-pressed:bg-close-overlay-hovered data-pressed:bg-close-overlay-pressed focus-visible:ring-3 focus-visible:ring-close-focus data-disabled:cursor-not-allowed data-disabled:pointer-events-none data-disabled:opacity-disabled size-6 rounded-md -me-1 -mt-1 ms-auto shrink-0" aria-label="Close" data-slot="close-button" ><span _hk=00402991 data-slot="close-button-icon" class="pointer-events-none inline-flex items-center justify-center [&amp;_svg]:size-4"><svg _hk=004029920 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></span></button></div>"`,
    );
  });
});
