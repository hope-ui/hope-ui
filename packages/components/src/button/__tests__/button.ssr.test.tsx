import { renderToStringAsync } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Button } from "../button";

describe("Button SSR", () => {
  it("resolves renderToStringAsync without throwing", async () => {
    const html = await renderToStringAsync(() => <Button>Click me</Button>);
    expect(typeof html).toBe("string");
  });

  it("renders a native disabled button with the disabled attribute and no aria-disabled", async () => {
    // The rework drops the redundant `aria-disabled` on a native disabled button — the native
    // `disabled` attribute already conveys the state.
    const html = await renderToStringAsync(() => <Button disabled>Click me</Button>);
    expect(html).toContain("Click me");
    expect(html).toMatch(/disabled/);
    expect(html).not.toMatch(/aria-disabled/);
  });

  it("computes the non-native a11y props at render time (present in server output)", async () => {
    // `nativeButton={false}` switches to the `role`/`aria-disabled` model. These derive from the
    // boolean at render time (no ref consulted), so they appear server-side — the whole point of
    // the render-time split. Asserted on the default `Dynamic`-rendered element rather than a
    // literal `<a>` because a literal host element in an SSR-compiled test module compiles to a
    // module-scope client-only call that throws at import (see __fixtures__/README.md / CLAUDE.md).
    const html = await renderToStringAsync(() => (
      <Button nativeButton={false} disabled>
        Link
      </Button>
    ));
    expect(html).toContain('role="button"');
    expect(html).toContain('aria-disabled="true"');
    // Disabled + non-focusable → dropped from the tab order, and no native disabled attribute.
    expect(html).not.toMatch(/tabindex/);
    expect(html).not.toMatch(/\sdisabled/);
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
