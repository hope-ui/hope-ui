import { JSX, splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { isFunction } from "../../utils/assertion";
import { classNames, createClassSelector } from "../../utils/css";
import { chainHandlers } from "../../utils/function";
import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { useMenuContext } from "./menu";
import { menuTriggerStyles } from "./menu.styles";

export type MenuTriggerProps<C extends ElementType = "button"> = HTMLHopeProps<C>;

const hopeMenuTriggerClass = "hope-menu__trigger";

/**
 * The trigger that toggles the menu.
 */
export function MenuTrigger<C extends ElementType = "button">(props: MenuTriggerProps<C>) {
  const theme = useStyleConfig().Menu;

  const menuContext = useMenuContext();

  const [local, others] = splitProps(props as MenuTriggerProps<"button">, [
    "ref",
    "class",
    "onClick",
    "onKeyDown",
    "onBlur",
  ]);

  const assignTriggerRef = (el: HTMLButtonElement) => {
    menuContext.assignTriggerRef(el);

    if (isFunction(local.ref)) {
      local.ref(el);
    } else {
      // eslint-disable-next-line solid/reactivity
      local.ref = el;
    }
  };

  const onClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = event => {
    chainHandlers(menuContext.onTriggerClick, local.onClick)(event);
  };

  const onKeyDown: JSX.EventHandlerUnion<HTMLButtonElement, KeyboardEvent> = event => {
    chainHandlers(menuContext.onTriggerKeyDown, local.onKeyDown)(event);
  };

  const onBlur: JSX.EventHandlerUnion<HTMLButtonElement, FocusEvent> = event => {
    chainHandlers(menuContext.onTriggerBlur, local.onBlur)(event);
  };

  const classes = () => classNames(local.class, hopeMenuTriggerClass, menuTriggerStyles());

  return (
    <hope.button
      ref={assignTriggerRef}
      id={menuContext.state.triggerId}
      type="button"
      aria-haspopup="menu"
      aria-controls={menuContext.state.menuContentId}
      aria-expanded={menuContext.state.opened}
      class={classes()}
      __baseStyle={theme?.baseStyle?.trigger}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onBlur={onBlur}
      {...others}
    />
  );
}

MenuTrigger.toString = () => createClassSelector(hopeMenuTriggerClass);
