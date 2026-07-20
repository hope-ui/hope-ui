import { hope } from "@hope-ui/presets/hope";
import { ThemeProvider } from "@hope-ui/theming";
import type { JSX } from "@solidjs/web";
import { renderToStringAsync } from "@solidjs/web";
import { CloseButton } from "../close-button";

// The single source of truth for CloseButton's SSR → hydration round-trip tree. Three consumers share
// it, which enforces the "structurally identical tree" invariant by construction (hydration keys are a
// path through the component tree — a shape mismatch between server and client fails hydration):
//   - close-button.ssr.test.tsx      renders `Tree` with renderToStringAsync and inline-snapshots bytes
//   - close-button.browser.test.tsx  passes `Tree` as the `ui` to hydrateFixture (client build)
//   - the hydration-fixture bridge ssrLoadModule()s this file and calls `renderFixture()`
//
// The glyph is a **component** in both cases (the built-in `<CloseIcon/>`, and a consumer-supplied
// `<CustomIcon/>`), so this exercises the component-in-slot hydration path by default — the same path
// `button-icons.ssr-entry.tsx` guards for the decorator slots. CloseButton reads styling through
// `useSlots`/`useRecipe`, so the tree sits under a `<ThemeProvider>` fed the `hope` preset; `hope`'s
// token overrides are empty (values live in CSS), so the provider stays on the zero-DOM branch and
// emits no `<style>`. The provider still shifts `_hk` keys, so it must be present identically. See
// __internal__/theming.md.

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

/**
 * CloseButton's hydration tree — a default close button (built-in `<CloseIcon/>`) and one with a
 * consumer-supplied component glyph, so both the default and custom paths round-trip.
 */
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
 * The server render the bridge invokes. `renderToStringAsync` only produces a string under the server
 * builds (the client build's stub returns `undefined`), so only the bridge — which mirrors the `ssr`
 * project's server-build resolution — calls this.
 */
export function renderFixture(): Promise<string> {
  return renderToStringAsync(() => <Tree />);
}
