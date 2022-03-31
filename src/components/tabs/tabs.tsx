import { createContext, createMemo, createUniqueId, splitProps, useContext } from "solid-js";
import { createStore, DeepReadonly } from "solid-js/store";

import { SystemStyleObject } from "@/styled-system/types";
import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";
import { getNextIndex, getPrevIndex } from "@/utils/number";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { TabListVariants, tabsStyles, TabVariants } from "./tabs.styles";

type ThemeableTabsOptions = Pick<TabListVariants, "alignment"> &
  Omit<TabVariants, "orientation"> & {
    /**
     * If `true`, the content of inactive tab panels stays mounted when unselected.
     */
    keepAlive?: boolean;
  };

interface TabsOptions extends ThemeableTabsOptions {
  /**
   * The orientation of the tab list.
   */
  orientation?: "horizontal" | "vertical";

  /**
   * The index of the selected tab.
   * (in controlled mode)
   */
  index?: number;

  /**
   * The initial index of the selected tab.
   * (in uncontrolled mode)
   */
  defaultIndex?: number;

  /**
   * The id of the tabs component.
   */
  id?: string;

  /**
   * Callback invoked when the index changes.
   * (in controlled or un-controlled modes)
   */
  onChange?: (index: number) => void;
}

export type TabsProps<C extends ElementType = "div"> = HTMLHopeProps<C, TabsOptions>;

interface TabsState extends Required<TabVariants> {
  /**
   * The index of the selected tab.
   * (In uncontrolled mode)
   */
  _selectedIndex: number;

  /**
   * If `true`, the tabs is in controlled mode.
   * (have index and onChange props)
   */
  isControlled: boolean;

  /**
   * The index of the selected tab.
   * (in controlled mode)
   */
  selectedIndex: number;

  /**
   * The base id used as prefix for tab and tab-panel ids.
   */
  baseId: string;

  /**
   * If `true`, the content of inactive tab panels stays mounted when unselected.
   */
  keepAlive: boolean;

  /**
   * The orientation of the tab list.
   */
  orientation: "horizontal" | "vertical";

  /**
   * The alignment of tabs in the tablist.
   */
  alignment: TabListVariants["alignment"];

  /**
   * All tab nodes.
   */
  tabs: Array<HTMLButtonElement>;

  /**
   * All tab panel nodes.
   */
  tabPanels: Array<HTMLElement>;
}

const hopeTabsClass = "hope-tabs";

/**
 * Tabs provides context and logic for all tabs components.
 */
