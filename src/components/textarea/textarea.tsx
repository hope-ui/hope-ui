import { mergeProps, splitProps } from "solid-js";

import { useTheme } from "@/theme/provider";
import { classNames, createCssSelector } from "@/utils/css";

import { Box } from "../box/box";
import { useFormControl, useFormControlPropNames } from "../form-control/use-form-control";
import { HopeComponentProps } from "../types";
import { textareaStyles, TextareaVariants } from "./textarea.styles";

export type ThemeableTextareaOptions = TextareaVariants;

interface TextareaOptions extends ThemeableTextareaOptions {
  /**
   * If `true`, the input will have `aria-invalid` set to `true`
   */
  invalid?: boolean;
}

export type TextareaProps = Omit<HopeComponentProps<"textarea", TextareaOptions>, "as">;

const hopeTextareaClass = "hope-textarea";

export function Textarea(props: TextareaProps) {
  const theme = useTheme().components.Textarea;

  const defaultProps: TextareaProps = {
    variant: theme?.defaultProps?.variant ?? "outline",
    size: theme?.defaultProps?.size ?? "md",
  };

  const propsWithDefault: TextareaProps = mergeProps(defaultProps, props);

  const [local, variantProps, useFormControlProps, others] = splitProps(
    propsWithDefault,
    ["class"],
    ["variant", "size"],
    useFormControlPropNames
  );

  const formControlProps = useFormControl<HTMLTextAreaElement>(useFormControlProps);

  const classes = () => classNames(local.class, hopeTextareaClass, textareaStyles(variantProps));

  return (
    <Box
      as="textarea"
      class={classes()}
      __baseStyle={theme?.baseStyle}
      {...formControlProps}
      {...others}
    />
  );
}

Textarea.toString = () => createCssSelector(hopeTextareaClass);
