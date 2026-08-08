import { renderToStream } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Tree } from "./listbox.ssr-entry";

// `Tree` (from `listbox.ssr-entry.tsx`) is shared with `listbox.browser.test.tsx`, which hydrates
// this exact render. Solid allocates hydration keys by walking the tree, so sharing one definition
// keeps the two halves structurally identical by construction.

describe("Listbox SSR", () => {
  it("resolves renderToStream without throwing", async () => {
    const html = await renderToStream(() => <Tree />);
    expect(typeof html).toBe("string");
  });

  it("renders a role=listbox container named by aria-label, with the options and groups", async () => {
    const html = await renderToStream(() => <Tree />);
    expect(html).toMatch(/role="listbox"/);
    expect(html).toMatch(/aria-label="Choose a fruit"/);
    expect(html).toMatch(/role="group"/);
    expect(html).toMatch(/role="option"/);
    expect(html).toContain("Orange");
    expect(html).toContain("Blueberry");
    expect(html).toContain("Citrus");
  });

  it("reflects the default selection: exactly one aria-selected=true option, and one selected <option>", async () => {
    const html = await renderToStream(() => <Tree />);
    // Strawberry (id 3) is the default selection.
    expect((html.match(/aria-selected="true"/g) ?? []).length).toBe(1);
    // The hidden field is a real `<select>`, which is what browser autofill matches against — and
    // that only works if the *whole* option set is server-rendered.
    expect(html).toMatch(/<select[^>]*name="fruit"/);
    expect((html.match(/<option/g) ?? []).length).toBe(5); // the placeholder + one per fruit
    expect(html).toMatch(/<option[^>]*value="3"[^>]*selected>/);
    // The `selected` attribute is the only channel a server render has: `value` on a `<select>` is
    // inert HTML, so a `<select value=…>` would submit nothing before hydration ran.
    expect((html.match(/ selected>/g) ?? []).length).toBe(1);
  });

  it("matches its server output byte for byte", async () => {
    // Byte-for-byte on purpose: hydration matches server nodes on the `_hk` attribute below (the
    // per-node hydration key), so "contains the right text" would not catch a shifted key. Only the
    // `ssr` test project can produce these bytes — it is the one place both `solid-js` and
    // `@solidjs/web` resolve to their server builds, which is what makes `_hk` appear at all.
    //
    // An **inline** snapshot rather than a committed `.html` file, so a hydration subject costs zero
    // fixture files. The browser test hydrates a fresh render of this same `<Tree />`, so the two
    // cannot drift. Regenerate with `pnpm exec vitest run --project=ssr -u`.
    const html = await renderToStream(() => <Tree />);
    expect(html).toMatchInlineSnapshot(
      `"<div _hk=00c0010 aria-label="Choose a fruit" id="000" role="listbox" aria-orientation="vertical" tabindex="-1" class="text-foreground overflow-y-auto outline-none min-w-36" data-slot="listbox" ><!--!$--><div _hk=00c001103010 role="group" class="not-last:pb-1" data-slot="listbox-group"><div _hk=00c0011030140 id="00c001103011" class="px-1.5 py-1 text-xs text-foreground-muted" data-slot="listbox-group-label">Citrus</div><div _hk=00c00110301501010 id="003-0" role="option" aria-selected="false" tabindex="-1" class="relative flex cursor-default items-center pe-8 outline-none select-none data-active:bg-active data-active:text-on-active data-disabled:pointer-events-none data-disabled:opacity-disabled text-sm gap-1.5 py-1.5 ps-1.5 rounded-md [&amp;_svg]:size-4" data-slot="listbox-item" >Orange</div><!--!$--><div _hk=00c00110301511010 id="003-1" role="option" aria-selected="false" tabindex="-1" class="relative flex cursor-default items-center pe-8 outline-none select-none data-active:bg-active data-active:text-on-active data-disabled:pointer-events-none data-disabled:opacity-disabled text-sm gap-1.5 py-1.5 ps-1.5 rounded-md [&amp;_svg]:size-4" data-slot="listbox-item" >Lemon</div></div><div _hk=00c00111210 role="presentation" aria-hidden="true" class="my-1 h-px bg-subtle pointer-events-none" data-slot="listbox-separator"></div><!--!$--><div _hk=00c001113010 role="group" class="not-last:pb-1" data-slot="listbox-group"><div _hk=00c0011130140 id="00c001113011" class="px-1.5 py-1 text-xs text-foreground-muted" data-slot="listbox-group-label">Berries</div><div _hk=00c00111301501010 id="003-2" role="option" aria-selected="true" data-selected tabindex="0" class="relative flex cursor-default items-center pe-8 outline-none select-none data-active:bg-active data-active:text-on-active data-disabled:pointer-events-none data-disabled:opacity-disabled text-sm gap-1.5 py-1.5 ps-1.5 rounded-md [&amp;_svg]:size-4" data-slot="listbox-item" ><span _hk=00c0011130150101310 data-slot="listbox-item-indicator" aria-hidden="true" class="absolute flex items-center justify-center end-1 [&amp;_svg]:size-4" ><svg _hk=00c0011130150101311 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg></span>Strawberry</div><!--!$--><div _hk=00c00111301511010 id="003-3" role="option" aria-selected="false" tabindex="-1" class="relative flex cursor-default items-center pe-8 outline-none select-none data-active:bg-active data-active:text-on-active data-disabled:pointer-events-none data-disabled:opacity-disabled text-sm gap-1.5 py-1.5 ps-1.5 rounded-md [&amp;_svg]:size-4" data-slot="listbox-item" >Blueberry</div></div></div><div _hk=00c0820 aria-hidden="true" style="border:0;clip:rect(0 0 0 0);clip-path:inset(50%);height:1px;margin:-1px;overflow:hidden;padding:0;position:fixed;inset-block-start:0;inset-inline-start:0;width:1px;white-space:nowrap"><label><select tabindex="-1" name="fruit"><option _hk=00c082100 value="" label=" "> </option><option _hk=00c082110 value="1" label="Orange">Orange</option><option _hk=00c082120 value="2" label="Lemon">Lemon</option><option _hk=00c082130 value="3" label="Strawberry" selected>Strawberry</option><option _hk=00c082140 value="4" label="Blueberry">Blueberry</option></select></label></div>"`,
    );
  });
});
