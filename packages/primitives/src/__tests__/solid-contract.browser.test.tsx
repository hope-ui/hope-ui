import { applyRef } from "@solidjs/web";
import { describe, expect, it, vi } from "vitest";

/**
 * The client-build half of the Solid contract. Same purpose — characterization tests pinning
 * undocumented `@solidjs/web` internals, each naming the code that depends on it — but these
 * must run where `@solidjs/web` resolves to `dist/web.js` rather than `dist/server.js`, which
 * is only true in the **browser** project.
 *
 * See `docs/migration-2.0-stable.md` §2.
 */

describe("@solidjs/web client-build contract", () => {
  describe("applyRef flattens a ref array and skips falsy entries", () => {
    // Depended on by: `renderElement` (packages/primitives/src/utils/render/render.tsx), which
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
});
