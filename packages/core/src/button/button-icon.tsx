import { createHopeComponent, hope, useStyleConfigContext } from "@hope-ui/styles";
import { clsx } from "clsx";
import { splitProps } from "solid-js";

import { ButtonParts } from "./button.styles";

export const ButtonIcon = createHopeComponent<"span">(props => {
  const [local, others] = splitProps(props, ["class"]);

  const { classes, styles } = useStyleConfigContext<ButtonParts>();

  return (
    <hope.span
      aria-hidden={true}
      class={clsx(classes().icon, local.class)}
      __css={styles().icon}
      {...others}
    />
  );
});
