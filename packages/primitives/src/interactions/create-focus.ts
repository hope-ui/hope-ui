import { access, MaybeAccessor } from "@solid-primitives/utils";
import { Accessor, createMemo } from "solid-js";

import { FocusEvents } from "../types";
import { createSyntheticBlurEvent } from "./utils";

interface CreateFocusProps extends FocusEvents {
  /**
   * Whether the focus events should be disabled.
   */
  isDisabled?: MaybeAccessor<boolean | undefined>;
}

interface FocusProps {
  /**
   * Handler that is called when the element receives focus.
   */
  onFocus: FocusEvents["onFocus"];

  /**
   * Handler that is called when the element loses focus.
   */
  onBlur: FocusEvents["onBlur"];
}

interface FocusResult {
  /**
   * Props to spread onto the target element.
   */
  focusProps: Accessor<FocusProps>;
}

/**
 * Handles focus events for the immediate target.
 * Focus events on child elements will be ignored.
 */
export function createFocus(props: CreateFocusProps): FocusResult {
  const onBlur: CreateFocusProps["onBlur"] = event => {
    const isDisabled = access(props.isDisabled);

    if (
      !isDisabled &&
      (props.onBlur || props.onFocusChange) &&
      event.target === event.currentTarget
    ) {
      props.onBlur?.(event);
      props.onFocusChange?.(false);
      return true;
    }
  };

  const onSyntheticFocus = createSyntheticBlurEvent(onBlur);

  const onFocus: CreateFocusProps["onFocus"] = event => {
    const isDisabled = access(props.isDisabled);

    if (
      !isDisabled &&
      (props.onFocus || props.onFocusChange || props.onBlur) &&
      event.target === event.currentTarget
    ) {
      props.onFocus?.(event);
      props.onFocusChange?.(true);
      onSyntheticFocus(event);
    }
  };

  const focusProps: Accessor<FocusProps> = createMemo(() => ({
    onFocus,
    onBlur,
  }));

  return { focusProps };
}
