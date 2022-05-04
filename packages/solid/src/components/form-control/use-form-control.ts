import { createMemo, JSX } from "solid-js";
import { createStore } from "solid-js/store";

import { chainHandlers } from "../../utils/function";
import { FormControlOptions, useFormControlContext } from "./form-control";

export interface UseFormControlProps<T extends HTMLElement> extends FormControlOptions {
  "aria-describedby"?: string;
  onFocus?: JSX.EventHandlerUnion<T, FocusEvent>;
  onBlur?: JSX.EventHandlerUnion<T, FocusEvent>;
}

export interface UseFormControlReturn<T extends HTMLElement> {
  id?: string;
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  "aria-required"?: boolean;
  "aria-disabled"?: boolean;
  "aria-invalid"?: boolean;
  "aria-readonly"?: boolean;
  "aria-describedby"?: string;
  onFocus?: JSX.EventHandlerUnion<T, FocusEvent>;
  onBlur?: JSX.EventHandlerUnion<T, FocusEvent>;
}

/**
 * Hook that provides the props that should be spread on to
 * input fields (`input`, `select`, `textarea`, etc.).
 *
 * It provides a convenient way to control a form fields, validation
 * and helper text.
 *
 * @internal
 */
export function useFormControl<T extends HTMLElement>(
  props: UseFormControlProps<T>
): UseFormControlReturn<T> {
  const formControl = useFormControlContext();

  const focusHandler = createMemo(() => {
    return chainHandlers(formControl?.onFocus, props.onFocus);
  });

  const blurHandler = createMemo(() => {
    return chainHandlers(formControl?.onBlur, props.onBlur);
  });

  const [state] = createStore<UseFormControlReturn<T>>({
    get id() {
      return props.id ?? formControl?.state.id;
    },
    get required() {
      return props.required ?? formControl?.state.required;
    },
    get disabled() {
      return props.disabled ?? formControl?.state.disabled;
    },
    get invalid() {
      return props.invalid ?? formControl?.state.invalid;
    },
    get readOnly() {
      return props.readOnly ?? formControl?.state.readOnly;
    },
    get ["aria-required"]() {
      return this.required ? true : undefined;
    },
    get ["aria-disabled"]() {
      return this.disabled ? true : undefined;
    },
    get ["aria-invalid"]() {
      return this.invalid ? true : undefined;
    },
    get ["aria-readonly"]() {
      return this.readOnly ? true : undefined;
    },
    get ["aria-describedby"]() {
      const labelIds: string[] = props["aria-describedby"] ? [props["aria-describedby"]] : [];

      // Error message must be described first in all scenarios.
      if (formControl?.state.hasErrorMessage && formControl?.state.invalid) {
        labelIds.push(formControl.state.errorMessageId);
      }

      if (formControl?.state.hasHelperText) {
        labelIds.push(formControl.state.helperTextId);
      }

      return labelIds.join(" ") || undefined;
    },
    get onFocus() {
      return focusHandler;
    },
    get onBlur() {
      return blurHandler;
    },
  });

  return state as UseFormControlReturn<T>;
}
