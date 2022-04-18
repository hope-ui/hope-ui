import { Accessor, createMemo, createSignal, onMount } from "solid-js";

import {
  createFocus,
  createKeyboard,
  FocusElementProps,
  keyboardElementProps,
} from "../interactions";
import { FocusableDOMProps, FocusableProps } from "../types";
import { combineProps } from "../utils";

export interface CreateFocusableProps extends FocusableProps, FocusableDOMProps {
  /**
   * Whether focus should be disabled.
   */
  isDisabled?: boolean;
}

export type FocusableElementProps = FocusElementProps &
  keyboardElementProps & { tabIndex?: number };

export interface FocusableResult {
  /**
   * Props to spread onto the target element.
   */
  focusableProps: Accessor<FocusableElementProps>;
}

// TODO: add all the focus provider stuff when needed

/**
 * Used to make an element focusable and capable of auto focus.
 */
export function createFocusable(props: CreateFocusableProps, ref?: HTMLElement): FocusableResult {
  const [autoFocus, setAutoFocus] = createSignal(!!props.autoFocus);

  const { focusProps } = createFocus(props);
  const { keyboardProps } = createKeyboard(props);

  // const interactionProps = createMemo(() => {
  //   return props.isDisabled ? {} : useFocusableContext(ref);
  // });

  const focusableProps: Accessor<FocusableElementProps> = createMemo(() => {
    return combineProps(
      focusProps(),
      keyboardProps(),
      {
        tabIndex: props.excludeFromTabOrder && !props.isDisabled ? -1 : undefined,
      }
      // interactionProps()
    );
  });

  onMount(() => {
    autoFocus() && ref?.focus();
    setAutoFocus(false);
  });

  return { focusableProps };
}
