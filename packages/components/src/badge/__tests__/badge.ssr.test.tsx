import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import { renderToStringAsync } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Badge } from "../badge";
import { Tree } from "./badge.ssr-entry";

// Badge reads its styling through `useSlots`/`useRecipe`, so every render — SSR and hydration alike —
// must sit under a `<ThemeProvider>` fed the `hope` preset. `hope`'s token overrides are empty (its
// values live in CSS), so the provider takes the zero-DOM branch and emits no `<style>`, leaving the
// output byte-identical. Wrapping a subtree in the provider also shifts its hydration keys (`_hk`),
// so this render and the one `badge.browser.test.tsx` hydrates must be structurally identical,
// `<ThemeProvider>` included — enforced by construction here: both import the same `Tree` from
// `badge.ssr-entry.tsx`, the single source of truth. See __internal__/theming.md.

describe("Badge SSR", () => {
  it("resolves renderToStringAsync without throwing", async () => {
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={hope}>
        <Badge>New</Badge>
      </ThemeProvider>
    ));
    expect(typeof html).toBe("string");
  });

  it("paints the recipe classes into the server output", async () => {
    // The recipe is a pure, deterministic class mapper, so its classes appear in the server HTML
    // exactly as on the client — the whole of theming's SSR requirement.
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={hope}>
        <Badge variant="solid" colorScheme="danger">
          Error
        </Badge>
      </ThemeProvider>
    ));
    expect(html).toContain("bg-danger");
    expect(html).toContain("text-on-danger");
    expect(html).toContain('data-slot="badge-label"');
  });

  it("renders the role dot on its own slot for the dot variant", async () => {
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={hope}>
        <Badge variant="dot" colorScheme="success">
          Online
        </Badge>
      </ThemeProvider>
    ));
    expect(html).toContain('data-slot="badge-dot"');
    // The dot slot carries the role color; the root chrome stays neutral.
    expect(html).toContain("bg-success");
    expect(html).toContain("border-neutral-subtle-line");
  });

  it("renders the decorator slots when supplied", async () => {
    const html = await renderToStringAsync(() => (
      <ThemeProvider preset={hope}>
        <Badge startDecorator={<span>+</span>} endDecorator={<span>-</span>}>
          Label
        </Badge>
      </ThemeProvider>
    ));
    expect(html).toContain('data-slot="badge-start-decorator"');
    expect(html).toContain('data-slot="badge-end-decorator"');
  });

  it("matches its server output byte for byte", async () => {
    // The byte-exact half of the hydration round-trip, and only the `ssr` project can produce it:
    // this is the one place `solid-js` *and* `@solidjs/web` both resolve to their server builds, so
    // this is genuine server output, hydration keys (`_hk`) and all. Byte-exact on purpose —
    // `hydrate()`'s `gatherHydratable()` matches on `_hk`, so "contains the right text" is not enough.
    //
    // An **inline** snapshot, not a committed `.html` file: the regression guard lives in this `.tsx`,
    // so a hydration subject adds zero committed fixture files at any scale. The exact same `<Tree />`
    // is rendered fresh into the `browser` project by the hydration-fixture bridge (see
    // `vitest-hydration-bridge.ts`), so the snapshot below and what `badge.browser.test.tsx` hydrates
    // cannot drift. Regenerate deliberately with `pnpm exec vitest run --project=ssr -u`.
    const html = await renderToStringAsync(() => <Tree />);
    expect(html).toMatchInlineSnapshot(
      `"<span _hk=00j0 class="inline-flex items-center justify-center whitespace-nowrap align-middle font-medium select-none border border-transparent bg-clip-padding h-5 gap-1 px-2 text-xs has-data-[slot=badge-start-decorator]:ps-1.5 has-data-[slot=badge-end-decorator]:pe-1.5 rounded-md bg-neutral-soft text-neutral-emphasis" data-slot="badge" ><span _hk=00e0 data-slot="badge-label" class="inline-flex items-center">New</span></span>"`,
    );
  });
});
