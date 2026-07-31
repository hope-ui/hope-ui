import { renderToStringAsync } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Tree } from "./select.ssr-entry";

// `Tree` (from `select.ssr-entry.tsx`) is the single source of truth for the round-trip tree:
// `select.browser.test.tsx` hydrates the very same render. Hydration keys are allocated by walking
// the tree, so sharing one definition keeps the two halves structurally identical by construction.

describe("Select SSR", () => {
  it("resolves renderToStringAsync without throwing", async () => {
    const html = await renderToStringAsync(() => <Tree />);
    expect(typeof html).toBe("string");
  });

  it("renders the trigger with its name, its value, and no popup", async () => {
    const html = await renderToStringAsync(() => <Tree />);
    expect(html).toMatch(/role="combobox"/);
    expect(html).toMatch(/aria-label="Choose a fruit"/);
    expect(html).toMatch(/aria-haspopup="listbox"/);
    expect(html).toMatch(/aria-expanded="false"/);
    // The value is rendered from `itemToLabel`, not from a mounted row — the option set is data.
    expect(html).toContain("Strawberry");
    // Nothing renders until open, so there is no listbox, no option and no group on the server.
    expect(html).not.toMatch(/role="listbox"/);
    expect(html).not.toMatch(/role="option"/);
    expect(html).not.toMatch(/role="group"/);
    // `aria-controls` names an element that is not in the DOM while closed, so it must be absent —
    // otherwise every closed Select on the page carries an invalid IDREF.
    expect(html).not.toMatch(/aria-controls=/);
    expect(html).not.toMatch(/aria-activedescendant=/);
  });

  it("server-renders every option into the hidden native <select>, not just the selected one", async () => {
    const html = await renderToStringAsync(() => <Tree />);
    // This is what browser autofill matches against, and it only works because the option set is
    // data rather than mounted rows: the popup rendered nothing, yet all four options are here.
    expect(html).toMatch(/<select[^>]*name="fruit"/);
    expect((html.match(/<option/g) ?? []).length).toBe(5); // the placeholder + one per fruit
    expect(html).toMatch(/<option[^>]*value="3"[^>]*selected>/);
    // `selected` is the only channel a server render has: a `value` attribute on `<select>` is inert
    // HTML, so a `<select value=…>` would submit nothing before hydration.
    expect((html.match(/ selected>/g) ?? []).length).toBe(1);
  });

  it("renders an open Select on the server without crashing, and still portals nothing", async () => {
    // `Select.Portal` returns `null` under `isServer` — @solidjs/web's `Portal` throws server-side
    // rather than degrading — so an open Select must render, and render only its trigger.
    const html = await renderToStringAsync(() => <Tree defaultOpen />);
    expect(html).toMatch(/role="combobox"/);
    expect(html).toMatch(/aria-expanded="true"/);
    expect(html).not.toMatch(/role="listbox"/);
    expect(html).not.toMatch(/data-slot="select-content"/);
  });

  it("matches its server output byte for byte", async () => {
    // The byte-exact half of the hydration round-trip, and only the `ssr` project can produce it:
    // the one place `solid-js` *and* `@solidjs/web` both resolve to their server builds, which is
    // what makes `_hk` — the hydration key `select.browser.test.tsx` hydrates against — real.
    // Byte-for-byte on purpose: `hydrate()`'s `gatherHydratable()` matches on `_hk`, so "contains the
    // right text" is not enough.
    //
    // An **inline** snapshot, not a committed `.html` file, so a hydration subject adds zero committed
    // fixture files at any scale. The hydration-fixture bridge renders this same `<Tree />` fresh into
    // the `browser` project (see `vitest-hydration-bridge.ts`), so the snapshot below and what the
    // browser test hydrates cannot drift. Regenerate with `pnpm exec vitest run --project=ssr -u`.
    const html = await renderToStringAsync(() => <Tree />);
    expect(html).toMatchInlineSnapshot(
      `"<button _hk=00t0030 aria-label="Choose a fruit" type="button" id="000" role="combobox" aria-haspopup="listbox" aria-expanded="false" class="relative inline-flex items-center justify-between select-none cursor-default rounded-lg border border-subtle bg-surface-raised text-foreground outline-none transition-[background-color,border-color,box-shadow] duration-150 ease-out focus-visible:border-focus focus-visible:ring-3 focus-visible:ring-focus-halo data-disabled:cursor-not-allowed data-disabled:pointer-events-none data-disabled:opacity-disabled h-8 gap-2 ps-2.5 pe-2 text-sm min-w-36" data-slot="select-trigger" ><span _hk=00t00340 id="00t0031" class="min-w-0 flex-1 truncate text-start data-placeholder:text-foreground-subtle" data-slot="select-value" >Strawberry</span><span _hk=00t00360 data-slot="select-icon" aria-hidden="true" class="pointer-events-none inline-flex shrink-0 items-center justify-center text-foreground-muted [&amp;_svg]:size-4" ><svg _hk=00t00361 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></span></button><div _hk=00t0820 aria-hidden="true" style="border:0;clip:rect(0 0 0 0);clip-path:inset(50%);height:1px;margin:-1px;overflow:hidden;padding:0;position:fixed;inset-block-start:0;inset-inline-start:0;width:1px;white-space:nowrap"><label><select tabindex="-1" name="fruit"><option _hk=00t082100 value="" label=" "> </option><option _hk=00t082110 value="1" label="Orange">Orange</option><option _hk=00t082120 value="2" label="Lemon">Lemon</option><option _hk=00t082130 value="3" label="Strawberry" selected>Strawberry</option><option _hk=00t082140 value="4" label="Blueberry">Blueberry</option></select></label></div>"`,
    );
  });
});
