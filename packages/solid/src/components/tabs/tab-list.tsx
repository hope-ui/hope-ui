import { Accessor, createMemo, JSX, splitProps } from "solid-js";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { normalizeEventKey } from "../../utils/dom";
import { callHandler } from "../../utils/function";
import { EventKeyMap } from "../../utils/types";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useTabsContext } from "./tabs";
import { tabListStyles } from "./tabs.styles";

export type TabListProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeTabListClass = "hope-tabs__tablist";

/**
 * TabList is used to manage a list of tab buttons. It renders a `div` by default,
 * and is responsible of the keyboard interaction between tabs.
 */
export function TabList<C extends ElementType = "div">(props: TabListProps<C>) {
  const theme = useStyleConfig().Tabs;

  const tabsContext = useTabsContext();

  const [local, others] = splitProps(props as TabListProps<"div">, ["class", "onKeyDown"]);

  const isHorizontal = () => tabsContext.state.orientation === "horizontal";
  const isVertical = () => tabsContext.state.orientation === "vertical";

  const onArrowLeftKeyDown = () => isHorizontal() && tabsContext.focusPrevTab();
  const onArrowRightKeyDown = () => isHorizontal() && tabsContext.focusNextTab();
  const onArrowDownKeyDown = () => isVertical() && tabsContext.focusNextTab();
  const onArrowUpKeyDown = () => isVertical() && tabsContext.focusPrevTab();

  const keyMap: Accessor<EventKeyMap> = createMemo(() => ({
    ArrowLeft: onArrowLeftKeyDown,
    ArrowRight: onArrowRightKeyDown,
    ArrowDown: onArrowDownKeyDown,
    ArrowUp: onArrowUpKeyDown,
    Home: tabsContext.focusFirstTab,
    End: tabsContext.focusLastTab,
  }));

  const onKeyDown: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent> = event => {
    callHandler(local.onKeyDown)(event);

    const eventKey = normalizeEventKey(event);

    const action = keyMap()[eventKey];

    if (action) {
      event.preventDefault();
      callHandler(action)(event);
    }
  };

  const classes = () => {
    return classNames(
      local.class,
      hopeTabListClass,
      tabListStyles({
        alignment: tabsContext.state.alignment,
        orientation: tabsContext.state.orientation,
        variant: tabsContext.state.variant,
      })
    );
  };

  return (
    <Box
      role="tablist"
      aria-orientation={tabsContext.state.orientation}
      class={classes()}
      __baseStyle={theme?.baseStyle?.tabList}
      onKeyDown={onKeyDown}
      {...others}
    />
  );
}

TabList.toString = () => createClassSelector(hopeTabListClass);
