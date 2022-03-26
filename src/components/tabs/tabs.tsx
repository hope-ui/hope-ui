import { createContext, createUniqueId, splitProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { SystemStyleObject } from "@/styled-system/types";
import { useComponentStyleConfigs } from "@/theme/provider";
import { classNames, createClassSelector } from "@/utils/css";

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
   * The id of the tabs component.
   */
  id: string;

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
}

const hopeTabsClass = "hope-tabs";

/**
 * Tabs provides context and logic for all tabs components.
 */
export function Tabs<C extends ElementType = "div">(props: TabsProps<C>) {
  const defaultId = `hope-tabs-${createUniqueId()}`;

  const theme = useComponentStyleConfigs().Tabs;

  const [state, setState] = createStore<TabsState>({
    // eslint-disable-next-line solid/reactivity
    _selectedIndex: props.defaultIndex ?? 0,
    get isControlled() {
      return props.index !== undefined;
    },
    get selectedIndex() {
      return this.isControlled ? props.index : this._selectedIndex;
    },
    get id() {
      return props.id ?? defaultId;
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

  const setSelectedIndex = (index: number) => {
    setState("_selectedIndex", index);

    local.onChange?.(index);
  };

  const isSelectedIndex = (index: number) => {
    return index === state.selectedIndex;
  };

  const getTabId = (index: number) => {
    return `${state.id}--tab-${index}`;
  };

  const getTabPanelId = (index: number) => {
    return `${state.id}--tabpanel-${index}`;
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
    state,
    setSelectedIndex,
    isSelectedIndex,
    getTabId,
    getTabPanelId,
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
