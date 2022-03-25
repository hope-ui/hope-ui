import { createEffect, JSX, on, splitProps } from "solid-js";

import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";
import { callHandler } from "@/utils/function";

import { hope } from "../factory";
import { ElementType, HTMLHopeProps } from "../types";
import { useTabsDescendant } from "./tab-list";
import { useTabsContext } from "./tabs";
import { tabStyles } from "./tabs.styles";

interface TabOptions {
  /**
   * The `id` of the tab-panel activated by this tab.
   */
  panelId?: string;
}

export type TabProps<C extends ElementType = "button"> = HTMLHopeProps<C, TabOptions>;

const hopeTabClass = "hope-tabs__tab";

/**
 * Tab button used to activate a specific tab panel. It renders a `button` by default.
 */
export function Tab<C extends ElementType = "button">(props: TabProps<C>) {
  const tabsContext = useTabsContext();

  const [local, others] = splitProps(props as TabProps<"button">, ["ref", "class", "disabled", "onClick", "onFocus"]);

  const tabsDescendant = useTabsDescendant(local);

  const isSelected = () => tabsContext.isSelectedIndex(tabsDescendant.index());

  const tabId = () => tabsContext.getTabId(tabsDescendant.index());

  const tabPanelId = () => tabsContext.getTabPanelId(tabsDescendant.index());

  const assignTabRef = (el: HTMLButtonElement) => {
    tabsDescendant.assignRef(el);

    if (isFunction(local.ref)) {
      local.ref(el);
    } else {
      // eslint-disable-next-line solid/reactivity
      local.ref = el;
    }
  };

  const onClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = event => {
    tabsContext.setSelectedIndex(tabsDescendant.index());

    callHandler(local.onClick)(event);
  };

  const onFocus: JSX.EventHandlerUnion<HTMLButtonElement, FocusEvent> = event => {
    tabsContext.setSelectedIndex(tabsDescendant.index());

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

  createEffect(
    on(
      () => local.disabled,
      () => tabsDescendant.setDisabled(!!local.disabled)
    )
  );

  return (
    <hope.button
      ref={assignTabRef}
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
