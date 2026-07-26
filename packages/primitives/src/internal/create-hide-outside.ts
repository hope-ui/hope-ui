/**
 * @license
 * Portions of this file are derived from Adobe React Spectrum (`@react-aria/overlays`,
 * `src/ariaHideOutside.ts`).
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

import { type Accessor, createEffect } from "solid-js";

export interface CreateHideOutsideOptions {
  /** Whether outside content should currently be hidden and made inert. */
  active: Accessor<boolean>;
  /**
   * The element everything else is hidden *from* — the popup. Its subtree and its ancestors
   * are spared.
   *
   * Must be a real signal accessor: it's typically created as a reactive consequence of the
   * same signal `active` derives from. See the identical note in `create-focus-trap.ts`. Until it
   * resolves to a connected element, this primitive does nothing at all — which is what stops
   * a run from hiding the page, or worse, the popup itself.
   */
  target: Accessor<Element | null | undefined>;
  /**
   * Additional elements to spare, beside the target: a pointer-blocking `ModalBackdrop`, a
   * consumer's visible backdrop, a live region. Their subtrees and ancestors are spared too.
   *
   * These are optional by nature — an entry that hasn't registered yet is simply hidden until
   * it does, then spared on the next run. Only `target` is load-bearing enough to gate on.
   */
  spare?: Accessor<ReadonlyArray<Element | null | undefined>>;
}

/**
 * Declarative always-visible marker: an element carrying this attribute is spared by **every**
 * layer, whether it was already in the page when the layer opened or appeared while it was open.
 *
 * It covers the ordering `keepVisible` cannot reach — a modal opening *after* the layer it must
 * spare — and the code that never sees this kernel at all: a third-party toast root, a live
 * region, a portal owned by another library. It ships wired to nothing on purpose; `Popover` uses
 * `createKeepVisible` instead, because that is scoped to one layer and undone on close, which an
 * always-on attribute is not. React Aria ships the same pair (`data-react-aria-top-layer`, and no
 * first-party overlay of theirs sets it either).
 */
export const TOP_LAYER_ATTRIBUTE = "data-hope-ui-top-layer";

/**
 * Per-element bookkeeping, stored on the element itself under a cross-realm shared symbol
 * rather than in a module-scope `WeakMap`. `@hope-ui/primitives` is public API and is
 * depended on as a plain `dependencies` entry, which does not force a single installed
 * instance: two copies would keep two independent ref counts, and an inner layer's cleanup
 * would un-hide elements an outer layer still needs hidden.
 */
const HIDDEN_STATE = Symbol.for("hope-ui.hide-outside");

interface HiddenState {
  /** How many active layers are hiding this element. */
  count: number;
  /** The element's own `aria-hidden` before the first layer hid it, or `null` if it had none. */
  previousAriaHidden: string | null;
  /** Whether the element was already `inert` before the first layer hid it. */
  previousInert: boolean;
}

type HiddenElement = Element & { [HIDDEN_STATE]?: HiddenState };

function hide(element: Element, hidden: Set<Element>): void {
  const host = element as HiddenElement;
  const state = host[HIDDEN_STATE];
  hidden.add(element);

  if (state !== undefined) {
    state.count++;
    return;
  }

  host[HIDDEN_STATE] = {
    count: 1,
    previousAriaHidden: element.getAttribute("aria-hidden"),
    previousInert: element.hasAttribute("inert"),
  };

  // Both, deliberately. See the doc comment on `createHideOutside`.
  element.setAttribute("aria-hidden", "true");
  element.setAttribute("inert", "");
}

function unhide(element: Element): void {
  const host = element as HiddenElement;
  const state = host[HIDDEN_STATE];
  if (state === undefined) {
    return;
  }

  state.count--;
  if (state.count > 0) {
    return;
  }

  delete host[HIDDEN_STATE];

  if (state.previousAriaHidden === null) {
    element.removeAttribute("aria-hidden");
  } else {
    element.setAttribute("aria-hidden", state.previousAriaHidden);
  }

  if (!state.previousInert) {
    element.removeAttribute("inert");
  }
}

