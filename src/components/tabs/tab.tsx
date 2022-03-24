import { createMemo, JSX, splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";
import { callHandler } from "@/utils/function";

import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { makeTabId, makeTabPanelId, useTabsContext, useTabsDescendant } from "./tabs";
import { tabStyles } from "./tabs.styles";

interface TabOptions {
  panelId?: string;
}

export type TabProps<C extends ElementType = "button"> = HTMLHopeProps<C, TabOptions>;

const hopeTabClass = "hope-tabs__tab";

/**
 * Tab button used to activate a specific tab panel. It renders a `button`,
 * and is responsible for automatic and manual selection modes.
 */
export function Tab<C extends ElementType = "button">(props: TabProps<C>) {
  const tabsContext = useTabsContext();

  const [local, others] = splitProps(props as TabProps<"button">, ["class", "disabled", "onClick", "onFocus"]);

  const tabsDescendant = createMemo(() => {
    return useTabsDescendant({ disabled: local.disabled });
  });

  const isSelected = () => tabsDescendant().index() === tabsContext.state.selectedIndex;

  const tabId = () => makeTabId(tabsContext.state.id, tabsDescendant().index());

  const tabPanelId = () => makeTabPanelId(tabsContext.state.id, tabsDescendant().index());

  const onClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = event => {
    tabsContext.setSelectedIndex(tabsDescendant().index());

    callHandler(local.onClick)(event);
  };

  const onFocus: JSX.EventHandlerUnion<HTMLButtonElement, FocusEvent> = event => {
    tabsContext.setSelectedIndex(tabsDescendant().index());

    callHandler(local.onFocus)(event);
  };

  const classes = () => {
    return classNames(
      local.class,
      hopeTabClass,
      tabStyles({
        orientation: tabsContext.state.orientation,
        variant: tabsContext.state.variant,
        colorScheme: tabsContext.state.colorScheme,
        size: tabsContext.state.size,
        fitted: tabsContext.state.fitted,
      })
    );
  };

  return (
    <hope.button
      role="tab"
      id={tabId()}
      tabIndex={isSelected() ? 0 : -1}
      disabled={local.disabled}
      aria-selected={isSelected()}
      aria-controls={tabPanelId()}
      class={classes()}
      onClick={onClick}
      onFocus={onFocus}
      {...others}
    />
  );
}

Tab.toString = () => createClassSelector(hopeTabClass);
