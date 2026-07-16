import { renderToStringAsync } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Tree } from "./theme-context.ssr-entry";

// `Tree` (from `theme-context.ssr-entry.tsx`) is the single source of truth for the round-trip tree
// — a `<ThemeProvider>` wrapping a `Probe` that reads a synthetic recipe. `theme-context.browser.test.tsx`
// hydrates the very same render, so sharing one definition keeps the two halves structurally identical.

// SSR (node, server builds of solid-js AND @solidjs/web): proves the ThemeProvider context is
// readable during `renderToStringAsync` — it resolves through the owner graph the server render
// establishes, so a provider wrapping the server render delivers the recipe on the server. This is
// the "works in SolidStart" half for theming.
describe("ThemeProvider + useRecipe on the server", () => {
  it("server-reads the injected recipe and emits its class string, with no <style> of its own", async () => {
    const html = await renderToStringAsync(() => <Tree />);
    expect(html).toMatch(/\bdemo--size_sm\b/);
    // Zero-DOM provider: it contributes no markup, so nothing but the probe is emitted.
    expect(html).not.toContain("<style");
  });

  it("matches its server output byte for byte", async () => {
    // Genuine server output, `_hk` keys and all — the bytes the browser test hydrates. An **inline**
    // snapshot, not a committed `.html` file, so a hydration subject adds zero committed fixture files
    // at any scale. The hydration-fixture bridge renders this same `<Tree />` fresh into the `browser`
    // project (see `vitest-hydration-bridge.ts`), so the snapshot below and what the browser test
    // hydrates cannot drift. Regenerate deliberately with `pnpm exec vitest run --project=ssr -u`.
    const html = await renderToStringAsync(() => <Tree />);
    expect(html).toMatchInlineSnapshot(
      `"<button _hk=000 type="button" class="demo demo--size_sm">go</button>"`,
    );
  });
});
