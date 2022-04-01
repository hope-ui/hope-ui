import type { Placement } from "@floating-ui/dom";
import { autoUpdate, computePosition, flip, offset, shift } from "@floating-ui/dom";
import { Accessor, createContext, createUniqueId, JSX, Show, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { SystemStyleObject } from "@/styled-system/types";
import { useComponentStyleConfigs } from "@/theme/provider";
import { isScrollable, maintainScrollVisibility } from "@/utils/dom";
import { isChildrenFunction } from "@/utils/solid";

import { getActionFromKey, getIndexByLetter, getUpdatedIndex, MenuActions, MenuItemData } from "./menu.utils";

type MenuMotionPreset = "scale-top-left" | "scale-top-right" | "scale-bottom-left" | "scale-bottom-right" | "none";

type MenuChildrenRenderProp = (props: { opened: Accessor<boolean> }) => JSX.Element;

interface ThemeableMenuOptions {
  /**
   * If `true`, the menu will close when a menu item is selected.
   */
  closeOnSelect?: boolean;

  /**
   * Offset between the menu content and the reference (trigger) element.
   */
  offset?: number;

  /**
   * Placement of the menu content.
   */
  placement?: Placement;

  /**
   * Menu content opening/closing transition.
   */
  motionPreset?: MenuMotionPreset;
}

export interface MenuProps extends ThemeableMenuOptions {
  /**
   * The `id` of the menu.
   */
  id?: string;

  /**
   * Children of the menu.
   */
  children?: JSX.Element | MenuChildrenRenderProp;
}

interface MenuState {
  /**
   * If `true`, the menu will be open.
   */
  opened: boolean;

  /**
   * If `true`, the menu will close when a menu item is clicked.
   */
  closeOnSelect: boolean;

  /**
   * The id of the current `aria-activedescendent` element.
   */
  activeDescendantId?: string;

  /**
   * The `id` of the `MenuTrigger`.
   */
  triggerId: string;

  /**
   * The `id` of the `MenuContent`.
   */
  menuContentId: string;

  /**
   * The prefix of the group labels (`MenuLabel`) `id`.
   */
  labelIdPrefix: string;

  /**
   * The prefix of the menutiems (`MenuItem`) `id`.
   */
  itemIdPrefix: string;

  /**
   * The list of available item.
   */
  items: MenuItemData[];

  /**
   * Menu opening/closing transition.
   */
  motionPreset?: MenuMotionPreset;

  /**
   * Index of the active `MenuItem`.
   */
  activeIndex: number;

  /**
   * If `true`, prevent the blur event when clicking a `MenuItem`.
   */
  ignoreBlur: boolean;

  /**
   * The string to search for in the `MenuContent`.
   */
  searchString: string;

  /**
   * The timeout id of the search functionnality.
   */
  searchTimeoutId?: number;
}

/**
 * The wrapper component that provides context for all its children.
 */
export function Menu(props: MenuProps) {
  const defaultBaseId = `hope-menu-${createUniqueId()}`;

  const theme = useComponentStyleConfigs().Menu;

  const [state, setState] = createStore<MenuState>({
    get triggerId() {
      return props.id ?? `${defaultBaseId}-trigger`;
    },
    get menuContentId() {
      return `${defaultBaseId}-content`;
    },
    get labelIdPrefix() {
      return `${defaultBaseId}-label`;
    },
    get itemIdPrefix() {
      return `${defaultBaseId}-item`;
    },
    get activeDescendantId() {
      return this.opened ? `${this.itemIdPrefix}-${this.activeIndex}` : undefined;
    },
    get closeOnSelect() {
      return props.closeOnSelect ?? theme?.defaultProps?.root?.closeOnSelect ?? true;
    },
    get motionPreset() {
      if (props.motionPreset) {
        return props.motionPreset;
      }

      if (theme?.defaultProps?.root?.motionPreset) {
        return theme?.defaultProps?.root?.motionPreset;
      }

      if (props.placement?.startsWith("top")) {
        return "scale-bottom-left";
      }

      return "scale-top-left";
    },
    items: [],
    opened: false,
    activeIndex: 0,
    ignoreBlur: false,
    searchString: "",
    searchTimeoutId: undefined,
  });

  // element refs
  let triggerRef: HTMLButtonElement | undefined;
  let contentRef: HTMLDivElement | undefined;

  let cleanupContentAutoUpdate: (() => void) | undefined;

  const updateContentPosition = async () => {
    if (!triggerRef || !contentRef) {
      return;
    }

    const { x, y } = await computePosition(triggerRef, contentRef, {
      placement: props.placement ?? theme?.defaultProps?.root?.placement ?? "bottom-start",
      middleware: [offset(props.offset ?? theme?.defaultProps?.root?.offset ?? 5), flip(), shift()],
    });

    if (!contentRef) {
      return;
    }

    Object.assign(contentRef.style, {
      left: `${Math.round(x)}px`,
      top: `${Math.round(y)}px`,
    });
  };

  const getSearchString = (char: string) => {
    // reset typing timeout and start new timeout
    // this allows us to make multiple-letter matches, like a native select
    if (state.searchTimeoutId) {
      window.clearTimeout(state.searchTimeoutId);
    }

    const searchTimeoutId = window.setTimeout(() => {
      setState("searchString", "");
    }, 500);

    setState("searchTimeoutId", searchTimeoutId);

    // add most recent letter to saved search string
    setState("searchString", searchString => (searchString += char));

    return state.searchString;
  };

  const onItemChange = (index: number) => {
    setState("activeIndex", index);
  };

  const isItemDisabledCallback = (index: number) => {
    return state.items[index].disabled;
  };

  const selectItem = (index: number) => {
    onItemChange(index);

    const menuItem = state.items[index];

    menuItem.onSelect?.();

    if (menuItem.closeOnSelect) {
      updateOpeningState(false);
    } else {
      // if we don't close the menu on select, ensure to bring back focus to the `MenuTrigger` in order to keep keyboard navigation working.
      focusTrigger();
    }
  };

  const focusTrigger = () => {
    triggerRef?.focus();
  };

  const isInsideTrigger = (element: HTMLElement) => {
    return !!triggerRef && triggerRef.contains(element);
  };

  const onTriggerBlur = (event: FocusEvent) => {
    // if the blur was provoked by an element inside the trigger, ignore it
    if (event.relatedTarget && isInsideTrigger(event.relatedTarget as HTMLElement)) {
      return;
    }

    // do not do blur action if ignoreBlur flag has been set
    if (state.ignoreBlur) {
      setState("ignoreBlur", false);
      return;
    }

    if (state.opened) {
      updateOpeningState(false, false);
    }
  };

  const onTriggerClick = () => {
    updateOpeningState(!state.opened, false);
  };

  const onTriggerKeyDown = (event: KeyboardEvent) => {
    const { key } = event;

    const max = state.items.length - 1;
    const action = getActionFromKey(event, state.opened);

    switch (action) {
      case MenuActions.Last:
      case MenuActions.First:
      case MenuActions.Next:
      case MenuActions.Previous:
        event.preventDefault();
        return onItemChange(
          getUpdatedIndex({
            currentIndex: state.activeIndex,
            maxIndex: max,
            initialAction: action,
            isItemDisabled: isItemDisabledCallback,
          })
        );

      case MenuActions.SelectAndClose:
        event.preventDefault();
        selectItem(state.activeIndex);
        return;

      case MenuActions.Close:
        event.preventDefault();
        return updateOpeningState(false);

      case MenuActions.Type:
        return onTriggerType(key);

      case MenuActions.Open:
        event.preventDefault();
        return updateOpeningState(true);

      case MenuActions.OpenAndFocusLast:
        event.preventDefault();
        return updateOpeningState(true, true, true);
    }
  };

  const onTriggerType = (letter: string) => {
    // open the listbox if it is closed
    updateOpeningState(true);

    // find the index of the first matching option
    const searchString = getSearchString(letter);
    const searchIndex = getIndexByLetter(state.items as MenuItemData[], searchString, state.activeIndex + 1);

    // if a match was found, go to it
    if (searchIndex >= 0) {
      onItemChange(searchIndex);
    }

    // if no matches, clear the timeout and search string
    else {
      window.clearTimeout(state.searchTimeoutId);
      setState("searchString", "");
    }
  };

  const onItemClick = (index: number) => {
    // if item is disabled ensure to bring back focus to the `MenuTrigger` in order to keep keyboard navigation working.
    if (state.items[index].disabled) {
      focusTrigger();
      return;
    }

    selectItem(index);
  };

  const onItemMouseMove = (index: number) => {
    // if index is already the active one, do nothing
    if (state.activeIndex === index) {
      return;
    }

    onItemChange(index);
  };

  const onItemMouseDown = () => {
    // Clicking an item will cause a blur event,
    // but we don't want to perform the default keyboard blur action
    setState("ignoreBlur", true);
  };

  const scheduleContentPositionAutoUpdate = () => {
    if (state.opened) {
      updateContentPosition();

      // schedule auto update of the content position.
      if (triggerRef && contentRef) {
        cleanupContentAutoUpdate = autoUpdate(triggerRef, contentRef, updateContentPosition);
      }
    } else {
      cleanupContentAutoUpdate?.();
    }
  };

  const updateOpeningState = (opened: boolean, callFocus = true, lastItemActive = false) => {
    if (state.opened === opened) {
      return;
    }

    setState("opened", opened);

    setState("activeIndex", lastItemActive ? state.items.length - 1 : 0);

    scheduleContentPositionAutoUpdate();

    // move focus back to the button, if needed.
    callFocus && focusTrigger();
  };

  const onContentMouseLeave = () => {
    onItemChange(-1);
  };

  const onContentOutsideClick = (target: HTMLElement) => {
    // clicking inside the trigger is not considered an "outside click"
    if (isInsideTrigger(target)) {
      return;
    }

    updateOpeningState(false, false);
  };

  const isItemActiveDescendant = (index: number) => {
    return index === state.activeIndex;
  };

  const assignTriggerRef = (el: HTMLButtonElement) => {
    triggerRef = el;
  };

  const assignContentRef = (el: HTMLDivElement) => {
    contentRef = el;
  };

  const scrollToItem = (optionRef: HTMLDivElement) => {
    if (!contentRef) {
      return;
    }

    // ensure the new item is in view
    if (isScrollable(contentRef)) {
      maintainScrollVisibility(optionRef, contentRef);
    }
  };

  const registerItem = (itemData: MenuItemData) => {
    const index = state.items.findIndex(item => item.key === itemData.key);

    // do not register the same item twice.
    if (index != -1) {
      return index;
    }

    setState("items", prev => [...prev, itemData]);

    return state.items.length - 1;
  };

  const openedRenderProp = () => state.opened;

  const context: MenuContextValue = {
    state: state as MenuState,
    isItemActiveDescendant,
    assignTriggerRef,
    assignContentRef,
    registerItem,
    scrollToItem,
    onTriggerBlur,
    onTriggerClick,
    onTriggerKeyDown,
    onContentMouseLeave,
    onContentOutsideClick,
    onItemClick,
    onItemMouseMove,
    onItemMouseDown,
  };

  return (
    <MenuContext.Provider value={context}>
      <Show when={isChildrenFunction(props)} fallback={props.children as JSX.Element}>
        {(props.children as MenuChildrenRenderProp)?.({ opened: openedRenderProp })}
      </Show>
    </MenuContext.Provider>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

interface MenuContextValue {
  state: MenuState;

  /**
   * Check if the item is the current active-descendant by comparing its index with the active index.
   */
  isItemActiveDescendant: (index: number) => boolean;

  /**
   * Callback to assign the `MenuTrigger` ref.
   */
  assignTriggerRef: (el: HTMLButtonElement) => void;

  /**
   * Callback to assign the `MenuContent` ref.
   */
  assignContentRef: (el: HTMLDivElement) => void;

  /**
   * Scroll to the active item.
   */
  scrollToItem: (itemRef: HTMLDivElement) => void;

  /**
   * Callback to notify the context that a `MenuItem` is mounted.
   * @return The index of the item.
   */
  registerItem: (itemData: MenuItemData) => number;

  /**
   * Callback invoked when the `MenuTrigger` loose focus.
   */
  onTriggerBlur: (event: FocusEvent) => void;

  /**
   * Callback invoked when the user click on the `MenuTrigger`.
   */
  onTriggerClick: (event: MouseEvent) => void;

  /**
   * Callback invoked when the user trigger the `MenuTrigger` with keyboard.
   */
  onTriggerKeyDown: (event: KeyboardEvent) => void;

  /**
   * Callback invoked when the user click on a `MenuItem`.
   */
  onItemClick: (index: number) => void;

  /**
   * Callback invoked when the user cursor move on a `MenuItem`.
   */
  onItemMouseMove: (index: number) => void;

  /**
   * Callback invoked when the user click on a `MenuItem`.
   */
  onItemMouseDown: () => void;

  /**
   * Callback invoked when the user click outside the `MenuContent`.
   */
  onContentOutsideClick: (target: HTMLElement) => void;

  /**
   * Callback invoked when the user cursor leave the `MenuContent`.
   */
  onContentMouseLeave: () => void;
}

const MenuContext = createContext<MenuContextValue>();

export function useMenuContext() {
  const context = useContext(MenuContext);

  if (!context) {
    throw new Error("[Hope UI]: useMenuContext must be used within a `<Menu />` component");
  }

  return context;
}

/* -------------------------------------------------------------------------------------------------
 * StyleConfig
 * -----------------------------------------------------------------------------------------------*/

export interface MenuStyleConfig {
  baseStyle?: {
    trigger?: SystemStyleObject;
    content?: SystemStyleObject;
    group?: SystemStyleObject;
    label?: SystemStyleObject;
    item?: SystemStyleObject;
    itemText?: SystemStyleObject;
    itemIconWrapper?: SystemStyleObject;
    itemCommand?: SystemStyleObject;
  };
  defaultProps?: {
    root?: ThemeableMenuOptions;
  };
}
