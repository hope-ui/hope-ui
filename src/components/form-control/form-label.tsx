import { mergeProps, Show, splitProps } from "solid-js";

import { useTheme } from "@/theme";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { useFormControlContext } from "./form-control";
import { formLabelStyles, requiredIndicatorStyles } from "./form-control.styles";

export interface ThemeableFormLabelOptions {
  withRequiredIndicator?: boolean;
}

export type FormLabelProps<C extends ElementType = "label"> = HopeComponentProps<C, ThemeableFormLabelOptions>;

const hopeFormLabelClass = "hope-form-label";

export function FormLabel<C extends ElementType = "label">(props: FormLabelProps<C>) {
  const theme = useTheme().components.FormLabel;
  const formControl = useFormControlContext();

  const defaultProps: FormLabelProps<"label"> = {
    as: "label",
    withRequiredIndicator: theme?.defaultProps?.withRequiredIndicator ?? true,
  };

  const propsWithDefault: FormLabelProps<"label"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, [
    "id",
    "for",
    "htmlFor",
    "class",
    "children",
    "withRequiredIndicator",
  ]);

  const id = () => local.id ?? formControl?.state.labelId;
  const htmlFor = () => local.for ?? local.htmlFor ?? formControl?.state.id;

  const classes = () => classNames(local.class, hopeFormLabelClass, formLabelStyles());

  const formControlDataAttrs = () => ({
    "data-focus": formControl?.state.isFocused ? "" : undefined,
    "data-disabled": formControl?.state.disabled ? "" : undefined,
    "data-invalid": formControl?.state.invalid ? "" : undefined,
    "data-readonly": formControl?.state.readOnly ? "" : undefined,
  });

  return (
    <Box
      id={id()}
      for={htmlFor()}
      class={classes()}
      __baseStyle={theme?.baseStyle}
      {...formControlDataAttrs}
      {...others}
    >
      {local.children}
      <Show when={formControl?.state.required && local.withRequiredIndicator}>
        <span class={requiredIndicatorStyles()} role="presentation" aria-hidden="true">
          *
        </span>
      </Show>
    </Box>
  );
}

FormLabel.toString = () => createClassSelector(hopeFormLabelClass);
