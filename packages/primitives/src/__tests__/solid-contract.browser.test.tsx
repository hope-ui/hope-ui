import { applyRef, hydrate } from "@solidjs/web";
// `sharedConfig` is re-exported by `@solidjs/web`'s *types* but not by its runtime bundle — importing
// it from there fails at load. It lives in `solid-js`.
import { sharedConfig } from "solid-js";
import { describe, expect, it, vi } from "vitest";

/**
 * The client-build half of the Solid contract. Same purpose — characterization tests pinning
 * undocumented `@solidjs/web` internals, each naming the code that depends on it — but these
 * must run where `@solidjs/web` resolves to `dist/web.js` rather than `dist/server.js`, which
 * is only true in the **browser** project.
 *
 * See `__internal__/migration-2.0-stable.md` §2.
 */

describe("@solidjs/web client-build contract", () => {
  describe("applyRef flattens a ref array and skips falsy entries", () => {
    // Depended on by: `renderElement` (packages/primitives/src/render/render.tsx), which
    // merges a component's internal ref setter with the consumer's into a SINGLE function ref and
    // calls `applyRef([internalRef, consumerRef], element)` inside it. Because `applyRef` does
    // `r.flat(Infinity).forEach(f => f && f(element))`, an absent consumer ref (or one that is
    // itself an array) is a non-issue, so **no `mergeRefs` helper is needed anywhere in this
    // codebase** — an invariant CLAUDE.md and `render.md` both state. Exposing the merge as one
    // function (rather than handing the raw array to the render target) is what lets it wrap a
    // consumer *component* that only honours function refs, not just host elements.

    it("calls every function in a flat array", () => {
      const first = vi.fn();
      const second = vi.fn();
      const element = document.createElement("div");

      applyRef([first, second], element);

      expect(first).toHaveBeenCalledWith(element);
      expect(second).toHaveBeenCalledWith(element);
    });

    it("skips undefined, null and false entries instead of throwing", () => {
      const setter = vi.fn();
      const element = document.createElement("div");

      expect(() =>
        applyRef([setter, undefined, null, false] as unknown as (typeof setter)[], element),
      ).not.toThrow();
      expect(setter).toHaveBeenCalledExactlyOnceWith(element);
    });

    it("flattens nested arrays to any depth", () => {
      const setter = vi.fn();
      const element = document.createElement("div");

      applyRef([[[setter]]] as unknown as (typeof setter)[], element);

      expect(setter).toHaveBeenCalledExactlyOnceWith(element);
    });

    it("calls a bare function ref directly", () => {
      const setter = vi.fn();
      const element = document.createElement("div");

      applyRef(setter, element);

      expect(setter).toHaveBeenCalledExactlyOnceWith(element);
    });
  });

  describe("sharedConfig.hydrating marks the hydration pass, and only it", () => {
    // Depended on by: `@hope-ui/i18n`'s `readDetectedLocale`
    // (packages/i18n/src/default-locale.ts), which reports the server's `en-US` for exactly as long
    // as this flag is set and the detected browser locale otherwise. That gate is what makes
    // zero-config i18n SSR-safe *without* costing a client-only app the en-US first paint — so if
    // this flag is renamed (1.x spelled it `sharedConfig.context`) or stops covering component
    // bodies, the locale silently disagrees with the server's markup again.

    it("is falsy outside any hydration", () => {
      expect(sharedConfig.hydrating).toBeFalsy();
    });

    it("is set while a component body runs during hydrate(), and cleared after", () => {
      const globals = globalThis as { _$HY?: unknown };
      globals._$HY = { events: [], completed: new WeakSet(), r: {} };
      const container = document.createElement("div");
      container.innerHTML = "<span>hi</span>";
      document.body.appendChild(container);

      let duringComponentBody: unknown;
      const dispose = hydrate(() => {
        duringComponentBody = sharedConfig.hydrating;
        return <span>hi</span>;
      }, container);

      expect(duringComponentBody).toBeTruthy();
      expect(sharedConfig.hydrating).toBeFalsy();

      dispose();
      container.remove();
      globals._$HY = undefined;
    });
  });
});
