import { onCleanup, onMount, splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useFormControlContext } from "./form-control";
import { formHelperTextStyles } from "./form-control.styles";

export type FormHelperTextProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

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

  onMount(() => formControl?.setHasHelperText(true));
  onCleanup(() => formControl?.setHasHelperText(false));

  return <Box id={id()} class={classes()} {...formControlDataAttrs} {...others} />;
}

FormHelperText.toString = () => createClassSelector(hopeFormHelperTextClass);
