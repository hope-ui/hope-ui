import type { JSX } from "@solidjs/web";
import { renderToStringAsync } from "@solidjs/web";

// A tiny, component-free keyed tree used only to exercise `hydrateFixture`'s own success and
// reuse-*failure* paths against genuine server markup. The helper forbids hand-written `_hk`
// fixtures, and the hydration-fixture bridge is the only in-project source of real ones, so the
// helper gets its own `hydrate-fixture` subject (registered in `vitest-hydration-bridge.ts`) rather
// than borrowing a component's — no cross-package coupling, no invented markup.

// The click handler is load-bearing even though the server never serializes it: `click` is a
// **delegated** event, and `babel-preset-solid` emits a `runHydrationEvents()` call for any
// top-level template element carrying one. That call queues a microtask which, once hydration
// settles, writes `_$HY.events = null` — landing *after* a synchronous `dispose()`. Keeping it here
// is what holds `bootstrapHydration`'s teardown honest.
export function Tree(props: { onProbeClick?: () => void }): JSX.Element {
  return (
    <button type="button" data-probe="root" onClick={() => props.onProbeClick?.()}>
      <span>hydrate-fixture probe</span>
    </button>
  );
}

/** The server render the hydration-fixture bridge invokes for `?id=hydrate-fixture`. */
export function renderFixture(): Promise<string> {
  return renderToStringAsync(() => <Tree />);
}
