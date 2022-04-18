import { access, MaybeAccessor } from "@solid-primitives/utils";
import { Accessor, createMemo } from "solid-js";

import { FocusEvents } from "../types";

export interface CreateFocusProps extends FocusEvents {
  /**
   * Whether the focus events should be disabled.
   */
  isDisabled?: MaybeAccessor<boolean | undefined>;
}

export interface FocusElementProps {
  /**
   * Handler that is called when the element receives focus.
   */
  onFocus: FocusEvents["onFocus"];

  /**
   * Handler that is called when the element loses focus.
   */
  onBlur: FocusEvents["onBlur"];
}

export interface FocusResult {
  /**
   * Props to spread onto the target element.
   */
  focusProps: Accessor<FocusElementProps>;
}

/**
 * Handles focus events.
 */
export function createFocus(props: CreateFocusProps): FocusResult {
  const onFocus: CreateFocusProps["onFocus"] = event => {
    if (access(props.isDisabled)) {
      return;
    }

    props.onFocus?.(event);
    props.onFocusChange?.(true);
  };

  const onBlur: CreateFocusProps["onBlur"] = event => {
    if (access(props.isDisabled)) {
      return;
    }

    props.onBlur?.(event);
    props.onFocusChange?.(false);
  };

  const focusProps: Accessor<FocusElementProps> = createMemo(() => ({
    onFocus,
    onBlur,
  }));

  return { focusProps };
}
