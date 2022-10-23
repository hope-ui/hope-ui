import { createHopeComponent, hope } from "@hope-ui/styles";
import { clsx } from "clsx";
import { onCleanup, onMount, Show, splitProps } from "solid-js";

import { useFormControlContext } from "./form-control-context";

export const FormControlErrorMessage = createHopeComponent<"div">(props => {
  const context = useFormControlContext();

  const [local, others] = splitProps(props, ["id", "class", "__css"]);

  const id = () => local.id ?? context?.errorMessageId();

  onMount(() => context?.setHasErrorMessage(true));
  onCleanup(() => context?.setHasErrorMessage(false));

  return (
    <hope.div
      aria-live="polite"
      id={id()}
      data-required={context?.isRequired() || undefined}
      data-disabled={context?.isDisabled() || undefined}
      data-readonly={context?.isReadOnly() || undefined}
      data-invalid={context?.isInvalid() || undefined}
      class={clsx(context?.baseClasses().errorMessage, local.class)}
      __css={{ ...context?.styleOverrides().errorMessage, ...local.__css }}
      {...others}
    />
  );
});
