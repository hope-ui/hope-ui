import type { JSX } from "@solidjs/web";
import { renderToStream } from "@solidjs/web";

// A tiny, component-free tree used only to exercise `hydrateFixture`'s own success and
// reuse-*failure* paths against genuine server markup. Hand-writing hydration-key attributes is not
// allowed and the fixture bridge is the only source of real ones, so this helper gets a subject of
// its own rather than borrowing a component's: no cross-package coupling, no invented markup.

// The click handler is load-bearing even though the server never serializes it. `click` is a
// *delegated* event, so Solid emits a call that queues a microtask which, once hydration settles,
// writes `_$HY.events = null` — landing *after* a synchronous `dispose()`. Keeping the handler here is
// what holds `bootstrapHydration`'s teardown honest.
export function Tree(props: { onProbeClick?: () => void }): JSX.Element {
  return (
    <button type="button" data-probe="root" onClick={() => props.onProbeClick?.()}>
      <span>hydrate-fixture probe</span>
    </button>
  );
}

/** The server render the hydration-fixture bridge invokes for `?id=hydrate-fixture`. */
export async function renderFixture(): Promise<string> {
  return await renderToStream(() => <Tree />);
}
