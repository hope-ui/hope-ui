/**
 * @license
 * Portions of this file are derived from Adobe React Spectrum (`@react-aria/overlays`,
 * `src/useOverlay.ts`).
 * Copyright 2020 Adobe. All rights reserved.
 * https://github.com/adobe/react-spectrum
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file
 * except in compliance with the License. A copy of the License is distributed with this
 * package as LICENSE-APACHE-2.0.txt, and is available at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the
 * License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 * either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 *
 * This file has been modified from the original.
 */

import { type Accessor, createEffect, untrack } from "solid-js";

/**
 * Whether a dismissal reaches the layers **below** the one that handled it. The name and shape are
 * those of `useDismiss` in Base UI (MUI's headless component library); the defaults are not.
 *
 * Both members default to `false`, so only the topmost layer dismisses — what a Popover opened
 * inside a Dialog needs: one Escape closes one layer. Base UI defaults asymmetrically
 * (`escapeKey: false`, `outsidePress: true`) and hope-ui deliberately does not follow it: an outside
 * press that bubbled would make a single click on a modal's backdrop close the modal *and* the layer
 * above it, the exact breakage the layer stack exists to end. A bare boolean sets both.
 */
export type DismissBubbles = boolean | { escapeKey?: boolean; outsidePress?: boolean };

export interface CreateDismissableOptions {
  /** Whether the layer is currently open and should listen for a dismissal. */
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
   * focus-out. The layer's own trigger above all: without it, a pointerdown on the trigger
   * dismisses in the capture phase and the trigger's own `click` reopens, so the layer can never be
   * closed by clicking the control that opened it. Escape ignores this list; it is keyboard-global
   * and has no "outside".
   *
   * Layers opened *above* this one need no entry here — the stack already handles them.
   */
  exclude?: Accessor<Element[]>;
  /**
   * Dismiss when focus lands outside the container while active. Default `false` — a modal layer
   * traps focus, so the listener would be dead weight there.
   */
  dismissOnFocusOutside?: boolean;
  /**
   * Whether Escape / an outside pointerdown handled by the layer above also dismisses this one.
   * Default: neither. See {@link DismissBubbles}.
   */
  bubbles?: DismissBubbles;
}

/** Resolves {@link DismissBubbles} for one event channel. Both members default to `false`. */
function bubblesFor(
  bubbles: DismissBubbles | undefined,
  channel: "escapeKey" | "outsidePress",
): boolean {
  return typeof bubbles === "boolean" ? bubbles : (bubbles?.[channel] ?? false);
}

/**
 * The stack of active layers, topmost last, stored on `document` under a `Symbol.for` key — a symbol
 * from the global registry, so every copy of this module resolves the same one — rather than at
 * module scope. Nothing forces a consumer to install a single copy of `@hope-ui/primitives`, and two
 * module-scope stacks each believing they own the topmost layer is an unreproducible field bug: one
 * Escape would close a Dialog straight through the Popover above it.
 *
 * A **separate** stack from the one in `create-hide-outside.ts`, and they must stay that way: a
 * Dialog with `dismissOnEscape: false` still participates in hide-outside ordering but must never
 * win Escape.
 */
const DISMISS_STACK = Symbol.for("hope-ui.dismiss-stack");

interface DismissLayer {
  /** What counts as "inside" for this layer — and, for every layer below it, what counts as *not*
   * outside. */
  container: HTMLElement;
}

type DismissStackHost = Document & { [DISMISS_STACK]?: DismissLayer[] };

function getDismissStack(): DismissLayer[] {
  const host = document as DismissStackHost;
  const existing = host[DISMISS_STACK];
  if (existing !== undefined) {
    return existing;
  }

  const created: DismissLayer[] = [];
  host[DISMISS_STACK] = created;
  return created;
}

