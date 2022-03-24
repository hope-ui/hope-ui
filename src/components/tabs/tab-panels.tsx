import { splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { createDescendantContext } from "../descendant/use-descendant";
import { ElementType, HTMLHopeProps } from "../types";
import { tabPanelsStyles } from "./tabs.styles";

export type TabPanelsProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeTabPanelsClass = "hope-tabs__tab-panels";

/**
 * TabPanel is used to manage the rendering of multiple tab panels.
 * It renders a `div` by default.
 */
export function TabPanels<C extends ElementType = "div">(props: TabPanelsProps<C>) {
  const [local, others] = splitProps(props, ["class"]);

  const tabPanelsDescendantsManager = createTabPanelsDescendantsManager();

  const classes = () => {
    return classNames(local.class, hopeTabPanelsClass, tabPanelsStyles());
  };

  return (
    <TabPanelsDescendantsProvider value={tabPanelsDescendantsManager}>
      <Box class={classes()} {...others} />
    </TabPanelsDescendantsProvider>
  );
}

TabPanels.toString = () => createClassSelector(hopeTabPanelsClass);

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

// Manage descendant tab panels
export const [
  TabPanelsDescendantsProvider,
  useTabPanelsDescendantsContext,
  createTabPanelsDescendantsManager,
  useTabPanelsDescendant,
] = createDescendantContext<HTMLDivElement>();
