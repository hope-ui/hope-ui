import {
  createContext,
  createEffect,
  createRoot,
  createSignal,
  flush,
  merge,
  useContext,
} from "solid-js";
import { describe, expect, it } from "vitest";

/**
 * Characterization tests for the `solid-js` internals this codebase leans on without any of
 * them being documented, public API. Each one names the code that would break if SolidJS 2.0
 * *stable* changed it.
 *
 * They are not testing hope-ui. They exist so the beta→stable migration is a mechanical
 * diff instead of a bug hunt: `@solidjs/web` has already renamed runtime helpers *within* the
 * beta line (`use`→`ref`, `addEventListener`→`addEvent`), and if stable flips any of these,
 * the failure would otherwise surface days later as a dialog that won't label itself, a ref
 * that never fires, or an SSR crash pointing into `@solidjs/web`'s internals.
 *
 * This file runs in the **unit** project: `solid-js`'s client build, real effects, deferred
 * signal writes (hence `flush()`). Its siblings pin the same idea against the other builds:
 *
 * - `solid-contract.ssr.test.tsx` — server build. `Dynamic` emits the `_hk` hydration key that
 *   everything `renderElement` renders hydrates against.
 * - `solid-contract.browser.test.tsx` — client build in a real browser. `applyRef` (why no
 *   `mergeRefs` helper is needed).
 *
 * See `docs/testing.md` and `docs/migration-2.0-stable.md` §2.
 */

describe("solid-js contract", () => {
  describe("merge resolves a key by presence, not by value", () => {
    // Depended on by: `withDefaults` (packages/primitives/src/defaults/defaults.ts), which
    // exists *only* because of this. Every `Dialog.Root modal`, `Button type` and
    // `Dialog.Title id` default routes through it. If stable makes `merge` skip `undefined`
    // values from later sources, `withDefaults` becomes unnecessary — delete it.
    it("keeps an earlier source's value when a later source omits the key", () => {
      expect(merge({ modal: true }, {}).modal).toBe(true);
    });

    it("lets a later source's explicit `undefined` clobber an earlier value", () => {
      expect(merge({ modal: true }, { modal: undefined }).modal).toBeUndefined();
    });
  });

  describe("createSignal(fn) is the memo overload, not a signal holding a function", () => {
    // Depended on by: `createControllableState`
    // (packages/primitives/src/controllable/controllable.ts), which boxes its value in
    // `{ value: T }` with an `equals` that unwraps via `isEqual`, solely to dodge this.
    // 2.0 overloads `createSignal` as `<T>(value: Exclude<T, Function>, options?)` and
    // `<T>(fn: ComputeFunction<T>, options?)`, so a generic `createSignal<T>(someValue)`
    // silently invokes a function-typed value and stores its return.
    it("invokes a function argument and stores its return value", () => {
      const compute = () => "computed";
      const [read] = createSignal(compute);

      expect(read()).toBe("computed");
      expect(read()).not.toBe(compute);
    });

    it("stores a function untouched once it is boxed inside an object", () => {
      const compute = () => "computed";
      const [read] = createSignal({ value: compute });

      expect(read().value).toBe(compute);
    });
  });

  describe("useContext throws when no Provider is mounted", () => {
    // Depended on by: `createComponentContext` (packages/primitives/src/context/context.ts),
    // whose `try/catch` silently relies on the throw to reword it as "Dialog sub-components
    // must be rendered inside a Dialog root component." If stable returns `undefined`
    // instead, that friendly error stops firing and every sub-component fails later with a
    // null-deref on `context.open()`.
    it("throws for a context created without a default value", () => {
      const NoDefault = createContext<string>(undefined, { name: "NoDefault" });

      createRoot((dispose) => {
        expect(() => useContext(NoDefault)).toThrow(/Context must either be created with/);
        dispose();
      });
    });

    it("returns the default value, without throwing, when the context has one", () => {
      // The other half of the contract: `createComponentContext` passes `undefined` as the
      // default *on purpose*. Were it to pass a real default, the catch would never run.
      const WithDefault = createContext<string>("fallback", { name: "WithDefault" });

      createRoot((dispose) => {
        expect(useContext(WithDefault)).toBe("fallback");
        dispose();
      });
    });
  });

  describe("sibling effect ordering", () => {
    // Depended on by: `createFocusRestore` (packages/primitives/src/focus-restore/), twice.
    // It must be *created before* `createFocusTrap` so its `document.activeElement` snapshot
    // precedes the trap's `.focus()` and `createHideOutside`'s `inert` blur; and it must
    // restore in a `queueMicrotask` so the restore lands after every sibling cleanup, when
    // the trap's `focusin` listener is detached and the trigger is no longer `inert`.
    // Focusing synchronously would fire `focusin` into a still-live trap.
    //
    // `Dialog.Popup` is the only caller today. Popover, Tooltip and Select will all be.

    /** Two sibling effects on one signal, each logging its run and its cleanup. */
    function createOrderedSiblings(): {
      order: string[];
      setActive: (v: boolean) => void;
      dispose: () => void;
    } {
      const order: string[] = [];
      const [active, setActive] = createSignal(true);
      let dispose!: () => void;

      createRoot((disposeRoot) => {
        dispose = disposeRoot;

        createEffect(
          () => active(),
          () => {
            order.push("first:run");
            return () => {
              order.push("first:cleanup");
              queueMicrotask(() => order.push("first:microtask"));
            };
          },
        );

        createEffect(
          () => active(),
          () => {
            order.push("second:run");
            return () => order.push("second:cleanup");
          },
        );
      });

      flush();
      return { order, setActive, dispose };
    }

    it("runs sibling effects in creation order", () => {
      const { order, dispose } = createOrderedSiblings();
      expect(order).toEqual(["first:run", "second:run"]);
      dispose();
    });

    it("runs sibling cleanups in creation order when the effects re-run", () => {
      // The path that matters: `open` flips false, both effects re-run, and each runs its own
      // previous cleanup before its own new body. So the restore's cleanup (created first)
      // fires while the trap's `focusin` listener is *still attached* — which is precisely
      // why `createFocusRestore` defers the actual `.focus()` call by a microtask.
      const { order, setActive, dispose } = createOrderedSiblings();
      order.length = 0;

      flush(() => setActive(false));

      expect(order).toEqual(["first:cleanup", "first:run", "second:cleanup", "second:run"]);
      dispose();
    });

    it("lands a microtask queued from the first cleanup after every sibling cleanup", () => {
      // Effect cleanups are synchronous within a flush, so a microtask queued from the first
      // one runs after all of them. This is the whole mechanism behind `createFocusRestore`'s
      // deferral — if stable made cleanups async, the deferral would no longer be enough.
      const { order, setActive, dispose } = createOrderedSiblings();
      order.length = 0;

      flush(() => setActive(false));
      expect(order).not.toContain("first:microtask");

      return Promise.resolve().then(() => {
        expect(order.at(-1)).toBe("first:microtask");
        dispose();
      });
    });

    it("runs sibling cleanups in REVERSE creation order when the owner is disposed", () => {
      // The other path, and it is the opposite. Owner disposal is LIFO. Nothing depends on
      // this today — `Dialog.Popup`'s primitives deactivate via the re-run path above, since
      // `Popup` stays mounted while only its element unmounts. Pinned because the two paths
      // disagreeing is exactly the sort of thing a reader assumes away, and because a modal
      // that unmounts *while open* takes this one.
      const { order, dispose } = createOrderedSiblings();
      order.length = 0;

      dispose();

      expect(order).toEqual(["second:cleanup", "first:cleanup"]);
    });
  });
});
