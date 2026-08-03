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
 * Characterization tests for the `solid-js` internals this codebase leans on, none of which is
 * documented, public API. Each block names the code that breaks if SolidJS 2.0 *stable* changes it.
 *
 * They do not test hope-ui. They exist so the beta→stable migration is a mechanical diff rather
 * than a bug hunt: `@solidjs/web` has already renamed runtime helpers *within* the beta line
 * (`use`→`ref`, `addEventListener`→`addEvent`), and a silent flip here would otherwise surface days
 * later as a dialog that won't label itself, a ref that never fires, or a crash inside
 * `@solidjs/web`.
 *
 * This file runs in the **unit** project — `solid-js`'s client build, real effects, and signal
 * writes that only become visible after a `flush()`. Its siblings pin the same idea against the
 * other builds: `solid-contract.ssr.test.tsx` (server build, and the `_hk` hydration key `Dynamic`
 * emits) and `solid-contract.browser.test.tsx` (client build in a real browser, `applyRef`).
 *
 * See `__internal__/testing.md` and `__internal__/migration-2.0-stable.md` §2.
 */

describe("solid-js contract", () => {
  describe("merge resolves a key by presence, not by value", () => {
    // Depended on by `withDefaults` (packages/primitives/src/utils/defaults.ts), which exists
    // *only* because of this — every `Dialog.Root modal`, `Button type` and `Dialog.Title id`
    // default routes through it. If stable makes a later source's `undefined` stop winning,
    // `withDefaults` becomes unnecessary: delete it.
    it("keeps an earlier source's value when a later source omits the key", () => {
      expect(merge({ modal: true }, {}).modal).toBe(true);
    });

    it("lets a later source's explicit `undefined` clobber an earlier value", () => {
      expect(merge({ modal: true }, { modal: undefined }).modal).toBeUndefined();
    });
  });

  describe("createSignal(fn) is the memo overload, not a signal holding a function", () => {
    // Depended on by `createControllableState`
    // (packages/primitives/src/internal/create-controllable-state.ts), which boxes its value in
    // `{ value: T }` solely to dodge this: 2.0 overloads `createSignal` as
    // `<T>(value: Exclude<T, Function>, options?)` and `<T>(fn: ComputeFunction<T>, options?)`, so
    // a generic `createSignal<T>(someValue)` silently invokes a function-typed value and stores
    // its return instead.
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
    // Depended on by `createComponentContext`
    // (packages/primitives/src/internal/create-component-context.ts), whose `try/catch` relies on
    // the throw to reword it as "Dialog sub-components must be rendered inside a Dialog root
    // component." If stable returns `undefined` instead, that friendly error stops firing and
    // every sub-component fails later with a null-deref on `context.open()`.
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
    // Depended on twice by `createFocusRestore`
    // (packages/primitives/src/internal/create-focus-restore.ts). It must be *created before*
    // `createFocusTrap`, so its `document.activeElement` snapshot precedes the trap's `.focus()`
    // and `createHideOutside`'s `inert` blur; and it must restore inside a `queueMicrotask`, so
    // the restore lands after every sibling cleanup — once the trap's `focusin` listener is
    // detached and the trigger is no longer `inert`. Focusing synchronously would fire `focusin`
    // straight back into a still-live trap.

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
      // previous cleanup before its own new body. So the restore's cleanup (created first) fires
      // while the trap's `focusin` listener is *still attached* — precisely why
      // `createFocusRestore` defers the actual `.focus()` call by a microtask.
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
      // this today — `Dialog.Content`'s primitives deactivate via the re-run path above, since
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
