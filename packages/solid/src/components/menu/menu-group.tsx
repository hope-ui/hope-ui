import { createContext, createSignal, splitProps, useContext } from "solid-js";

import { useComponentStyleConfigs } from "../../theme/provider";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { menuGroupStyles } from "./menu.styles";

export interface MenuGroupContextValue {
  setAriaLabelledBy: (id: string) => void;
}

const MenuGroupContext = createContext<MenuGroupContextValue>();

export type MenuGroupProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeMenuGroupClass = "hope-menu__group";

/**
 * Component used to group multiple menu item.
 */
export function MenuGroup<C extends ElementType = "div">(props: MenuGroupProps<C>) {
  const theme = useComponentStyleConfigs().Menu;

  const [ariaLabelledBy, setAriaLabelledBy] = createSignal<string>();

  const [local, others] = splitProps(props as MenuGroupProps<"div">, ["class", "children"]);

  const classes = () => classNames(local.class, hopeMenuGroupClass, menuGroupStyles());

  const context: MenuGroupContextValue = {
    setAriaLabelledBy,
  };

  return (
    <MenuGroupContext.Provider value={context}>
      <Box
        role="group"
        aria-labelledby={ariaLabelledBy()}
        class={classes()}
        __baseStyle={theme?.baseStyle?.group}
        {...others}
      >
        {local.children}
      </Box>
    </MenuGroupContext.Provider>
  );
}

MenuGroup.toString = () => createClassSelector(hopeMenuGroupClass);

export function useMenuGroupContext() {
  return useContext(MenuGroupContext);
}
