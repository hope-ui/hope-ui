import { access, MaybeAccessor } from "@solid-primitives/utils";
import { Accessor, createMemo, JSX, mergeProps, splitProps } from "solid-js";

import { createFocusable } from "../focus";
import { createPress } from "../interactions";
import { AriaToggleProps } from "../types";
import { combineProps, filterDOMProps } from "../utils";
import { ToggleState } from "./create-toggle-state";

export interface ToggleResult {
  /**
   * Props to be spread on the input element.
   */
  inputProps: Accessor<JSX.InputHTMLAttributes<HTMLInputElement>>;
}

/**
 * Handles interactions for toggle elements, e.g. Checkboxes and Switches.
 */
export function createToggle(
  props: AriaToggleProps,
  state: ToggleState,
  ref: MaybeAccessor<HTMLElement>
): ToggleResult {
  const defaultProps: AriaToggleProps = {
    isDisabled: false,
    validationState: "valid",
  };

  const propsWithDefault = mergeProps(defaultProps, props);
  const [local] = splitProps(propsWithDefault, [
    "isDisabled",
    "isRequired",
    "isReadOnly",
    "value",
    "name",
    "id",
    "aria-label",
    "aria-labelledby",
    "aria-describedby",
    "aria-details",
    "aria-errormessage",
    "aria-controls",
    "validationState",
  ]);

  const onChange: JSX.EventHandlerUnion<HTMLInputElement, Event> = event => {
    // since we spread props on label, onChange will end up there as well as in here.
    // so we have to stop propagation at the lowest level that we care about
    event.stopPropagation();
    state.setSelected((event.target as HTMLInputElement).checked);
  };

  const { pressProps } = createPress(props);

  const { focusableProps } = createFocusable(props, ref);
  const domProps = filterDOMProps(props, { labelable: true });

  const inputProps = createMemo(() => {
    return combineProps(
      domProps,
      {
        "aria-label": access(local["aria-label"]),
        "aria-labelledby": access(local["aria-labelledby"]),
        "aria-describedby": access(local["aria-describedby"]),
        "aria-details": access(local["aria-details"]),
        "aria-invalid": access(local.validationState) === "invalid" || undefined,
        "aria-errormessage": access(local["aria-errormessage"]),
        "aria-controls": access(local["aria-controls"]),
        "aria-readonly": access(local.isReadOnly) || undefined,
        "aria-required": access(local.isRequired) || undefined,
        disabled: access(local.isDisabled),
        value: access(local.value),
        name: access(local.name),
        id: access(local.id),
        type: "checkbox",
        onChange,
      },
      pressProps,
      focusableProps
    );
  });

  return { inputProps };
}
