import { children, Show, splitProps } from "solid-js";
import { Portal } from "solid-js/web";

import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { OutsideClick } from "../select/select-content";
import { ElementType, HTMLHopeProps } from "../types";
import { useMenuContext } from "./menu";
import { menuContentStyles } from "./menu.styles";

export type MenuContentProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeMenuContentClass = "hope-menu__content";

/**
 * The component that pops out when the menu is open.
 */
export function MenuContent<C extends ElementType = "div">(props: MenuContentProps<C>) {
  const menuContext = useMenuContext();

  const [local, others] = splitProps(props as MenuContentProps<"div">, ["ref", "class", "children"]);

  // hack to force children `SelectOption` to mount and register themself to the select.
  const resolvedChildren = children(() => local.children);

  const assignContentRef = (el: HTMLDivElement) => {
    menuContext.assignContentRef(el);

    if (isFunction(local.ref)) {
      local.ref(el);
    } else {
      // eslint-disable-next-line solid/reactivity
      local.ref = el;
    }
  };

  const onOutsideClick = (event: Event) => {
    menuContext.onContentOutsideClick(event.target as HTMLElement);
  };

  const classes = () => classNames(local.class, hopeMenuContentClass, menuContentStyles());

  return (
    <Show when={menuContext.state.opened}>
      <Portal>
        <OutsideClick onOutsideClick={onOutsideClick}>
          <Box
            role="menu"
            tabindex="-1"
            ref={assignContentRef}
            id={menuContext.state.menuContentId}
            aria-activedescendant={menuContext.state.activeDescendantId}
            aria-labelledby={menuContext.state.triggerId}
            aria-orientation="vertical"
            class={classes()}
            onMouseLeave={menuContext.onContentMouseLeave}
            {...others}
          >
            {resolvedChildren()}
          </Box>
        </OutsideClick>
      </Portal>
    </Show>
  );
}

MenuContent.toString = () => createClassSelector(hopeMenuContentClass);
