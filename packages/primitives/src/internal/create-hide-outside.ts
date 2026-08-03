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
  /**
   * Whether outside content should currently be hidden from assistive technology and made
   * `inert` — the HTML attribute that takes an element out of the focus order and out of hit
   * testing, so it can be neither tabbed to nor clicked.
   */
  active: Accessor<boolean>;
  /**
   * The element everything else is hidden *from* — the popup. Its subtree and its ancestors
   * are spared.
   *
   * Must be a real signal accessor, never a plain variable: the element is typically created as
   * a reactive consequence of the same signal `active` derives from, so a non-reactive read can
   * see it as `undefined` forever. Nothing happens at all until it resolves to a connected
   * element, which is what stops a run from hiding the page — or the popup itself.
   */
  target: Accessor<Element | null | undefined>;
  /**
   * Extra elements to spare beside the target, with their subtrees and ancestors: a
   * pointer-blocking `ModalBackdrop`, a consumer's visible backdrop, a live region.
   *
   * Incompleteness here is harmless, unlike `target`: an element that hasn't registered yet is
   * merely hidden until the next run spares it.
   */
  spare?: Accessor<ReadonlyArray<Element | null | undefined>>;
}

/**
 * Declarative always-visible marker: an element carrying this attribute is spared by **every**
 * layer, whether it was in the page when the layer opened or appeared while it was open.
 *
 * It covers what {@link keepVisible} cannot — a modal opening *after* the element it must spare —
 * and code that never calls into these primitives at all: a third-party toast root, another
 * library's portal. Nothing here sets it, deliberately: `Popover` uses {@link createKeepVisible},
 * which is scoped to one layer and undone on close, where an always-on attribute is not.
 */
export const TOP_LAYER_ATTRIBUTE = "data-hope-ui-top-layer";

/**
 * Per-element bookkeeping, stored on the element itself under a `Symbol.for` key — a symbol from
 * the global registry, so every copy of this module resolves the same one — rather than in a
 * module-scope `WeakMap`. Nothing forces a consumer to install a single copy of
 * `@hope-ui/primitives`, and two copies would keep two independent ref counts: an inner layer's
 * cleanup would then un-hide elements an outer layer still needs hidden.
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

  // Both attributes, deliberately — neither covers the other. See the doc on `createHideOutside`.
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
 * `aria-hidden` and `inert` both apply to the whole subtree, so descending into a branch we just
 * hid is pointless — and harmful, since clearing the attributes off a descendant later would not
 * un-hide it anyway.
 */
function hideOutside(targets: ReadonlySet<Element>, root: Element, hidden: Set<Element>): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode(node) {
      const element = node as Element;

      // Covered by an ancestor we just hid. Testing only the parent is enough: REJECT prunes
      // the whole subtree, so a hidden branch is never descended into in the first place.
      const parent = element.parentElement;
      if (parent !== null && hidden.has(parent)) {
        return NodeFilter.FILTER_REJECT;
      }

      // A target: prune it and everything inside it.
      if (targets.has(element)) {
        return NodeFilter.FILTER_REJECT;
      }

      // An ancestor of a target: don't hide it, but SKIP rather than REJECT so the walk still
      // reaches its other children.
      for (const target of targets) {
        if (element.contains(target)) {
          return NodeFilter.FILTER_SKIP;
        }
      }

      return NodeFilter.FILTER_ACCEPT;
    },
  });

  // Hiding before advancing is what makes the parent test above work: `acceptNode` runs for a
  // node's children only on the *next* `nextNode()` call, and reads `hidden` as it stands then.
  let node = walker.nextNode();
  while (node !== null) {
    hide(node as Element, hidden);
    node = walker.nextNode();
  }
}

