import { mergeProps, splitProps } from "solid-js";

import { useComponentStyleConfigs } from "../../theme/provider";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { useFormControl } from "../form-control/use-form-control";
import { HTMLHopeProps, SinglePartComponentStyleConfig } from "../types";
import { textareaStyles, TextareaVariants } from "./textarea.styles";

export type TextareaStyleConfig = SinglePartComponentStyleConfig<TextareaVariants>;

interface TextareaOptions extends TextareaVariants {
  /**
   * If `true`, the textarea will have `aria-invalid` set to `true`
   */
  invalid?: boolean;
}

export type TextareaProps = Omit<HTMLHopeProps<"textarea", TextareaOptions>, "as">;

const hopeTextareaClass = "hope-textarea";

export function Textarea(props: TextareaProps) {
  const theme = useComponentStyleConfigs().Textarea;

  const defaultProps: TextareaProps = {
    variant: theme?.defaultProps?.variant ?? "outline",
    size: theme?.defaultProps?.size ?? "md",
  };

  const propsWithDefault: TextareaProps = mergeProps(defaultProps, props);

  const [local, others] = splitProps(propsWithDefault, ["class", "variant", "size"]);

  const formControlProps = useFormControl<HTMLTextAreaElement>(props);

  const classes = () => {
    return classNames(
      local.class,
      hopeTextareaClass,
      textareaStyles({
        variant: local.variant,
        size: local.size,
      })
    );
  };

  return <Box as="textarea" class={classes()} __baseStyle={theme?.baseStyle} {...formControlProps} {...others} />;
}

Textarea.toString = () => createClassSelector(hopeTextareaClass);
