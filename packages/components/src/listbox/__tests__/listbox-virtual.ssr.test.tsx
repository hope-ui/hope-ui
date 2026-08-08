import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { renderToStream } from "@solidjs/web";
import type { Accessor } from "solid-js";
import { describe, expect, it } from "vitest";
import { Listbox } from "../index";

// Virtual-mode SSR is deliberately a **graceful no-op**, not the strict hydration round-trip the
// non-virtual tree exercises: a windowed list can never be byte-identical between server and client,
// because the client mounts a scroll-dependent slice the server has no viewport to compute. The
// windowing layer is client-only — it runs no effects and finds no scroll element on the server — so
// the window stays empty and the server emits just the scroll container and an empty sizer.
//
// This file asserts that baseline is produced without throwing, and is sane. There is nothing
// byte-stable to hydrate, so no fixture bridge is involved.

interface Row {
  id: number;
  name: string;
}

// None of these 10k rows should reach the server HTML.
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
  it("resolves renderToStream without throwing (the virtual path is a graceful server no-op)", async () => {
    const html = await renderToStream(() => <VirtualTree />);
    expect(typeof html).toBe("string");
  });

  it("emits a sane baseline: a role=listbox scroll container + an empty sizer, and no windowed rows", async () => {
    const html = await renderToStream(() => <VirtualTree />);
    expect(html).toMatch(/role="listbox"/);
    expect(html).toMatch(/aria-label="Ten thousand rows"/);
    expect(html).toContain('data-slot="listbox"');
    // The sizer is present but empty: with no viewport to compute a window from, not one option — nor
    // any of the 10k labels — is rendered. That is what keeps the server render O(1), not O(10k).
    expect(html).toContain('data-slot="listbox-sizer"');
    expect(html).not.toMatch(/role="option"/);
    expect(html).not.toContain("Item 0");
    expect(html).not.toContain("Item 9999");
  });
});
