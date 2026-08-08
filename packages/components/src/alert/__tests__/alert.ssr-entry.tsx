import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { renderToStream } from "@solidjs/web";
import { Alert } from "..";

// One tree, three consumers — which is what keeps the server and client trees identical by
// construction, since Solid matches their nodes by position:
//   - alert.ssr.test.tsx      snapshots the server bytes
//   - alert.browser.test.tsx  hydrates it
//   - the hydration-fixture bridge imports this file and calls `renderFixture()`
//
// The auto-composed form is the one worth round-tripping: it nests components inside slots — the
// status glyph inside `Alert.Icon`, a whole `CloseButton` — which is the shape that used to
// mis-hydrate. Its title and description register their ids only after the render pass, so the
// server HTML carries no `aria-labelledby`/`aria-describedby`; those appear once hydrated.
//
// The `<ThemeProvider>` emits no DOM of its own but does occupy a position in the tree, so it has to
// be present identically in both halves.

/** Alert's hydration tree — the auto-composed anatomy (icon + title + description + close). */
export function Tree(): JSX.Element {
  return (
    <ThemeProvider preset={hope}>
      <Alert.Root
        colorScheme="info"
        title="Update available"
        description="A new version is ready to install."
        closable
      />
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
