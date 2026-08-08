import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import { renderToStream } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Button } from "../button";
import { Tree } from "./button.ssr-entry";

// Button reads its styling from the theme, so every render — server and client alike — needs a
// `<ThemeProvider>`. It emits no DOM, but it does occupy a position in the tree, and Solid matches
// server and client nodes by position, so it must wrap identically on both sides. Enforced by
// construction: this file and `button.browser.test.tsx` import the same `Tree`.

describe("Button SSR", () => {
  it("resolves renderToStream without throwing", async () => {
    const html = await renderToStream(() => (
      <ThemeProvider preset={hope}>
        <Button>Click me</Button>
      </ThemeProvider>
    ));
    expect(typeof html).toBe("string");
  });

  it("paints the recipe classes into the server output", async () => {
    // Turning props into classes is a pure function of those props, so the server emits exactly what
    // the client would — which is the whole of theming's SSR requirement.
    const html = await renderToStream(() => (
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
    // No redundant `aria-disabled` — the native attribute already conveys the state.
    const html = await renderToStream(() => (
      <ThemeProvider preset={hope}>
        <Button disabled>Click me</Button>
      </ThemeProvider>
    ));
    expect(html).toContain("Click me");
    // Matches the bare boolean attribute only — the recipe also emits `disabled:`-prefixed utility
    // classes, which a naive substring check would happily accept instead.
    expect(html).toMatch(/\sdisabled(?:=|\s|>)/);
    expect(html).not.toMatch(/aria-disabled=/);
  });

  it("marks aria-busy while loading without disabling the button", async () => {
    // Loading blocks activation and dims the button, but it keeps its place in the tab order — the
    // state is conveyed by `aria-busy`, never by the native `disabled` attribute.
    const html = await renderToStream(() => (
      <ThemeProvider preset={hope}>
        <Button loading>Saving</Button>
      </ThemeProvider>
    ));
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toMatch(/\sdisabled(?:=|\s|>)/);
    expect(html).toContain('data-slot="button-loader"');
  });

  it("computes the non-native a11y props at render time (present in server output)", async () => {
    // `nativeButton={false}` switches to the `role`/`aria-disabled` model. Those derive from the
    // prop alone, never from inspecting the rendered element, which is exactly why they can appear
    // in server output at all.
    const html = await renderToStream(() => (
      <ThemeProvider preset={hope}>
        <Button nativeButton={false} disabled>
          Link
        </Button>
      </ThemeProvider>
    ));
    expect(html).toContain('role="button"');
    expect(html).toContain('aria-disabled="true"');
    // Disabled, so it also leaves the tab order — and a non-`<button>` takes no native `disabled`.
    expect(html).not.toMatch(/tabindex/);
    expect(html).not.toMatch(/\sdisabled(?:=|\s|>)/);
  });

  it("matches its server output byte for byte", async () => {
    // Only the `ssr` project can produce this: it is the one place `solid-js` *and* `@solidjs/web`
    // both resolve to their server builds, which is what makes the `_hk` attributes — the position
    // keys `hydrate()` matches server nodes on — real. Byte-exact on purpose: matching happens on
    // those keys, so "contains the right text" would not catch a shifted tree.
    //
    // Inline rather than a committed `.html`, so a hydration subject costs zero fixture files. The
    // bridge renders this same `<Tree />` fresh for the browser test, so the two cannot drift.
    // Regenerate deliberately with `pnpm exec vitest run --project=ssr -u`.
    const html = await renderToStream(() => <Tree />);
    expect(html).toMatchInlineSnapshot(
      `"<button _hk=00p0 type="button" class="relative inline-flex items-center justify-center whitespace-nowrap font-medium select-none border outline-none transition-[color,background-color,border-color,box-shadow,translate] duration-150 ease-out focus-visible:border-focus focus-visible:ring-3 focus-visible:ring-focus-halo data-pressed:translate-y-px data-disabled:cursor-not-allowed data-disabled:pointer-events-none data-disabled:shadow-none data-disabled:opacity-disabled aria-busy:cursor-progress aria-busy:pointer-events-none aria-busy:shadow-none aria-busy:opacity-loading h-8 gap-1.5 text-sm rounded-lg has-data-[slot=button-start-decorator]:ps-2.5 has-data-[slot=button-end-decorator]:pe-2.5 bg-surface-raised text-foreground border-subtle shadow-xs hover:not-data-pressed:bg-surface-raised-hovered data-pressed:bg-surface-raised-pressed px-3" data-slot="button" ><span _hk=00f data-slot="button-label" class="inline-flex items-center">Click me</span></button>"`,
    );
  });
});
