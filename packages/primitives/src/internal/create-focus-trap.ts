import { type Accessor, createEffect } from "solid-js";
import { createAutoFocus, getFocusableElements } from "./create-auto-focus";
import { createFocusScope } from "./create-focus-scope";

export interface CreateFocusTrapOptions {
  /** Whether the trap is currently active. */
  active: Accessor<boolean>;
  /** The container element to trap focus within. */
  ref: Accessor<HTMLElement | null | undefined>;
  /** Explicit element to focus on activation, instead of the first focusable descendant. */
  initialFocus?: Accessor<HTMLElement | null | undefined>;
}

/**
 * Traps Tab/Shift+Tab focus cycling within a container while `active`, and refocuses the
 * container if focus is moved outside it programmatically. Gated entirely inside
 * `createEffect`, so it naturally never runs during SSR (no DOM access happens outside the
 * effect).
 *
 * **Moving focus in on activation is `createAutoFocus`**, composed below rather than
 * reimplemented — a non-modal overlay (Popover, Tooltip) wants that half without the cage.
 *
 * **Restoring focus on deactivation is not this primitive's job** — that's
 * `createFocusRestore`, which is a separate concern precisely because a non-modal overlay
 * (Popover, Tooltip, a non-modal Dialog) wants focus returned *without* being trapped.
 * Compose both, and create `createFocusRestore` first; see `create-focus-restore.md` for the two
 * ordering constraints that depend on it.
 *
 * **A trap is not the outermost thing in the page.** It registers itself as a focus scope
 * (`createFocusScope`, composed below) and leaves alone any focus that landed in a layer opened
 * *above* it — a Popover portaled out of the Dialog it was opened in is not focus escaping, even
 * though it is outside this container by every DOM measure. See `create-focus-scope.md`.
 */
export function createFocusTrap(options: CreateFocusTrapOptions): void {
  // Created first of the three, so the scope is on the stack before the listeners below can
  // consult it and before `createAutoFocus` moves focus anywhere. Same `options`, so registration
  // and the listeners activate on exactly the same edge.
  const scope = createFocusScope(options);

  // Created BEFORE `createAutoFocus`, and that order is load-bearing. Sibling effects run
  // their previous cleanup in *creation* order on a re-run, so listeners-first reproduces
  // what the single welded effect used to do: remove the listeners, and only then let
  // autofocus remove the `tabindex` it added. It also puts the `focusin` handler in place
  // before autofocus fires, which is what makes an out-of-container `initialFocus` get
  // pulled back inside — the observable half of the decision. See `create-focus-trap.md`.
  createEffect(
    // Same compute as `createAutoFocus`'s, for the same reason — see the comment there.
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
