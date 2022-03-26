import { JSX, splitProps } from "solid-js";

import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";
import { callAllHandlers } from "@/utils/function";

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
  const menuContext = useMenuContext();

  const [local, others] = splitProps(props as MenuTriggerProps<"button">, ["ref", "class", "onBlur"]);

  const assignTriggerRef = (el: HTMLButtonElement) => {
    menuContext.assignTriggerRef(el);

    if (isFunction(local.ref)) {
      local.ref(el);
    } else {
      // eslint-disable-next-line solid/reactivity
      local.ref = el;
    }
  };

  const onBlur: JSX.EventHandlerUnion<HTMLButtonElement, FocusEvent> = event => {
    callAllHandlers(menuContext.onTriggerBlur, local.onBlur)(event);
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
      onBlur={onBlur}
      onClick={menuContext.onTriggerClick}
      onKeyDown={menuContext.onTriggerKeyDown}
      {...others}
    />
  );
}

MenuTrigger.toString = () => createClassSelector(hopeMenuTriggerClass);
