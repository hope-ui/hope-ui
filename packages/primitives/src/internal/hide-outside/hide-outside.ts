import { type Accessor, createEffect } from "solid-js";

export interface CreateHideOutsideOptions {
  /** Whether outside content should currently be hidden and made inert. */
  active: Accessor<boolean>;
  /**
   * The element everything else is hidden *from* — the popup. Its subtree and its ancestors
   * are spared.
   *
   * Must be a real signal accessor: it's typically created as a reactive consequence of the
   * same signal `active` derives from. See the identical note in `focus-trap.ts`. Until it
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
  if (state === undefined) return;

  state.count--;
  if (state.count > 0) return;

  delete host[HIDDEN_STATE];

  if (state.previousAriaHidden === null) element.removeAttribute("aria-hidden");
  else element.setAttribute("aria-hidden", state.previousAriaHidden);

  if (!state.previousInert) element.removeAttribute("inert");
}

/** Whether an ancestor of `element` is already hidden — both attributes are inherited. */
function hasHiddenAncestor(element: Element, hidden: Set<Element>): boolean {
  let current = element.parentElement;
  while (current !== null) {
    if (hidden.has(current)) return true;
    current = current.parentElement;
  }
  return false;
}

/** Whether `node` is a target, contains one, or lives inside one. Such nodes are never hidden. */
function isSpared(node: Element, targets: readonly Element[]): boolean {
  return targets.some(
    (target) => node === target || node.contains(target) || target.contains(node),
  );
}

/**
 * Walks `root` and hides every element that is neither a target, an ancestor of one, nor
 * inside a subtree that was already hidden.
 *
 * `aria-hidden` and `inert` are both inherited, so there's no reason to descend into a branch
 * we just hid — and every reason not to, since clearing the attributes from a descendant
 * later wouldn't un-hide it anyway.
 */
function hideOutside(targets: readonly Element[], root: Element, hidden: Set<Element>): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode(node) {
      const element = node as Element;

      // Covered by an ancestor we just hid: skip the node and its whole subtree. The parent
      // is enough to check — REJECT prunes, so a hidden branch is never descended into.
      const parent = element.parentElement;
      if (parent !== null && hidden.has(parent)) return NodeFilter.FILTER_REJECT;

      // A target: skip it and everything inside it.
      if (targets.includes(element)) return NodeFilter.FILTER_REJECT;

      // An ancestor of a target: don't hide it, but descend to reach its other children.
      if (targets.some((target) => element.contains(target))) return NodeFilter.FILTER_SKIP;

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
 * compose, and the `MutationObserver` for content that appears while a layer is open are
 * adapted from React Aria's `ariaHideOutside` (Adobe, Apache-2.0). The code is written fresh
 * for Solid.
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
 * See `focus-restore.md`.
 */
export function createHideOutside(options: CreateHideOutsideOptions): void {
  createEffect(
    // Track `target()`/`spare()` alongside `active()`, for the reason spelled out in
    // `focus-trap.ts`: these elements are created as a reactive consequence of the same signal
    // `active` derives from, so an untracked read can catch them still `undefined`, forever.
    () => [options.active(), options.target(), options.spare?.()] as const,
    ([active, target, rawSpare]) => {
      const root = document.body;
      if (!active || target == null || !root.contains(target)) return;

      // A `ref` signal is never reset to `undefined` on unmount, so stale detached elements
      // can linger in `spare`. They're harmless, but filtering keeps `contains` checks cheap.
      const spare = (rawSpare ?? []).filter(
        (element): element is Element => element != null && root.contains(element),
      );
      const targets = spare.includes(target) ? spare : [target, ...spare];

      const hidden = new Set<Element>();
      hideOutside(targets, root, hidden);

      // Content can appear after activation — another portal, a toast, a lazily rendered
      // route, or the `ModalBackdrop` a modal layer renders. React Aria observes for the
      // same reason.
      const observer = new MutationObserver((records) => {
        for (const record of records) {
          for (const node of record.addedNodes) {
            if (!(node instanceof Element)) continue;
            if (isSpared(node, targets)) continue;
            if (hasHiddenAncestor(node, hidden)) continue;

            hide(node, hidden);
          }
        }
      });
      observer.observe(root, { childList: true, subtree: true });

      return () => {
        observer.disconnect();
        for (const element of hidden) unhide(element);
        hidden.clear();
      };
    },
  );
}
