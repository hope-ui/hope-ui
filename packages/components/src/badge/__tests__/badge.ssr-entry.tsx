import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { renderToStringAsync } from "@solidjs/web";
import { Badge } from "../badge";

// One tree, three consumers — which is what keeps the server and client trees identical by
// construction, since Solid matches their nodes by position:
//   - badge.ssr.test.tsx      snapshots the server bytes
//   - badge.browser.test.tsx  hydrates it
//   - the hydration-fixture bridge imports this file and calls `renderFixture()`
//
// The `<ThemeProvider>` is required because Badge reads its styling from the theme. It emits no DOM
// of its own, so the fixture is just the `<span>` — but it *does* occupy a position in the tree, so
// it has to be present identically in both halves.

/** Badge's hydration tree — a static, non-interactive label, so it takes no props. */
export function Tree(): JSX.Element {
  return (
    <ThemeProvider preset={hope}>
      <Badge>New</Badge>
    </ThemeProvider>
  );
}

/**
 * Only the bridge and the `ssr` project call this: `renderToStringAsync` returns a string only under
 * Solid's server builds — the client build's stub returns `undefined`.
 */
export function renderFixture(): Promise<string> {
  return renderToStringAsync(() => <Tree />);
}
