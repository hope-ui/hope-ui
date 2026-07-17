import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import { renderToStringAsync } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Button } from "../button";
import { Tree } from "./button.ssr-entry";

// Button reads its styling through `useSlots`/`useRecipe`, so every render — SSR and hydration
// alike — must sit under a `<ThemeProvider>` fed the `hope` preset. `hope`'s token overrides are
// empty (its values live in CSS), so the provider takes the zero-DOM branch and emits no `<style>`,
// leaving the output byte-identical. Wrapping a subtree in the provider also shifts its hydration
// keys (`_hk`), so this render and the one `button.browser.test.tsx` hydrates must be structurally
// identical, `<ThemeProvider>` included — which is enforced by construction here: both import the
// same `Tree` from `button.ssr-entry.tsx`, the single source of truth. See docs/theming.md.

describe("Button SSR", () => {
  it("resolves renderToStringAsync without throwing", async () => {
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={hope}>
        <Button>Click me</Button>
      </ThemeProvider>
    ));
    expect(typeof html).toBe("string");
  });

  it("paints the recipe classes into the server output", async () => {
    // The recipe is a pure, deterministic class mapper, so its classes appear in the server HTML
    // exactly as on the client — the whole of theming's SSR requirement.
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={hope}>
        <Button variant="solid" colorScheme="danger">
          Delete
        </Button>
      </ThemeProvider>
    ));
    expect(html).toContain("bg-danger");
    expect(html).toContain("text-on-danger");
    expect(html).toContain('data-slot="button-label"');
  });

  it("renders a native disabled button with the disabled attribute and no aria-disabled", async () => {
    // The rework drops the redundant `aria-disabled` on a native disabled button — the native
    // `disabled` attribute already conveys the state.
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={hope}>
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
    // Loading blocks activation and dims the chrome via the `aria-busy` axis (`opacity-loading`),
    // but keeps its tab order and is conveyed by `aria-busy`, never the native `disabled` attribute.
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={hope}>
        <Button loading>Saving</Button>
      </ThemeProvider>
    ));
    expect(html).toContain('aria-busy="true"');
    // No native `disabled` attribute — loading blocks activation without disabling.
    expect(html).not.toMatch(/\sdisabled(?:=|\s|>)/);
    expect(html).toContain('data-slot="button-loader"');
  });

  it("computes the non-native a11y props at render time (present in server output)", async () => {
    // `nativeButton={false}` switches to the `role`/`aria-disabled` model. These derive from the
    // boolean at render time (no ref consulted), so they appear server-side — the whole point of
    // the render-time split. Asserted on the default `Dynamic`-rendered element rather than a
    // literal `<a>` because a literal host element in an SSR-compiled test module compiles to a
    // module-scope client-only call that throws at import (see __fixtures__/README.md / CLAUDE.md).
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={hope}>
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

  it("matches its server output byte for byte", async () => {
    // The byte-exact half of the hydration round-trip, and only the `ssr` project can produce it:
    // this is the one place `solid-js` *and* `@solidjs/web` both resolve to their server builds, so
    // this is genuine server output, hydration keys (`_hk`) and all. Byte-exact on purpose —
    // `hydrate()`'s `gatherHydratable()` matches on `_hk`, so "contains the right text" is not
    // enough.
    //
    // An **inline** snapshot, not a committed `.html` file: the regression guard lives in this
    // `.tsx`, so a hydration subject adds zero committed fixture files at any scale. The exact same
    // `<Tree />` is rendered fresh into the `browser` project by the hydration-fixture bridge (see
    // `vitest-hydration-bridge.ts`), so the snapshot below and what `button.browser.test.tsx`
    // hydrates cannot drift. Regenerate deliberately with `pnpm exec vitest run --project=ssr -u`.
    const html = await renderToStringAsync(() => <Tree />);
    expect(html).toMatchInlineSnapshot(
      `"<button _hk=00e0 type="button" class="relative inline-flex items-center justify-center whitespace-nowrap font-medium select-none border bg-clip-padding outline-none transition-[color,background-color,border-color,box-shadow,transform] duration-150 ease-out focus-visible:border-focus focus-visible:ring-3 focus-visible:ring-focus-halo data-pressed:translate-y-px data-disabled:cursor-not-allowed data-disabled:pointer-events-none data-disabled:shadow-none data-disabled:opacity-disabled aria-busy:cursor-progress aria-busy:pointer-events-none aria-busy:shadow-none aria-busy:opacity-loading h-8 gap-1.5 text-sm px-3 rounded-lg has-data-[slot=button-start-decorator]:ps-2.5 has-data-[slot=button-end-decorator]:pe-2.5 bg-surface-raised text-foreground border-subtle shadow-xs hover:not-data-pressed:bg-surface-raised-hovered data-pressed:bg-surface-raised-pressed" data-slot="button" ><span _hk=004 data-slot="button-label" class="inline-flex items-center">Click me</span></button>"`,
    );
  });
});
