import probeServerHtml from "virtual:hydration-fixture?id=hydrate-fixture";
import { describe, expect, it } from "vitest";
import { hydrateFixture } from "../hydrate-fixture";
// Genuine server markup carrying real hydration keys (`<div _hk=…><span _hk=…>`), rendered fresh for
// this project by the fixture bridge from `hydrate-fixture.ssr-entry.tsx`. Hand-writing `_hk`
// attributes is not allowed and the bridge is the only source of real ones, so this helper gets its
// own component-free probe tree instead of inventing markup no server would send.
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
    // The success half, against the same fixture the failure case below diverges from: a matching
    // `Tree` claims the server's keyed nodes in place, so the whole-tree reuse check passes.
    const { container, dispose } = hydrateFixture(probeServerHtml, () => <Tree />);

    expect(container.querySelector('[data-probe="root"]')).not.toBeNull();
    expect(container.querySelector("span")?.textContent).toBe("hydrate-fixture probe");

    dispose();
  });

  it("leaves a hydrated delegated handler live, and its replay queue drained on dispose", async () => {
    // Two things at once, both on the delegated-event path `Tree`'s `onClick` exists to reach. The
    // handler must survive hydration; and `dispose()` must drain Solid's hydration-event queue, since
    // the microtask that replays it writes `_$HY.events = null` once hydration settles — which, for a
    // synchronous hydrate-then-dispose, lands after the bootstrap is gone. Undrained, it throws from
    // inside a microtask: an unhandled error that fails the whole file rather than this assertion.
    const clicks: number[] = [];
    const { container, dispose } = hydrateFixture(probeServerHtml, () => (
      <Tree onProbeClick={() => clicks.push(1)} />
    ));

    (container.querySelector('[data-probe="root"]') as HTMLElement).click();
    expect(clicks).toHaveLength(1);

    dispose();
    await Promise.resolve();
  });

  it("throws when the client tree structurally diverges, shifting the hydration keys", () => {
    // The failure half. Solid derives a node's hydration key from its position in the component tree,
    // so prepending an element shifts every key after it, `hydrate()` cannot find the server's nodes,
    // and it fails loudly instead of silently client-rendering a second copy. That is the hazard the
    // whole fixture system guards against: inserting a component before, say, `Dialog.Trigger` — even
    // one that renders nothing at all — shifts the trigger's key.
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
