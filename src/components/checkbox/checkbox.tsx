import { JSX, mergeProps, Show, splitProps } from "solid-js";

import { useTheme } from "@/theme";
import { classNames, createCssSelector } from "@/utils/css";

import { Box } from "../box/box";
import { HopeComponentProps } from "../types";
import {
  checkboxLabelStyles,
  checkboxSpanStyles,
  CheckboxSpanVariants,
  checkboxStyles,
  CheckboxVariants,
} from "./checkbox.styles";

export type ThemeableCheckboxOptions = CheckboxVariants & CheckboxSpanVariants;

interface CheckboxOptions extends ThemeableCheckboxOptions {
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

export type CheckboxProps = Omit<HopeComponentProps<"label", CheckboxOptions>, "as">;

const hopeCheckboxClass = "hope-checkbox";

export function Checkbox(props: CheckboxProps) {
  const theme = useTheme().components.Checkbox;

  const defaultProps: CheckboxProps = {
    variant: theme?.defaultProps?.variant ?? "outline",
    colorScheme: theme?.defaultProps?.colorScheme ?? "primary",
    size: theme?.defaultProps?.size ?? "md",
    labelPosition: theme?.defaultProps?.labelPosition ?? "right",
  };

  const propsWithDefaults: CheckboxProps = mergeProps(defaultProps, props);
  const [local, inputProps, variantProps, others] = splitProps(
    propsWithDefaults,
    ["invalid", "class", "children"],
    [
      "id",
      "name",
      "value",
      "checked",
      "indeterminate",
      "required",
      "disabled",
      "readOnly",
      "aria-label",
      "aria-labelledby",
      "aria-describedby",
      "tabIndex",
      "onChange",
      "onFocus",
      "onBlur",
    ],
    ["variant", "colorScheme", "size", "labelPosition"]
  );

  const labelClasses = () =>
    classNames(local.class, hopeCheckboxClass, checkboxLabelStyles(variantProps));

  const dataAttrs = () => ({
    "data-checked": inputProps.checked ? "" : undefined,
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

  return (
    <Box
      as="label"
      class={labelClasses()}
      __baseStyle={theme?.baseStyle}
      {...dataAttrs}
      {...others}
    >
      <Box
        as="input"
        type="checkbox"
        class={checkboxStyles(variantProps)}
        {...inputProps}
        {...ariaAttrs}
      />
      <Show when={local.children}>
        <Box as="span" class={checkboxSpanStyles(variantProps)} {...dataAttrs}>
          {local.children}
        </Box>
      </Show>
    </Box>
  );
}

Checkbox.toString = () => createCssSelector(hopeCheckboxClass);