export function Tabs<C extends ElementType = "div">(props: TabsProps<C>) {
  const defaultBaseId = `hope-tabs-${createUniqueId()}`;

  const theme = useComponentStyleConfigs().Tabs;

  const [state, setState] = createStore<TabsState>({
    // eslint-disable-next-line solid/reactivity
    _selectedIndex: props.defaultIndex ?? 0,
    tabs: [],
    tabPanels: [],
    get isControlled() {
      return props.index !== undefined;
    },
    get selectedIndex() {
      return this.isControlled ? props.index : this._selectedIndex;
    },
    get baseId() {
      return props.id ?? defaultBaseId;
    },
    get orientation() {
      return props.orientation ?? "horizontal";
    },
    get keepAlive() {
      return props.keepAlive ?? theme?.defaultProps?.root?.keepAlive ?? false;
    },
    get alignment() {
      return props.alignment ?? theme?.defaultProps?.root?.alignment ?? "start";
    },
    get variant() {
      return props.variant ?? theme?.defaultProps?.root?.variant ?? "underline";
    },
    get colorScheme() {
      return props.colorScheme ?? theme?.defaultProps?.root?.colorScheme ?? "primary";
    },
    get size() {
      return props.size ?? theme?.defaultProps?.root?.size ?? "md";
    },
    get fitted() {
      return props.fitted ?? theme?.defaultProps?.root?.fitted ?? false;
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [local, _, others] = splitProps(
    props,
    ["class", "onChange"],
    ["index", "defaultIndex", "keepAlive", "alignment", "orientation", "variant", "colorScheme", "size", "fitted"]
  );

  const reverseTabs = createMemo(() => state.tabs.slice().reverse());

  const setSelectedIndex = (index: number) => {
    setState("_selectedIndex", index);

    local.onChange?.(index);
  };

  const isSelectedIndex = (index: number) => {
    return index === state.selectedIndex;
  };

  const getTabId = (index: number) => {
    return `${state.baseId}--tab-${index}`;
  };

  const getTabPanelId = (index: number) => {
    return `${state.baseId}--tabpanel-${index}`;
  };

  const registerTab = (node: HTMLButtonElement) => {
    setState("tabs", prev => [...prev, node] as Array<DeepReadonly<HTMLButtonElement>>);

    return state.tabs.length - 1;
  };

  const registerTabPanel = (node: HTMLElement) => {
    setState("tabPanels", prev => [...prev, node] as Array<DeepReadonly<HTMLElement>>);

    return state.tabPanels.length - 1;
  };

  const focusNextTab = () => {
    const lastIndex = state.tabs.length - 1;
    let nextIndex = getNextIndex(tabsContext.state.selectedIndex, lastIndex, true);
    let nextTab = state.tabs[nextIndex];

    while (nextTab.disabled) {
      nextIndex = getNextIndex(nextIndex, lastIndex, true);
      nextTab = state.tabs[nextIndex];
    }

    nextTab.focus();
  };

  const focusPrevTab = () => {
    const lastIndex = state.tabs.length - 1;
    let prevIndex = getPrevIndex(tabsContext.state.selectedIndex, lastIndex, true);
    let prevTab = state.tabs[prevIndex];

    while (prevTab.disabled) {
      prevIndex = getPrevIndex(prevIndex, lastIndex, true);
      prevTab = state.tabs[prevIndex];
    }

    prevTab.focus();
  };

  const focusFirstTab = () => {
    state.tabs.find(tab => !tab.disabled)?.focus();
  };

  const focusLastTab = () => {
    reverseTabs()
      .find(tab => !tab.disabled)
      ?.focus();
  };

  const classes = () => {
    return classNames(
      local.class,
      hopeTabsClass,
      tabsStyles({
        orientation: state.orientation,
      })
    );
  };

  const tabsContext: TabsContextValue = {
    state: state as TabsState,
    setSelectedIndex,
    isSelectedIndex,
    getTabId,
    getTabPanelId,
    registerTab,
    registerTabPanel,
    focusPrevTab,
    focusNextTab,
    focusFirstTab,
    focusLastTab,
  };

  return (
    <TabsContext.Provider value={tabsContext}>
      <Box class={classes()} __baseStyle={theme?.baseStyle?.root} {...others} />
    </TabsContext.Provider>
  );
}

Tabs.toString = () => createClassSelector(hopeTabsClass);

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

interface TabsContextValue {
  state: TabsState;

  /**
   * Callback to set the active tab index.
   */
  setSelectedIndex: (index: number) => void;

  /**
   * Return `true` if the given index is the selected one.
   */
  isSelectedIndex: (index: number) => boolean;

  /**
   * Return the tab `id` of the given index.
   */
  getTabId: (index: number) => string;

  /**
   * Return the tab panel `id` of the given index.
   */
  getTabPanelId: (index: number) => string;

  /**
   * Register a `Tab` to the context.
   * @return The index of the tab.
   */
  registerTab: (node: HTMLButtonElement) => number;

  /**
   * Register a `TabPanel` to the context.
   * @return The index of the tab panel.
   */
  registerTabPanel: (node: HTMLElement) => number;

  /**
   * Focus the previous non disabled tab.
   */
  focusPrevTab: () => void;

  /**
   * Focus the next non disabled tab.
   */
  focusNextTab: () => void;

  /**
   * Focus the first non disabled tab.
   */
  focusFirstTab: () => void;

  /**
   * Focus the last non disabled tab.
   */
  focusLastTab: () => void;
}

const TabsContext = createContext<TabsContextValue>();

export function useTabsContext() {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error("[Hope UI]: useTabsContext must be used within a `<Tabs />` component");
  }

  return context;
}

/* -------------------------------------------------------------------------------------------------
 * StyleConfig
 * -----------------------------------------------------------------------------------------------*/

export interface TabsStyleConfig {
  baseStyle?: {
    root?: SystemStyleObject;
    tabList?: SystemStyleObject;
    tab?: SystemStyleObject;
    tabPanels?: SystemStyleObject;
    tabPanel?: SystemStyleObject;
  };
  defaultProps?: {
    root?: ThemeableTabsOptions;
  };
}
