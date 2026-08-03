import { type Accessor, createEffect } from "solid-js";

/**
 * The stack of active focus scopes, topmost last, stored on `document` under a `Symbol.for` key — a
 * symbol from the global registry, so every copy of this module resolves the same one — rather than
 * at module scope. Nothing forces a consumer to install a single copy of `@hope-ui/primitives`, and
 * two module-scope stacks would put a `Popover` from copy B outside every scope copy A knows about:
 * copy A's `Dialog` would go straight back to yanking focus out of it, on some installs and not
 * others.
 *
 * The **third** such stack (`create-dismissable.ts` and `create-hide-outside.ts` hold the others),
 * and the three must stay separate: a `Dialog` with `dismissOnEscape: false` still participates in
 * focus-scope and hide-outside ordering, but must never win Escape.
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
   * The container element the scope covers, subtree included. Must be a real signal accessor, never
   * a plain variable: it is typically created as a reactive consequence of the same signal `active`
   * derives from, so a non-reactive read would see it as `undefined` forever.
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
 * inside a `Dialog` renders through a portal, outside the dialog's container, so
 * `dialogContent.contains(target)` is `false` for everything in it: the dialog's focus trap read
 * that as focus escaping and pulled it back to its own first focusable, and the popover's
 * `closeOnFocusOutside` read *that* as focus leaving and closed the layer. A popover open for ~3ms,
 * with no error anywhere. `containsSelfOrAbove` is what a trap consults instead of
 * `container.contains`.
 *
 * ## Nested scopes
 *
 * Every active scope pushes onto a `document`-keyed stack, topmost last, and the predicate looks
 * **upward only** — a scope sees itself and everything above it, never below. That asymmetry is
 * the point: the dialog underneath must tolerate focus in the popover above it, while the popover
 * must still treat focus falling back into the dialog as focus it has lost.
 *
 * Position in the stack is *activation* order, not mount order: a mounted-but-closed layer is
 * simply absent, and re-opening one — or swapping its container element while active — puts it on
 * top.
 *
 * ## Tab is deliberately not covered
 *
 * A scope is not a trap, and registering one does not extend the trap below it. With focus inside a
 * non-modal layer, Tab past its last focusable leaves the chain, the trap underneath pulls focus
 * back into itself, and `closeOnFocusOutside` closes the layer — which is the documented non-modal
 * contract ("Tab away closes it"), not a gap. A layer that wants Tab caged asks for
 * `createFocusTrap`.
 *
 * All DOM access happens inside `createEffect`, whose bodies never run on the server — and a server
 * has no scope stack anyway.
 *
 * ## Provenance
 *
 * The idea is React Aria's — Adobe's headless accessibility hooks keep a `focusScopeTree` and check
 * it before treating a blur as focus leaving an overlay. Only the idea: upstream is a real tree of
 * parent-linked nodes, built to carry the focus *restore* algorithm living in the same file.
 * hope-ui has that half already (`createFocusRestore`), which leaves a flat array and a slice here.
 */
export function createFocusScope(options: CreateFocusScopeOptions): CreateFocusScopeReturn {
  // The registration this instance currently holds, or `null` while it holds none. A plain `let`
  // rather than a signal on purpose: the predicate below runs from DOM event handlers, outside any
  // reactive scope — a signal read there emits Solid's `[STRICT_READ_UNTRACKED]` warning — and
  // nothing re-renders on this value.
  let registered: FocusScope | null = null;

  createEffect(
    // Solid 2.0 effects take two functions: the first declares what to track, the second reacts.
    // `ref()` has to be tracked alongside `active()` — the container is conditionally rendered, so
    // reading it only in the second function would see it as `undefined` forever.
    () => [options.active(), options.ref()] as const,
    ([active, container]) => {
      if (!active || !container) {
        return;
      }

      // Pushed after the guard, not before it, so the stack is ordered by activation rather than
      // by mount.
      const stack = getFocusScopeStack();
      const scope: FocusScope = { container };
      stack.push(scope);
      registered = scope;

      return () => {
        // Guarded, because `indexOf` returning -1 would make `splice(-1, 1)` drop whichever scope
        // happens to be topmost. Scopes do deactivate out of order — that is the nesting this
        // exists for.
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
