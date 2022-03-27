import { children, Show, splitProps } from "solid-js";

import { isFunction } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useTabPanelsDescendant } from "./tab-panels";
import { useTabsContext } from "./tabs";
import { tabPanelStyles } from "./tabs.styles";

export type TabPanelProps<C extends ElementType = "div"> = HTMLHopeProps<C>;

const hopeTabPanelClass = "hope-tabs__tab-panel";

/**
 * TabPanel is used to render the content for a specific tab.
 */
export function TabPanel<C extends ElementType = "div">(props: TabPanelProps<C>) {
  const tabsContext = useTabsContext();

  const [local, others] = splitProps(props as TabPanelProps<"div">, ["ref", "class", "children"]);

  const tabPanelsDescendant = useTabPanelsDescendant();

  const isSelected = () => tabsContext.isSelectedIndex(tabPanelsDescendant.index());

  const tabId = () => tabsContext.getTabId(tabPanelsDescendant.index());

  const tabPanelId = () => tabsContext.getTabPanelId(tabPanelsDescendant.index());

  const assignTabPanelRef = (el: HTMLDivElement) => {
    tabPanelsDescendant.assignRef(el);

    if (isFunction(local.ref)) {
      local.ref(el);
    } else {
      // eslint-disable-next-line solid/reactivity
      local.ref = el;
    }
  };

  const resolvedChildren = children(() => local.children);

  const classes = () => {
    return classNames(local.class, hopeTabPanelClass, tabPanelStyles());
  };

  return (
    <Box
      ref={assignTabPanelRef}
      role="tabpanel"
      tabIndex="0"
      id={tabPanelId()}
      aria-labelledby={tabId()}
      hidden={!isSelected()}
      class={classes()}
      {...others}
    >
      <Show when={isSelected()}>
        <Show when={tabsContext.state.keepAlive} fallback={local.children}>
          {resolvedChildren()}
        </Show>
      </Show>
    </Box>
  );
}

TabPanel.toString = () => createClassSelector(hopeTabPanelClass);
