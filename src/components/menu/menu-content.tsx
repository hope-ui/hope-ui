import { children, createEffect, createSignal, on, Show, splitProps } from "solid-js";
import { Portal } from "solid-js/web";
import { Transition } from "solid-transition-group";

import { useComponentStyleConfigs } from "../../theme/provider";
import { isFunction } from "../../utils/assertion";
import { classNames, createClassSelector } from "../../utils/css";
import { Box } from "../box/box";
import { ClickOutside } from "../click-outside/click-outside";
import { ElementType, HTMLHopeProps } from "../types";
import { useMenuContext } from "./menu";
import { menuContentStyles, menuTransitionName } from "./menu.styles";

export type MenuContentProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeMenuContentClass = "hope-menu__content";

/**
 * The component that pops out when the menu is open.
 */
export function MenuContent<C extends ElementType = "div">(props: MenuContentProps<C>) {
  const theme = useComponentStyleConfigs().Menu;

  const menuContext = useMenuContext();

  const [local, others] = splitProps(props as MenuContentProps<"div">, ["ref", "class", "children"]);

  /**
   * Internal state to handle menu content portal `mounted` state.
   * Dirty hack since solid-transition-group doesn't work with Portal.
   */
  const [isPortalMounted, setIsPortalMounted] = createSignal(false);

  createEffect(
    on(
      () => menuContext.state.opened,
      () => {
        if (menuContext.state.opened) {
          // mount portal when state `opened` is true.
          setIsPortalMounted(true);
        } else {
          // unmount portal instantly when there is no menu transition.
          menuContext.state.motionPreset === "none" && setIsPortalMounted(false);
        }
      }
    )
  );

  // For smooth transition, unmount portal only after menu's content exit transition is done.
  const unmountPortal = () => setIsPortalMounted(false);

  // hack to force children `MenuItem` to mount and register themself to the menu.
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

  const onClickOutside = (event: Event) => {
    menuContext.onContentClickOutside(event.target as HTMLElement);
  };

  const classes = () => classNames(local.class, hopeMenuContentClass, menuContentStyles());

  const transitionName = () => {
    switch (menuContext.state.motionPreset) {
      case "scale-top-left":
        return menuTransitionName.scaleTopLeft;
      case "scale-top-right":
        return menuTransitionName.scaleTopRight;
      case "scale-bottom-left":
        return menuTransitionName.scaleBottomLeft;
      case "scale-bottom-right":
        return menuTransitionName.scaleBottomRight;
      case "none":
        return "hope-none";
    }
  };

  return (
    <Show when={isPortalMounted()}>
      <Portal>
        <Transition name={transitionName()} appear onAfterExit={unmountPortal}>
          <Show when={menuContext.state.opened}>
            <ClickOutside onClickOutside={onClickOutside}>
              <Box
                role="menu"
                tabindex="-1"
                ref={assignContentRef}
                id={menuContext.state.menuContentId}
                aria-activedescendant={menuContext.state.activeDescendantId}
                aria-labelledby={menuContext.state.triggerId}
                aria-orientation="vertical"
                class={classes()}
                __baseStyle={theme?.baseStyle?.content}
                onMouseLeave={menuContext.onContentMouseLeave}
                {...others}
              >
                {resolvedChildren()}
              </Box>
            </ClickOutside>
          </Show>
        </Transition>
      </Portal>
    </Show>
  );
}

MenuContent.toString = () => createClassSelector(hopeMenuContentClass);
