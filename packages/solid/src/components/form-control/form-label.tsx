import { mergeProps, Show, splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { useFormControlContext } from "./form-control";
import { formLabelStyles, requiredIndicatorStyles } from "./form-control.styles";

export interface FormLabelOptions {
  withRequiredIndicator?: boolean;
}

export type FormLabelProps<C extends ElementType = "label"> = HTMLHopeProps<C, FormLabelOptions>;

const hopeFormLabelClass = "hope-form-label";

export function FormLabel<C extends ElementType = "label">(props: FormLabelProps<C>) {
  const theme = useStyleConfig().FormControl;

  const formControl = useFormControlContext();

  const defaultProps: FormLabelProps<"label"> = {
    withRequiredIndicator: theme?.defaultProps?.label?.withRequiredIndicator ?? true,
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

  return (
    <hope.label
      id={id()}
      for={htmlFor()}
      class={classes()}
      __baseStyle={theme?.baseStyle?.label}
      data-focus={formControl?.state["data-focus"]}
      data-disabled={formControl?.state["data-disabled"]}
      data-invalid={formControl?.state["data-invalid"]}
      data-readonly={formControl?.state["data-readonly"]}
      {...others}
    >
      {local.children}
      <Show when={formControl?.state.required && local.withRequiredIndicator}>
        <span class={requiredIndicatorStyles()} role="presentation" aria-hidden="true">
          *
        </span>
      </Show>
    </hope.label>
  );
}

FormLabel.toString = () => createClassSelector(hopeFormLabelClass);
