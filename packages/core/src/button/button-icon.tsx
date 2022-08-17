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

  const styles = useStyleConfigContext<ButtonParts>();

  const iconStyles: Accessor<SystemStyleObject> = createMemo(() => ({
    ...styles().icon,
    ...local.__css,
  }));

  return (
    <hope.span
      __css={iconStyles()}
      class={clsx("hope-button__icon", local.class)}
      aria-hidden={true}
      {...others}
    />
  );
});
