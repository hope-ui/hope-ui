import { type Accessor, createEffect } from "solid-js";

/**
 * The stack of active focus scopes, topmost last, stored on `document` under a cross-realm shared
 * symbol rather than at module scope — the same argument `create-dismissable.ts` and
 * `create-hide-outside.ts` make for theirs. Nothing forces a consumer to have one installed copy
 * of `@hope-ui/primitives`, and two module-scope stacks would put a `Popover` from copy B outside
 * every scope copy A knows about: copy A's `Dialog` would go straight back to yanking focus out of
 * it, on some installs and not others.
 *
 * The **third** such stack, and the three stay separate. A `Dialog` with `dismissOnEscape: false`
 * still participates in focus-scope and hide-outside ordering but must never win Escape — React
 * Aria keeps `focusScopeTree`, `observerStack` and `visibleOverlays` apart for that reason, and so
 * does this kernel.
 */
const FOCUS_SCOPE_STACK = Symbol.for("hope-ui.focus-scope-stack");

interface FocusScope {
  /** What counts as "inside" this scope — and, for every scope below it, what counts as still
   * inside the chain. */
  container: HTMLElement;
}

type FocusScopeStackHost = Document & { [FOCUS_SCOPE_STACK]?: FocusScope[] };

function getFocusScopeStack(): FocusScope[] {
  const host = document as FocusScopeStackHost;
  const existing = host[FOCUS_SCOPE_STACK];
  if (existing !== undefined) {
    return existing;
  }

  const created: FocusScope[] = [];
  host[FOCUS_SCOPE_STACK] = created;
  return created;
}

export interface CreateFocusScopeOptions {
  /** Whether this scope is currently part of the chain. */
  active: Accessor<boolean>;
  /**
   * The container element the scope covers, subtree included. Must be a real signal accessor, for
   * the reason spelled out in `create-focus-trap.ts`: it is typically created as a reactive
   * consequence of the same signal `active` derives from.
   */
  ref: Accessor<HTMLElement | null | undefined>;
}

export interface CreateFocusScopeReturn {
  /**
   * Whether `target` is inside this scope's own container, or inside the container of any scope
   * registered **above** it. `false` for a `null` target, and `false` while this scope is not
   * registered — inactive, or still waiting for its container.
   */
  containsSelfOrAbove(target: Node | null): boolean;
}

/**
 * Registers a container as a focus scope while `active`, and answers the one question a layer
 * underneath needs: **did focus land in me, or in a layer opened above me?**
 *
 * That is the whole primitive. It moves no focus and cages none — `createAutoFocus` and
 * `createFocusTrap` own those halves. What it adds is the containment *chain*. A `Popover` opened
 * inside a `Dialog` is portaled out of the dialog's container, so `dialogContent.contains(target)`
 * is `false` for everything in it: the dialog's trap read that as focus escaping and pulled it back
 * to its own first focusable, and the popover's `closeOnFocusOutside` read *that* as focus leaving
 * and closed the layer. A popover open for ~3ms, with no error anywhere. `containsSelfOrAbove` is
 * what the trap consults instead of `container.contains`.
 *
 * ## Nested scopes
 *
 * Every active scope pushes onto a `document`-keyed stack, topmost last, and the predicate looks
 * **upward only** — a scope sees itself and everything above it, never below. That asymmetry is
 * the point: the dialog underneath must tolerate focus in the popover above it, while the popover
 * must still treat focus falling back into the dialog as focus it has lost.
 *
 * **Stack position is activation order, not mount order.** The push happens inside the effect body,
 * after the `active`/`ref` guard, so a mounted-but-closed layer is simply absent and reopening it
 * puts it on top. One consequence worth knowing, shared with the other two registries: the effect
 * is keyed on `[active(), ref()]`, so swapping the container element *while active* re-runs it and
 * moves that scope to the top.
 *
 * ## Tab is deliberately not covered
 *
 * A scope is not a trap, and registering one does not extend the trap below it. With focus inside a
 * non-modal layer, Tab past its last focusable leaves the chain, the trap underneath pulls focus
 * back into itself, and `closeOnFocusOutside` closes the layer — which is the documented non-modal
 * contract ("Tab away closes it"), not a gap. A layer that wants Tab caged asks for
 * `createFocusTrap`.
 *
 * ## Provenance
 *
 * The idea is React Aria's: `FocusScope.tsx` keeps a `focusScopeTree`, and `useOverlay` consults
 * `isElementInChildOfActiveScope` before treating a blur as focus leaving the overlay. Only the
 * idea. Upstream is a genuine `Tree` of `TreeNode`s with parent links, a per-node `nodeToRestore`,
 * a pre-order traversal generator and a `clone()` — a data structure built to carry the focus
 * *restore* algorithm that lives in the same file. hope-ui already has that half
 * (`createFocusRestore`), so what is left here is a flat array and a slice, sharing no expression
 * with it.
 *
 * ## SSR
 *
 * All DOM access happens inside `createEffect`, whose bodies never run during SSR — and there is no
 * scope stack on a server anyway.
 */
export function createFocusScope(options: CreateFocusScopeOptions): CreateFocusScopeReturn {
  // The registration this instance currently holds, or `null` while it holds none. A plain `let`
  // rather than a signal on purpose: the predicate is called from a DOM event handler, where a
  // signal read would trip `STRICT_READ_UNTRACKED`, and nothing re-renders on it.
  let registered: FocusScope | null = null;

  createEffect(
    // Same compute as `createFocusTrap`'s, for the same reason — see the comment there.
    () => [options.active(), options.ref()] as const,
    ([active, container]) => {
      if (!active || !container) {
        return;
      }

      // Pushed here, after the guard, so the stack orders scopes by *activation* — see this
      // primitive's doc.
      const stack = getFocusScopeStack();
      const scope: FocusScope = { container };
      stack.push(scope);
      registered = scope;

      return () => {
        // Guarded, because `splice(-1, 1)` on a miss would drop whichever scope happens to be
        // topmost. Scopes can deactivate out of order — that is the whole nesting this exists for.
        const position = stack.indexOf(scope);
        if (position !== -1) {
          stack.splice(position, 1);
        }
        registered = null;
      };
    },
  );

  return {
    containsSelfOrAbove: (target) => {
      const scope = registered;
      if (target === null || scope === null) {
        return false;
      }

      const stack = getFocusScopeStack();
      const position = stack.indexOf(scope);
      if (position === -1) {
        return false;
      }

      // From this scope up: itself, then everything opened above it.
      return stack.slice(position).some((above) => above.container.contains(target));
    },
  };
}
