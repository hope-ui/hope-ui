import { renderToStream } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Tree } from "./theme-context.ssr-entry";

// Runs against the *server* builds of solid-js and @solidjs/web. `theme-context.browser.test.tsx`
// hydrates this same `Tree`, so the two halves stay structurally identical by construction.
//
// What it proves: the ThemeProvider context is readable during `renderToStream`, resolving
// through the owner graph the server render sets up, so a provider wrapping a server render really
// does deliver the recipe there.
describe("ThemeProvider + useRecipe on the server", () => {
  it("server-reads the injected recipe and emits its class string, with no <style> of its own", async () => {
    const html = await renderToStream(() => <Tree />);
    expect(html).toMatch(/\bdemo--size_sm\b/);
    // The provider contributes no markup of its own, so nothing but the probe is emitted.
    expect(html).not.toContain("<style");
  });

  it("matches its server output byte for byte", async () => {
    // Real server output, hydration keys (`_hk`) and all — the bytes the browser test hydrates. Kept
    // as an inline snapshot rather than a committed `.html` file, so adding a hydration subject never
    // adds a fixture file. The browser side does not read this snapshot: the fixture bridge renders
    // the same `<Tree />` fresh, so the two cannot drift. Regenerate deliberately, with
    // `pnpm exec vitest run --project=ssr -u`.
    const html = await renderToStream(() => <Tree />);
    expect(html).toMatchInlineSnapshot(
      `"<button _hk=000 type="button" class="demo demo--size_sm">go</button>"`,
    );
  });
});
