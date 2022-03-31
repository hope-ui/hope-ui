import { createContext, splitProps, useContext } from "solid-js";
import { createStore, DeepReadonly } from "solid-js/store";

import { isArray } from "@/utils/assertion";
import { classNames, createClassSelector } from "@/utils/css";

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
  onChange?(expandedIndex: ExpandedIndex): void;
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
  const [state, setState] = createStore<AccordionState>({
    // eslint-disable-next-line solid/reactivity
    _expandedIndex: props.defaultIndex ?? (props.allowMultiple ? [] : -1),
    buttons: [],
    get isControlled() {
      return props.index !== undefined;
    },
    get expandedIndex() {
      return this.isControlled ? props.index : this._expandedIndex;
    },
  });

  const [local, others] = splitProps(props, ["class", "allowMultiple", "index", "defaultIndex", "onChange"]);

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

  const classes = () => classNames(local.class, hopeAccordionClass);

  const context: AccordionContextValue = {
    state: state as AccordionState,
    setExpandedIndex,
    isExpandedIndex,
    registerAccordionButton,
  };

  return (
    <AccordionContext.Provider value={context}>
      <Box class={classes()} {...others} />
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

// export interface AccordionStyleConfig {
//   baseStyle?: {
//     root?: SystemStyleObject;
//     item?: SystemStyleObject;
//     header?: SystemStyleObject;
//     button?: SystemStyleObject;
//     panel?: SystemStyleObject;
//   };
//   defaultProps?: {
//     root?: ThemeableAccordionOptions;
//   };
// }
