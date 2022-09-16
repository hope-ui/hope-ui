/*!
 * Portions of this file are based on code from ariakit.
 * MIT Licensed, Copyright (c) Diego Haz.
 *
 * Credits to the Ariakit team:
 * https://github.com/ariakit/ariakit/blob/232bc79018ec20967fec1e097a9474aba3bb5be7/packages/ariakit/src/focus-trap/focus-trap-region.tsx
 */

import { createHopeComponent, hope } from "@hope-ui/styles";
import { getAllTabbableIn, mergeRefs } from "@hope-ui/utils";
import { JSX, onCleanup, onMount, ParentProps, Show, splitProps } from "solid-js";

import { VisuallyHidden } from "../visually-hidden";

export interface FocusTrapRegionProps extends ParentProps {
  /**
   * A query selector to retrieve the element that should receive focus once `FocusTrap` mounts.
   * This value has priority over `autoFocus`.
   * @default '[data-autofocus]'
   */
  initialFocusSelector?: string;

  /**
   * A query selector to retrieve the element that should receive focus once `FocusTrap` unmounts.
   * This value has priority over `restoreFocus`.
   */
  finalFocusSelector?: string;

  /** Whether the first focusable element should be focused once `FocusTrap` mounts. */
  autoFocus?: boolean;

  /** Whether focus should be restored to the element that triggered the `FocusTrap` once it unmounts. */
  restoreFocus?: boolean;

  /** Whether the focus trap should be disabled. */
  isDisabled?: boolean;
}

/**
 * `FocusTrapRegion` traps focus within itself.
 */
export const FocusTrapRegion = createHopeComponent<"div", FocusTrapRegionProps>(props => {
  let finalFocusElement: HTMLElement | null;
  let containerRef: HTMLDivElement | undefined;

  const [local, others] = splitProps(props, [
    "ref",
    "initialFocusSelector",
    "finalFocusSelector",
    "autoFocus",
    "restoreFocus",
    "isDisabled",
  ]);

  const setFinalFocusElement = () => {
    // get a reference to the requested final focus element.
    if (local.finalFocusSelector) {
      finalFocusElement = document.querySelector(local.finalFocusSelector) as HTMLElement | null;
      return;
    }

    // get a reference to the previous active element to restore focus back.
    if (local.restoreFocus) {
      finalFocusElement = document.activeElement as HTMLElement | null;
    }
  };

  const focusInitialElement = () => {
    if (!containerRef) {
      return;
    }

    const initialFocusElement = containerRef.querySelector(
      local.initialFocusSelector ?? "[data-autofocus]"
    ) as HTMLElement | null;

    if (initialFocusElement) {
      initialFocusElement.focus();
      return;
    }

    // fallback to first focusable element or container.
    if (local.autoFocus) {
      const first = getAllTabbableIn(containerRef)[0];
      first ? first.focus() : containerRef.focus();
    }
  };

  const onTrapFocus: JSX.EventHandlerUnion<HTMLSpanElement, FocusEvent> = event => {
    if (!containerRef) {
      return;
    }

    // Because this function run only when focus trap is active,
    // we remove first and last element since they are `FocusTrap`.
    const tabbables = getAllTabbableIn(containerRef).slice(1, -1);

    // Fallback to the container element
    if (!tabbables.length) {
      containerRef.focus();
      return;
    }

    const first = tabbables[0];
    const last = tabbables[tabbables.length - 1];

    if (event.relatedTarget === first) {
      last?.focus();
    } else {
      first?.focus();
    }
  };

  onMount(() => {
    // should run first to get the previous active element in case of restoreFocus,
    // before FocusTrap try to focus initial element.
    setFinalFocusElement();

    focusInitialElement();
  });

  onCleanup(() => {
    finalFocusElement?.focus();
  });

  return (
    <hope.div ref={mergeRefs(el => (containerRef = el), local.ref)} tabIndex={-1} {...others}>
      <Show when={!props.isDisabled}>
        <FocusTrap onFocus={onTrapFocus} />
      </Show>
      {props.children}
      <Show when={!props.isDisabled}>
        <FocusTrap onFocus={onTrapFocus} />
      </Show>
    </hope.div>
  );
});

const FocusTrap = createHopeComponent<"span">(props => {
  return (
    <VisuallyHidden
      data-focus-trap
      tabIndex={0}
      aria-hidden="true"
      style={{ position: "fixed", top: "0", left: "0" }}
      {...props}
    />
  );
});
