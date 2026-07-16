import { describe, expect, it } from "vitest";
import { hydrateFixture } from "../hydrate-fixture";

/**
 * These tests pin the helper's plumbing, its silence check, and its console discipline. The
 * genuine "server `_hk` markup hydrates and every node is reused" path (and its diverging-tree
 * failure) can only be produced by a real server render — the client build's
 * `renderToStringAsync` returns `undefined`, and `hydrate()` on markup without matching `_hk`
 * simply renders nothing rather than replacing anything. That path is exercised by the component
 * suites that feed `hydrateFixture` a genuine fixture (`button`/`dialog`/`calendar`/
 * `theme-context`), and gets a deterministic reuse-failure test once the SSR generation bridge
 * lands.
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
});
