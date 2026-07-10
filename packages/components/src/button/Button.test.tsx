import { renderToStringAsync } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import ssrFixture from "./__fixtures__/button-ssr.html?raw";
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
    // This is the half of the hydration round-trip that only the *unit* project can run:
    // `@solidjs/web` resolves to its server build here, so this is genuine server output,
    // hydration keys (`_hk`) and all. `Button.browser.test.tsx` hydrates the same fixture in
    // a real browser. Neither project can do both halves — see __fixtures__/README.md.
    //
    // Byte-for-byte on purpose: the `_hk` key and attribute order are exactly what
    // `hydrate()`'s `gatherHydratable()` matches on, so "close enough" is not.
    const html = await renderToStringAsync(() => <Button>Click me</Button>);
    expect(html).toBe(ssrFixture);
  });
});
