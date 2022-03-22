import { createContext, createUniqueId, JSX, splitProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { SystemStyleObject } from "@/styled-system/types";
import { useComponentStyleConfigs } from "@/theme/provider";
import { visuallyHiddenStyles } from "@/theme/utils";
import { classNames, createClassSelector } from "@/utils/css";
import { callAllHandlers, callHandler } from "@/utils/function";

import { hope } from "../factory";
import { useFormControl, useFormControlPropNames } from "../form-control/use-form-control";
import { ElementType, HTMLHopeProps } from "../types";
import { radioContainerStyles, RadioIndicatorVariants } from "./radio.styles";
import { useRadioGroupContext } from "./radio-group";

export type ThemeableRadioOptions = RadioIndicatorVariants;

interface RadioOptions extends ThemeableRadioOptions {
  /**
   * The ref to be passed to the internal <input> tag.
   */
  ref?: HTMLInputElement | ((el: HTMLInputElement) => void);

  /**
   * The name of the input field in a radio
   * (Useful for form submission).
   */
  name?: string;

  /**
   * The value to be used in the radio input.
   * This is the value that will be returned on form submission.
   */
  value?: string | number;

  /**
   * If `true`, the radio will be checked.
   * You'll need to pass `onChange` to update its value (since it is now controlled)
   */
  checked?: boolean;

  /**
   * If `true`, the radio will be initially checked.
   */
  defaultChecked?: boolean;

  /**
   * If `true`, the radio input is marked as required,
   * and `required` attribute will be added
   */
  required?: boolean;

  /**
   * If `true`, the radio will be disabled
   */
  disabled?: boolean;

  /**
   * If `true`, the input will have `aria-invalid` set to `true`
   */
  invalid?: boolean;

  /**
   * If `true`, the radio will be readonly
   */
  readOnly?: boolean;

  /**
   * The callback invoked when the checked state of the `Radio` changes.
   */
  onChange?: JSX.EventHandlerUnion<HTMLInputElement, Event>;

  /**
   * The callback invoked when the radio is focused
   */
  onFocus?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;

  /**
   * The callback invoked when the radio is blurred (loses focus)
   */
  onBlur?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
}

export type RadioProps<C extends ElementType = "label"> = HTMLHopeProps<C, RadioOptions>;

export interface RadioStyleConfig {
  baseStyle?: {
    root?: SystemStyleObject;
    group?: SystemStyleObject;
    indicator?: SystemStyleObject;
    label?: SystemStyleObject;
  };
  defaultProps?: {
    root?: ThemeableRadioOptions;
    group?: ThemeableRadioOptions;
  };
}

interface RadioContextState extends Required<RadioIndicatorVariants> {
  _checked: boolean;
  checked: boolean;
  focused: boolean;
  isControlled: boolean;

  id: string;
  name: string;
  value?: string | number;
  required?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  readOnly?: boolean;

  ariaAttrs: {
    "aria-required"?: boolean;
    "aria-disabled"?: boolean;
    "aria-invalid"?: boolean;
    "aria-readonly"?: boolean;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-describedby"?: string;
  };

  dataAttrs: {
    "data-focus"?: string;
    "data-checked"?: string;
    "data-required"?: string;
    "data-disabled"?: string;
    "data-invalid"?: string;
    "data-readonly"?: string;
  };
}

interface RadioContextValue {
  state: RadioContextState;

  onChange: JSX.EventHandlerUnion<HTMLInputElement, Event>;
  onFocus?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
  onBlur?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
}

const RadioContext = createContext<RadioContextValue>();

const hopeRadioClass = "hope-radio";
const hopeRadioInputClass = "hope-radio__input";

export function Radio<C extends ElementType = "label">(props: RadioProps<C>) {
  const defaultId = `hope-radio-${createUniqueId()}`;
  const defaultName = `${defaultId}-name`;

  const theme = useComponentStyleConfigs().Radio;

  const radioGroupContext = useRadioGroupContext();

  const [useFormControlProps] = splitProps(props as RadioProps<"label">, useFormControlPropNames);
  const formControlProps = useFormControl<HTMLInputElement>(useFormControlProps);

  const [state, setState] = createStore<RadioContextState>({
    // Internal state for uncontrolled radio.
    // eslint-disable-next-line solid/reactivity
    _checked: !!props.defaultChecked,
    focused: false,
    get isControlled() {
      return props.checked !== undefined;
    },
    get checked() {
      if (radioGroupContext) {
        const radioGroupValue = radioGroupContext.state.value;
        return radioGroupValue != null ? props.value === radioGroupValue : false;
      }

      // Not in a RadioGroup
      return this.isControlled ? !!props.checked : this.internalChecked;
    },
    get variant() {
      return props.variant ?? radioGroupContext?.state?.variant ?? theme?.defaultProps?.root?.variant ?? "outline";
    },
    get colorScheme() {
      return (
        props.colorScheme ??
        radioGroupContext?.state?.colorScheme ??
        theme?.defaultProps?.root?.colorScheme ??
        "primary"
      );
    },
    get size() {
      return props.size ?? radioGroupContext?.state?.size ?? theme?.defaultProps?.root?.size ?? "md";
    },
    get id() {
      return formControlProps.id ?? defaultId;
    },
    get name() {
      return props.name ?? radioGroupContext?.state.name ?? defaultName;
    },
    get value() {
      return props.value;
    },
    get required() {
      return formControlProps.required ?? radioGroupContext?.state.required;
    },
    get disabled() {
      return formControlProps.disabled ?? radioGroupContext?.state.disabled;
    },
    get invalid() {
      return formControlProps.invalid ?? radioGroupContext?.state.invalid;
    },
    get readOnly() {
      return formControlProps.readOnly ?? radioGroupContext?.state.readOnly;
    },
    get ariaAttrs() {
      return {
        "aria-required": this.required ? true : undefined,
        "aria-disabled": this.disabled ? true : undefined,
        "aria-invalid": this.invalid ? true : undefined,
        "aria-readonly": this.readOnly ? true : undefined,
        "aria-label": props["aria-label"],
        "aria-labelledby": props["aria-labelledby"],
        "aria-describedby": props["aria-describedby"],
      };
    },
    get dataAttrs() {
      return {
        "data-focus": this.focused ? "" : undefined,
        "data-checked": this.checked ? "" : undefined,
        "data-required": this.required ? "" : undefined,
        "data-disabled": this.disabled ? "" : undefined,
        "data-invalid": this.invalid ? "" : undefined,
        "data-readonly": this.readOnly ? "" : undefined,
      };
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [local, _, others] = splitProps(
    props as RadioProps<"label">,
    ["class", "children", "ref", "tabIndex", "disabled", "readOnly", "onChange"],
    [
      "variant",
      "colorScheme",
      "size",
      "id",
      "name",
      "value",
      "checked",
      "defaultChecked",
      "required",
      "invalid",
      "readOnly",
      "onFocus",
      "onBlur",
    ]
  );

  const onChange: JSX.EventHandlerUnion<HTMLInputElement, Event> = event => {
    if (local.readOnly || local.disabled) {
      event.preventDefault();
      return;
    }

    if (!state.isControlled) {
      const target = event.target as HTMLInputElement;
      setState("_checked", target.checked);
    }

    callAllHandlers(radioGroupContext?.onChange, local.onChange)(event);
  };

  const onFocus: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent> = event => {
    setState("focused", true);
    callHandler(formControlProps.onFocus)(event);
  };

  const onBlur: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent> = event => {
    setState("focused", false);
    callHandler(formControlProps.onBlur)(event);
  };

  const containerClasses = () => {
    return classNames(local.class, hopeRadioClass, radioContainerStyles({ size: state.size }));
  };

  const inputClasses = () => classNames(hopeRadioInputClass, visuallyHiddenStyles());

  const context: RadioContextValue = {
    state,
    onChange,
    onFocus,
    onBlur,
  };

  return (
    <RadioContext.Provider value={context}>
      <hope.label
        class={containerClasses()}
        __baseStyle={theme?.baseStyle?.root}
        data-focus={state.dataAttrs["data-focus"]}
        data-checked={state.dataAttrs["data-checked"]}
        data-required={state.dataAttrs["data-required"]}
        data-disabled={state.dataAttrs["data-disabled"]}
        data-invalid={state.dataAttrs["data-invalid"]}
        data-readonly={state.dataAttrs["data-readonly"]}
        {...others}
      >
        {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
        <input
          type="radio"
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
          aria-required={state.ariaAttrs["aria-required"]}
          aria-disabled={state.ariaAttrs["aria-disabled"]}
          aria-invalid={state.ariaAttrs["aria-invalid"]}
          aria-readonly={state.ariaAttrs["aria-readonly"]}
          aria-label={state.ariaAttrs["aria-label"]}
          aria-labelledby={state.ariaAttrs["aria-labelledby"]}
          aria-describedby={state.ariaAttrs["aria-describedby"]}
        />
        {local.children}
      </hope.label>
    </RadioContext.Provider>
  );
}

Radio.toString = () => createClassSelector(hopeRadioClass);

export function useRadioContext() {
  const context = useContext(RadioContext);

  if (!context) {
    throw new Error("[Hope UI]: useRadioContext must be used within a `<Radio />` component");
  }

  return context;
}
