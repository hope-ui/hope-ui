import { onCleanup, onMount, Show, splitProps } from "solid-js";

import { classNames, createCssSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HopeComponentProps } from "../types";
import { useFormControlContext } from "./form-control";

export type FormErrorMessageProps<C extends ElementType> = HopeComponentProps<C>;

const hopeFormErrorMessageClass = "hope-form-error-message";

export function FormErrorMessage<C extends ElementType = "div">(props: FormErrorMessageProps<C>) {
  const formControl = useFormControlContext();

  const [local, others] = splitProps(props as FormErrorMessageProps<"div">, ["id", "class"]);

  const id = () => local.id ?? formControl?.state.errorMessageId;

  const classes = () => classNames(local.class, hopeFormErrorMessageClass);

  onMount(() => {
    formControl?.setHasErrorMessage(true);
  });

  onCleanup(() => {
    formControl?.setHasErrorMessage(false);
  });

  return (
    <Show when={formControl?.state.invalid}>
      <Box aria-live="polite" id={id()} class={classes()} {...others} />
    </Show>
  );
}

FormErrorMessage.toString = () => createCssSelector(hopeFormErrorMessageClass);
