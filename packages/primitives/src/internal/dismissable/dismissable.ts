import { type Accessor, createEffect } from "solid-js";

export interface CreateDismissableOptions {
  /** Whether the dismissable layer is currently active. */
  active: Accessor<boolean>;
  /** The container element that defines "inside" for outside-pointerdown detection. */
  ref: Accessor<HTMLElement | null | undefined>;
  /** Called when an Escape keydown or outside pointerdown should dismiss the layer. */
  onDismiss: () => void;
  /** Dismiss when Escape is pressed while active. Default `true`. */
  dismissOnEscape?: boolean;
  /** Dismiss when a pointerdown occurs outside the container while active. Default `true`. */
  dismissOnOutsidePointerDown?: boolean;
}

/**
 * Calls `onDismiss` on Escape keydown and/or outside pointerdown while `active`. Gated
 * entirely inside `createEffect`, so it never touches `document` during SSR.
 *
 * Doesn't manage a layered dismiss stack (only the single container passed in) — that's
 * intentionally deferred until Popover/Tooltip force a real need for stacked dismissable
 * layers, per solid-zero's phased build plan.
 */
export function createDismissable(options: CreateDismissableOptions): void {
  createEffect(
    // Track both `active()` and `ref()` — see the identical comment in `focus-trap.ts`
    // for why `ref` must be a real signal accessor tracked here, not read untracked
    // inside the effect callback.
    () => [options.active(), options.ref()] as const,
    ([active, container]) => {
      if (!active || !container) return;

      const handleKeyDown = (event: KeyboardEvent) => {
        if (options.dismissOnEscape === false) return;
        if (event.key === "Escape") options.onDismiss();
      };

      const handlePointerDown = (event: PointerEvent) => {
        if (options.dismissOnOutsidePointerDown === false) return;
        if (container.contains(event.target as Node)) return;
        options.onDismiss();
      };

      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("pointerdown", handlePointerDown, true);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("pointerdown", handlePointerDown, true);
      };
    },
  );
}
