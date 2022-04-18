import { access, MaybeAccessor } from "@solid-primitives/utils";
import { Accessor, createMemo } from "solid-js";

import { KeyboardEvents } from "../types";

export interface CreateKeyboardProps extends KeyboardEvents {
  /**
   * Whether the keyboard events should be disabled.
   */
  isDisabled?: MaybeAccessor<boolean | undefined>;
}

export interface keyboardElementProps {
  /**
   * Handler that is called when a key is pressed.
   */
  onKeyDown?: KeyboardEvents["onKeyDown"];

  /**
   * Handler that is called when a key is released.
   */
  onKeyUp?: KeyboardEvents["onKeyUp"];
}

export interface KeyboardResult {
  /**
   * Props to spread onto the target element.
   */
  keyboardProps: Accessor<keyboardElementProps>;
}

/**
 * Handles keyboard interactions for a focusable element.
 */
export function createKeyboard(props: CreateKeyboardProps): KeyboardResult {
  const keyboardProps: Accessor<keyboardElementProps> = createMemo(() => {
    if (access(props.isDisabled)) {
      return {};
    }

    return {
      onKeyDown: props.onKeyDown,
      onKeyUp: props.onKeyUp,
    };
  });

  return { keyboardProps };
}
