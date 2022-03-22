import { createSignal, createUniqueId, JSX, Show, splitProps } from "solid-js";

import { SystemStyleObject } from "@/styled-system/types";
import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";
import { callAllHandlers } from "@/utils/function";

import { hope } from "../factory";
import { useFormControl } from "../form-control/use-form-control";
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

  const [local, inputProps, variantProps, others] = splitProps(
    props as RadioProps<"label">,
    ["checked", "defaultChecked", "onChange", "class", "children"],
    [
      "ref",
      "id",
      "name",
      "value",
      "required",
      "disabled",
      "invalid",
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

  const formControlProps = useFormControl<HTMLInputElement>(inputProps);

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

  const id = () => formControlProps.id ?? defaultId;
  const name = () => inputProps.name ?? radioGroupContext?.state.name;
  const required = () => formControlProps.required ?? radioGroupContext?.state.required;
  const disabled = () => formControlProps.disabled ?? radioGroupContext?.state.disabled;
  const invalid = () => formControlProps.invalid ?? radioGroupContext?.state.invalid;
  const readOnly = () => formControlProps.readOnly ?? radioGroupContext?.state.readOnly;

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
        ref={inputProps.ref}
        type="radio"
        id={id()}
        tabIndex={inputProps.tabIndex}
        value={inputProps.value}
        name={name()}
        checked={checked()}
        required={required()}
        disabled={disabled()}
        readOnly={readOnly()}
        aria-required={ariaRequired()}
        aria-disabled={ariaDisabled()}
        aria-invalid={ariaInvalid()}
        aria-readonly={ariaReadonly()}
        aria-label={inputProps["aria-label"]}
        aria-labelledby={inputProps["aria-labelledby"]}
        aria-describedby={formControlProps["aria-describedby"]}
        class={inputClasses()}
        onChange={onChange}
        onFocus={formControlProps.onFocus}
        onBlur={formControlProps.onBlur}
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
