import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { renderToStringAsync } from "@solidjs/web";
import type { Accessor } from "solid-js";
import { describe, expect, it } from "vitest";
import { Listbox } from "../index";

// Virtual-mode SSR is a **graceful no-op**, not the strict hydration round-trip the collection-mode
// `Tree` (`listbox.ssr-entry.tsx` / `listbox.ssr.test.tsx`) exercises. A windowed list can never be
// byte-identical server↔client: the client mounts a scroll-dependent slice the server has no viewport
// to compute. `createVirtualCollection` is client-only — it runs no effects and resolves no scroll
// element on the server, so `virtualItems()` stays empty and the server emits just the
// `role="listbox"` scroll container + an empty sizer. This file asserts that baseline is (a) produced
// without throwing and (b) sane. The DoD's strict round-trip stays satisfied by the collection `Tree`,
// so no `.ssr-entry` / hydration-fixture bridge is used here (there is nothing byte-stable to hydrate).

interface Row {
  id: number;
  name: string;
}

// The full data set — 10k rows, the same scale as the story. None of it should reach the server HTML.
const ROWS: Row[] = Array.from({ length: 10_000 }, (_, index) => ({
  id: index,
  name: `Item ${index}`,
}));

function VirtualTree(): JSX.Element {
  return (
    <ThemeProvider preset={hope}>
      <Listbox.Root
        aria-label="Ten thousand rows"
        items={ROWS}
        estimateSize={() => 32}
        itemToValue={(row: Row) => String(row.id)}
        itemToLabel={(row: Row) => row.name}
        style={{ height: "256px", "overflow-y": "auto" }}
      >
        {(row: Row, index: Accessor<number>) => (
          <Listbox.Item index={index} style={{ height: "32px" }}>
            <Listbox.ItemIndicator />
            {row.name}
          </Listbox.Item>
        )}
      </Listbox.Root>
    </ThemeProvider>
  );
}

describe("Listbox virtual SSR", () => {
  it("resolves renderToStringAsync without throwing (the virtual path is a graceful server no-op)", async () => {
    const html = await renderToStringAsync(() => <VirtualTree />);
    expect(typeof html).toBe("string");
  });

  it("emits a sane baseline: a role=listbox scroll container + an empty sizer, and no windowed rows", async () => {
    const html = await renderToStringAsync(() => <VirtualTree />);
    // The scroll container renders (a role-based `<div role="listbox">` in virtual mode) named by
    // its `aria-label`, carrying the root `data-slot`.
    expect(html).toMatch(/role="listbox"/);
    expect(html).toMatch(/aria-label="Ten thousand rows"/);
    expect(html).toContain('data-slot="listbox"');
    // The sizer div is present; the windowed slice is empty on the server (no viewport to compute), so
    // not a single option — nor any of the 10k labels — is rendered. That is the whole point of
    // windowing, and what keeps the server render O(1) instead of O(10k).
    expect(html).toContain('data-slot="listbox-sizer"');
    expect(html).not.toMatch(/role="option"/);
    expect(html).not.toContain("Item 0");
    expect(html).not.toContain("Item 9999");
  });
});
