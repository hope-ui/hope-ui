import { createContext, createMemo, onCleanup, splitProps, useContext } from "solid-js";
import { createStore, DeepReadonly } from "solid-js/store";

import { SystemStyleObject } from "@/styled-system/types";
import { useComponentStyleConfigs } from "@/theme/provider";
import { isArray } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";
import { getNextIndex, getPrevIndex } from "@/utils/number";

import { Box } from "../box/box";
import { ElementType, HTMLHopeProps } from "../types";

export type ExpandedIndex = number | number[];

interface AccordionOptions {
  /**
   * If `true`, multiple accordion items can be expanded at once.
   */
  allowMultiple?: boolean;

  /**
   * The index(es) of the expanded accordion item.
   * (in controlled mode)
   */
  index?: ExpandedIndex;

  /**
   * The initial index(es) of the expanded accordion item.
   * (in uncontrolled mode)
   */
  defaultIndex?: ExpandedIndex;

  /**
   * The callback invoked when accordion items are expanded or collapsed.
   */
  onChange?: (expandedIndex: ExpandedIndex) => void;
}

export type AccordionProps<C extends ElementType = "div"> = HTMLHopeProps<C, AccordionOptions>;

interface AccordionState {
  /**
   * The index(es) of the expanded accordion items.
   * (In uncontrolled mode)
   */
  _expandedIndex: ExpandedIndex;

  /**
   * If `true`, the accordion is in controlled mode.
   * (have index and onChange props)
   */
  isControlled: boolean;

  /**
   * The index(es) of the expanded accordion items.
   * (in controlled mode)
   */
  expandedIndex: ExpandedIndex;

  /**
   * The index of the focused accordion button.
   */
  focusedIndex: number;

  /**
   * All accordion button nodes.
   */
  buttons: Array<HTMLButtonElement>;
}

const hopeAccordionClass = "hope-accordion";

/**
 * The wrapper that provides context and focus management for all accordion items.
 * It wraps all accordion items in a `div` for better grouping.
 */
export function Accordion<C extends ElementType = "div">(props: AccordionProps<C>) {
  const theme = useComponentStyleConfigs().Accordion;

  const [state, setState] = createStore<AccordionState>({
    // eslint-disable-next-line solid/reactivity
    _expandedIndex: props.defaultIndex ?? (props.allowMultiple ? [] : -1),
    focusedIndex: -1,
    buttons: [],
    get isControlled() {
      return props.index !== undefined;
    },
    get expandedIndex() {
      return this.isControlled ? props.index : this._expandedIndex;
    },
  });

  const [local, others] = splitProps(props, ["class", "allowMultiple", "index", "defaultIndex", "onChange"]);

  const reverseButtons = createMemo(() => state.buttons.slice().reverse());

  const setFocusedIndex = (index: number) => {
    setState("focusedIndex", index);
  };

  const setExpandedIndex = (index: number, isExpanded: boolean) => {
    let nextState: ExpandedIndex = -1;

    if (local.allowMultiple && isArray<number>(state.expandedIndex)) {
      nextState = isExpanded ? [...state.expandedIndex, index] : state.expandedIndex.filter(idx => idx !== index);
    } else if (isExpanded) {
      nextState = index;
    } else {
      nextState = -1;
    }

    setState("_expandedIndex", nextState);

    local.onChange?.(nextState);
  };

  const isExpandedIndex = (index: number) => {
    return isArray(state.expandedIndex) ? state.expandedIndex.includes(index) : state.expandedIndex === index;
  };

  const registerAccordionButton = (node: HTMLButtonElement) => {
    setState("buttons", prev => [...prev, node] as Array<DeepReadonly<HTMLButtonElement>>);

    return state.buttons.length - 1;
  };

  const focusNextAccordionButton = () => {
    const lastIndex = state.buttons.length - 1;
    let nextIndex = getNextIndex(state.focusedIndex, lastIndex, true);
    let nextButton = state.buttons[nextIndex];

    while (nextButton.disabled) {
      nextIndex = getNextIndex(nextIndex, lastIndex, true);
      nextButton = state.buttons[nextIndex];
    }

    nextButton.focus();
  };

  const focusPrevAccordionButton = () => {
    const lastIndex = state.buttons.length - 1;
    let prevIndex = getPrevIndex(state.focusedIndex, lastIndex, true);
    let prevButton = state.buttons[prevIndex];

    while (prevButton.disabled) {
      prevIndex = getPrevIndex(prevIndex, lastIndex, true);
      prevButton = state.buttons[prevIndex];
    }

    prevButton.focus();
  };

  const focusFirstAccordionButton = () => {
    state.buttons.find(button => !button.disabled)?.focus();
  };

  const focusLastAccordionButton = () => {
    reverseButtons()
      .find(button => !button.disabled)
      ?.focus();
  };

  const classes = () => classNames(local.class, hopeAccordionClass);

  // Reset focused index when accordion unmounts or descendants change
  onCleanup(() => {
    setFocusedIndex(-1);
  });

  const context: AccordionContextValue = {
    state: state as AccordionState,
    setFocusedIndex,
    setExpandedIndex,
    isExpandedIndex,
    registerAccordionButton,
    focusNextAccordionButton,
    focusPrevAccordionButton,
    focusFirstAccordionButton,
    focusLastAccordionButton,
  };

  return (
    <AccordionContext.Provider value={context}>
      <Box class={classes()} __baseStyle={theme?.baseStyle?.root} {...others} />
    </AccordionContext.Provider>
  );
}

Accordion.toString = () => createClassSelector(hopeAccordionClass);

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

interface AccordionContextValue {
  state: AccordionState;

  /**
   * Callback to set the focused accordion button index.
   */
  setFocusedIndex: (index: number) => void;

  /**
   * Callback to set the expanded accordion indexes.
   */
  setExpandedIndex: (index: number, isExpanded: boolean) => void;

  /**
   * Check if the accordion item at the given index is expanded or not.
   */
  isExpandedIndex: (index: number) => boolean;

  /**
   * Register a `AccordionButton` to the context.
   * @return The index of the accordion button.
   */
  registerAccordionButton: (node: HTMLButtonElement) => number;

  /**
   * Focus the previous non disabled accordion button.
   */
  focusPrevAccordionButton: () => void;

  /**
   * Focus the next non disabled accordion button.
   */
  focusNextAccordionButton: () => void;

  /**
   * Focus the first non disabled accordion button.
   */
  focusFirstAccordionButton: () => void;

  /**
   * Focus the last non disabled accordion button.
   */
  focusLastAccordionButton: () => void;
}

const AccordionContext = createContext<AccordionContextValue>();

export function useAccordionContext() {
  const context = useContext(AccordionContext);

  if (!context) {
    throw new Error("[Hope UI]: useAccordionContext must be used within a `<Accordion />` component");
  }

  return context;
}

/* -------------------------------------------------------------------------------------------------
 * StyleConfig
 * -----------------------------------------------------------------------------------------------*/

export interface AccordionStyleConfig {
  baseStyle?: {
    root?: SystemStyleObject;
    item?: SystemStyleObject;
    button?: SystemStyleObject;
    icon?: SystemStyleObject;
    panel?: SystemStyleObject;
  };
}
