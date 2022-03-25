import { Accessor, createMemo, JSX, splitProps } from "solid-js";

import { classNames, createClassSelector } from "@/utils/css";
import { normalizeEventKey } from "@/utils/dom";
import { focus } from "@/utils/focus";
import { callHandler } from "@/utils/function";
import { EventKeyMap } from "@/utils/types";

import { Box } from "../box/box";
import { createDescendantContext } from "../descendant/use-descendant";
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
  const tabsContext = useTabsContext();

  const tabsDescendantsManager = createTabsDescendantsManager();

  const [local, others] = splitProps(props as TabListProps<"div">, ["class", "onKeyDown"]);

  const nextTab = () => {
    const next = tabsDescendantsManager.nextEnabled(tabsContext.state.selectedIndex);

    if (next) {
      focus(next.node);
    }
  };

  const prevTab = () => {
    const prev = tabsDescendantsManager.prevEnabled(tabsContext.state.selectedIndex);

    if (prev) {
      focus(prev.node);
    }
  };

  const firstTab = () => {
    const first = tabsDescendantsManager.firstEnabled();

    if (first) {
      focus(first.node);
    }
  };

  const lastTab = () => {
    const last = tabsDescendantsManager.lastEnabled();

    if (last) {
      focus(last.node);
    }
  };

  const isHorizontal = () => tabsContext.state.orientation === "horizontal";
  const isVertical = () => tabsContext.state.orientation === "vertical";

  const keyMap: Accessor<EventKeyMap> = createMemo(() => ({
    ArrowLeft: () => isHorizontal() && prevTab(),
    ArrowRight: () => isHorizontal() && nextTab(),
    ArrowDown: () => isVertical() && nextTab(),
    ArrowUp: () => isVertical() && prevTab(),
    Home: firstTab,
    End: lastTab,
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
    <TabsDescendantsProvider value={tabsDescendantsManager}>
      <Box
        role="tablist"
        aria-orientation={tabsContext.state.orientation}
        class={classes()}
        onKeyDown={onKeyDown}
        {...others}
      />
    </TabsDescendantsProvider>
  );
}

TabList.toString = () => createClassSelector(hopeTabListClass);

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

/**
 * Context for managing descendant `tab` components.
 */
export const [TabsDescendantsProvider, useTabsDescendantsContext, createTabsDescendantsManager, useTabsDescendant] =
  createDescendantContext<HTMLButtonElement>();
