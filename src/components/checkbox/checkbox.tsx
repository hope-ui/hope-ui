import { createContext, createUniqueId, JSX, splitProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { SystemStyleObject } from "@/styled-system/types";
import { useComponentStyleConfigs } from "@/theme/provider";
import { visuallyHiddenStyles } from "@/theme/utils";
import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";
import { callAllHandlers, callHandler } from "@/utils/function";

import { hope } from "../factory";
import { useFormControlContext } from "../form-control/form-control";
import { useFormControl } from "../form-control/use-form-control";
import { ElementType, HTMLHopeProps } from "../types";
import { checkboxContainerStyles, CheckboxControlVariants } from "./checkbox.styles";
import { useCheckboxGroupContext } from "./checkbox-group";

export type ThemeableCheckboxOptions = CheckboxControlVariants;

interface CheckboxOptions extends ThemeableCheckboxOptions {
  /**
   * The ref to be passed to the internal <input> tag.
   */
  ref?: HTMLInputElement | ((el: HTMLInputElement) => void);

  /**
   * The id to be passed to the internal <input> tag.
   */
  id?: string;

  /**
   * The name to be passed to the internal <input> tag.
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
   * The children of the switch.
   */
  children?: JSX.Element | ((props: { checked: boolean }) => JSX.Element);

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

export type CheckboxProps<C extends ElementType = "label"> = HTMLHopeProps<C, CheckboxOptions>;

interface CheckboxContextState extends Required<CheckboxControlVariants> {
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

const hopeCheckboxClass = "hope-checkbox";
const hopeCheckboxInputClass = "hope-checkbox__input";

/**
 * The component that provides context for all part of a `checkbox`.
 * It act as a container and renders a `label` with a visualy hidden `input[type=checkbox]`.
 */
export function Checkbox<C extends ElementType = "label">(props: CheckboxProps<C>) {
  const defaultId = `hope-checkbox-${createUniqueId()}`;

  const theme = useComponentStyleConfigs().Checkbox;

  const formControlContext = useFormControlContext();
  const checkboxGroupContext = useCheckboxGroupContext();

  const formControlProps = useFormControl<HTMLInputElement>(props);

  const [state, setState] = createStore<CheckboxContextState>({
    // eslint-disable-next-line solid/reactivity
    _checked: !!props.defaultChecked,
    isFocused: false,
    get isControlled() {
      return props.checked !== undefined;
    },
    get checked() {
      if (checkboxGroupContext) {
        const checkboxGroupValue = checkboxGroupContext.state.value;
        return checkboxGroupValue != null ? checkboxGroupValue.some(val => String(props.value) === String(val)) : false;
      }

      // Not in CheckboxGroup
      return this.isControlled ? !!props.checked : this._checked;
    },
    get variant() {
      return props.variant ?? checkboxGroupContext?.state?.variant ?? theme?.defaultProps?.root?.variant ?? "outline";
    },
    get colorScheme() {
      return (
        props.colorScheme ??
        checkboxGroupContext?.state?.colorScheme ??
        theme?.defaultProps?.root?.colorScheme ??
        "primary"
      );
    },
    get size() {
      return props.size ?? checkboxGroupContext?.state?.size ?? theme?.defaultProps?.root?.size ?? "md";
    },
    get id() {
      if (formControlContext && !checkboxGroupContext) {
        return formControlProps.id;
      }

      return props.id ?? defaultId;
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
      return this.isFocused ? "" : undefined;
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [local, _, others] = splitProps(
    props as CheckboxProps<"label">,
    ["class", "children", "ref", "tabIndex", "onChange"],
    [
      "variant",
      "colorScheme",
      "size",
      "id",
      "name",
      "value",
      "indeterminate",
      "checked",
      "defaultChecked",
      "required",
      "disabled",
      "invalid",
      "readOnly",
      "onFocus",
      "onBlur",
    ]
  );

  const onChange: JSX.EventHandlerUnion<HTMLInputElement, Event> = event => {
    if (state.readOnly || state.disabled) {
      event.preventDefault();
      return;
    }

    if (!state.isControlled) {
      const target = event.target as HTMLInputElement;
      setState("_checked", target.checked);
    }

    callAllHandlers(checkboxGroupContext?.onChange, local.onChange)(event);
  };

  const onFocus: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent> = event => {
    setState("isFocused", true);
    callHandler(formControlProps.onFocus)(event);
  };

  const onBlur: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent> = event => {
    setState("isFocused", false);
    callHandler(formControlProps.onBlur)(event);
  };

  const containerClasses = () => {
    return classNames(local.class, hopeCheckboxClass, checkboxContainerStyles({ size: state.size }));
  };

  const inputClasses = () => classNames(hopeCheckboxInputClass, visuallyHiddenStyles());

  const context: CheckboxContextValue = {
    state,
    onChange,
    onFocus,
    onBlur,
  };

  return (
    <CheckboxContext.Provider value={context}>
      <hope.label
        class={containerClasses()}
        __baseStyle={theme?.baseStyle?.root}
        for={state.id}
        data-group
        data-indeterminate={state["data-indeterminate"]}
        data-focus={state["data-focus"]}
        data-checked={state["data-checked"]}
        data-required={state["data-required"]}
        data-disabled={state["data-disabled"]}
        data-invalid={state["data-invalid"]}
        data-readonly={state["data-readonly"]}
        {...others}
      >
        <input
          type="checkbox"
          class={inputClasses()}
          ref={local.ref}
          tabIndex={local.tabIndex}
          value={state.value}
          id={state.id}
          name={state.name}
          checked={state.checked}
          required={state.required}
          disabled={state.disabled}
          readOnly={state.readOnly}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          aria-required={state["aria-required"]}
          aria-disabled={state["aria-disabled"]}
          aria-invalid={state["aria-invalid"]}
          aria-readonly={state["aria-readonly"]}
          aria-label={state["aria-label"]}
          aria-labelledby={state["aria-labelledby"]}
          aria-describedby={state["aria-describedby"]}
        />
        {isFunction(local.children) ? local.children({ checked: state.checked }) : local.children}
      </hope.label>
    </CheckboxContext.Provider>
  );
}

Checkbox.toString = () => createClassSelector(hopeCheckboxClass);

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

interface CheckboxContextValue extends Required<Pick<CheckboxOptions, "onChange" | "onFocus" | "onBlur">> {
  state: CheckboxContextState;
}

const CheckboxContext = createContext<CheckboxContextValue>();

export function useCheckboxContext() {
  const context = useContext(CheckboxContext);

  if (!context) {
    throw new Error("[Hope UI]: useCheckboxContext must be used within a `<Checkbox />` component");
  }

  return context;
}

/* -------------------------------------------------------------------------------------------------
 * StyleConfig
 * -----------------------------------------------------------------------------------------------*/

export interface CheckboxStyleConfig {
  baseStyle?: {
    root?: SystemStyleObject;
    group?: SystemStyleObject;
    control?: SystemStyleObject;
    label?: SystemStyleObject;
  };
  defaultProps?: {
    root?: ThemeableCheckboxOptions;
    group?: ThemeableCheckboxOptions;
  };
}
