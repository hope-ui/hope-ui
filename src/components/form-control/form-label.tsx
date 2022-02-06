import { mergeProps, splitProps } from "solid-js";

import { classNames, createCssSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { useFormControlContext } from "./form-control";

export type FormLabelProps<C extends ElementType> = HopeComponentProps<C>;

const hopeFormLabelClass = "hope-form-label";

export function FormLabel<C extends ElementType = "label">(props: FormLabelProps<C>) {
  const formControl = useFormControlContext();

  const defaultProps: FormLabelProps<"label"> = {
    as: "label",
  };

  const propsWithDefault: FormLabelProps<"label"> = mergeProps(defaultProps, props);
  const [local, others] = splitProps(propsWithDefault, ["id", "for", "htmlFor", "class"]);

  const id = () => local.id ?? formControl?.state.labelId;
  const htmlFor = () => local.for ?? local.htmlFor ?? formControl?.state.fieldId;

  const formControlDataAttrs = () => ({
    //"data-focus": formControl.state.focused ? "" : undefined,
    "data-disabled": formControl?.state.disabled ? "" : undefined,
    "data-invalid": formControl?.state.invalid ? "" : undefined,
    "data-readonly": formControl?.state.readOnly ? "" : undefined,
  });

  const classes = () => classNames(local.class, hopeFormLabelClass);

  return <Box id={id()} for={htmlFor()} class={classes()} {...formControlDataAttrs} {...others} />;
}

FormLabel.toString = () => createCssSelector(hopeFormLabelClass);
