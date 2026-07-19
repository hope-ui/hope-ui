import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { renderToStringAsync } from "@solidjs/web";
import { Button } from "../button";

// The single source of truth for Button's SSR → hydration round-trip tree. Three consumers share
// it, which is what enforces the "structurally identical tree" invariant by construction (hydration
// keys are a path through the component tree — a shape mismatch between server and client fails
// hydration):
//   - button.ssr.test.tsx      renders `Tree` with renderToStringAsync and inline-snapshots the bytes
//   - button.browser.test.tsx  passes `Tree` as the `ui` to hydrateFixture (client build)
//   - the hydration-fixture bridge ssrLoadModule()s this file and calls `renderFixture()`
//
// Button reads styling through `useSlots`/`useRecipe`, so the tree sits under a `<ThemeProvider>` fed
// the `hope` preset. `hope`'s token overrides are empty (its values live in CSS), so the provider
// stays on the zero-DOM branch and emits no `<style>` — the fixture is just the `<button>`. The
// provider still shifts `_hk` keys, so it must be present identically everywhere. See __internal__/theming.md.

/**
 * Button's hydration tree. `onClick` is optional so the "interactive after hydrating" test can
 * attach a handler without diverging the structure: an event binding adds no element and no server
 * attribute, so the tree stays byte- and `_hk`-identical to the fixture with or without it.
 */
export function Tree(props?: { onClick?: (event: MouseEvent) => void }): JSX.Element {
  return (
    <ThemeProvider preset={hope}>
      <Button onClick={props?.onClick}>Click me</Button>
    </ThemeProvider>
  );
}

/**
 * The server render the bridge invokes. `renderToStringAsync` only produces a string under the
 * server builds (the client build's stub returns `undefined`), so only the bridge — which mirrors
 * the `ssr` project's server-build resolution — calls this.
 */
export function renderFixture(): Promise<string> {
  return renderToStringAsync(() => <Tree />);
}
