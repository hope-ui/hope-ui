import type { JSX } from "@solidjs/web";
import { renderToStringAsync } from "@solidjs/web";

// A tiny, component-free keyed tree used only to exercise `hydrateFixture`'s own success and
// reuse-*failure* paths against genuine server markup. The helper forbids hand-written `_hk`
// fixtures, and the hydration-fixture bridge is the only in-project source of real ones, so the
// helper gets its own `hydrate-fixture` subject (registered in `vitest-hydration-bridge.ts`) rather
// than borrowing a component's — no cross-package coupling, no invented markup.

export function Tree(): JSX.Element {
  return (
    <div data-probe="root">
      <span>hydrate-fixture probe</span>
    </div>
  );
}

/** The server render the hydration-fixture bridge invokes for `?id=hydrate-fixture`. */
export function renderFixture(): Promise<string> {
  return renderToStringAsync(() => <Tree />);
}
