import {
  createHopeComponent,
  hope,
  SystemStyleObject,
  useStyleConfigContext,
} from "@hope-ui/styles";
import { clsx } from "clsx";
import { Accessor, createMemo, splitProps } from "solid-js";

import { ButtonParts } from "./button.styles";

export const ButtonIcon = createHopeComponent<"span">(props => {
  const [local, others] = splitProps(props, ["class", "__css"]);

  const { classes, styles } = useStyleConfigContext<ButtonParts>();

  const iconStyles: Accessor<SystemStyleObject> = createMemo(() => ({
    ...styles().icon,
    ...local.__css,
  }));

  return (
    <hope.span
      aria-hidden={true}
      class={clsx("hope-button__icon", classes().icon, local.class)}
      __css={iconStyles()}
      {...others}
    />
  );
});
