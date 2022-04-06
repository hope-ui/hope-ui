import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "../../utils/css";
import { Icon, IconProps } from "../icon/icon";
import { ElementType } from "../types";
import { listIconStyles } from "./list.styles";

const hopeListIconClass = "hope-list__icon";

/**
 * ListIcon is used to render an icon beside the list item text.
 */
export function ListIcon<C extends ElementType = "svg">(props: IconProps<C>) {
  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeListIconClass, listIconStyles());

  return <Icon role="presentation" class={classes()} verticalAlign="text-bottom" {...others} />;
}

ListIcon.toString = () => createClassSelector(hopeListIconClass);
