import { Accessor, JSX } from "solid-js";

import { callAllHandlers } from "@/utils/function";

import { FormControlOptions, useFormControlContext } from "./form-control";

export interface UseFormControlProps<T extends HTMLElement> extends FormControlOptions {
  onFocus?: JSX.EventHandlerUnion<T, FocusEvent>;
  onBlur?: JSX.EventHandlerUnion<T, FocusEvent>;
  "aria-describedby"?: string;
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

export interface FormControlProps<T extends HTMLElement> {
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
export function useFormControl<T extends HTMLElement>(props: UseFormControlProps<T>): Accessor<FormControlProps<T>> {
  const formControl = useFormControlContext();

  const id = () => props.id ?? formControl?.state.id;
  const required = () => props.required ?? formControl?.state.required;
  const disabled = () => props.disabled ?? formControl?.state.disabled;
  const invalid = () => props.invalid ?? formControl?.state.invalid;
  const readOnly = () => props.readOnly ?? formControl?.state.readOnly;
  const ariaDescribedBy = () => {
    const labelIds: string[] = props["aria-describedby"] ? [props["aria-describedby"]] : [];

    // Error message must be described first in all scenarios.
    if (formControl?.state.hasErrorMessage && formControl?.state.invalid) {
      labelIds.push(formControl.state.errorMessageId);
    }

    if (formControl?.state.hasHelperText) {
      labelIds.push(formControl.state.helperTextId);
    }

    return labelIds.join(" ") || undefined;
  };

  return () => ({
    id: id(),
    required: required(),
    disabled: disabled(),
    readOnly: readOnly(),
    "aria-invalid": invalid() ? true : undefined,
    "aria-required": required() ? true : undefined,
    "aria-readonly": readOnly() ? true : undefined,
    "aria-describedby": ariaDescribedBy(),
    onFocus: callAllHandlers(formControl?.onFocus, props.onFocus),
    onBlur: callAllHandlers(formControl?.onBlur, props.onBlur),
  });
}
