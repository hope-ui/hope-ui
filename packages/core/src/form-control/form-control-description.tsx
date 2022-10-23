import { createHopeComponent, hope } from "@hope-ui/styles";
import { dataAttr } from "@hope-ui/utils";
import { clsx } from "clsx";
import { onCleanup, onMount, splitProps } from "solid-js";

import { useRequiredFormControlContext } from "./form-control-context";

export const FormControlDescription = createHopeComponent<"div">(props => {
  const context = useRequiredFormControlContext();

  const [local, others] = splitProps(props, ["id", "class", "__css"]);

  const id = () => local.id ?? context.descriptionId();

  onMount(() => context.setHasDescription(true));
  onCleanup(() => context.setHasDescription(false));

  return (
    <hope.div
      id={id()}
      data-required={dataAttr(context.isRequired())}
      data-disabled={dataAttr(context.isDisabled())}
      data-readonly={dataAttr(context.isReadOnly())}
      data-invalid={dataAttr(context.isInvalid())}
      class={clsx(context.baseClasses().description, local.class)}
      __css={{ ...context.styleOverrides().description, ...local.__css }}
      {...others}
    />
  );
});
