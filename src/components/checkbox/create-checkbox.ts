import { createUniqueId, JSX } from "solid-js";
import { createStore } from "solid-js/store";

import { callAllHandlers, callHandler } from "@/utils/function";

import { useFormControl } from "../form-control/use-form-control";
import { useCheckboxGroupContext } from "./checkbox-group";

interface CreateCheckboxProps {
  /**
   * The ref to be passed to the internal <input> tag.
   */
  ref?: HTMLInputElement | ((el: HTMLInputElement) => void);

  /**
   * The id of the input field in a checkbox.
   */
  id?: string;

  /**
   * The name of the internal <input> tag.
   */
  name?: string;

  /**
   * The value to be used in the checkbox input.
   * This is the value that will be returned on form submission.
   */
  value?: string | number;

  /**
   * If `true`, the checkbox will be checked.
   * You'll need to pass `onChange` to update its value (since it is now controlled)
   */
  checked?: boolean;

  /**
   * If `true`, the checkbox will be initially checked.
   */
  defaultChecked?: boolean;

  /**
   * If `true`, the checkbox will be indeterminate.
   * This only affects the icon shown inside checkbox
   * and does not modify the checked property.
   */
  indeterminate?: boolean;

  /**
   * If `true`, the checkbox input is marked as required,
   * and `required` attribute will be added
   */
  required?: boolean;

  /**
   * If `true`, the checkbox will be disabled
   */
  disabled?: boolean;

  /**
   * If `true`, the input will have `aria-invalid` set to `true`
   */
  invalid?: boolean;

  /**
   * If `true`, the checkbox will be readonly
   */
  readOnly?: boolean;

  /**
   * Defines the string that labels the checkbox element.
   */
  "aria-label"?: string;

  /**
   * Refers to the `id` of the element that labels the checkbox element.
   */
  "aria-labelledby"?: string;

  /**
   * Refers to the `id` of the element that describes the checkbox element.
   */
  "aria-describedby"?: string;

  /**
   * The callback invoked when the checked state of the checkbox changes.
   */
  onChange?: JSX.EventHandlerUnion<HTMLInputElement, Event>;

  /**
   * The callback invoked when the checkbox is focused
   */
  onFocus?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;

  /**
   * The callback invoked when the checkbox is blurred (loses focus)
   */
  onBlur?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
}

interface CheckboxState {
  /**
   * The `checked` state of the checkbox.
   * (In uncontrolled mode)
   */
  _checked: boolean;

  /**
   * If `true`, the checkbox is in controlled mode.
   * (have checked and onChange props)
   */
  isControlled: boolean;

  /**
   * If `true`, the checkbox is currently focused.
   */
  isFocused: boolean;

  /**
   * The `checked` state of the checkbox.
   * (In controlled mode)
   */
  checked: boolean;

  /**
   * The value to be used in the checkbox input.
   * This is the value that will be returned on form submission.
   */
  value?: string | number;

  /**
   * The id of the input field in a checkbox.
   */
  id?: string;

  /**
   * The name of the input field in a checkbox.
   */
  name?: string;

  /**
   * If `true`, the checkbox input is marked as required,
   * and `required` attribute will be added
   */
  required?: boolean;

  /**
   * If `true`, the checkbox will be indeterminate.
   * This only affects the icon shown inside checkbox
   * and does not modify the checked property.
   */
  indeterminate?: boolean;

  /**
   * If `true`, the checkbox will be disabled
   */
  disabled?: boolean;

  /**
   * If `true`, the input will have `aria-invalid` set to `true`
   */
  invalid?: boolean;

  /**
   * If `true`, the checkbox will be readonly
   */
  readOnly?: boolean;

  "aria-required"?: boolean;
  "aria-disabled"?: boolean;
  "aria-invalid"?: boolean;
  "aria-readonly"?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;

  "data-indeterminate"?: string;
  "data-focus"?: string;
  "data-checked"?: string;
  "data-required"?: string;
  "data-disabled"?: string;
  "data-invalid"?: string;
  "data-readonly"?: string;
}

/**
 * createCheckbox provides all the state and focus management logic
 * for a checkbox. It is consumed by the `Checkbox` component
 */
export function createCheckbox(props: CreateCheckboxProps) {
  const defaultId = `hope-checkbox-${createUniqueId()}`;

  const checkboxGroupContext = useCheckboxGroupContext();

  const formControlProps = useFormControl<HTMLInputElement>(props);

  const [state, setState] = createStore<CheckboxState>({
    // eslint-disable-next-line solid/reactivity
    _checked: !!props.defaultChecked,
    isFocused: false,
    get isControlled() {
      return props.checked !== undefined;
    },
    get checked() {
      if (checkboxGroupContext) {
        const checkboxGroupValue = checkboxGroupContext.state.value;
        return checkboxGroupValue != null
          ? checkboxGroupValue.some(val => String(props.value) === String(val))
          : undefined;
      }

      // Not in CheckboxGroup
      return this.isControlled ? !!props.checked : this._checked;
    },
    get id() {
      return formControlProps.id ?? defaultId;
    },
    get name() {
      return props.name ?? checkboxGroupContext?.state.name;
    },
    get value() {
      return props.value;
    },
    get indeterminate() {
      return props.indeterminate;
    },
    get required() {
      return formControlProps.required ?? checkboxGroupContext?.state.required;
    },
    get disabled() {
      return formControlProps.disabled ?? checkboxGroupContext?.state.disabled;
    },
    get invalid() {
      return formControlProps.invalid ?? checkboxGroupContext?.state.invalid;
    },
    get readOnly() {
      return formControlProps.readOnly ?? checkboxGroupContext?.state.readOnly;
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
    get ["aria-label"]() {
      return props["aria-label"];
    },
    get ["aria-labelledby"]() {
      return props["aria-labelledby"];
    },
    get ["aria-describedby"]() {
      return props["aria-describedby"];
    },
    get ["data-indeterminate"]() {
      return this.indeterminate ? "" : undefined;
    },
    get ["data-focus"]() {
      return this.focused ? "" : undefined;
    },
    get ["data-checked"]() {
      return this.checked ? "" : undefined;
    },
    get ["data-required"]() {
      return this.required ? "" : undefined;
    },
    get ["data-disabled"]() {
      return this.disabled ? "" : undefined;
    },
    get ["data-invalid"]() {
      return this.invalid ? "" : undefined;
    },
    get ["data-readonly"]() {
      return this.readOnly ? "" : undefined;
    },
  });

  const onChange: JSX.EventHandlerUnion<HTMLInputElement, Event> = event => {
    if (state.readOnly || state.disabled) {
      event.preventDefault();
      return;
    }

    if (!state.isControlled) {
      const target = event.target as HTMLInputElement;
      setState("_checked", target.checked);
    }

    callHandler(props.onChange)(event);
  };

  const onFocus: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent> = event => {
    setState("isFocused", true);
    callHandler(formControlProps.onFocus)(event);
  };

  const onBlur: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent> = event => {
    setState("isFocused", false);
    callHandler(formControlProps.onBlur)(event);
  };

  return {
    state: state as CheckboxState,
    onChange,
    onFocus,
    onBlur,
  };
}
