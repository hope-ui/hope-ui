import { createHopeComponent, hope } from "@hope-ui/styles";
import { dataAttr } from "@hope-ui/utils";
import { clsx } from "clsx";
import { onCleanup, onMount, splitProps } from "solid-js";

import { useRequiredFormControlContext } from "./form-control-context";

export const FormControlError = createHopeComponent<"div">(props => {
  const context = useRequiredFormControlContext();

  const [local, others] = splitProps(props, ["id", "class", "__css"]);

  const id = () => local.id ?? context.errorId();

  onMount(() => context.setHasError(true));
  onCleanup(() => context.setHasError(false));

  return (
    <hope.div
      aria-live="polite"
      id={id()}
      data-required={dataAttr(context.isRequired())}
      data-disabled={dataAttr(context.isDisabled())}
      data-readonly={dataAttr(context.isReadOnly())}
      data-invalid={dataAttr(context.isInvalid())}
      class={clsx(context.baseClasses().error, local.class)}
      __css={{ ...context.styleOverrides().error, ...local.__css }}
      {...others}
    />
  );
});
