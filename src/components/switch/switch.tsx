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
import { classNames, createCssSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import {
  switchContainerStyles,
  SwitchContainerVariants,
  switchControlStyles,
  SwitchControlVariants,
  switchInputStyles,
  switchLabelStyles,
} from "./switch.styles";

export type ThemeableSwitchOptions = SwitchContainerVariants & SwitchControlVariants;

interface SwitchOptions extends ThemeableSwitchOptions {
  /**
   * The ref to be passed to the internal <input> tag.
   */
  ref?: HTMLInputElement | ((el: HTMLInputElement) => void);

  /**
   * The icon to use when the switch is `on`
   */
  iconOn?: JSX.Element;

  /**
   * The icon to use when the switch is `off`
   */
  iconOff?: JSX.Element;

  /**
   * The name of the input field in a switch
   * (Useful for form submission).
   */
  name?: string;

  /**
   * The value to be used in the switch input.
   * This is the value that will be returned on form submission.
   */
  value?: any;

  /**
   * If `true`, the switch will be checked.
   * You'll need to pass `onChange` to update its value (since it is now controlled)
   */
  checked?: boolean;

  /**
   * If `true`, the switch input is marked as required,
   * and `required` attribute will be added
   */
  required?: boolean;

  /**
   * If `true`, the switch will be disabled
   */
  disabled?: boolean;

  /**
   * If `true`, the switch will be readonly
   */
  readOnly?: boolean;

  /**
   * If `true`, the input will have `aria-invalid` set to `true`
   */
  invalid?: boolean;

  /**
   * The callback invoked when the on state of the `Switch` changes.
   */
  onChange?: JSX.EventHandlerUnion<HTMLInputElement, Event>;

  /**
   * The callback invoked when the switch is focused
   */
  onFocus?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;

  /**
   * The callback invoked when the switch is blurred (loses focus)
   */
  onBlur?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
}

export type SwitchProps<C extends ElementType> = HopeComponentProps<C, SwitchOptions>;

const hopeSwitchClass = "hope-switch";
const hopeSwitchInputClass = "hope-switch__input";
const hopeSwitchControlClass = "hope-switch__control";
const hopeSwitchLabelClass = "hope-switch__label";

export function Switch<C extends ElementType = "label">(props: SwitchProps<C>) {
  const theme = useTheme().components.Switch;

  // eslint-disable-next-line solid/reactivity
  const [checkedState, setCheckedState] = createSignal(!!props.checked);

  const defaultProps: SwitchProps<"label"> = {
    as: "label",
    id: createUniqueId(),
    variant: theme?.defaultProps?.variant ?? "filled",
    colorScheme: theme?.defaultProps?.colorScheme ?? "primary",
    size: theme?.defaultProps?.size ?? "md",
    labelPosition: theme?.defaultProps?.labelPosition ?? "left",
  };

  const propsWithDefaults: SwitchProps<"label"> = mergeProps(defaultProps, props);
  const [local, inputProps, variantProps, others] = splitProps(
    propsWithDefaults,
    ["iconOn", "iconOff", "checked", "invalid", "onChange", "class", "children"],
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
    return classNames(local.class, hopeSwitchClass, switchContainerStyles(variantProps));
  };

  const inputClasses = () => classNames(hopeSwitchInputClass, switchInputStyles());

  const controlClasses = () => {
    return classNames(
      hopeSwitchControlClass,
      switchControlStyles({
        ...variantProps,
        hasIconOn: !!local.iconOn,
        hasIconOff: !!local.iconOff,
      })
    );
  };

  const labelClasses = () => classNames(hopeSwitchLabelClass, switchLabelStyles(variantProps));

  const onChange: JSX.EventHandlerUnion<HTMLInputElement, Event> = event => {
    if (inputProps.readOnly || inputProps.disabled) {
      event.preventDefault();
      return;
    }

    const target = event.target as HTMLInputElement;
    setCheckedState(target.checked);

    if (local.onChange) {
      if (typeof local.onChange === "function") {
        local.onChange(event);
      } else {
        local.onChange[0](local.onChange[1], event);
      }
    }

    return event.defaultPrevented;
  };

  createEffect(() => {
    if (local.checked !== undefined) {
      setCheckedState(local.checked);
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
        type="checkbox"
        role="switch"
        class={inputClasses()}
        checked={checkedState()}
        onChange={onChange}
        {...inputProps}
        {...ariaAttrs}
      />
      <span aria-hidden={true} class={controlClasses()} data-checked={dataChecked()} {...dataAttrs}>
        {local.iconOn}
        {local.iconOff}
      </span>
      <Show when={local.children}>
        <span class={labelClasses()} data-checked={dataChecked()} {...dataAttrs}>
          {local.children}
        </span>
      </Show>
    </Box>
  );
}

Switch.toString = () => createCssSelector(hopeSwitchClass);
