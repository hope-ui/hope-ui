import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { renderToStream } from "@solidjs/web";
import { CloseButton } from "../close-button";

// One tree, three consumers — which is what keeps the server and client trees identical by
// construction, since Solid matches their nodes by position:
//   - close-button.ssr.test.tsx      snapshots the server bytes
//   - close-button.browser.test.tsx  hydrates it
//   - the hydration-fixture bridge imports this file and calls `renderFixture()`
//
// The glyph is a component either way — built-in or consumer-supplied — so this covers the
// component-in-slot hydration path by default, the same shape `button-icons.ssr-entry.tsx` guards
// for the decorator slots. The `<ThemeProvider>` emits no DOM of its own but does occupy a position
// in the tree, so it has to be present identically in both halves.

/** A consumer-supplied glyph expressed as a **component** — the custom-`icon` round-trip subject. */
function CustomIcon(): JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
      data-custom-icon="true"
    >
      <path d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

/** Two buttons, so the built-in glyph and a consumer-supplied one both round-trip. */
export function Tree(): JSX.Element {
  return (
    <ThemeProvider preset={hope}>
      <div>
        <CloseButton />
        <CloseButton icon={<CustomIcon />} />
      </div>
    </ThemeProvider>
  );
}

/**
 * Only the bridge and the `ssr` project call this: `renderToStream` returns a string only under
 * Solid's server builds — the client build's stub returns `undefined`.
 */
export async function renderFixture(): Promise<string> {
  return await renderToStream(() => <Tree />);
}
