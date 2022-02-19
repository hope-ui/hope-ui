import {
  createEffect,
  createSignal,
  createUniqueId,
  JSX,
  Match,
  mergeProps,
  Show,
  splitProps,
  Switch,
} from "solid-js";

import { useTheme } from "@/theme";
import { classNames, createClassSelector } from "@/utils/css";
import { callAllHandlers } from "@/utils/function";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import {
  checkboxContainerStyles,
  CheckboxContainerVariants,
  checkboxControlStyles,
  CheckboxControlVariants,
  checkboxInputStyles,
  checkboxLabelStyles,
} from "./checkbox.styles";
import { CheckIcon, IndeterminateIcon } from "./checkbox-icon";

export type ThemeableCheckboxOptions = CheckboxContainerVariants & CheckboxControlVariants;

interface CheckboxOptions extends ThemeableCheckboxOptions {
  /**
   * The ref to be passed to the internal <input> tag.
   */
  ref?: HTMLInputElement | ((el: HTMLInputElement) => void);

  /**
   * The checked icon to use
   */
  iconChecked?: JSX.Element;

  /**
   * The indeterminate icon to use
   */
  iconIndeterminate?: JSX.Element;

  /**
   * The name of the input field in a checkbox
   * (Useful for form submission).
   */
  name?: string;

  /**
   * The value to be used in the checkbox input.
   * This is the value that will be returned on form submission.
   */
  value?: any;

  /**
   * If `true`, the checkbox will be checked.
   * You'll need to pass `onChange` to update its value (since it is now controlled)
   */
  checked?: boolean;

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
   * If `true`, the checkbox will be readonly
   */
  readOnly?: boolean;

  /**
   * If `true`, the input will have `aria-invalid` set to `true`
   */
  invalid?: boolean;

  /**
   * The callback invoked when the checked state of the `Checkbox` changes.
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

export type CheckboxProps<C extends ElementType = "label"> = HopeComponentProps<C, CheckboxOptions>;

const hopeCheckboxClass = "hope-checkbox";
const hopeCheckboxInputClass = "hope-checkbox__input";
const hopeCheckboxControlClass = "hope-checkbox__control";
const hopeCheckboxLabelClass = "hope-checkbox__label";

export function Checkbox<C extends ElementType = "label">(props: CheckboxProps<C>) {
  const theme = useTheme().components.Checkbox;

  // eslint-disable-next-line solid/reactivity
  const [checkedState, setCheckedState] = createSignal(!!props.checked);

  const defaultProps: CheckboxProps<"label"> = {
    as: "label",
    id: `hope-checkbox-${createUniqueId()}`,
    iconChecked: <CheckIcon />,
    iconIndeterminate: <IndeterminateIcon />,
    variant: theme?.defaultProps?.variant ?? "outline",
    colorScheme: theme?.defaultProps?.colorScheme ?? "primary",
    size: theme?.defaultProps?.size ?? "md",
    labelPosition: theme?.defaultProps?.labelPosition ?? "right",
  };

  const propsWithDefaults: CheckboxProps<"label"> = mergeProps(defaultProps, props);
  const [local, inputProps, variantProps, others] = splitProps(
    propsWithDefaults,
    ["iconChecked", "iconIndeterminate", "checked", "invalid", "onChange", "class", "children"],
    [
      "ref",
      "id",
      "name",
      "value",
      "indeterminate",
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
    "data-indeterminate": inputProps.indeterminate ? "" : undefined,
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
    return classNames(local.class, hopeCheckboxClass, checkboxContainerStyles(variantProps));
  };

  const inputClasses = () => classNames(hopeCheckboxInputClass, checkboxInputStyles());

  const controlClasses = () => {
    return classNames(hopeCheckboxControlClass, checkboxControlStyles(variantProps));
  };

  const labelClasses = () => classNames(hopeCheckboxLabelClass, checkboxLabelStyles(variantProps));

  const onChange: JSX.EventHandlerUnion<HTMLInputElement, Event> = event => {
    if (inputProps.readOnly || inputProps.disabled) {
      event.preventDefault();
      return;
    }

    const target = event.target as HTMLInputElement;
    setCheckedState(target.checked);

    callAllHandlers(local.onChange)(event);
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
        class={inputClasses()}
        checked={checkedState()}
        onChange={onChange}
        {...inputProps}
        {...ariaAttrs}
      />
      <span aria-hidden={true} class={controlClasses()} data-checked={dataChecked()} {...dataAttrs}>
        <Switch>
          <Match when={inputProps.indeterminate}>{local.iconIndeterminate}</Match>
          <Match when={checkedState() && !inputProps.indeterminate}>{local.iconChecked}</Match>
        </Switch>
      </span>
      <Show when={local.children}>
        <span class={labelClasses()} data-checked={dataChecked()} {...dataAttrs}>
          {local.children}
        </span>
      </Show>
    </Box>
  );
}

Checkbox.toString = () => createClassSelector(hopeCheckboxClass);