/** Whether an ancestor of `element` is already hidden — both attributes are inherited. */
function hasHiddenAncestor(element: Element, hidden: Set<Element>): boolean {
  let current = element.parentElement;
  while (current !== null) {
    if (hidden.has(current)) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

/** Whether `node` is a target, contains one, or lives inside one. Such nodes are never hidden. */
function isSpared(node: Element, targets: ReadonlySet<Element>): boolean {
  for (const target of targets) {
    if (node === target || node.contains(target) || target.contains(node)) {
      return true;
    }
  }
  return false;
}

/**
 * Walks `root` and hides every element that is neither a target, an ancestor of one, nor
 * inside a subtree that was already hidden.
 *
 * `aria-hidden` and `inert` are both inherited, so there's no reason to descend into a branch
 * we just hid — and every reason not to, since clearing the attributes from a descendant
 * later wouldn't un-hide it anyway.
 */
function hideOutside(targets: ReadonlySet<Element>, root: Element, hidden: Set<Element>): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode(node) {
      const element = node as Element;

      // Covered by an ancestor we just hid: skip the node and its whole subtree. The parent
      // is enough to check — REJECT prunes, so a hidden branch is never descended into.
      const parent = element.parentElement;
      if (parent !== null && hidden.has(parent)) {
        return NodeFilter.FILTER_REJECT;
      }

      // A target: skip it and everything inside it.
      if (targets.has(element)) {
        return NodeFilter.FILTER_REJECT;
      }

      // An ancestor of a target: don't hide it, but descend to reach its other children.
      for (const target of targets) {
        if (element.contains(target)) {
          return NodeFilter.FILTER_SKIP;
        }
      }

      return NodeFilter.FILTER_ACCEPT;
    },
  });

  // `hide` records into `hidden` before the walker advances, because `acceptNode` for this
  // node's children is only consulted on the *next* `nextNode()` call, and reads the set.
  let node = walker.nextNode();
  while (node !== null) {
    hide(node as Element, hidden);
    node = walker.nextNode();
  }
}

/**
 * The stack of live layers, innermost last, stored on `document` under a cross-realm shared
 * symbol for the same reason {@link HIDDEN_STATE} is stored on the element: two installed copies
 * of `@hope-ui/primitives` would keep two module-scope stacks, each believing it owns the
 * innermost layer.
 *
 * It answers a different question from the per-element ref count. That one is "how many layers
 * still need this element hidden"; this one is "which layer is innermost" — which decides who
 * observes, and which layer `keepVisible` spares into.
 */
const OBSERVER_STACK = Symbol.for("hope-ui.hide-outside-stack");

interface HideOutsideLayer {
  /** What this layer spares. Mutable — {@link keepVisible} adds to the topmost layer's set. */
  targets: Set<Element>;
  /** What this layer hid, and what its cleanup must un-hide. */
  hidden: Set<Element>;
  /** Re-attach this layer's `MutationObserver` — called when it becomes topmost again. */
  observe: () => void;
  /** Detach it, without discarding anything the layer hid. */
  disconnect: () => void;
}

type ObserverStackHost = Document & { [OBSERVER_STACK]?: HideOutsideLayer[] };

function getObserverStack(): HideOutsideLayer[] {
  const host = document as ObserverStackHost;
  const existing = host[OBSERVER_STACK];
  if (existing !== undefined) {
    return existing;
  }

  const created: HideOutsideLayer[] = [];
  host[OBSERVER_STACK] = created;
  return created;
}

