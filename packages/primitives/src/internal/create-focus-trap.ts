import { type Accessor, createEffect } from "solid-js";
import { createAutoFocus, getFocusableElements } from "./create-auto-focus";
import { createFocusScope } from "./create-focus-scope";

export interface CreateFocusTrapOptions {
  /** Whether the trap is currently active. */
  active: Accessor<boolean>;
  /**
   * The container element to trap focus within. Must be a real signal accessor, never a plain
   * variable: it is typically created as a reactive consequence of the same signal `active` derives
   * from, so a non-reactive read would see it as `undefined` forever.
   */
  ref: Accessor<HTMLElement | null | undefined>;
  /** Explicit element to focus on activation, instead of the first focusable descendant. */
  initialFocus?: Accessor<HTMLElement | null | undefined>;
}

/**
 * Cages Tab/Shift+Tab within a container while `active`, and pulls focus back if something moves it
 * outside programmatically. Everything happens inside `createEffect`, whose bodies never run on the
 * server, so no DOM access can leak into server rendering.
 *
 * Focus behavior is deliberately split across primitives, because a non-modal overlay wants some
 * parts of it without the others:
 *
 * - **Moving focus in on activation is `createAutoFocus`**, composed below rather than
 *   reimplemented — a Popover or Tooltip wants that half without the cage.
 * - **Restoring focus on deactivation is `createFocusRestore`**, separate for the mirror reason:
 *   those same overlays want focus returned without ever being trapped. Compose both, and create
 *   `createFocusRestore` *first* — `__internal__/primitives/internal/create-focus-restore.md` has
 *   the two ordering constraints that depend on it.
 *
 * **A trap is not the outermost thing in the page.** It registers itself as a focus scope
 * (`createFocusScope`, composed below) and leaves alone focus that landed in a layer opened *above*
 * it — a Popover portaled out of the Dialog it was opened in is not focus escaping, even though it
 * is outside this container by every DOM measure.
 */
export function createFocusTrap(options: CreateFocusTrapOptions): void {
  // Created first of the three, so the scope is registered before the listeners below can consult
  // it and before `createAutoFocus` moves focus anywhere. Same `options`, so the registration and
  // the listeners activate on exactly the same edge.
  const scope = createFocusScope(options);

  // Created BEFORE `createAutoFocus`, and that order is load-bearing. Solid re-runs sibling effects
  // — and their cleanups — in creation order, so listeners-first means the listeners are removed
  // before autofocus removes the `tabindex` it added. It also puts the `focusin` handler in place
  // before autofocus fires, which is what pulls an out-of-container `initialFocus` back inside.
  createEffect(
    // Solid 2.0 effects take two functions: the first declares what to track, the second reacts.
    // `ref()` has to be tracked alongside `active()` — the container is conditionally rendered, so
    // reading it only in the second function would see it as `undefined` forever.
    () => [options.active(), options.ref()] as const,
    ([active, container]) => {
      if (!active || !container) {
        return;
      }

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key !== "Tab") {
          return;
        }

        const focusable = getFocusableElements(container);
        if (focusable.length === 0) {
          event.preventDefault();
          container.focus();
          return;
        }

        // Guaranteed non-empty by the length check above.
        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;
        const current = document.activeElement;

        if (event.shiftKey && current === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && current === last) {
          event.preventDefault();
          first.focus();
        }
      };

      const handleFocusIn = (event: FocusEvent) => {
        // Not a bare `container.contains`: focus that landed inside a layer opened *above* this
        // trap belongs to that layer. Pulling it back would blur what the layer just focused and,
        // through its `closeOnFocusOutside`, close it outright.
        if (scope.containsSelfOrAbove(event.target as Node | null)) {
          return;
        }
        const focusable = getFocusableElements(container);
        (focusable[0] ?? container).focus();
      };

      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("focusin", handleFocusIn);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("focusin", handleFocusIn);
      };
    },
  );

  createAutoFocus(options);
}
