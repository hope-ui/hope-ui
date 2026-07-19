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
// title, a description, and `closable`) — so it exercises the auto path built from the real `Alert.*`
// parts (the status glyph *component* nested inside a reused `Alert.Icon`, the `Alert.Content` subtree
// with `Alert.Title`/`Alert.Description`, and the reused `CloseButton`). The parts self-register their
// title/description ids client-side (`createRegisteredId`/`onSettled`), so the server HTML carries no
// `aria-labelledby`/`aria-describedby` — the links land only after hydration, exactly like the compound
// path. Alert reads styling through `useSlots`/`useRecipe`, so the tree sits under a `<ThemeProvider>`
// fed the `hope` preset; `hope`'s token overrides are empty (values live in CSS), so the provider stays
// on the zero-DOM branch and emits no `<style>`. The provider still shifts `_hk` keys, so it must be
// present identically everywhere. See docs/theming.md.

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
