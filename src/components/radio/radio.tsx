import { createSignal, createUniqueId, JSX, mergeProps, Show, splitProps } from "solid-js";

import { SystemStyleObject } from "@/styled-system/types";
import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";
import { callAllHandlers } from "@/utils/function";

import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import {
  radioContainerStyles,
  RadioContainerVariants,
  radioControlStyles,
  RadioControlVariants,
  radioInputStyles,
  radioLabelStyles,
} from "./radio.styles";
import { useRadioGroupContext } from "./radio-group";

export type ThemeableRadioOptions = RadioContainerVariants & RadioControlVariants;

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
   * If `true`, the radio will be readonly
   */
  readOnly?: boolean;

  /**
   * If `true`, the input will have `aria-invalid` set to `true`
   */
  invalid?: boolean;

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
    control?: SystemStyleObject;
    label?: SystemStyleObject;
  };
  defaultProps?: {
    root?: ThemeableRadioOptions;
    group?: ThemeableRadioOptions;
  };
}

const hopeRadioClass = "hope-radio";
const hopeRadioInputClass = "hope-radio__input";
const hopeRadioControlClass = "hope-radio__control";
const hopeRadioLabelClass = "hope-radio__label";

export function Radio<C extends ElementType = "label">(props: RadioProps<C>) {
  const defaultId = `hope-radio-${createUniqueId()}`;

  const theme = useComponentStyleConfigs().Radio;

  const radioGroupContext = useRadioGroupContext();

  const defaultProps: RadioProps<"label"> = {
    id: defaultId,
  };

  const propsWithDefaults: RadioProps<"label"> = mergeProps(defaultProps, props);
  const [local, inputProps, variantProps, others] = splitProps(
    propsWithDefaults,
    ["checked", "defaultChecked", "invalid", "onChange", "class", "children"],
    [
      "ref",
      "id",
      "name",
      "value",
      "required",
      "disabled",
      "readOnly",
      "aria-label",
      "aria-labelledby",
      "aria-describedby",
      "tabIndex",
      "onFocus",
      "onBlur",
    ],
    ["variant", "colorScheme", "size", "labelPlacement"]
  );

  const variant = () => {
    return variantProps.variant ?? radioGroupContext?.state?.variant ?? theme?.defaultProps?.root?.variant ?? "outline";
  };

  const colorScheme = () => {
    return (
      variantProps.colorScheme ??
      radioGroupContext?.state?.colorScheme ??
      theme?.defaultProps?.root?.colorScheme ??
      "primary"
    );
  };

  const size = () => {
    return variantProps.size ?? radioGroupContext?.state?.size ?? theme?.defaultProps?.root?.size ?? "md";
  };

  const labelPlacement = () => {
    return (
      variantProps.labelPlacement ??
      radioGroupContext?.state?.labelPlacement ??
      theme?.defaultProps?.root?.labelPlacement ??
      "end"
    );
  };

  const name = () => inputProps.name ?? radioGroupContext?.state.name;
  const required = () => inputProps.required ?? radioGroupContext?.state.required;
  const disabled = () => inputProps.disabled ?? radioGroupContext?.state.disabled;
  const invalid = () => local.invalid ?? radioGroupContext?.state.invalid;
  const readOnly = () => inputProps.readOnly ?? radioGroupContext?.state.readOnly;

  // Internal state for uncontrolled radio.
  // eslint-disable-next-line solid/reactivity
  const [checkedState, setCheckedState] = createSignal(!!local.defaultChecked);

  const isControlled = () => local.checked !== undefined;
  const checked = () => {
    if (radioGroupContext) {
      const radioGroupValue = radioGroupContext.state.value;
      return radioGroupValue != null ? inputProps.value === radioGroupValue : undefined;
    }

    // Not in a RadioGroup
    return isControlled() ? !!local.checked : checkedState();
  };

  const dataChecked = () => (checked() ? "" : undefined);
  const dataRequired = () => (required() ? "" : undefined);
  const dataDisabled = () => (disabled() ? "" : undefined);
  const dataInvalid = () => (invalid() ? "" : undefined);
  const dataReadonly = () => (readOnly() ? "" : undefined);

  const ariaRequired = () => (required() ? true : undefined);
  const ariaDisabled = () => (disabled() ? true : undefined);
  const ariaInvalid = () => (invalid() ? true : undefined);
  const ariaReadonly = () => (readOnly() ? true : undefined);

  const containerClasses = () => {
    return classNames(
      local.class,
      hopeRadioClass,
      radioContainerStyles({
        size: size(),
        labelPlacement: labelPlacement(),
      })
    );
  };

  const inputClasses = () => classNames(hopeRadioInputClass, radioInputStyles());

  const controlClasses = () => {
    return classNames(
      hopeRadioControlClass,
      radioControlStyles({
        variant: variant(),
        colorScheme: colorScheme(),
        size: size(),
      })
    );
  };

  const labelClasses = () => {
    return classNames(
      hopeRadioLabelClass,
      radioLabelStyles({
        size: size(),
        labelPlacement: labelPlacement(),
      })
    );
  };

  const onChange: JSX.EventHandlerUnion<HTMLInputElement, Event> = event => {
    if (inputProps.readOnly || inputProps.disabled) {
      event.preventDefault();
      return;
    }

    if (!isControlled()) {
      const target = event.target as HTMLInputElement;
      setCheckedState(target.checked);
    }

    callAllHandlers(radioGroupContext?.onChange, local.onChange)(event);
  };

  return (
    <hope.label
      class={containerClasses()}
      __baseStyle={theme?.baseStyle?.root}
      for={inputProps.id}
      data-checked={dataChecked()}
      data-required={dataRequired()}
      data-disabled={dataDisabled()}
      data-invalid={dataInvalid()}
      data-readonly={dataReadonly()}
      {...others}
    >
      {/* eslint-disable-next-line jsx-a11y/role-supports-aria-props */}
      <input
        type="radio"
        class={inputClasses()}
        checked={checked()}
        onChange={onChange}
        name={name()}
        aria-required={ariaRequired()}
        aria-disabled={ariaDisabled()}
        aria-invalid={ariaInvalid()}
        aria-readonly={ariaReadonly()}
        {...inputProps}
      />
      <hope.span
        aria-hidden={true}
        class={controlClasses()}
        __baseStyle={theme?.baseStyle?.control}
        data-checked={dataChecked()}
        data-required={dataRequired()}
        data-disabled={dataDisabled()}
        data-invalid={dataInvalid()}
        data-readonly={dataReadonly()}
      />
      <Show when={local.children}>
        <hope.span
          class={labelClasses()}
          __baseStyle={theme?.baseStyle?.label}
          data-checked={dataChecked()}
          data-required={dataRequired()}
          data-disabled={dataDisabled()}
          data-invalid={dataInvalid()}
          data-readonly={dataReadonly()}
        >
          {local.children}
        </hope.span>
      </Show>
    </hope.label>
  );
}

Radio.toString = () => createClassSelector(hopeRadioClass);
