import { splitProps } from "solid-js";

import { classNames, createCssSelector } from "@/utils/css";
import { mergeRefs } from "@/utils/refs";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { useFormControlContext } from "./form-control";
import { formHelperTextStyles } from "./form-control.styles";

export type FormHelperTextProps<C extends ElementType> = HopeComponentProps<C>;

const hopeFormHelperTextClass = "hope-form-helper-text";

export function FormHelperText<C extends ElementType = "div">(props: FormHelperTextProps<C>) {
  const formControl = useFormControlContext();

  const [local, others] = splitProps(props as FormHelperTextProps<"div">, ["ref", "id", "class"]);

  const id = () => local.id ?? formControl?.state.helperTextId;

  const classes = () => classNames(local.class, hopeFormHelperTextClass, formHelperTextStyles());

  const formControlDataAttrs = () => ({
    "data-disabled": formControl?.state.disabled ? "" : undefined,
    "data-readonly": formControl?.state.readOnly ? "" : undefined,
  });

  /**
   * Notify the field context when the help text is rendered on screen,
   * so we can apply the correct `aria-describedby` to the field (e.g. input, textarea).
   */
  const refs = () => mergeRefs(local.ref, el => formControl?.setHasHelperText(!!el));

  return <Box ref={refs()} id={id()} class={classes()} {...formControlDataAttrs()} {...others} />;
}

FormHelperText.toString = () => createCssSelector(hopeFormHelperTextClass);
