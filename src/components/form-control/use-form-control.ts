import { JSX } from "solid-js";
import { createStore } from "solid-js/store";

import { callAllHandlers } from "@/utils/function";

import { FormControlOptions, useFormControlContext } from "./form-control";

export interface UseFormControlProps<T extends HTMLElement> extends FormControlOptions {
  "aria-describedby"?: string;
  onFocus?: JSX.EventHandlerUnion<T, FocusEvent>;
  onBlur?: JSX.EventHandlerUnion<T, FocusEvent>;
}

/**
 * Array of commonly splited props by component that use `useFormControl`.
 */
export const useFormControlPropNames: Array<keyof UseFormControlProps<HTMLElement>> = [
  "id",
  "required",
  "disabled",
  "invalid",
  "readOnly",
  "aria-describedby",
  "onFocus",
  "onBlur",
];

export interface UseFormControlReturn<T extends HTMLElement> {
  id?: string;
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  readOnly?: boolean;
  "aria-invalid"?: boolean;
  "aria-required"?: boolean;
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
  // ): Accessor<UseFormControlReturn<T>> {
): UseFormControlReturn<T> {
  const formControl = useFormControlContext();

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
    get readOnly() {
      return props.readOnly ?? formControl?.state.readOnly;
    },
    get ["aria-required"]() {
      return this.required ? true : undefined;
    },
    get ["aria-invalid"]() {
      const invalid = props.invalid ?? formControl?.state.invalid;
      return invalid ? true : undefined;
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
      return callAllHandlers(formControl?.onFocus, props.onFocus);
    },
    get onBlur() {
      return callAllHandlers(formControl?.onBlur, props.onBlur);
    },
  });

  return state as UseFormControlReturn<T>;

  // const id = () => props.id ?? formControl?.state.id;
  // const required = () => props.required ?? formControl?.state.required;
  // const disabled = () => props.disabled ?? formControl?.state.disabled;
  // const invalid = () => props.invalid ?? formControl?.state.invalid;
  // const readOnly = () => props.readOnly ?? formControl?.state.readOnly;
  // const ariaDescribedBy = () => {
  //   const labelIds: string[] = props["aria-describedby"] ? [props["aria-describedby"]] : [];

  //   // Error message must be described first in all scenarios.
  //   if (formControl?.state.hasErrorMessage && formControl?.state.invalid) {
  //     labelIds.push(formControl.state.errorMessageId);
  //   }

  //   if (formControl?.state.hasHelperText) {
  //     labelIds.push(formControl.state.helperTextId);
  //   }

  //   return labelIds.join(" ") || undefined;
  // };

  // return () => ({
  //   id: id(),
  //   required: required(),
  //   disabled: disabled(),
  //   readOnly: readOnly(),
  //   "aria-required": required() ? true : undefined,
  //   "aria-invalid": invalid() ? true : undefined,
  //   "aria-readonly": readOnly() ? true : undefined,
  //   "aria-describedby": ariaDescribedBy(),
  //   onFocus: callAllHandlers(formControl?.onFocus, props.onFocus),
  //   onBlur: callAllHandlers(formControl?.onBlur, props.onBlur),
  // });
}
