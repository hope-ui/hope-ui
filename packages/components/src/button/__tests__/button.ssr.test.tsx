import { hopeRecipes } from "@hope-ui/themes/hope/recipes";
import { ThemeProvider } from "@hope-ui/theming";
import { renderToStringAsync } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Button } from "../button";

// Button reads its styling through `useRecipe("button")`, so every render — SSR and hydration
// alike — must sit under a `<ThemeProvider>`. Wrapping a subtree in the provider also shifts its
// hydration keys (`_hk`), so this tree and `button.browser.test.tsx`'s hydration tree are
// structurally identical, `<ThemeProvider>` included. See docs/theming.md "SSR / hydration".

describe("Button SSR", () => {
  it("resolves renderToStringAsync without throwing", async () => {
    const html = await renderToStringAsync(() => (
      <ThemeProvider theme={hopeRecipes}>
        <Button>Click me</Button>
      </ThemeProvider>
    ));
    expect(typeof html).toBe("string");
  });

  it("paints the recipe classes into the server output", async () => {
    // The recipe is a pure, deterministic class mapper, so its classes appear in the server HTML
    // exactly as on the client — the whole of theming's SSR requirement.
    const html = await renderToStringAsync(() => (
      <ThemeProvider theme={hopeRecipes}>
        <Button variant="solid" color="danger">
          Delete
        </Button>
      </ThemeProvider>
    ));
    expect(html).toContain("bg-danger");
    expect(html).toContain("text-on-danger");
    expect(html).toContain('data-slot="label"');
  });

  it("renders a native disabled button with the disabled attribute and no aria-disabled", async () => {
    // The rework drops the redundant `aria-disabled` on a native disabled button — the native
    // `disabled` attribute already conveys the state.
    const html = await renderToStringAsync(() => (
      <ThemeProvider theme={hopeRecipes}>
        <Button disabled>Click me</Button>
      </ThemeProvider>
    ));
    expect(html).toContain("Click me");
    // The native boolean `disabled` attribute (followed by a space/`>`), not the recipe's
    // `disabled:`-prefixed utility classes.
    expect(html).toMatch(/\sdisabled(?:=|\s|>)/);
    expect(html).not.toMatch(/aria-disabled=/);
  });

  it("marks aria-busy while loading without disabling the button", async () => {
    // Loading blocks activation but keeps the enabled look and tab order — conveyed by `aria-busy`,
    // never the native `disabled` attribute.
    const html = await renderToStringAsync(() => (
      <ThemeProvider theme={hopeRecipes}>
        <Button loading>Saving</Button>
      </ThemeProvider>
    ));
    expect(html).toContain('aria-busy="true"');
    // No native `disabled` attribute — loading blocks activation without disabling.
    expect(html).not.toMatch(/\sdisabled(?:=|\s|>)/);
    expect(html).toContain('data-slot="loader"');
  });

  it("computes the non-native a11y props at render time (present in server output)", async () => {
    // `nativeButton={false}` switches to the `role`/`aria-disabled` model. These derive from the
    // boolean at render time (no ref consulted), so they appear server-side — the whole point of
    // the render-time split. Asserted on the default `Dynamic`-rendered element rather than a
    // literal `<a>` because a literal host element in an SSR-compiled test module compiles to a
    // module-scope client-only call that throws at import (see __fixtures__/README.md / CLAUDE.md).
    const html = await renderToStringAsync(() => (
      <ThemeProvider theme={hopeRecipes}>
        <Button nativeButton={false} disabled>
          Link
        </Button>
      </ThemeProvider>
    ));
    expect(html).toContain('role="button"');
    expect(html).toContain('aria-disabled="true"');
    // Disabled + non-focusable → dropped from the tab order, and no native disabled attribute.
    expect(html).not.toMatch(/tabindex/);
    expect(html).not.toMatch(/\sdisabled(?:=|\s|>)/);
  });

  it("matches the committed SSR fixture byte for byte", async () => {
    // Half of the hydration round-trip, and only the `ssr` project can run it: this is the one
    // place `solid-js` *and* `@solidjs/web` both resolve to their server builds, so this is
    // genuine server output, hydration keys (`_hk`) and all. `Button.browser.test.tsx` hydrates
    // the same file — under the same `<ThemeProvider>` — in a real browser. See docs/testing.md.
    //
    // `toMatchFileSnapshot`, so the fixture is *generated* by a real server render rather than
    // hand-written — nobody should ever be guessing an `_hk` key. Update it deliberately with
    // `pnpm exec vitest run --project=ssr -u`.
    const html = await renderToStringAsync(() => (
      <ThemeProvider theme={hopeRecipes}>
        <Button>Click me</Button>
      </ThemeProvider>
    ));
    await expect(html).toMatchFileSnapshot("./__fixtures__/button-ssr.html");
  });
});
