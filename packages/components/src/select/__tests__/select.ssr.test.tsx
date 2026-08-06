import { renderToStringAsync } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Tree } from "./select.ssr-entry";

// `select.browser.test.tsx` hydrates this very same `Tree`. Solid assigns hydration keys by walking
// the component tree, so sharing one definition is what keeps the two halves structurally identical.

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
    // The value comes from `itemToLabel`, not from a mounted row — the option set is data.
    expect(html).toContain("Strawberry");
    expect(html).not.toMatch(/role="listbox"/);
    expect(html).not.toMatch(/role="option"/);
    expect(html).not.toMatch(/role="group"/);
    // `aria-controls` would name an element that is not in the DOM while closed, so every closed
    // Select on the page would carry an invalid IDREF.
    expect(html).not.toMatch(/aria-controls=/);
    expect(html).not.toMatch(/aria-activedescendant=/);
  });

  it("server-renders every option into the hidden native <select>, not just the selected one", async () => {
    const html = await renderToStringAsync(() => <Tree />);
    // What browser autofill matches against, and only possible because the option set is data rather
    // than mounted rows: the popup rendered nothing, yet all four options are here.
    expect(html).toMatch(/<select[^>]*name="fruit"/);
    expect((html.match(/<option/g) ?? []).length).toBe(5); // the placeholder + one per fruit
    expect(html).toMatch(/<option[^>]*value="3"[^>]*selected>/);
    // `selected` is the only channel a server render has: a `value` attribute on `<select>` is inert
    // HTML, so a `<select value=…>` would submit nothing before hydration.
    expect((html.match(/ selected>/g) ?? []).length).toBe(1);
  });

  it("renders an open Select on the server without crashing, and still portals nothing", async () => {
    // @solidjs/web's `Portal` throws server-side rather than degrading, so `Select.Portal` returns
    // `null` there. An open Select must therefore still render, and render only its trigger.
    const html = await renderToStringAsync(() => <Tree defaultOpen />);
    expect(html).toMatch(/role="combobox"/);
    expect(html).toMatch(/aria-expanded="true"/);
    expect(html).not.toMatch(/role="listbox"/);
    expect(html).not.toMatch(/data-slot="select-content"/);
  });

  it("matches its server output byte for byte", async () => {
    // The byte-exact half of the hydration round-trip, and only the `ssr` project can produce it: the
    // one place `solid-js` *and* `@solidjs/web` both resolve to their server builds, which is what
    // makes the `_hk` hydration keys in the output real. Byte-for-byte on purpose, because `hydrate()`
    // matches client nodes to server ones on those keys — "contains the right text" is not enough.
    //
    // Inline rather than a committed `.html` fixture, so a hydration subject adds no fixture files at
    // any scale. The bridge feeding `select.browser.test.tsx` renders this same `<Tree />` fresh, so
    // the two cannot drift. Regenerate with `pnpm exec vitest run --project=ssr -u`.
    const html = await renderToStringAsync(() => <Tree />);
    expect(html).toMatchInlineSnapshot(
      `"<button _hk=00u0030 aria-label="Choose a fruit" type="button" id="000" role="combobox" aria-haspopup="listbox" aria-expanded="false" class="relative inline-flex items-center justify-between select-none cursor-default rounded-lg border border-subtle bg-surface-raised text-foreground outline-none transition-[background-color,border-color,box-shadow] duration-150 ease-out focus-visible:border-focus focus-visible:ring-3 focus-visible:ring-focus-halo data-disabled:cursor-not-allowed data-disabled:pointer-events-none data-disabled:opacity-disabled h-8 gap-2 ps-2.5 pe-2 text-sm min-w-36" data-slot="select-trigger" ><span _hk=00u00340 id="00u0031" class="min-w-0 flex-1 truncate text-start data-placeholder:text-foreground-subtle" data-slot="select-value" >Strawberry</span><span _hk=00u00360 data-slot="select-icon" aria-hidden="true" class="pointer-events-none inline-flex shrink-0 items-center justify-center text-foreground-muted [&amp;_svg]:size-4" ><svg _hk=00u00361 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></span></button><div _hk=00u0820 aria-hidden="true" style="border:0;clip:rect(0 0 0 0);clip-path:inset(50%);height:1px;margin:-1px;overflow:hidden;padding:0;position:fixed;inset-block-start:0;inset-inline-start:0;width:1px;white-space:nowrap"><label><select tabindex="-1" name="fruit"><option _hk=00u082100 value="" label=" "> </option><option _hk=00u082110 value="1" label="Orange">Orange</option><option _hk=00u082120 value="2" label="Lemon">Lemon</option><option _hk=00u082130 value="3" label="Strawberry" selected>Strawberry</option><option _hk=00u082140 value="4" label="Blueberry">Blueberry</option></select></label></div>"`,
    );
  });
});
