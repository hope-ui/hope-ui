/*!
 * Portions of this file are based on code from ariakit.
 * MIT Licensed, Copyright (c) Diego Haz.
 *
 * Credits to the Ariakit team:
 * https://github.com/ariakit/ariakit/blob/main/packages/ariakit/src/focus-trap/focus-trap-region.tsx
 */

import { createHopeComponent, hope } from "@hope-ui/styles";
import { getAllTabbableIn, mergeRefs } from "@hope-ui/utils";
import { JSX, onCleanup, onMount, ParentProps, Show, splitProps } from "solid-js";

import { VisuallyHidden } from "../visually-hidden";

interface FocusTrapProps extends ParentProps {
  /**
   * Whether focus should be restored to the element that
   * triggered the `FocusTrap` once it unmounts.
   */
  restoreFocus?: boolean;

  /** Whether the focus trap should be disabled. */
  isDisabled?: boolean;
}

/**
 * `FocusTrap` traps focus within itself.
 */
export const FocusTrap = createHopeComponent<"div", FocusTrapProps>(props => {
  let previousActiveElement: HTMLElement | null;
  let containerRef: HTMLDivElement | undefined;

  const [local, others] = splitProps(props, ["ref", "restoreFocus", "isDisabled"]);

  const onFocus: JSX.EventHandlerUnion<HTMLSpanElement, FocusEvent> = event => {
    if (!containerRef) {
      return;
    }

    const tabbables = getAllTabbableIn(containerRef, true);

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
    if (local.restoreFocus) {
      previousActiveElement = document.activeElement as HTMLElement | null;
    }

    if (containerRef) {
      let first = containerRef.querySelector("[data-autofocus]") as HTMLElement | null;

      if (!first) {
        first = getAllTabbableIn(containerRef, true)[0];
      }

      first ? first.focus() : containerRef.focus();
    }
  });

  onCleanup(() => {
    previousActiveElement?.focus();
  });

  return (
    <>
      <Show when={!props.isDisabled}>
        <FocusTrapElement onFocus={onFocus} />
      </Show>
      <hope.div ref={mergeRefs(el => (containerRef = el), local.ref)} tabIndex={-1} {...others}>
        {props.children}
      </hope.div>
      <Show when={!props.isDisabled}>
        <FocusTrapElement onFocus={onFocus} />
      </Show>
    </>
  );
});

const FocusTrapElement = createHopeComponent<"span">(props => {
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
