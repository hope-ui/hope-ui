import { createHopeComponent, hope } from "@hope-ui/styles";
import { clsx } from "clsx";
import { splitProps } from "solid-js";

import { useFormControlContext } from "./form-control-context";

export const FormControlLabel = createHopeComponent<"label">(props => {
  const context = useFormControlContext();

  const [local, others] = splitProps(props, ["id", "for", "class", "__css"]);

  const id = () => local.id ?? context?.labelId();
  const htmlFor = () => local.for ?? context?.id();

  return (
    <hope.label
      id={id()}
      for={htmlFor()}
      data-required={context?.isRequired() || undefined}
      data-disabled={context?.isDisabled() || undefined}
      data-readonly={context?.isReadOnly() || undefined}
      data-invalid={context?.isInvalid() || undefined}
      class={clsx(context?.baseClasses().label, local.class)}
      __css={{ ...context?.styleOverrides().label, ...local.__css }}
      {...others}
    />
  );
});
