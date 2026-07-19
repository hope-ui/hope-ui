import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { renderToStringAsync } from "@solidjs/web";
import { Alert } from "..";

// The single source of truth for Alert's SSR → hydration round-trip tree. Three consumers share it,
// which enforces the "structurally identical tree" invariant by construction (hydration keys are a
// path through the component tree — a shape mismatch between server and client fails hydration):
//   - alert.ssr.test.tsx      renders `Tree` with renderToStringAsync and inline-snapshots the bytes
//   - alert.browser.test.tsx  passes `Tree` as the `ui` to hydrateFixture (client build)
//   - the hydration-fixture bridge ssrLoadModule()s this file and calls `renderFixture()`
//
// `Tree` renders Alert in the **auto-compose** form (a `colorScheme` with a built-in status glyph, a
// title, a description, and `closable`) — so it exercises the Badge-safe host structure (host-element
// slot wrappers with the glyph *component* nested inside the `alert-icon` span), the content subtree,
// and the reused `CloseButton`. Alert reads styling through `useSlots`/`useRecipe`, so the tree sits
// under a `<ThemeProvider>` fed the `hope` preset; `hope`'s token overrides are empty (values live in
// CSS), so the provider stays on the zero-DOM branch and emits no `<style>`. The provider still shifts
// `_hk` keys, so it must be present identically everywhere. See docs/theming.md.

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
 * The server render the bridge invokes. `renderToStringAsync` only produces a string under the server
 * builds (the client build's stub returns `undefined`), so only the bridge — which mirrors the `ssr`
 * project's server-build resolution — calls this.
 */
export function renderFixture(): Promise<string> {
  return renderToStringAsync(() => <Tree />);
}
