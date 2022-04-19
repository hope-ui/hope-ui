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
  onFocusWithin?: (e: FocusEvent) => void;

  /**
   * Handler that is called when the target element and all descendants lose focus.
   */
  onBlurWithin?: (e: FocusEvent) => void;

  /**
   * Handler that is called when the the focus within state changes.
   */
  onFocusWithinChange?: (isFocusWithin: boolean) => void;
}

export interface FocusWithinElementProps {
  /**
   * Handler that is called when the element receives focus.
   */
  onFocus: FocusEvents["onFocus"];

  /**
   * Handler that is called when the element loses focus.
   */
  onBlur: FocusEvents["onBlur"];
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

  const onBlur: FocusEvents["onBlur"] = event => {
    if (access(props.isDisabled)) {
      return;
    }

    // We don't want to trigger onBlurWithin and then immediately onFocusWithin again
    // when moving focus inside the element. Only trigger if the currentTarget doesn't
    // include the relatedTarget (where focus is moving).
    if (
      isFocusWithin() &&
      !(event.currentTarget as Element).contains(event.relatedTarget as Element)
    ) {
      setIsFocusWithin(false);
      props.onBlurWithin?.(event);
      props.onFocusWithinChange?.(false);
    }
  };

  const onSyntheticFocus = createSyntheticBlurEvent(onBlur);

  const onFocus: FocusEvents["onFocus"] = event => {
    if (access(props.isDisabled)) {
      return;
    }

    if (!isFocusWithin()) {
      props.onFocusWithin?.(event);
      props.onFocusWithinChange?.(true);
      setIsFocusWithin(true);
      onSyntheticFocus(event);
    }
  };

  const focusWithinProps: Accessor<FocusWithinElementProps> = createMemo(() => ({
    onFocus,
    onBlur,
  }));

  return { focusWithinProps };
}
