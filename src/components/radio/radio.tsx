import { createSignal, createUniqueId, JSX, mergeProps, Show, splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme";
import { classNames, createClassSelector } from "@/utils/css";
import { callAllHandlers } from "@/utils/function";

import { Box } from "../box/box";
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

const hopeRadioClass = "hope-radio";
const hopeRadioInputClass = "hope-radio__input";
const hopeRadioControlClass = "hope-radio__control";
const hopeRadioLabelClass = "hope-radio__label";

export function Radio<C extends ElementType = "label">(props: RadioProps<C>) {
  const defaultId = `hope-radio-${createUniqueId()}`;

  const theme = useComponentStyleConfigs().Radio;

  const radioGroupContext = useRadioGroupContext();

  const defaultProps: RadioProps<"label"> = {
    as: "label",
    id: defaultId,
    variant: radioGroupContext?.state?.variant ?? theme?.defaultProps?.variant ?? "outline",
    colorScheme: radioGroupContext?.state?.colorScheme ?? theme?.defaultProps?.colorScheme ?? "primary",
    size: radioGroupContext?.state?.size ?? theme?.defaultProps?.size ?? "md",
    labelPosition: radioGroupContext?.state?.labelPosition ?? theme?.defaultProps?.labelPosition ?? "right",

    name: radioGroupContext?.state.name,
    required: radioGroupContext?.state.required,
    disabled: radioGroupContext?.state.disabled,
    readOnly: radioGroupContext?.state.readOnly,
    invalid: radioGroupContext?.state.invalid,
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
    ["variant", "colorScheme", "size", "labelPosition"]
  );

  // Internal state for uncontrolled radio.
  // eslint-disable-next-line solid/reactivity
  const [checkedState, setCheckedState] = createSignal(!!local.defaultChecked);

  const isControlled = () => local.checked !== undefined;
  const checked = () => {
    if (radioGroupContext?.state.value != null && inputProps?.value != null) {
      return radioGroupContext.state.value === inputProps.value;
    }

    return isControlled() ? local.checked : checkedState();
  };

  // Input loose focus if this is placed in `dataAttrs()`
  const dataChecked = () => (checked() ? "" : undefined);

  const dataAttrs = () => ({
    "data-required": inputProps.required ? "" : undefined,
    "data-disabled": inputProps.disabled ? "" : undefined,
    "data-invalid": local.invalid ? "" : undefined,
    "data-readonly": inputProps.readOnly ? "" : undefined,
  });

  const ariaAttrs = () => ({
    "aria-required": inputProps.required ? true : undefined,
    "aria-disabled": inputProps.disabled ? true : undefined,
    "aria-invalid": local.invalid ? true : undefined,
    "aria-readonly": inputProps.readOnly ? true : undefined,
  });

  const containerClasses = () => {
    return classNames(local.class, hopeRadioClass, radioContainerStyles(variantProps));
  };

  const inputClasses = () => classNames(hopeRadioInputClass, radioInputStyles());

  const controlClasses = () => {
    return classNames(hopeRadioControlClass, radioControlStyles(variantProps));
  };

  const labelClasses = () => classNames(hopeRadioLabelClass, radioLabelStyles(variantProps));

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
    <Box
      as="label"
      __baseStyle={theme?.baseStyle}
      class={containerClasses()}
      for={inputProps.id}
      data-checked={dataChecked()}
      {...dataAttrs}
      {...others}
    >
      <input
        type="radio"
        class={inputClasses()}
        checked={checked()}
        onChange={onChange}
        {...inputProps}
        {...ariaAttrs}
      />
      <span aria-hidden={true} class={controlClasses()} data-checked={dataChecked()} {...dataAttrs} />
      <Show when={local.children}>
        <span class={labelClasses()} data-checked={dataChecked()} {...dataAttrs}>
          {local.children}
        </span>
      </Show>
    </Box>
  );
}

Radio.toString = () => createClassSelector(hopeRadioClass);
