import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { tabPanelsStyles } from "./tabs.styles";
import { makeTabId, makeTabPanelId, useTabsContext } from "./tabs";

export type TabPanelsProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeTabPanelsClass = "hope-tabs__tab-panels";

/**
 * TabPanel is used to manage the rendering of multiple tab panels.
 * It renders a `div` by default.
 */
export function TabPanels<C extends ElementType = "div">(props: TabPanelsProps<C>) {
  const tabsContext = useTabsContext();

  const [local, others] = splitProps(props, ["class"]);

  const classes = () => {
    return classNames(local.class, hopeTabPanelsClass, tabPanelsStyles());
  };

  return <Box class={classes()} {...others} />;
}

TabPanels.toString = () => createClassSelector(hopeTabPanelsClass);
