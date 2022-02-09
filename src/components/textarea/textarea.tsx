import { mergeProps, splitProps } from "solid-js";

import { useTheme } from "@/theme/provider";
import { classNames, createCssSelector } from "@/utils/css";

import { Box } from "../box/box";
import { useFormControl, useFormControlPropNames } from "../form-control/use-form-control";
import { ElementType, HopeComponentProps } from "../types";
import { textareaStyles, TextareaVariants } from "./textarea.styles";

export type ThemeableTextareaOptions = Pick<TextareaVariants, "variant" | "size">;

interface TextareaOptions extends ThemeableTextareaOptions {
  /**
   * If `true`, the input will have `aria-invalid` set to `true`
   */
  invalid?: boolean;
}

export type TextareaProps<C extends ElementType> = HopeComponentProps<C, TextareaOptions>;

const hopeTextareaClass = "hope-textarea";

export function Textarea<C extends ElementType = "textarea">(props: TextareaProps<C>) {
  const theme = useTheme().components.Textarea;

  const defaultProps: TextareaProps<"textarea"> = {
    as: "textarea",
    variant: theme?.defaultProps?.variant ?? "outline",
    size: theme?.defaultProps?.size ?? "md",
  };

  const propsWithDefault: TextareaProps<"textarea"> = mergeProps(defaultProps, props);

  const [local, variantProps, useFormControlProps, others] = splitProps(
    propsWithDefault,
    ["class"],
    ["variant", "size"],
    useFormControlPropNames
  );

  const formControlProps = useFormControl<HTMLTextAreaElement>(useFormControlProps);

  const classes = () => classNames(local.class, hopeTextareaClass, textareaStyles(variantProps));

  return (
    <Box class={classes()} __baseStyle={theme?.baseStyle} {...formControlProps()} {...others} />
  );
}

Textarea.toString = () => createCssSelector(hopeTextareaClass);
