import { renderToStringAsync } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Button } from "./Button";

describe("Button SSR", () => {
  it("resolves renderToStringAsync without throwing", async () => {
    const html = await renderToStringAsync(() => <Button>Click me</Button>);
    expect(typeof html).toBe("string");
  });

  it("renders the button label and disabled state", async () => {
    const html = await renderToStringAsync(() => <Button disabled>Click me</Button>);
    expect(html).toContain("Click me");
    expect(html).toMatch(/disabled/);
    expect(html).toMatch(/aria-disabled="true"/);
  });

  it("matches the committed SSR fixture byte for byte", async () => {
    // Half of the hydration round-trip, and only the `ssr` project can run it: this is the one
    // place `solid-js` *and* `@solidjs/web` both resolve to their server builds, so this is
    // genuine server output, hydration keys (`_hk`) and all. `Button.browser.test.tsx` hydrates
    // the same file in a real browser. See __fixtures__/README.md and docs/testing.md.
    //
    // `toMatchFileSnapshot`, so the fixture is *generated* by a real server render rather than
    // hand-written — nobody should ever be guessing an `_hk` key. It writes the file on first
    // run, fails on any drift, and under `CI=true` fails rather than writing. Update it
    // deliberately with `pnpm exec vitest run --project=ssr -u`.
    //
    // Byte-for-byte on purpose: the `_hk` key and attribute order are exactly what
    // `hydrate()`'s `gatherHydratable()` matches on, so "close enough" is not.
    const html = await renderToStringAsync(() => <Button>Click me</Button>);
    await expect(html).toMatchFileSnapshot("./__fixtures__/button-ssr.html");
  });
});