/**
 * Calls `onDismiss` on Escape keydown, outside pointerdown and/or outside focus while `active`.
 * Every listener is attached from inside `createEffect`, which never runs on the server, so this
 * never touches `document` during server rendering.
 *
 * Focus-out listens for `focusin`, not `focusout`: `focusin` fires on the element focus *arrived*
 * at, so focus falling back to `<body>` — an element removed or made unfocusable while focused —
 * can't be mistaken for a deliberate move to another control.
 *
 * ## Nested layers
 *
 * Every active layer pushes onto a `document`-keyed stack, topmost last, and two rules follow:
 *
 * - **Escape and outside pointerdown dismiss the topmost layer only.** Without that gate, one
 *   Escape closes both a Dialog and the Popover opened inside it. `bubbles` opts back in, per
 *   event channel.
 * - **Nothing inside a layer opened _above_ this one is "outside".** A pointerdown on a Popover's
 *   card is not an outside press for the Dialog underneath, and focus landing there is not focus
 *   leaving it. One clause, both channels — which is why `exclude` never needs to name a layer.
 *
 * **Focus-out deliberately gets no topmost gate.** The layers-above clause already covers nesting,
 * and focus that genuinely leaves the whole chain should close all of it, not just the top.
 *
 * Position in the stack is *activation* order, not mount order: a mounted-but-closed layer is simply
 * absent, and re-opening one — or swapping its container element while active — puts it on top.
 *
 * ## Two deliberate divergences from React Aria's `useOverlay`
 *
 * - **Escape stays document-level.** React Aria — Adobe's headless accessibility hooks, and what
 *   this file derives from — scopes it to the overlay element, so it fires only with focus inside.
 *   Here it is a document listener gated on being topmost, because element-scoping would mean
 *   returning keyboard props from every part hook in every family, for behavior the stack already
 *   provides.
 * - **One phase, not two.** React Aria snapshots the topmost layer at `pointerdown` and *decides* at
 *   `click`, because those two events can have different targets. Dismissing at the start of the
 *   interaction instead makes "topmost at the snapshot" and "topmost now" the same instant — an
 *   equivalence that rests on a dispatch not being reorderable underneath itself, pinned by
 *   `solid-contract.browser.test.tsx` § *a signal write from one document listener cannot unhook
 *   the next one mid-dispatch*.
 */
export function createDismissable(options: CreateDismissableOptions): void {
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
      const stack = getDismissStack();
      const layer: DismissLayer = { container };
      stack.push(layer);

      const isTopmost = () => stack.at(-1) === layer;

      const isInsideLayerAbove = (target: Node) => {
        const position = stack.indexOf(layer);
        return (
          position !== -1 &&
          stack.slice(position + 1).some((above) => above.container.contains(target))
        );
      };

      // One definition of "outside", shared by both handlers so the two can't drift apart.
      //
      // `exclude` is read here rather than tracked in the dependency function above: the elements it
      // names register from their own effects, so tracking it would tear down and reattach these
      // document listeners on every ref change. The `untrack` — read without subscribing — is not
      // decoration either, because a handler is not always reached from a real user gesture. Above a
      // modal the whole chain runs synchronously: `createAutoFocus` calls `.focus()` from its effect
      // callback, that dispatches `focusin`, the focus trap refocuses its own container, and *that*
      // dispatch lands here, still inside the effect, where an implicit read would emit Solid's
      // `[STRICT_READ_UNTRACKED]` warning.
      const isOutside = (target: Node | null) => {
        if (target === null || container.contains(target)) {
          return false;
        }
        if (isInsideLayerAbove(target)) {
          return false;
        }
        const excluded = untrack(() => options.exclude?.());
        return !excluded?.some((element) => element.contains(target));
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (options.dismissOnEscape === false) {
          return;
        }
        if (event.key !== "Escape") {
          return;
        }
        if (!isTopmost() && !bubblesFor(options.bubbles, "escapeKey")) {
          return;
        }
        options.onDismiss();
      };

      const handlePointerDown = (event: PointerEvent) => {
        if (options.dismissOnOutsidePointerDown === false) {
          return;
        }
        if (!isTopmost() && !bubblesFor(options.bubbles, "outsidePress")) {
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

        // Guarded, because `indexOf` returning -1 would make `splice(-1, 1)` drop whichever layer
        // happens to be topmost instead.
        const position = stack.indexOf(layer);
        if (position !== -1) {
          stack.splice(position, 1);
        }
      };
    },
  );
}
