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

  const { classes, styleOverrides } = useStyleConfigContext<ButtonParts>();

  const iconStyles: Accessor<SystemStyleObject> = createMemo(() => ({
    ...styleOverrides().icon,
    ...local.__css,
  }));

  return (
    <hope.span
      aria-hidden={true}
      class={clsx(classes().icon, local.class)}
      __css={iconStyles()}
      {...others}
    />
  );
});
