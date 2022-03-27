import { createUniqueId, onMount, splitProps } from "solid-js";

import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useMenuContext } from "./menu";
import { menuLabelStyles } from "./menu.styles";
import { useMenuGroupContext } from "./menu-group";

export type MenuLabelProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeMenuLabelClass = "hope-menu__label";

/**
 * Component used to render the label of a group.
 */
export function MenuLabel<C extends ElementType = "div">(props: MenuLabelProps<C>) {
  const defaultIdSuffix = createUniqueId();

  const theme = useComponentStyleConfigs().Menu;

  const menuContext = useMenuContext();
  const menuGroupContext = useMenuGroupContext();

  const [local, others] = splitProps(props as MenuLabelProps<"div">, ["class", "id"]);

  const id = () => local.id ?? `${menuContext.state.labelIdPrefix}-${defaultIdSuffix}`;

  const classes = () => classNames(local.class, hopeMenuLabelClass, menuLabelStyles());

  onMount(() => {
    menuGroupContext?.setAriaLabelledBy(id());
  });

  return <Box id={id()} class={classes()} __baseStyle={theme?.baseStyle?.label} {...others} />;
}

MenuLabel.toString = () => createClassSelector(hopeMenuLabelClass);
