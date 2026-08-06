import { renderToStringAsync } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Tree } from "./combobox.ssr-entry";

// `combobox.browser.test.tsx` hydrates this very same `Tree`. Solid assigns hydration keys by walking
// the component tree, so sharing one definition is what keeps the two halves structurally identical.

describe("Combobox SSR", () => {
  it("resolves renderToStringAsync without throwing", async () => {
    const html = await renderToStringAsync(() => <Tree />);
    expect(typeof html).toBe("string");
  });

  it("renders the input with its name and its value, and no popup", async () => {
    const html = await renderToStringAsync(() => <Tree />);
    expect(html).toMatch(/role="combobox"/);
    expect(html).toMatch(/aria-label="Choose a fruit"/);
    expect(html).toMatch(/aria-autocomplete="list"/);
    expect(html).toMatch(/aria-expanded="false"/);
    // The browser's own suggestion machinery, off — `spellcheck` as the enumerated **string**,
    // because a JS `false` serializes to an absent attribute that then inherits back on.
    expect(html).toMatch(/autocomplete="off"/);
    expect(html).toMatch(/autocorrect="off"/);
    expect(html).toMatch(/spellcheck="false"/);
    // The field's text comes from `itemToLabel` over the initial selection, computed from props on
    // both sides — which is what lets the value agree across hydration without being re-derived.
    expect(html).toMatch(/value="Strawberry"/);
    // `role="combobox"` implies `aria-haspopup="listbox"` in ARIA 1.2, so the input does not repeat
    // it. The chevron `<button>` implies nothing, so it must.
    expect(html).not.toMatch(/role="combobox"[^>]*aria-haspopup/);
    expect(html).toMatch(/aria-haspopup="listbox"/);
    expect(html).not.toMatch(/role="listbox"/);
    expect(html).not.toMatch(/role="option"/);
    expect(html).not.toMatch(/role="group"/);
    expect(html).not.toMatch(/role="status"/);
    // `aria-controls` would name an element that is not in the DOM while closed, so every closed
    // Combobox on the page would carry an invalid IDREF.
    expect(html).not.toMatch(/aria-controls=/);
    expect(html).not.toMatch(/aria-activedescendant=/);
  });

  it("renders no hidden native form control", async () => {
    const html = await renderToStringAsync(() => <Tree />);
    // Deliberate, and enforced by the type: `name`/`form`/`required` are `Omit`-ted from
    // `ComboboxRootProps`. Select renders a `<select>` carrying every `<option>` because it holds the
    // whole option set; a Combobox holds the *filtered* one, so the same field would drop options as
    // the user typed and submit whatever the query happened to leave behind.
    expect(html).not.toMatch(/<select/);
  });

  it("renders the gutter buttons outside the tab order", async () => {
    const html = await renderToStringAsync(() => <Tree />);
    // The input is the widget's single tab stop, server-side too — otherwise a page that has not
    // hydrated yet takes three Tab presses to cross one field.
    //
    // Matched case-insensitively: the props ride through a spread, so the server serializes the key
    // verbatim as the source spells it (`tabIndex`). HTML attribute names are case-insensitive, so the
    // parser lowercases it and the hydrated DOM agrees; the browser half pins the effective property.
    const tabbable = html.match(/tabindex="-1"/gi) ?? [];
    expect(tabbable.length).toBe(2); // Clear + Trigger
    expect(html).toMatch(/data-slot="combobox-clear"/);
    expect(html).toMatch(/data-slot="combobox-trigger"/);
  });

  it("renders an open Combobox on the server without crashing, and still portals nothing", async () => {
    // @solidjs/web's `Portal` throws server-side rather than degrading, so `Combobox.Portal` returns
    // `null` there. An open Combobox must therefore still render, and render only its control.
    const html = await renderToStringAsync(() => <Tree defaultOpen />);
    expect(html).toMatch(/role="combobox"/);
    expect(html).toMatch(/aria-expanded="true"/);
    expect(html).not.toMatch(/role="listbox"/);
    expect(html).not.toMatch(/data-slot="combobox-content"/);
    // `Combobox.Status` creates a `document.body`-level live region, so it is guarded on
    // `typeof document` — a server render must never reach `document.createElement`.
    expect(html).not.toMatch(/data-slot="combobox-status"/);
  });

  it("matches its server output byte for byte", async () => {
    // The byte-exact half of the hydration round-trip, and only the `ssr` project can produce it: the
    // one place `solid-js` *and* `@solidjs/web` both resolve to their server builds, which is what
    // makes the `_hk` hydration keys in the output real. Byte-for-byte on purpose, because `hydrate()`
    // matches client nodes to server ones on those keys — "contains the right text" is not enough.
    //
    // Inline rather than a committed `.html` fixture, so a hydration subject adds no fixture files at
    // any scale. The bridge feeding `combobox.browser.test.tsx` renders this same `<Tree />` fresh, so
    // the two cannot drift. Regenerate with `pnpm exec vitest run --project=ssr -u`.
    const html = await renderToStringAsync(() => <Tree />);
    expect(html).toMatchInlineSnapshot(
      `"<div _hk=00z010 data-slot="combobox-control" class="relative inline-flex items-center rounded-lg border border-subtle bg-surface-raised text-foreground transition-[background-color,border-color,box-shadow] duration-150 ease-out focus-within:border-focus focus-within:ring-3 focus-within:ring-focus-halo data-disabled:cursor-not-allowed data-disabled:pointer-events-none data-disabled:opacity-disabled h-8 gap-1 ps-2.5 pe-1 min-w-36" ><input _hk=00z0130 aria-label="Choose a fruit" placeholder="Search fruit" value="Strawberry" id="004" type="text" role="combobox" aria-autocomplete="list" aria-expanded="false" autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false" class="min-w-0 flex-1 cursor-text border-0 bg-transparent outline-none text-foreground placeholder:text-foreground-subtle h-8 text-sm" data-slot="combobox-input" /><button _hk=00z01710 type="button" aria-label="Clear" tabIndex="-1" class="aspect-square inline-flex shrink-0 items-center justify-center outline-none text-foreground-muted transition-[background-color,color] duration-150 ease-out hover:not-data-pressed:bg-surface-raised-hovered data-pressed:bg-surface-raised-pressed h-6 rounded-md [&amp;_svg]:size-4" data-slot="combobox-clear" ><svg _hk=00z01711 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg></button><button _hk=00z01a0 type="button" aria-label="Show suggestions" aria-haspopup="listbox" aria-expanded="false" tabIndex="-1" class="aspect-square inline-flex shrink-0 items-center justify-center select-none outline-none text-foreground-muted transition-[background-color,color] duration-150 ease-out hover:not-data-pressed:bg-surface-raised-hovered data-pressed:bg-surface-raised-pressed h-6 rounded-md" data-slot="combobox-trigger" ><span _hk=00z01a20 data-slot="combobox-icon" aria-hidden="true" class="pointer-events-none inline-flex shrink-0 items-center justify-center text-foreground-muted [&amp;_svg]:size-4" ><svg _hk=00z01a21 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg></span></button></div>"`,
    );
  });
});
