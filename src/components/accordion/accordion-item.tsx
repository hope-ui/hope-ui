import { createContext, createUniqueId, splitProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { classNames, createClassSelector } from "@/utils/css";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";
import { useAccordionContext } from "./accordion";
import { accordionItemStyles } from "./accordion.styles";

interface AccordionItemOptions {
  /**
   * If `true`, the accordion item will be disabled.
   */
  disabled?: boolean;
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

  const [local, others] = splitProps(props, ["class"]);

  const registerButton = (el: HTMLButtonElement) => {
    const index = accordionContext.registerAccordionButton(el);
    setState("index", index);
  };

  const toggleExpandedState = () => {
    accordionContext.setExpandedIndex(state.index, !state.expanded);
  };

  const classes = () => classNames(local.class, hopeAccordionItemClass, accordionItemStyles());

  const context: AccordionItemContextValue = {
    state: state as AccordionItemState,
    registerButton,
    toggleExpandedState,
  };

  return (
    <AccordionItemContext.Provider value={context}>
      <Box class={classes()} {...others} />
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
   * Callback to toggle the expanded state of the accordion item.
   */
  toggleExpandedState: () => void;
}

const AccordionItemContext = createContext<AccordionItemContextValue>();

export function useAccordionItemContext() {
  const context = useContext(AccordionItemContext);

  if (!context) {
    throw new Error("[Hope UI]: useAccordionItemContext must be used within a `<AccordionItem />` component");
  }

  return context;
}
