import { createContext, createUniqueId, JSX, Show, splitProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { useStyleConfig } from "../../hope-provider";
import { SystemStyleObject } from "../../styled-system/types";
import { visuallyHiddenStyles } from "../../styled-system/utils";
import { classNames, createClassSelector } from "../../utils/css";
import { callHandler, chainHandlers } from "../../utils/function";
import { isChildrenFunction } from "../../utils/solid";
import { hope } from "../factory";
import { useFormControlContext } from "../form-control/form-control";
import { useFormControl } from "../form-control/use-form-control";
import { ElementType, HTMLHopeProps } from "../types";
import {
  radioControlStyles,
  RadioControlVariants,
  radioLabelStyles,
  radioWrapperStyles,
  RadioWrapperVariants,
} from "./radio.styles";
import { useRadioGroupContext } from "./radio-group";

type RadioChildrenRenderProp = (props: { checked: boolean }) => JSX.Element;

export type ThemeableRadioOptions = RadioWrapperVariants & RadioControlVariants;

interface RadioOptions extends ThemeableRadioOptions {
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
   * The children of the radio.
   */
  children?: JSX.Element | RadioChildrenRenderProp;

  /**
   * The callback invoked when the checked state of the radio changes.
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

interface RadioState extends Required<ThemeableRadioOptions> {
  /**
   * The `checked` state of the radio.
   * (In uncontrolled mode)
   */
  _checked: boolean;

  /**
   * If `true`, the radio is in controlled mode.
   * (have checked and onChange props)
   */
  isControlled: boolean;

  /**
   * If `true`, the radio is currently focused.
   */
  isFocused: boolean;

  /**
   * The `checked` state of the radio.
   * (In controlled mode)
   */
  checked: boolean;

  /**
   * The value to be used in the radio input.
   * This is the value that will be returned on form submission.
   */
  value?: string | number;

  /**
   * The id of the input field in a radio.
   */
  id?: string;

  /**
   * The name of the input field in a radio.
   */
  name?: string;

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

  "aria-required"?: boolean;
  "aria-disabled"?: boolean;
  "aria-invalid"?: boolean;
  "aria-readonly"?: boolean;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;

  "data-focus"?: string;
  "data-checked"?: string;
  "data-required"?: string;
  "data-disabled"?: string;
  "data-invalid"?: string;
  "data-readonly"?: string;
}

const hopeRadioClass = "hope-radio";
const hopeRadioInputClass = "hope-radio__input";
const hopeRadioControlClass = "hope-radio__control";
const hopeRadioLabelClass = "hope-radio__label";

/**
 * The component that provides context for all part of a `radio`.
 * It act as a container and renders a `label` with a visualy hidden `input[type=radio]`.
 */
export function Radio<C extends ElementType = "label">(props: RadioProps<C>) {
  const defaultId = `hope-radio-${createUniqueId()}`;

  const theme = useStyleConfig().Radio;

  const formControlContext = useFormControlContext();
  const radioGroupContext = useRadioGroupContext();

  const formControlProps = useFormControl<HTMLInputElement>(props);

  const [state, setState] = createStore<RadioState>({
    // eslint-disable-next-line solid/reactivity
    _checked: !!props.defaultChecked,
    isFocused: false,
    get isControlled() {
      return props.checked !== undefined;
    },
    get checked() {
      if (radioGroupContext) {
        const radioGroupValue = radioGroupContext.state.value;
        return radioGroupValue != null ? String(props.value) === String(radioGroupValue) : false;
      }

      // Not in a RadioGroup
      return this.isControlled ? !!props.checked : this._checked;
    },
    get variant() {
      return (
        props.variant ??
        radioGroupContext?.state?.variant ??
        theme?.defaultProps?.root?.variant ??
        "outline"
      );
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
      return (
        props.size ?? radioGroupContext?.state?.size ?? theme?.defaultProps?.root?.size ?? "md"
      );
    },
    get labelPlacement() {
      return (
        props.labelPlacement ??
        radioGroupContext?.state?.labelPlacement ??
        theme?.defaultProps?.root?.labelPlacement ??
        "end"
      );
    },
    get id() {
      if (formControlContext && !radioGroupContext) {
        return formControlProps.id;
      }

      return props.id ?? defaultId;
    },
    get name() {
      return props.name ?? radioGroupContext?.state.name;
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
    props as RadioProps<"label">,
    ["class", "children", "ref", "tabIndex", "onChange"],
    [
      "variant",
      "colorScheme",
      "size",
      "labelPlacement",
      "id",
      "name",
      "value",
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

    chainHandlers(radioGroupContext?.onChange, local.onChange)(event);
  };

  const onFocus: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent> = event => {
    setState("isFocused", true);
    callHandler(formControlProps.onFocus, event);
  };

  const onBlur: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent> = event => {
    setState("isFocused", false);
    callHandler(formControlProps.onBlur, event);
  };

  const wrapperClasses = () => {
    return classNames(
      local.class,
      hopeRadioClass,
      radioWrapperStyles({
        size: state.size,
        labelPlacement: state.labelPlacement,
      })
    );
  };

  const inputClasses = () => classNames(hopeRadioInputClass, visuallyHiddenStyles());

  const controlClasses = () => {
    return classNames(
      hopeRadioControlClass,
      radioControlStyles({
        variant: state.variant,
        colorScheme: state.colorScheme,
        size: state.size,
      })
    );
  };

  const labelClasses = () => {
    return classNames(hopeRadioLabelClass, radioLabelStyles());
  };

  const context: RadioContextValue = {
    state,
    onChange,
    onFocus,
    onBlur,
  };

  return (
    <RadioContext.Provider value={context}>
      <hope.label
        class={wrapperClasses()}
        __baseStyle={theme?.baseStyle?.root}
        for={state.id}
        data-group
        data-focus={state["data-focus"]}
        data-checked={state["data-checked"]}
        data-required={state["data-required"]}
        data-disabled={state["data-disabled"]}
        data-invalid={state["data-invalid"]}
        data-readonly={state["data-readonly"]}
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
          aria-required={state["aria-required"]}
          aria-disabled={state["aria-disabled"]}
          aria-invalid={state["aria-invalid"]}
          aria-readonly={state["aria-readonly"]}
          aria-label={state["aria-label"]}
          aria-labelledby={state["aria-labelledby"]}
          aria-describedby={state["aria-describedby"]}
        />
        <hope.span
          aria-hidden={true}
          class={controlClasses()}
          __baseStyle={theme?.baseStyle?.control}
          data-focus={state["data-focus"]}
          data-checked={state["data-checked"]}
          data-required={state["data-required"]}
          data-disabled={state["data-disabled"]}
          data-invalid={state["data-invalid"]}
          data-readonly={state["data-readonly"]}
          {...others}
        />
        <hope.span
          class={labelClasses()}
          __baseStyle={theme?.baseStyle?.label}
          data-focus={state["data-focus"]}
          data-checked={state["data-checked"]}
          data-required={state["data-required"]}
          data-disabled={state["data-disabled"]}
          data-invalid={state["data-invalid"]}
          data-readonly={state["data-readonly"]}
        >
          <Show when={isChildrenFunction(local)} fallback={local.children as JSX.Element}>
            {(local.children as RadioChildrenRenderProp)?.({ checked: state.checked })}
          </Show>
        </hope.span>
      </hope.label>
    </RadioContext.Provider>
  );
}

Radio.toString = () => createClassSelector(hopeRadioClass);

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

interface RadioContextValue
  extends Required<Pick<RadioOptions, "onChange" | "onFocus" | "onBlur">> {
  state: RadioState;
}

const RadioContext = createContext<RadioContextValue>();

export function useRadioContext() {
  const context = useContext(RadioContext);

  if (!context) {
    throw new Error("[Hope UI]: useRadioContext must be used within a `<Radio />` component");
  }

  return context;
}

/* -------------------------------------------------------------------------------------------------
 * StyleConfig
 * -----------------------------------------------------------------------------------------------*/

export interface RadioStyleConfig {
  baseStyle?: {
    root?: SystemStyleObject;
    group?: SystemStyleObject;
    control?: SystemStyleObject;
    label?: SystemStyleObject;
  };
  defaultProps?: {
    root?: ThemeableRadioOptions;
    group?: ThemeableRadioOptions;
  };
}
