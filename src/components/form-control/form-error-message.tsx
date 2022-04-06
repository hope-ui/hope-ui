import { onCleanup, onMount, Show, splitProps } from "solid-js";

import { useComponentStyleConfigs } from "../../theme/provider";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useFormControlContext } from "./form-control";
import { formErrorMessageStyles } from "./form-control.styles";

export type FormErrorMessageProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeFormErrorMessageClass = "hope-form-error-message";

export function FormErrorMessage<C extends ElementType = "div">(props: FormErrorMessageProps<C>) {
  const theme = useComponentStyleConfigs().FormControl;

  const formControl = useFormControlContext();

  const [local, others] = splitProps(props as FormErrorMessageProps<"div">, ["ref", "id", "class"]);

  const id = () => local.id ?? formControl?.state.errorMessageId;

  const classes = () => classNames(local.class, hopeFormErrorMessageClass, formErrorMessageStyles());

  onMount(() => formControl?.setHasErrorMessage(true));
  onCleanup(() => formControl?.setHasErrorMessage(false));

  return (
    <Show when={formControl?.state.invalid}>
      <Box
        aria-live="polite"
        id={id()}
        class={classes()}
        __baseStyle={theme?.baseStyle?.errorMessage}
        data-disabled={formControl?.state["data-disabled"]}
        data-readonly={formControl?.state["data-readonly"]}
        {...others}
      />
    </Show>
  );
}

FormErrorMessage.toString = () => createClassSelector(hopeFormErrorMessageClass);
