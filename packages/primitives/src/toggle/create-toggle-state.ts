import { Accessor } from "solid-js";

import { ToggleProps } from "../types";
import { createControllableBooleanSignal } from "../utils";

export interface ToggleState {
  /**
   * Whether the toggle is selected.
   */
  isSelected: Accessor<boolean>;

  /**
   *  Updates selection state.
   */
  setSelected: (isSelected: boolean) => void;

  /**
   * Toggle the selection state.
   */
  toggle: () => void;
}

/**
 * Provides state management for toggle components like checkboxes and switches.
 */
export function createToggleState(props: ToggleProps = {}): ToggleState {
  const [isSelected, setSelected] = createControllableBooleanSignal({
    value: () => props.isSelected,
    defaultValue: () => !!props.defaultSelected,
    onChange: props.onChange,
  });

  const updateSelected = (value: boolean) => {
    if (!props.isReadOnly) {
      setSelected(value);
    }
  };

  const toggleState = () => {
    if (!props.isReadOnly) {
      setSelected(!isSelected());
    }
  };

  return {
    isSelected,
    setSelected: updateSelected,
    toggle: toggleState,
  };
}
