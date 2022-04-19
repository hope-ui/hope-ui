import { Accessor, createContext, createMemo, createUniqueId, JSX, Show, splitProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { useStyleConfig } from "../../hope-provider";
import { classNames, createClassSelector } from "../../utils/css";
import { normalizeEventKey } from "../../utils/dom";
import { callHandler } from "../../utils/function";
import { isChildrenFunction } from "../../utils/solid";
import { EventKeyMap } from "../../utils/types";
import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useAccordionContext } from "./accordion";
import { accordionItemStyles } from "./accordion.styles";

type AccordionItemChildrenRenderProp = (props: {
  expanded: Accessor<boolean>;
  disabled: Accessor<boolean>;
}) => JSX.Element;

interface AccordionItemOptions {
  /**
   * If `true`, the accordion item will be disabled.
   */
  disabled?: boolean;

  /**
   * The children of the accordion item.
   */
  children?: JSX.Element | AccordionItemChildrenRenderProp;
}

export type AccordionItemProps<C extends ElementType = "div"> = HTMLHopeProps<C, AccordionItemOptions>;

interface AccordionItemState {
  /**
   * The index of the accordion item.
   */
  index: number;

  /**
   * The id of the accordion button.
   */
  buttonId: string;

  /**
   * The id of the accordion panel.
   */
  panelId: string;

  /**
   * If `true`, the accordion item will be expanded.
   */
  expanded: boolean;

  /**
   * If `true`, the accordion item will be disabled.
   */
  disabled: boolean;
}

const hopeAccordionItemClass = "hope-accordion__item";

/**
 * AccordionItem is a single accordion that provides the open-close
 * behavior when the accordion button is clicked.
 *
 * It also provides context for the accordion button and panel.
 */
export function AccordionItem<C extends ElementType = "div">(props: AccordionItemProps<C>) {
  const defaultIdPrefix = `hope-accordion-item-${createUniqueId()}`;

  const theme = useStyleConfig().Accordion;

  const accordionContext = useAccordionContext();

  const [state, setState] = createStore<AccordionItemState>({
    index: -1,
    get buttonId() {
      return `${defaultIdPrefix}-button`;
    },
    get panelId() {
      return `${defaultIdPrefix}-panel`;
    },
    get expanded() {
      return accordionContext.isExpandedIndex(this.index);
    },
    get disabled() {
      return props.disabled ?? false;
    },
  });

  const [local, others] = splitProps(props, ["class", "children"]);

  const registerButton = (el: HTMLButtonElement) => {
    const index = accordionContext.registerAccordionButton(el);
    setState("index", index);
  };

  const setFocusedIndex = () => {
    accordionContext.setFocusedIndex(state.index);
  };

  const toggleExpandedState = () => {
    accordionContext.setExpandedIndex(state.index, !state.expanded);
  };

  const keyMap: Accessor<EventKeyMap> = createMemo(() => ({
    ArrowDown: accordionContext.focusNextAccordionButton,
    ArrowUp: accordionContext.focusPrevAccordionButton,
    Home: accordionContext.focusFirstAccordionButton,
    End: accordionContext.focusLastAccordionButton,
  }));

  const onButtonKeyDown: JSX.EventHandlerUnion<HTMLButtonElement, KeyboardEvent> = event => {
    const eventKey = normalizeEventKey(event);

    const action = keyMap()[eventKey];

    if (action) {
      event.preventDefault();
      callHandler(action)(event);
    }
  };

  const expandedAccessor = () => state.expanded;
  const disabledAccessor = () => state.disabled;

  const classes = () => classNames(local.class, hopeAccordionItemClass, accordionItemStyles());

  const context: AccordionItemContextValue = {
    state: state as AccordionItemState,
    registerButton,
    setFocusedIndex,
    toggleExpandedState,
    onButtonKeyDown,
  };

  return (
    <AccordionItemContext.Provider value={context}>
      <Box class={classes()} __baseStyle={theme?.baseStyle?.item} {...others}>
        <Show when={isChildrenFunction(local)} fallback={local.children as JSX.Element}>
          {(local.children as AccordionItemChildrenRenderProp)?.({
            expanded: expandedAccessor,
            disabled: disabledAccessor,
          })}
        </Show>
      </Box>
    </AccordionItemContext.Provider>
  );
}

AccordionItem.toString = () => createClassSelector(hopeAccordionItemClass);

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

interface AccordionItemContextValue {
  state: AccordionItemState;

  /**
   * Callback to set the accordion item button to the accordion context.
   */
  registerButton: (el: HTMLButtonElement) => void;

  /**
   * Callback to notify the accordion context that this item has focus.
   */
  setFocusedIndex: () => void;

  /**
   * Callback to toggle the expanded state of the accordion item.
   */
  toggleExpandedState: () => void;

  /**
   * Manage keyboard navigation between accordion items.
   */
  onButtonKeyDown: JSX.EventHandlerUnion<HTMLButtonElement, KeyboardEvent>;
}

const AccordionItemContext = createContext<AccordionItemContextValue>();

export function useAccordionItemContext() {
  const context = useContext(AccordionItemContext);

  if (!context) {
    throw new Error("[Hope UI]: useAccordionItemContext must be used within a `<AccordionItem />` component");
  }

  return context;
}
