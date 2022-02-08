import { onCleanup, onMount, Show, splitProps } from "solid-js";

import { classNames, createCssSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { useFormControlContext } from "./form-control";
import { formErrorMessageStyles } from "./form-control.styles";

export type FormErrorMessageProps<C extends ElementType> = HopeComponentProps<C>;

const hopeFormErrorMessageClass = "hope-form-error-message";

export function FormErrorMessage<C extends ElementType = "div">(props: FormErrorMessageProps<C>) {
  const formControl = useFormControlContext();

  const [local, others] = splitProps(props as FormErrorMessageProps<"div">, ["ref", "id", "class"]);

  const id = () => local.id ?? formControl?.state.errorMessageId;

  const classes = () =>
    classNames(local.class, hopeFormErrorMessageClass, formErrorMessageStyles());

  const formControlDataAttrs = () => ({
    "data-disabled": formControl?.state.disabled ? "" : undefined,
    "data-readonly": formControl?.state.readOnly ? "" : undefined,
  });

  onMount(() => formControl?.setHasErrorMessage(true));
  onCleanup(() => formControl?.setHasErrorMessage(false));

  return (
    <Show when={formControl?.state.invalid}>
      <Box id={id()} class={classes()} aria-live="polite" {...formControlDataAttrs()} {...others} />
    </Show>
  );
}

FormErrorMessage.toString = () => createCssSelector(hopeFormErrorMessageClass);
