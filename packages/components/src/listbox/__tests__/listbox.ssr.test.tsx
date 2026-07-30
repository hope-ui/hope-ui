import { renderToStringAsync } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Tree } from "./listbox.ssr-entry";

// `Tree` (from `listbox.ssr-entry.tsx`) is the single source of truth for the round-trip tree:
// `listbox.browser.test.tsx` hydrates the very same render. Hydration keys are allocated by walking
// the tree, so sharing one definition keeps the two halves structurally identical by construction.

describe("Listbox SSR", () => {
  it("resolves renderToStringAsync without throwing", async () => {
    const html = await renderToStringAsync(() => <Tree />);
    expect(typeof html).toBe("string");
  });

  it("renders a role=listbox container named by aria-label, with the options and groups", async () => {
    const html = await renderToStringAsync(() => <Tree />);
    expect(html).toMatch(/role="listbox"/);
    expect(html).toMatch(/aria-label="Choose a fruit"/);
    expect(html).toMatch(/role="group"/);
    expect(html).toMatch(/role="option"/);
    expect(html).toContain("Orange");
    expect(html).toContain("Blueberry");
    expect(html).toContain("Citrus");
  });

  it("reflects the default selection: exactly one aria-selected=true option and one hidden field", async () => {
    const html = await renderToStringAsync(() => <Tree />);
    // Strawberry (id 3) is the default selection.
    expect((html.match(/aria-selected="true"/g) ?? []).length).toBe(1);
    // One hidden native field carries the selected value's `itemToValue` string ("3").
    expect(html).toMatch(/<input[^>]*type="hidden"[^>]*>/);
    expect(html).toMatch(/name="fruit"/);
    expect(html).toMatch(/value="3"/);
  });

  it("matches its server output byte for byte", async () => {
    // The byte-exact half of the hydration round-trip, and only the `ssr` project can produce it:
    // the one place `solid-js` *and* `@solidjs/web` both resolve to their server builds, which is
    // what makes `_hk` — the hydration key `listbox.browser.test.tsx` hydrates against — real.
    // Byte-for-byte on purpose: `hydrate()`'s `gatherHydratable()` matches on `_hk`, so "contains the
    // right text" is not enough.
    //
    // An **inline** snapshot, not a committed `.html` file, so a hydration subject adds zero committed
    // fixture files at any scale. The hydration-fixture bridge renders this same `<Tree />` fresh into
    // the `browser` project (see `vitest-hydration-bridge.ts`), so the snapshot below and what the
    // browser test hydrates cannot drift. Regenerate with `pnpm exec vitest run --project=ssr -u`.
    const html = await renderToStringAsync(() => <Tree />);
    expect(html).toMatchInlineSnapshot(
      `"<div _hk=00a0010 aria-label="Choose a fruit" id="000" role="listbox" aria-orientation="vertical" tabindex="-1" class="text-foreground overflow-y-auto outline-none min-w-36" data-slot="listbox" ><!--!$--><div _hk=00a001103010 role="group" class="not-last:pb-1" data-slot="listbox-group"><div _hk=00a0011030140 id="00a001103011" class="px-1.5 py-1 text-xs text-foreground-muted" data-slot="listbox-group-label">Citrus</div><div _hk=00a00110301501010 id="003-0" role="option" aria-selected="false" tabindex="-1" class="relative flex cursor-default items-center rounded-md pe-8 outline-none select-none data-active:bg-active data-active:text-on-active data-disabled:pointer-events-none data-disabled:opacity-disabled [&amp;_svg]:size-4 gap-1.5 py-1 ps-1.5 text-sm" data-slot="listbox-item" >Orange</div><!--!$--><div _hk=00a00110301511010 id="003-1" role="option" aria-selected="false" tabindex="-1" class="relative flex cursor-default items-center rounded-md pe-8 outline-none select-none data-active:bg-active data-active:text-on-active data-disabled:pointer-events-none data-disabled:opacity-disabled [&amp;_svg]:size-4 gap-1.5 py-1 ps-1.5 text-sm" data-slot="listbox-item" >Lemon</div></div><div _hk=00a00111210 role="presentation" aria-hidden="true" class="my-1 h-px bg-subtle pointer-events-none" data-slot="listbox-separator"></div><!--!$--><div _hk=00a001113010 role="group" class="not-last:pb-1" data-slot="listbox-group"><div _hk=00a0011130140 id="00a001113011" class="px-1.5 py-1 text-xs text-foreground-muted" data-slot="listbox-group-label">Berries</div><div _hk=00a00111301501010 id="003-2" role="option" aria-selected="true" data-selected tabindex="0" class="relative flex cursor-default items-center rounded-md pe-8 outline-none select-none data-active:bg-active data-active:text-on-active data-disabled:pointer-events-none data-disabled:opacity-disabled [&amp;_svg]:size-4 gap-1.5 py-1 ps-1.5 text-sm" data-slot="listbox-item" ><span _hk=00a0011130150101310 data-slot="listbox-item-indicator" aria-hidden="true" class="absolute end-2 flex items-center justify-center [&amp;_svg]:size-4" ><svg _hk=00a0011130150101311 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg></span>Strawberry</div><!--!$--><div _hk=00a00111301511010 id="003-3" role="option" aria-selected="false" tabindex="-1" class="relative flex cursor-default items-center rounded-md pe-8 outline-none select-none data-active:bg-active data-active:text-on-active data-disabled:pointer-events-none data-disabled:opacity-disabled [&amp;_svg]:size-4 gap-1.5 py-1 ps-1.5 text-sm" data-slot="listbox-item" >Blueberry</div></div></div><input _hk=00a03000 type="hidden" name="fruit" value="3">"`,
    );
  });
});
