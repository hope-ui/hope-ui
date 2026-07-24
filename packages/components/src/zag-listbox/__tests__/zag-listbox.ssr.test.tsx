import { renderToStringAsync } from "@solidjs/web";
import { describe, expect, it } from "vitest";
import { Tree } from "./zag-listbox.ssr-entry";

// `Tree` (from `zag-listbox.ssr-entry.tsx`) is the single source of truth for the round-trip tree:
// `zag-listbox.browser.test.tsx` hydrates the very same render.
//
// Not a port of `listbox.ssr.test.tsx` — machine correctness is settled by the ZagDialog spike. What
// is genuinely untested is `_hk` stability across N rendered items, which is what the byte-exact
// snapshot below pins.

describe("ZagListbox SSR", () => {
  it("resolves renderToStringAsync without throwing", async () => {
    const html = await renderToStringAsync(() => <Tree />);
    expect(typeof html).toBe("string");
  });

  it("renders every collection item as a server-rendered option", async () => {
    const html = await renderToStringAsync(() => <Tree />);
    expect(html).toContain("Apple");
    expect(html).toContain("Banana");
    expect(html).toContain("Cherry");
    expect(html).toContain("Date");
    expect([...html.matchAll(/role="option"/g)]).toHaveLength(4);
  });

  it("ships the selected row's aria-selected and the disabled row's aria-disabled", async () => {
    // Both are boolean in the machine, so both are green only because the fork's `normalizeProps`
    // stringifies boolean `aria-*` (`A1`). `aria-selected="false"` on the unselected rows is the
    // half that would silently vanish without it.
    const html = await renderToStringAsync(() => <Tree />);
    expect([...html.matchAll(/aria-selected="true"/g)]).toHaveLength(1);
    expect([...html.matchAll(/aria-selected="false"/g)]).toHaveLength(3);
    expect([...html.matchAll(/aria-disabled="true"/g)]).toHaveLength(1);
  });

  it("emits an aria-labelledby on the listbox that resolves to the rendered Label", async () => {
    const html = await renderToStringAsync(() => <Tree />);
    const labelledBy = html.match(/role="listbox"[^>]*aria-labelledby="([^"]+)"/)?.[1];
    expect(labelledBy).toBeDefined();
    expect(html).toContain(`id="${labelledBy}"`);
  });

  it("matches its server output byte for byte", async () => {
    // The byte-exact half of the hydration round-trip, and the `_hk`-across-N-items pin.
    // Regenerate with `pnpm exec vitest run --project=ssr -u`.
    const html = await renderToStringAsync(() => <Tree />);
    expect(html).toMatchInlineSnapshot(
      `"<div _hk=00s010 data-scope="listbox" data-part="root" id="listbox:000" data-orientation="vertical" data-slot="zag-listbox-root" ><div _hk=00s0140 id="listbox:000:label" data-scope="listbox" data-part="label" data-slot="zag-listbox-label">Fruits</div><div _hk=00s0180 id="listbox:000:content" role="listbox" data-scope="listbox" data-part="content" data-orientation="vertical" aria-labelledby="listbox:000:label" tabIndex="0" data-layout="list" style="--column-count:1" class="text-foreground overflow-y-auto outline-none min-w-36" data-slot="zag-listbox"><div _hk=00s018102010 id="listbox:000:item:apple" role="option" data-scope="listbox" data-part="item" data-value="apple" aria-selected="false" data-layout="list" data-state="unchecked" data-orientation="vertical" class="relative flex cursor-default items-center rounded-md pr-8 outline-none select-none data-active:bg-active data-active:text-on-active data-disabled:pointer-events-none data-disabled:opacity-disabled [&amp;_svg]:size-4 gap-1.5 py-1 pl-1.5 text-sm" data-slot="zag-listbox-item" ><span _hk=00s0181020140 data-scope="listbox" data-part="item-text" data-state="unchecked" data-slot="zag-listbox-item-text">Apple</span></div><div _hk=00s018112010 id="listbox:000:item:banana" role="option" data-scope="listbox" data-part="item" data-value="banana" aria-selected="true" data-selected data-layout="list" data-state="checked" data-orientation="vertical" class="relative flex cursor-default items-center rounded-md pr-8 outline-none select-none data-active:bg-active data-active:text-on-active data-disabled:pointer-events-none data-disabled:opacity-disabled [&amp;_svg]:size-4 gap-1.5 py-1 pl-1.5 text-sm" data-slot="zag-listbox-item" ><span _hk=00s0181120140 data-scope="listbox" data-part="item-text" data-state="checked" data-slot="zag-listbox-item-text">Banana</span><span _hk=00s01811201910 data-scope="listbox" data-part="item-indicator" aria-hidden="true" data-state="checked" class="absolute right-2 flex items-center justify-center [&amp;_svg]:size-4" data-slot="zag-listbox-item-indicator" ><svg _hk=00s01811201911 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg></span></div><div _hk=00s018122010 id="listbox:000:item:cherry" role="option" data-scope="listbox" data-part="item" data-value="cherry" aria-selected="false" data-layout="list" data-state="unchecked" data-orientation="vertical" class="relative flex cursor-default items-center rounded-md pr-8 outline-none select-none data-active:bg-active data-active:text-on-active data-disabled:pointer-events-none data-disabled:opacity-disabled [&amp;_svg]:size-4 gap-1.5 py-1 pl-1.5 text-sm" data-slot="zag-listbox-item" ><span _hk=00s0181220140 data-scope="listbox" data-part="item-text" data-state="unchecked" data-slot="zag-listbox-item-text">Cherry</span></div><div _hk=00s018132010 id="listbox:000:item:date" role="option" data-scope="listbox" data-part="item" data-value="date" aria-selected="false" data-layout="list" data-state="unchecked" data-orientation="vertical" data-disabled aria-disabled="true" class="relative flex cursor-default items-center rounded-md pr-8 outline-none select-none data-active:bg-active data-active:text-on-active data-disabled:pointer-events-none data-disabled:opacity-disabled [&amp;_svg]:size-4 gap-1.5 py-1 pl-1.5 text-sm" data-slot="zag-listbox-item" ><span _hk=00s0181320140 data-scope="listbox" data-part="item-text" data-state="unchecked" data-disabled data-slot="zag-listbox-item-text">Date</span></div></div></div>"`,
    );
  });
});
