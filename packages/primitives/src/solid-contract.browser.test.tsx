import { applyRef, insert, setAttribute, spread, template } from "@solidjs/web";
import { createRoot } from "solid-js";
import { describe, expect, it, vi } from "vitest";

/**
 * The client-build half of `solid-contract.test.tsx`. Same purpose — characterization tests
 * pinning undocumented `@solidjs/web` internals, each naming the code that depends on it —
 * but these must run where `@solidjs/web` resolves to `dist/web.js` rather than
 * `dist/server.js`, which is only true in the **browser** project.
 *
 * See `docs/migration-2.0-stable.md` §2.
 */

describe("@solidjs/web client-build contract", () => {
  describe("applyRef flattens a ref array and skips falsy entries", () => {
    // Depended on by: `renderElement` (packages/primitives/src/render/render.tsx), which
    // merges a component's internal ref setter with the consumer's by handing `spread` the
    // array `[internalRef, consumerRef]`. Because `applyRef` does
    // `r.flat(Infinity).forEach(f => f && f(element))`, an absent consumer ref is a non-issue
    // and **no `mergeRefs` helper is needed anywhere in this codebase** — an invariant
    // CLAUDE.md and `render.md` both state, and which one component had already broken once.

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

  it("exports template/insert/spread/setAttribute as real implementations", () => {
    // The mirror image of `solid-contract.test.tsx`'s "throwing stubs" test, and the reason
    // the no-literal-host-JSX invariant exists: these four are exactly what `generate: "dom"`
    // compiles a literal `<div>` into, they work here, and they throw on the server. One
    // build, two environments, and only `Dynamic` bridges them.
    //
    // `createRoot`, because `spread` and `insert` create render effects: outside a reactive
    // context Solid warns `[NO_OWNER_EFFECT]` and the effects are never disposed.
    createRoot((dispose) => {
      const element = template("<div></div>")() as HTMLDivElement;
      expect(element.tagName).toBe("DIV");

      setAttribute(element, "data-pinned", "yes");
      expect(element.getAttribute("data-pinned")).toBe("yes");

      spread(element, { id: "pinned" });
      expect(element.id).toBe("pinned");

      insert(element, "hi");
      expect(element.textContent).toBe("hi");

      dispose();
    });
  });
});
