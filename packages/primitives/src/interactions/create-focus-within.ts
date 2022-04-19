import { access, MaybeAccessor } from "@solid-primitives/utils";
import { Accessor, createMemo, createSignal } from "solid-js";

import { FocusEvents } from "../types";
import { createSyntheticBlurEvent } from "./utils";

export interface CreateFocusWithinProps {
  /**
   * Whether the focus within events should be disabled.
   */
  isDisabled?: MaybeAccessor<boolean | undefined>;

  /**
   * Handler that is called when the target element or a descendant receives focus.
   */
  onFocusIn?: (e: FocusEvent) => void;

  /**
   * Handler that is called when the target element and all descendants lose focus.
   */
  onFocusOut?: (e: FocusEvent) => void;

  /**
   * Handler that is called when the the focus within state changes.
   */
  onFocusWithinChange?: (isFocusWithin: boolean) => void;
}

export interface FocusWithinElementProps {
  /**
   * Handler that is called when the element receives focus.
   */
  onFocusIn: FocusEvents["onFocusIn"];

  /**
   * Handler that is called when the element loses focus.
   */
  onFocusOut: FocusEvents["onFocusOut"];
}

export interface FocusWithinResult {
  /**
   * Props to spread onto the target element.
   */
  focusWithinProps: Accessor<FocusWithinElementProps>;
}

/**
 * Handles focus events for the target and its descendants.
 */
export function createFocusWithin(props: CreateFocusWithinProps): FocusWithinResult {
  const [isFocusWithin, setIsFocusWithin] = createSignal(false);

  const onFocusOut: FocusEvents["onFocusOut"] = event => {
    if (access(props.isDisabled)) {
      return;
    }

    const currentTarget = event.currentTarget as Element | null;
    const relatedTarget = event.relatedTarget as Element | null;

    // We don't want to trigger onFocusOut and then immediately onFocusIn again
    // when moving focus inside the element. Only trigger if the currentTarget doesn't
    // include the relatedTarget (where focus is moving).
    if (isFocusWithin() && !currentTarget?.contains(relatedTarget)) {
      setIsFocusWithin(false);
      props.onFocusOut?.(event);
      props.onFocusWithinChange?.(false);
    }
  };

  const onSyntheticFocus = createSyntheticBlurEvent(onFocusOut);

  const onFocusIn: FocusEvents["onFocusIn"] = event => {
    if (access(props.isDisabled)) {
      return;
    }

    if (!isFocusWithin()) {
      props.onFocusIn?.(event);
      props.onFocusWithinChange?.(true);
      setIsFocusWithin(true);
      onSyntheticFocus(event);
    }
  };

  const focusWithinProps: Accessor<FocusWithinElementProps> = createMemo(() => ({
    onFocusIn,
    onFocusOut,
  }));

  return { focusWithinProps };
}
