import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { renderToStream } from "@solidjs/web";
import { Button } from "../button";

// One tree, three consumers — which is what keeps the server and client trees identical by
// construction, since Solid matches their nodes by position:
//   - button.ssr.test.tsx      snapshots the server bytes
//   - button.browser.test.tsx  hydrates it
//   - the hydration-fixture bridge imports this file and calls `renderFixture()`
//
// The `<ThemeProvider>` is required because Button reads its styling from the theme. It emits no DOM
// of its own, so the fixture is just the `<button>` — but it *does* occupy a position in the tree,
// so it has to be present identically in both halves.

/**
 * `onClick` is optional so the "interactive after hydrating" test can attach a handler without
 * changing the structure: an event binding adds no element and no server attribute.
 */
export function Tree(props?: { onClick?: (event: MouseEvent) => void }): JSX.Element {
  return (
    <ThemeProvider preset={hope}>
      <Button onClick={props?.onClick}>Click me</Button>
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
