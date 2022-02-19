import {
  createEffect,
  createSignal,
  createUniqueId,
  JSX,
  mergeProps,
  Show,
  splitProps,
} from "solid-js";

import { useTheme } from "@/theme";
import { classNames, createClassSelector } from "@/utils/css";
import { callAllHandlers } from "@/utils/function";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
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

export type RadioProps<C extends ElementType = "label"> = HopeComponentProps<C, RadioOptions>;

const hopeRadioClass = "hope-radio";
const hopeRadioInputClass = "hope-radio__input";
const hopeRadioControlClass = "hope-radio__control";
const hopeRadioLabelClass = "hope-radio__label";

export function Radio<C extends ElementType = "label">(props: RadioProps<C>) {
  const theme = useTheme().components.Radio;
  const radioGroupContext = useRadioGroupContext();

  // eslint-disable-next-line solid/reactivity
  const [internalCheckedState, setInternalCheckedState] = createSignal(!!props.checked);

  const defaultProps: RadioProps<"label"> = {
    as: "label",
    id: `hope-radio-${createUniqueId()}`,
    variant: theme?.defaultProps?.variant ?? "outline",
    colorScheme: theme?.defaultProps?.colorScheme ?? "primary",
    size: theme?.defaultProps?.size ?? "md",
    labelPosition: theme?.defaultProps?.labelPosition ?? "right",

    name: radioGroupContext?.state.name,
    required: radioGroupContext?.state.required,
    disabled: radioGroupContext?.state.disabled,
    readOnly: radioGroupContext?.state.readOnly,
    invalid: radioGroupContext?.state.invalid,
  };

  const propsWithDefaults: RadioProps<"label"> = mergeProps(defaultProps, props);
  const [local, inputProps, variantProps, others] = splitProps(
    propsWithDefaults,
    ["checked", "invalid", "onChange", "class", "children"],
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

  const checkedState = () => {
    if (radioGroupContext && inputProps.value != null) {
      return inputProps.value === radioGroupContext.state.value;
    }

    return internalCheckedState();
  };

  // Input loose focus if this is placed in `dataAttrs()`
  const dataChecked = () => (checkedState() ? "" : undefined);

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

    const target = event.target as HTMLInputElement;
    setInternalCheckedState(target.checked);

    callAllHandlers(local.onChange, radioGroupContext?.onChange)(event);
  };

  createEffect(() => {
    if (local.checked !== undefined) {
      setInternalCheckedState(local.checked);
    }
  });

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
        checked={checkedState()}
        onChange={onChange}
        {...inputProps}
        {...ariaAttrs}
      />
      <span
        aria-hidden={true}
        class={controlClasses()}
        data-checked={dataChecked()}
        {...dataAttrs}
      />
      <Show when={local.children}>
        <span class={labelClasses()} data-checked={dataChecked()} {...dataAttrs}>
          {local.children}
        </span>
      </Show>
    </Box>
  );
}

Radio.toString = () => createClassSelector(hopeRadioClass);
