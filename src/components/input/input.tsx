import { mergeProps, splitProps } from "solid-js";

import { useTheme } from "@/theme/provider";
import { classNames, createCssSelector } from "@/utils/css";

import { Box } from "../box/box";
import { useFormControlContext } from "../form-control/form-control";
import { ElementType, HopeComponentProps } from "../types";
import { inputStyles, InputVariants } from "./input.styles";

export type ThemeableInputOptions = Pick<InputVariants, "variant" | "size">;

export type InputProps<C extends ElementType> = HopeComponentProps<C, InputVariants> & {
  /**
   * The native HTML `size` attribute to be passed to the `input`
   */
  htmlSize?: string | number;
};

const hopeInputClass = "hope-input";

export function Input<C extends ElementType = "input">(props: InputProps<C>) {
  const theme = useTheme().components.Input;

  //

  const formControl = useFormControlContext();
  //

  const defaultProps: InputProps<"input"> = {
    as: "input",
    variant: theme?.defaultProps?.variant ?? "outline",
    size: theme?.defaultProps?.size ?? "md",
  };

  const propsWithDefault: InputProps<"input"> = mergeProps(defaultProps, props);
  const [local, variantProps, others] = splitProps(
    propsWithDefault,
    ["id", "aria-describedby", "required", "disabled", "readOnly", "class", "htmlSize"],
    ["variant", "size"]
  );

  //
  const id = () => local.id ?? formControl?.state.fieldId;
  const required = () => local.required ?? formControl?.state.required;
  const disabled = () => local.disabled ?? formControl?.state.disabled;
  const readOnly = () => local.readOnly ?? formControl?.state.readOnly;
  const ariaInvalid = () => (formControl?.state.invalid ? true : undefined);
  const ariaRequired = () => (required() ? true : undefined);
  const ariaReadonly = () => (readOnly() ? true : undefined);
  const ariaDescribedBy = () => {
    const labelIds: string[] = local["aria-describedby"] ? [local["aria-describedby"]] : [];

    // Error message must be described first in all scenarios.
    if (formControl?.state.hasErrorMessage && formControl?.state.invalid) {
      labelIds.push(formControl.state.errorMessageId);
    }

    if (formControl?.state.hasHelperText) {
      labelIds.push(formControl.state.helperTextId);
    }

    return labelIds.join(" ") || undefined;
  };
  //

  const classes = () => classNames(local.class, hopeInputClass, inputStyles(variantProps));

  return (
    <Box
      id={id()}
      required={required()}
      disabled={disabled()}
      readOnly={readOnly()}
      aria-invalid={ariaInvalid()}
      aria-required={ariaRequired()}
      aria-readonly={ariaReadonly()}
      aria-describedby={ariaDescribedBy()}
      class={classes()}
      size={local.htmlSize}
      __baseStyle={theme?.baseStyle}
      {...others}
    />
  );
}

Input.toString = () => createCssSelector(hopeInputClass);
