import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";

export type ListItemProps<C extends ElementType = "li"> = HTMLHopeProps<C>;

const hopeListItemClass = "hope-list__item";

/**
 * ListItem is used to render a list item, it renders a `<li>` by default.
 */
export function ListItem<C extends ElementType = "li">(props: ListItemProps<C>) {
  const [local, others] = splitProps(props, ["class"]);

  const classes = () => classNames(local.class, hopeListItemClass);

  return <hope.li class={classes()} {...others} />;
}

ListItem.toString = () => createClassSelector(hopeListItemClass);
