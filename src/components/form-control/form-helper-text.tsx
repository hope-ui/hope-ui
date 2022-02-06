import { onCleanup, onMount, splitProps } from "solid-js";

import { classNames, createCssSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { useFormControlContext } from "./form-control";

export type FormHelperTextProps<C extends ElementType> = HopeComponentProps<C>;

const hopeFormHelperTextClass = "hope-form-helper-text";

export function FormHelperText<C extends ElementType = "div">(props: FormHelperTextProps<C>) {
  const formControl = useFormControlContext();

  const [local, others] = splitProps(props as FormHelperTextProps<"div">, ["id", "class"]);

  const id = () => local.id ?? formControl?.state.helperTextId;

  const classes = () => classNames(local.class, hopeFormHelperTextClass);

  onMount(() => {
    formControl?.setHasHelperText(true);
  });

  onCleanup(() => {
    formControl?.setHasHelperText(false);
  });

  return <Box id={id()} class={classes()} {...others} />;
}

FormHelperText.toString = () => createCssSelector(hopeFormHelperTextClass);