/**
 * The stack of live layers, innermost last, stored on `document` under a global-registry symbol
 * for the same reason {@link HIDDEN_STATE} is stored on the element: two installed copies of
 * `@hope-ui/primitives` would keep two module-scope stacks, each believing it owns the innermost
 * layer.
 *
 * It answers a different question from the per-element ref count. That one is "how many layers
 * still need this element hidden"; this one is "which layer is innermost" — which decides who
 * observes, and which layer {@link keepVisible} spares into.
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
 * Puts everything outside `targets` out of reach of screen readers, the keyboard and the
 * pointer, and restores the previous state on deactivation. Each element outside gets **both**:
 *
 * - `aria-hidden="true"` — removes it from the accessibility tree.
 * - `inert` — removes it from the focus order, and from hit testing.
 *
 * Neither is redundant. `aria-hidden` alone leaves outside content focusable and clickable, and —
 * measured against this repo's Chromium — `inert` alone does *not* take content out of the
 * accessibility tree as far as ARIA tooling is concerned: a role-based query still finds an
 * `inert` button, while it does not find an `aria-hidden` one. Putting `aria-modal="true"` on the
 * popup instead of either replaces neither; it has long-standing VoiceOver/Safari gaps, which is
 * why React Aria — Adobe's headless accessibility hook library — hides outside content instead.
 *
 * The TreeWalker accept/skip/reject strategy, the per-element ref count so nested layers
 * compose, the `MutationObserver` for content that appears while a layer is open, the layer
 * stack so only the innermost one observes, and `keepVisible` are adapted from React Aria's
 * `ariaHideOutside` (Adobe, Apache-2.0), re-expressed for Solid.
 *
 * ## One target, and a list of things to spare beside it
 *
 * A modal layer is not just its popup. `Dialog` also spares the `ModalBackdrop` it renders to
 * block the pointer — an `inert` element is transparent to hit testing, so a backdrop that hid
 * itself would silently stop blocking anything — and the consumer's optional visible backdrop,
 * which must keep its `:hover` styles and pointer handlers.
 *
 * `target` and `spare` are treated differently on purpose, after a real bug. These elements
 * register from effects that run on different ticks, so `spare` is routinely incomplete on an
 * early run — harmless, because an unregistered element is merely hidden until the next run
 * spares it. The **target** cannot be treated that way: a run that hides the popup makes `inert`
 * blur whatever was focused inside it, and focus lands on `<body>` for good, since nothing will
 * fire again to fix it. Hence the guard — nothing happens until `target` resolves.
 *
 * ## Nested layers: only the innermost one observes
 *
 * Every activation pushes onto a `document`-keyed stack and disconnects the layer it covers, so
 * exactly one `MutationObserver` is live at a time. That is load-bearing, not an optimization:
 * {@link keepVisible} registers into the **topmost** layer only, so a still-observing outer layer
 * would re-hide the very element the inner one just agreed to spare.
 *
 * A layer opened *above* an open modal — a `Popover` inside a `Dialog` — is a new `<body>` child
 * that modal would otherwise hide, leaving it painted but unclickable. Such a layer registers
 * itself with {@link createKeepVisible}; {@link TOP_LAYER_ATTRIBUTE} is the declarative form, for
 * the opposite ordering and for code that cannot call in.
 *
 * ## Composing with focus restoration
 *
 * `inert` blurs a focused element the moment one of its ancestors becomes inert. So a
 * `createFocusRestore` alongside this one must be created *first* (its `document.activeElement`
 * snapshot has to precede that blur) and must restore focus *after* this primitive's cleanup has
 * removed `inert` — which its microtask deferral already guarantees. See
 * `__internal__/primitives/internal/create-focus-restore.md`.
 *
 * Stack position is activation order rather than mount order, closing out of order is handled,
 * and axe reports nothing on the hidden background rather than an `incomplete`:
 * `__internal__/primitives/internal/create-hide-outside.md`.
 */
export function createHideOutside(options: CreateHideOutsideOptions): void {
  createEffect(
    // Solid 2.0 effects take two functions: the first declares what to track, the second reacts.
    // `target()`/`spare()` have to be tracked alongside `active()` because those elements are
    // created as a reactive consequence of the same signal `active` derives from — read only in
    // the second function, they would be seen as `undefined` forever.
    () => [options.active(), options.target(), options.spare?.()] as const,
    ([active, target, rawSpare]) => {
      const root = document.body;
      if (!active || target == null || !root.contains(target)) {
        return;
      }

      const targets = new Set<Element>([target]);
      // A `ref` signal is never reset when its element unmounts, so `spare` can hold detached
      // elements. Harmless, but dropping them keeps every `contains` check below cheap.
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

      // Content added after activation would otherwise stay reachable: another portal, a toast,
      // a lazily rendered route, or the `ModalBackdrop` a modal layer renders.
      const observer = new MutationObserver((records) => {
        for (const record of records) {
          for (const node of record.addedNodes) {
            if (!(node instanceof Element)) {
              continue;
            }
            // Marked always-visible: sparing it also spares whatever lands inside it later.
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
        // underneath. Two overlays can also close in the other order, and then there is nothing
        // to hand back — whoever is on top never stopped observing — so just splice out.
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
 * Sparing an element spares its whole subtree, since {@link isSpared} tests containment both
 * ways. It only affects what that layer hides *from now on*, so it has to run before the layer's
 * `MutationObserver` sees the element — hence {@link createKeepVisible} registering from an
 * effect body rather than from a cleanup or a deferred callback.
 *
 * Sparing is per-layer, not global: a modal that opens *later* walks the page fresh and knows
 * nothing about this registration. {@link TOP_LAYER_ATTRIBUTE} covers that case.
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
   * The element to spare, with its subtree. Must be a real signal accessor, for the same reason
   * `createHideOutside`'s `target` must: it is created as a reactive consequence of the signal
   * `active` derives from.
   */
  ref: Accessor<Element | null | undefined>;
}

/**
 * The reactive form of {@link keepVisible}: registers the element with the innermost open layer
 * while `active`, and undoes that on deactivation, on an element swap, or on disposal.
 *
 * Shaped like `createRegisteredElement` for the same reason: the element exists only after
 * render, and can be replaced when the layer remounts.
 *
 * Server rendering needs nothing here — effect bodies never run there, and there is no layer
 * stack on a server to register with.
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