/**
 * Makes everything outside `targets` inert to all three input channels, and restores the
 * previous state on deactivation. Each element outside gets **both**:
 *
 * - `aria-hidden="true"` — removes it from the accessibility tree.
 * - `inert` — removes it from the focus order, and from hit testing.
 *
 * Neither is redundant. `aria-modal="true"` alone has long-standing VoiceOver/Safari gaps,
 * which is why React Aria ships `ariaHideOutside` and Base UI ships floating-ui's
 * `markOthers`. But `aria-hidden` alone leaves outside content focusable and clickable, and —
 * measured against this repo's Chromium — `inert` alone does *not* take content out of the
 * accessibility tree as far as ARIA tooling is concerned: a role-based query still finds an
 * `inert` button, while it does not find an `aria-hidden` one. floating-ui reaches the same
 * conclusion, exposing `inert` as a separate opt-in flag layered on `aria-hidden` rather than
 * as a replacement for it.
 *
 * The TreeWalker accept/skip/reject strategy, the per-element ref count so nested layers
 * compose, the `MutationObserver` for content that appears while a layer is open, the layer
 * stack so only the innermost one observes, and `keepVisible` are adapted from React Aria's
 * `ariaHideOutside` (Adobe, Apache-2.0), re-expressed for Solid.
 *
 * ## One target, and a list of things to spare beside it
 *
 * A modal layer is not just its popup. `Dialog` also spares the always-present
 * `ModalBackdrop`, which must keep blocking the pointer (an `inert` backdrop is transparent to
 * hit testing and would silently stop doing its job), and the consumer's optional visible
 * backdrop, which must keep its `:hover` styles and pointer handlers.
 *
 * The asymmetry between `target` and `spare` is deliberate, and was a real bug before it was:
 * these elements register themselves from effects that fire on different flushes, so `spare`
 * is routinely incomplete on an early run — harmless, since an unregistered element is merely
 * hidden until the next run spares it. The **target** cannot be treated that way. A run with
 * the popup missing from the list hides the popup, `inert` blurs whatever the focus trap just
 * focused inside it, and focus lands on `<body>` for good — the trap has no reason to fire
 * again. Hence: nothing happens until `target` resolves.
 *
 * ## Nested layers: only the innermost one observes
 *
 * Every activation pushes onto a `document`-keyed stack and disconnects the layer it covers, so
 * exactly one `MutationObserver` is live at a time. That is load-bearing, not an optimization:
 * {@link keepVisible} registers into the **topmost** layer only, so a still-observing outer layer
 * would hide the very element the inner one just agreed to spare, and no registration could ever
 * work under a nesting. (A Dialog inside a Dialog also stops marking every new element twice.)
 *
 * Cleanup un-hides this layer's own set, then either pops and restarts the layer underneath (the
 * normal, innermost-closes-first case) or splices itself out of the middle without restarting
 * anything, because whoever is on top is already observing. That out-of-order branch is React
 * Aria's, and it is not hypothetical here: two overlays can close in either order.
 *
 * **Stack position is activation order, not mount order.** The push happens inside the effect
 * body, after the `active`/`target` guard, so a mounted-but-closed layer is simply absent and
 * reopening it puts it on top. One consequence worth knowing, which React Aria shares: the effect
 * is keyed on `[active(), target(), spare()]`, so swapping the target element *while active*
 * re-runs it and moves that layer to the top of the stack.
 *
 * ## Sparing a layer that opens later
 *
 * A layer added above an open modal — a `Popover` inside a `Dialog` — is a new `<body>` child the
 * modal's observer would otherwise hide, and being `inert` is what makes it unclickable while it
 * still paints perfectly. {@link createKeepVisible} is how such a layer registers itself into the
 * modal's spared set for as long as it is mounted; {@link TOP_LAYER_ATTRIBUTE} is the declarative
 * form, for the opposite ordering and for code that cannot call in.
 *
 * ## Consequences worth knowing
 *
 * With `inert` applied, outside content is no longer focusable, so axe-core's
 * `aria-hidden-focus` rule reports nothing at all — not even the `incomplete` that
 * `aria-hidden` on its own produces.
 *
 * `inert` also blurs a focused element the moment one of its ancestors becomes inert. A
 * `createFocusRestore` composed alongside this must therefore be created *first* (so its
 * `document.activeElement` snapshot precedes the blur) and restore focus *after* this
 * primitive's cleanup has removed `inert` — which its microtask deferral already guarantees.
 * See `create-focus-restore.md`.
 */
