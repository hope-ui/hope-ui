import { applyRef, hydrate } from "@solidjs/web";
// `sharedConfig` is re-exported by `@solidjs/web`'s *types* but not by its runtime bundle — importing
// it from there fails at load. It lives in `solid-js`.
import { createEffect, createRoot, createSignal, flush, sharedConfig } from "solid-js";
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
    // Depended on by `renderElement` (packages/primitives/src/render/render.tsx), which merges a
    // component's internal ref setter with the consumer's into a single function ref that calls
    // `applyRef([internalRef, consumerRef], element)`. Because `applyRef` does
    // `r.flat(Infinity).forEach(f => f && f(element))`, an absent consumer ref — or one that is
    // itself an array — is a non-issue, which is why **no `mergeRefs` helper exists anywhere in
    // this codebase**. If stable stops flattening or stops skipping falsy entries, one is needed.

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
    // Depended on by `@hope-ui/i18n`'s `readDetectedLocale` (packages/i18n/src/default-locale.ts),
    // which reports the server's `en-US` for exactly as long as this flag is set and the detected
    // browser locale otherwise — the gate that makes zero-config i18n SSR-safe without costing a
    // client-only app an en-US first paint. If the flag is renamed (1.x spelled it
    // `sharedConfig.context`) or stops covering component bodies, the locale silently disagrees
    // with the server's markup again.

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

  describe("a signal write from one document listener cannot unhook the next one mid-dispatch", () => {
    // Depended on by `createDismissable` (packages/primitives/src/internal/create-dismissable.ts),
    // whose outside-pointerdown guard is deliberately **single-phase**: it answers "am I the
    // topmost layer?" once, in the capture-phase `pointerdown` handler, and dismisses right there.
    // (React Aria splits it — snapshot at pointerdown, decide at `click` — because that is where
    // *it* dismisses, and the two events can have different targets.)
    //
    // Single-phase is only safe if a dispatch cannot be reordered underneath itself. Every layer's
    // listener is attached by its own sibling effect, and the topmost layer's handler writes the
    // very signal those effects track, because dismissing unmounts a layer. Were that write to
    // re-run the effects mid-dispatch, a lower layer's listener would be detached before the event
    // reached it — or a re-attached one would see it twice — and the guard would be reading a stack
    // that moved under it. Solid defers the re-run to the next flush, so it cannot. If that ever
    // stops holding, `createDismissable` needs the two-phase snapshot instead.

    const PROBE_EVENT = "hope-ui-solid-contract-probe";

    /** Two sibling effects, each attaching a `document` listener while `openLayers` is high enough
     * to keep its layer open — the shape `createDismissable` produces per layer. The upper one's
     * handler dismisses itself by writing that same signal. */
    function createProbeLayers(): { log: string[]; dispose: () => void } {
      const log: string[] = [];
      const [openLayers, setOpenLayers] = createSignal(2);
      let dispose!: () => void;

      createRoot((disposeRoot) => {
        dispose = disposeRoot;

        createEffect(
          () => openLayers(),
          (count) => {
            if (count < 2) {
              return;
            }
            const handler = () => {
              log.push("upper:handled");
              setOpenLayers(1);
            };
            document.addEventListener(PROBE_EVENT, handler, true);
            return () => {
              document.removeEventListener(PROBE_EVENT, handler, true);
              log.push("upper:detached");
            };
          },
        );

        createEffect(
          () => openLayers(),
          (count) => {
            if (count < 1) {
              return;
            }
            const handler = () => log.push("lower:handled");
            document.addEventListener(PROBE_EVENT, handler, true);
            log.push("lower:attached");
            return () => {
              document.removeEventListener(PROBE_EVENT, handler, true);
              log.push("lower:detached");
            };
          },
        );
      });

      flush();
      return { log, dispose };
    }

    it("delivers one dispatch to every listener attached when it started, then re-runs the effects", () => {
      const { log, dispose } = createProbeLayers();
      log.length = 0;

      document.body.dispatchEvent(new CustomEvent(PROBE_EVENT, { bubbles: true }));

      // Both handlers ran, in attach order, with nothing detached in between: on the client build
      // the write inside the upper handler is invisible to a plain read until the next flush.
      expect(log).toEqual(["upper:handled", "lower:handled"]);

      // The re-run lands afterwards, in sibling creation order — the ordering
      // `solid-contract.test.ts` pins for effects generally, observed here through the listeners.
      flush();
      expect(log).toEqual([
        "upper:handled",
        "lower:handled",
        "upper:detached",
        "lower:detached",
        "lower:attached",
      ]);

      dispose();
    });
  });
});
