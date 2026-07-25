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
  /**
   * Elements that must not count as "outside", subtrees included — for pointerdown *and*
   * focus-out. The layer's own trigger above all: without this, a pointerdown on it dismisses in
   * the capture phase and its own `click` reopens, so the layer can never be closed by clicking
   * the control that opened it. Doesn't apply to Escape, which is keyboard-global and has no
   * "outside".
   */
  exclude?: Accessor<Element[]>;
  /**
   * Dismiss when focus lands outside the container while active. Default `false` — a modal layer
   * traps focus, so the listener would be dead weight there.
   */
  dismissOnFocusOutside?: boolean;
}

/**
 * Calls `onDismiss` on Escape keydown, outside pointerdown and/or outside focus while `active`.
 * Gated entirely inside `createEffect`, so it never touches `document` during SSR.
 *
 * Doesn't manage a layered dismiss stack (only the single container passed in) — that's
 * intentionally deferred until Popover/Tooltip force a real need for stacked dismissable
 * layers, per hope-ui's phased build plan.
 *
 * Focus-out listens for `focusin`, not `focusout`: it fires on the element focus *arrived* at, so
 * focus falling to `<body>` (an element removed or made non-focusable while focused) can't be
 * mistaken for a deliberate move to another control.
 */
export function createDismissable(options: CreateDismissableOptions): void {
  createEffect(
    // Track both `active()` and `ref()` — see the identical comment in `create-focus-trap.ts`
    // for why `ref` must be a real signal accessor tracked here, not read untracked
    // inside the effect callback.
    () => [options.active(), options.ref()] as const,
    ([active, container]) => {
      if (!active || !container) {
        return;
      }

      // The single definition of "outside", shared by both handlers so the two can't drift apart.
      // `exclude` is read here rather than tracked in the compute above: the elements it names
      // register from their own effects, so tracking it would tear down and reattach these
      // document listeners on every ref change. Handlers run outside any tracking scope, so this
      // is a plain read, not a `STRICT_READ_UNTRACKED` one.
      const isOutside = (target: Node | null) => {
        if (target === null || container.contains(target)) {
          return false;
        }
        return !options.exclude?.().some((element) => element.contains(target));
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (options.dismissOnEscape === false) {
          return;
        }
        if (event.key === "Escape") {
          options.onDismiss();
        }
      };

      const handlePointerDown = (event: PointerEvent) => {
        if (options.dismissOnOutsidePointerDown === false) {
          return;
        }
        if (!isOutside(event.target as Node | null)) {
          return;
        }
        options.onDismiss();
      };

      const handleFocusIn = (event: FocusEvent) => {
        if (!options.dismissOnFocusOutside) {
          return;
        }
        if (!isOutside(event.target as Node | null)) {
          return;
        }
        options.onDismiss();
      };

      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("pointerdown", handlePointerDown, true);
      document.addEventListener("focusin", handleFocusIn);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.removeEventListener("pointerdown", handlePointerDown, true);
        document.removeEventListener("focusin", handleFocusIn);
      };
    },
  );
}