export function createHideOutside(options: CreateHideOutsideOptions): void {
  createEffect(
    // Track `target()`/`spare()` alongside `active()`, for the reason spelled out in
    // `create-focus-trap.ts`: these elements are created as a reactive consequence of the same signal
    // `active` derives from, so an untracked read can catch them still `undefined`, forever.
    () => [options.active(), options.target(), options.spare?.()] as const,
    ([active, target, rawSpare]) => {
      const root = document.body;
      if (!active || target == null || !root.contains(target)) {
        return;
      }

      const targets = new Set<Element>([target]);
      // A `ref` signal is never reset to `undefined` on unmount, so stale detached elements
      // can linger in `spare`. They're harmless, but filtering keeps `contains` checks cheap.
      for (const element of rawSpare ?? []) {
        if (element != null && root.contains(element)) {
          targets.add(element);
        }
      }
      for (const marked of root.querySelectorAll(`[${TOP_LAYER_ATTRIBUTE}]`)) {
        targets.add(marked);
      }

      const stack = getObserverStack();
      stack.at(-1)?.disconnect();

      const hidden = new Set<Element>();
      hideOutside(targets, root, hidden);

      // Content can appear after activation — another portal, a toast, a lazily rendered
      // route, or the `ModalBackdrop` a modal layer renders. React Aria observes for the
      // same reason.
      const observer = new MutationObserver((records) => {
        for (const record of records) {
          for (const node of record.addedNodes) {
            if (!(node instanceof Element)) {
              continue;
            }
            // Marked as always-visible: spare it, and keep sparing whatever lands inside it.
            if (node.hasAttribute(TOP_LAYER_ATTRIBUTE)) {
              targets.add(node);
              continue;
            }
            if (isSpared(node, targets)) {
              continue;
            }
            if (hasHiddenAncestor(node, hidden)) {
              continue;
            }

            hide(node, hidden);
          }
        }
      });

      const layer: HideOutsideLayer = {
        targets,
        hidden,
        observe: () => observer.observe(root, { childList: true, subtree: true }),
        disconnect: () => observer.disconnect(),
      };
      layer.observe();
      stack.push(layer);

      return () => {
        layer.disconnect();
        for (const element of hidden) {
          unhide(element);
        }
        hidden.clear();

        // Innermost-closes-first is the normal case: pop, and hand observation back to the layer
        // this one covered. Closing out of order, there is nothing to hand back — whoever is on
        // top never stopped observing — so this layer just splices itself out of the middle.
        if (stack.at(-1) === layer) {
          stack.pop();
          stack.at(-1)?.observe();
        } else {
          stack.splice(stack.indexOf(layer), 1);
        }
      };
    },
  );
}

/**
 * Spares `element` from the **innermost currently-open layer**, and returns the undo — or
 * `undefined` when there is no open layer, or when that layer already spares it.
 *
 * This is what lets a layer opened *above* a modal stay reachable: sparing an element spares its
 * whole subtree, because {@link isSpared} tests containment in both directions. It only affects
 * what the layer hides *from now on*, so it has to run before the layer's `MutationObserver` sees
 * the element — which is why {@link createKeepVisible} registers from an effect body rather than
 * from a cleanup or a deferred callback.
 *
 * Sparing is per-layer, not global: a modal that opens *later* walks the page fresh and knows
 * nothing about this registration. {@link TOP_LAYER_ATTRIBUTE} is the mechanism for that case.
 */
export function keepVisible(element: Element): (() => void) | undefined {
  const layer = getObserverStack().at(-1);
  if (layer === undefined || layer.targets.has(element)) {
    return undefined;
  }

  layer.targets.add(element);
  return () => {
    layer.targets.delete(element);
  };
}

export interface CreateKeepVisibleOptions {
  /**
   * Whether the element should currently be spared. Key it on whatever keeps the layer
   * *mounted* rather than on `open` — a layer animating out is still in the page, and still
   * needs to not be `inert` while it is.
   */
  active: Accessor<boolean>;
  /**
   * The element to spare, with its subtree. Must be a real signal accessor, for the reason
   * `createHideOutside`'s `target` is: it is created as a reactive consequence of the same
   * signal `active` derives from.
   */
  ref: Accessor<Element | null | undefined>;
}

/**
 * The reactive form of {@link keepVisible}: registers the element with the innermost open layer
 * while `active`, and undoes it on deactivation, on an element swap, or on disposal.
 *
 * Shaped like `createRegisteredElement`, and for the same reason — the element is only populated
 * after render, and may be replaced when the layer remounts.
 *
 * ## SSR
 *
 * `createEffect` bodies never run during SSR, and there is no layer stack on a server anyway.
 */
export function createKeepVisible(options: CreateKeepVisibleOptions): void {
  createEffect(
    () => [options.active(), options.ref()] as const,
    ([active, element]) => {
      if (!active || element == null) {
        return;
      }
      return keepVisible(element);
    },
  );
}
