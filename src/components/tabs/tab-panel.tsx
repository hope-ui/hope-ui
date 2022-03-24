import { createMemo, Show, splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { tabPanelStyles } from "./tabs.styles";
import { makeTabId, makeTabPanelId, useTabsContext } from "./tabs";

export type TabPanelProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeTabPanelClass = "hope-tabs__tab-panel";

/**
 * TabPanel is used to render the content for a specific tab.
 */
export function TabPanel<C extends ElementType = "div">(props: TabPanelProps<C>) {
  const tabsContext = useTabsContext();

  const [local, others] = splitProps(props, ["class", "children"]);

  const isSelected = () => true;

  const tabId = () => ""; //makeTabId(tabsContext.state.id, tabsDescendant().index());

  const tabPanelId = () => ""; //makeTabPanelId(tabsContext.state.id, tabsDescendant().index());

  const classes = () => {
    return classNames(local.class, hopeTabPanelClass, tabPanelStyles());
  };

  return (
    <Box
      role="tabpanel"
      tabIndex="0"
      id={tabPanelId()}
      aria-labelledby={tabId()}
      hidden={!isSelected()}
      class={classes()}
      {...others}
    >
      <Show when={isSelected()}>{local.children}</Show>
    </Box>
  );
}

TabPanel.toString = () => createClassSelector(hopeTabPanelClass);
