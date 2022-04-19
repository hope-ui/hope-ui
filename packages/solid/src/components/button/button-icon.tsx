import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "../../utils/css";
import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { buttonIconStyles } from "./button.styles";

export type ButtonIconProps<C extends ElementType = "span"> = HTMLHopeProps<C>;

const hopeButtonIconClass = "hope-button__icon";

export function ButtonIcon<C extends ElementType = "span">(props: ButtonIconProps<C>) {
  const [local, others] = splitProps(props, ["class", "children"]);

  const classes = () => classNames(local.class, hopeButtonIconClass, buttonIconStyles());

  return (
    <hope.span class={classes()} {...others}>
      {local.children}
    </hope.span>
  );
}

ButtonIcon.toString = () => createClassSelector(hopeButtonIconClass);
