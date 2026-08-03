import { type Accessor, createEffect, untrack } from "solid-js";

export interface CreateAutoFocusOptions {
  /** Whether autofocus is currently active. */
  active: Accessor<boolean>;
  /** The container to move focus into. */
  ref: Accessor<HTMLElement | null | undefined>;
  /** Explicit element to focus on activation, instead of the first focusable descendant. */
  initialFocus?: Accessor<HTMLElement | null | undefined>;
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable='true']",
  "audio[controls]",
  "video[controls]",
].join(",");

function isVisible(element: HTMLElement): boolean {
  return element.offsetParent !== null || element.getClientRects().length > 0;
}

/** Not barrel-exported — `create-focus-trap.ts` imports it for its Tab cycling. */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isVisible);
}

/**
 * Moves focus into a container when `active` turns true: `initialFocus` if given, else the first
 * focusable descendant, else the container itself under a temporary `tabindex="-1"` that is removed
 * again on deactivation. Every DOM access sits inside the effect, so none of it runs on the server.
 *
 * **Moving focus in and trapping it there are separate concerns**, which is why this is its own
 * primitive rather than half of `createFocusTrap`. A non-modal overlay — a popover, a tooltip —
 * wants focus moved into it *without* Tab being caged there. `createFocusTrap` composes this one, in
 * a creation order documented in __internal__/primitives/internal/create-focus-trap.md.
 *
 * Restoring focus afterwards is a third concern, `createFocusRestore`, which must be created
 * *before* this one so its snapshot of the previously focused element predates the `.focus()` below.
 */
export function createAutoFocus(options: CreateAutoFocusOptions): void {
  createEffect(
    // Both signals belong in this first function — only it tracks — and `ref` must be a real signal
    // accessor, not a closure over a plain `let`. When the container is itself created by the same
    // flag flipping (gated behind a `<Show>`), a sibling effect may assign the ref only *after* this
    // one has run for that change; a non-tracking read would then miss it forever, since `active`
    // never changes again. Tracking `ref()` re-runs this effect whatever the firing order.
    () => [options.active(), options.ref()] as const,
    ([active, container]) => {
      if (!active || !container) {
        return;
      }

      // Sampled rather than tracked: `initialFocus` says where focus goes *on this activation*, and
      // subscribing would re-run the whole block — stealing focus back — every time a signal-backed
      // target ref were reassigned. `untrack` is spelled out because leaving the read bare warns
      // `STRICT_READ_UNTRACKED` for any consumer that passes a real accessor.
      const initial =
        untrack(() => options.initialFocus?.()) ?? getFocusableElements(container)[0] ?? container;
      let addedTabIndex = false;
      if (initial === container && !container.hasAttribute("tabindex")) {
        container.setAttribute("tabindex", "-1");
        addedTabIndex = true;
      }
      initial.focus();

      return () => {
        if (addedTabIndex) {
          container.removeAttribute("tabindex");
        }
      };
    },
  );
}
