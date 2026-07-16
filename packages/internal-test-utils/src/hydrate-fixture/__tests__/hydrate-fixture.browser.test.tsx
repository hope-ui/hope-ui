import probeServerHtml from "virtual:hydration-fixture?id=hydrate-fixture";
import { describe, expect, it } from "vitest";
import { hydrateFixture } from "../hydrate-fixture";
// Genuine keyed server markup (`<div _hk=…><span _hk=…>`), rendered fresh by the hydration-fixture
// bridge in the `browser` project (see `vitest-hydration-bridge.ts`) from `hydrate-fixture.ssr-entry.tsx`.
// The helper forbids hand-written `_hk` fixtures, and the bridge is the only in-project source of
// real ones, so its own success + reuse-failure paths hydrate a dedicated component-free probe tree
// rather than inventing markup no server would send (or coupling to a component's fixture).
import { Tree } from "./hydrate-fixture.ssr-entry";

/**
 * These tests pin the helper's plumbing, its silence check, its console discipline, and — against a
 * genuine keyed bridge fixture — both halves of its reuse contract: a matching client tree reuses
 * every server node, and a structurally diverging one fails loudly rather than silently
 * client-rendering.
 */
interface HydrationGlobals {
  _$HY?: unknown;
}

describe("hydrateFixture", () => {
  it("hydrates a no-op tree cleanly, then disposes and clears the _$HY bootstrap", () => {
    const { container, dispose } = hydrateFixture("", () => null);

    expect(document.body.contains(container)).toBe(true);
    expect((globalThis as HydrationGlobals)._$HY).toBeDefined();

    dispose();

    expect(document.body.contains(container)).toBe(false);
    expect((globalThis as HydrationGlobals)._$HY).toBeUndefined();
  });

  it("throws when hydration is not silent (a mismatch surfaces on the console)", () => {
    expect(() =>
      hydrateFixture("", () => {
        console.error("simulated hydration mismatch");
        return null;
      }),
    ).toThrow(/not silent/);

    // Even though it threw, the bootstrap is cleaned up — no leak into the next test.
    expect((globalThis as HydrationGlobals)._$HY).toBeUndefined();
  });

  it("restores console.error/warn to the original functions after hydrating", () => {
    // The store/restore-unbound discipline: a later `vi.spyOn(console, ...)` must see the real
    // function, not a wrapper this helper left behind.
    const error = console.error;
    const warn = console.warn;

    const { dispose } = hydrateFixture("", () => null);

    expect(console.error).toBe(error);
    expect(console.warn).toBe(warn);

    dispose();
  });

  it("reuses every server node when the client tree matches the markup", () => {
    // The success half, against the same genuine fixture the failure case below diverges from: the
    // matching `Tree` claims the server's `_hk` nodes in place, so the helper's whole-tree reuse
    // check passes and hands back the hydrated container.
    const { container, dispose } = hydrateFixture(probeServerHtml, () => <Tree />);

    expect(container.querySelector('[data-probe="root"]')).not.toBeNull();
    expect(container.querySelector("span")?.textContent).toBe("hydrate-fixture probe");

    dispose();
  });

  it("throws when the client tree structurally diverges, shifting the hydration keys", () => {
    // The failure half. Prepending an element before the matching `Tree` shifts every hydration key
    // after it — `_hk` is a path through the component tree — so `hydrate()` can't find the server's
    // nodes and fails loudly (a "Hydration Mismatch … Unable to find DOM nodes for hydration key"),
    // rather than silently client-rendering a second copy. This is the exact hazard the fixture
    // system guards against project-wide: inserting a component before `Dialog.Trigger`, even one
    // that renders nothing, shifts the trigger's key. Without a genuine keyed fixture this path was
    // unreachable, which is why Phase 1 deferred it to the generation bridge.
    expect(() =>
      hydrateFixture(probeServerHtml, () => (
        <>
          <span>prepended — shifts every key after it</span>
          <Tree />
        </>
      )),
    ).toThrow(/hydration/i);

    // And it cleaned up on the way out — no `_$HY` bootstrap or stray container leaks into the next test.
    expect((globalThis as HydrationGlobals)._$HY).toBeUndefined();
  });
});
