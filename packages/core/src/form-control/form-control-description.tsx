import { createHopeComponent, hope } from "@hope-ui/styles";
import { clsx } from "clsx";
import { onCleanup, onMount, splitProps } from "solid-js";

import { useFormControlContext } from "./form-control-context";

export const FormControlDescription = createHopeComponent<"div">(props => {
  const context = useFormControlContext();

  const [local, others] = splitProps(props, ["id", "class", "__css"]);

  const id = () => local.id ?? context?.descriptionId();

  onMount(() => context?.setHasDescription(true));
  onCleanup(() => context?.setHasDescription(false));

  return (
    <hope.div
      id={id()}
      data-required={context?.isRequired() || undefined}
      data-disabled={context?.isDisabled() || undefined}
      data-readonly={context?.isReadOnly() || undefined}
      data-invalid={context?.isInvalid() || undefined}
      class={clsx(context?.baseClasses().description, local.class)}
      __css={{ ...context?.styleOverrides().description, ...local.__css }}
      {...others}
    />
  );
});
