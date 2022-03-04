import { computePosition, flip, getScrollParents, offset, shift, size } from "@floating-ui/dom";
import { createContext, createUniqueId, JSX, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { SelectButtonVariants } from "./select.styles";
import {
  getActionFromKey,
  getIndexByLetter,
  getUpdatedIndex,
  isScrollable,
  maintainScrollVisibility,
  SelectActions,
  SelectOptionData,
} from "./select.utils";

export interface SelectProps<T = any> extends SelectButtonVariants {
  /**
   * The `id` of the Select.
   */
  id?: string;

  /**
   * Children of the Select.
   */
  children?: JSX.Element;

  /**
   * The value of the select to be `selected`.
   * (in controlled mode)
   */
  value?: T;

  /**
   * The value of the select to be `selected` initially.
   * (in uncontrolled mode)
   */
  defaultValue?: T;

  /**
   * The placeholder to show when no value is selected.
   */
  placeholder?: string;

  /**
   * If `true`, the select will be disabled.
   */
  disabled?: boolean;

  /**
   * Callback invoked when the selected value changes.
   * (in controlled mode)
   */
  onChange?: (value: T) => void;

  /**
   * When using object as values, used to compare if two option are equals.
   */
  compareFn?: (a: T, b: T) => boolean;
}

interface SelectState<T = any> {
  /**
   * The visual style of the select.
   */
  variant: SelectButtonVariants["variant"];

  /**
   * The size of the select.
   */
  size: SelectButtonVariants["size"];

  /**
   * The value of the select to be `selected`.
   * (in controlled mode)
   */
  value?: T;

  /**
   * The value of the select to be `selected`.
   * (in uncontrolled mode)
   */
  valueState?: T;

  /**
   * The placeholder to show when no value is selected.
   */
  placeholder?: string;

  /**
   * If `true`, the select is in controlled mode.
   */
  isControlled: boolean;

  /**
   * The base `id` used in other `Select` components.
   */
  baseId: string;

  /**
   * The `id` of the `SelectButton`.
   */
  buttonId: string;

  /**
   * The `id` of the listbox list (`SelectOptions`).
   */
  listboxId: string;

  /**
   * The prefix of the options (`SelectOption`) `id`.
   */
  optionIdPrefix: string;

  /**
   * The list of available `SelectOption` values.
   */
  options: readonly SelectOptionData<T>[];

  /**
   * If `true`, the Select will be open.
   */
  opened: boolean;

  /**
   * Index of the active `SelectOption`.
   */
  activeIndex: number;

  /**
   * If `true`, prevent the blur event when clicking a `SelectOption`.
   */
  ignoreBlur: boolean;

  /**
   * The string to search for in the `SelectOptions`.
   */
  searchString: string;

  /**
   * The timeout id of the search functionnality.
   */
  searchTimeoutId?: number;

  /**
   * When using object as values, used to compare if two option are equals.
   */
  compareFn: (a: T, b: T) => boolean;
}

interface SelectContextValue<T = any> {
  state: SelectState<T>;

  /**
   * A reefrence to the listbox list (`SelectOptions`).
   */
  listboxRef?: HTMLUListElement;

  /**
   * Callback to assign the `SelectButton` ref.
   */
  assignButtonRef: (el: HTMLButtonElement) => void;

  /**
   * Callback to assign the listbox list (`SelectOptions`) ref.
   */
  assignListboxRef: (el: HTMLUListElement) => void;

  /**
   * Scroll to the active option.
   */
  scrollToOption: (optionRef: HTMLLIElement) => void;

  /**
   * Callback to notify the context that a `SelectOption` is mounted.
   * @return The index of the option.
   */
  registerOption: (optionData: SelectOptionData) => number;

  /**
   * Callback invoked when the user click outside the listbox (`SelectOptions`).
   */
  onListboxOutsideClick: (target: HTMLElement) => void;

  /**
   * Callback invoked when the `SelectButton` loose focus.
   */
  onButtonBlur: () => void;

  /**
   * Callback invoked when the user click on the `SelectButton`.
   */
  onButtonClick: () => void;

  /**
   * Callback invoked when the user trigger the `SelectButton` with keyboard.
   */
  onButtonKeyDown: (event: KeyboardEvent) => void;

  /**
   * Callback invoked when the user click on a `SelectOption`.
   */
  onOptionClick: (index: number) => void;

  /**
   * Callback invoked when the user cursor hover a `SelectOption`.
   */
  onOptionMouseEnter: (index: number) => void;

  /**
   * Callback invoked when the user cursor leave a `SelectOption`.
   */
  onOptionMouseLeave: () => void;

  /**
   * Callback invoked when the user click on a `SelectOption`.
   */
  onOptionMouseDown: () => void;
}

const SelectContext = createContext<SelectContextValue>();

export function Select<T = any>(props: SelectProps<T>) {
  const defaultBaseId = `hope-select-${createUniqueId()}`;

  const defaultCompareFn = (a: any, b: any) => {
    return a === b;
  };

  const [state, setState] = createStore<SelectState<T>>({
    // Internal state for uncontrolled select.
    // eslint-disable-next-line solid/reactivity
    valueState: props.defaultValue,
    get isControlled() {
      return props.value !== undefined;
    },
    get value() {
      return this.isControlled ? props.value : this.valueState;
    },
    get variant() {
      return props.variant ?? "outline";
    },
    get size() {
      return props.size ?? "md";
    },
    get baseId() {
      return props.id ?? defaultBaseId;
    },
    get buttonId() {
      return `${this.baseId}-button`;
    },
    get listboxId() {
      return `${this.baseId}-listbox`;
    },
    get optionIdPrefix() {
      return `${this.baseId}-option`;
    },
    get placeholder() {
      return props.placeholder;
    },
    get compareFn() {
      return props.compareFn ?? defaultCompareFn;
    },
    options: [],
    opened: false,
    activeIndex: 0,
    ignoreBlur: false,
    searchString: "",
    searchTimeoutId: undefined,
  });

  // element refs
  let buttonRef: HTMLButtonElement | undefined;
  let listboxRef: HTMLUListElement | undefined;

  const buttonScrollParents = () => {
    if (!buttonRef) {
      return;
    }

    return getScrollParents(buttonRef);
  };

  async function updateListboxPosition() {
    if (!buttonRef || !listboxRef) {
      return;
    }

    const { x, y } = await computePosition(buttonRef, listboxRef, {
      placement: "bottom",
      middleware: [
        offset(8),
        flip(),
        shift(),
        size({
          apply({ reference }) {
            if (!listboxRef) {
              return;
            }

            Object.assign(listboxRef.style, {
              width: `${reference.width}px`,
            });
          },
        }),
      ],
    });

    if (!listboxRef) {
      return;
    }

    Object.assign(listboxRef.style, {
      left: `${x}px`,
      top: `${y}px`,
    });
  }

  const getSearchString = function (char: string) {
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

  const selectOption = (index: number) => {
    setState("activeIndex", index);

    if (!state.isControlled) {
      setState("valueState", state.options[index].value);
    }

    props.onChange?.(state.options[index].value as T);
  };

  const onOptionChange = (index: number) => {
    setState("activeIndex", index);
  };

  const onButtonBlur = function () {
    // do not do blur action if ignoreBlur flag has been set
    if (state.ignoreBlur) {
      setState("ignoreBlur", false);
      return;
    }

    if (state.opened) {
      //selectOption(state.activeIndex);
      updateMenuState(false, false);
    }
  };

  const onButtonClick = function () {
    updateMenuState(!state.opened, false);
  };

  const onButtonKeyDown = function (event: KeyboardEvent) {
    const { key } = event;
    const max = state.options.length - 1;

    const action = getActionFromKey(event, state.opened);

    switch (action) {
      case SelectActions.Last:
      case SelectActions.First:
        updateMenuState(true);
      // intentional fallthrough
      case SelectActions.Next:
      case SelectActions.Previous:
      case SelectActions.PageUp:
      case SelectActions.PageDown:
        event.preventDefault();
        return onOptionChange(getUpdatedIndex(state.activeIndex, max, action));

      case SelectActions.CloseSelect:
        event.preventDefault();
        selectOption(state.activeIndex);
      // intentional fallthrough
      case SelectActions.Close:
        event.preventDefault();
        return updateMenuState(false);

      case SelectActions.Type:
        return onButtonType(key);

      case SelectActions.Open:
        event.preventDefault();
        return updateMenuState(true);
    }
  };

  const onButtonType = function (letter: string) {
    // open the listbox if it is closed
    updateMenuState(true);

    // find the index of the first matching option
    const searchString = getSearchString(letter);
    const searchIndex = getIndexByLetter([...state.options], searchString, state.activeIndex + 1);

    // if a match was found, go to it
    if (searchIndex >= 0) {
      onOptionChange(searchIndex);
    }

    // if no matches, clear the timeout and search string
    else {
      window.clearTimeout(state.searchTimeoutId);
      setState("searchString", "");
    }
  };

  const onOptionClick = function (index: number) {
    onOptionChange(index);
    selectOption(index);
    updateMenuState(false);
  };

  const onOptionMouseEnter = (index: number) => {
    onOptionChange(index);
  };

  const onOptionMouseLeave = () => {
    onOptionChange(-1);
  };

  const onOptionMouseDown = function () {
    // Clicking an option will cause a blur event,
    // but we don't want to perform the default keyboard blur action
    setState("ignoreBlur", true);
  };

  const updateMenuState = function (opened: boolean, callFocus = true) {
    if (state.opened === opened) {
      return;
    }

    setState("opened", opened);

    // focus on selected value or the first one
    if (state.value != null) {
      setState(
        "activeIndex",
        state.options.findIndex(item => state.compareFn(item.value as T, state.value as T))
      );
    } else {
      setState("activeIndex", 0);
    }

    if (state.opened) {
      updateListboxPosition();

      buttonScrollParents()?.forEach(el => {
        el.addEventListener("scroll", updateListboxPosition);
        el.addEventListener("resize", updateListboxPosition);
      });
    } else {
      // select closed, clear the options
      setState("options", []);

      buttonScrollParents()?.forEach(el => {
        el.removeEventListener("scroll", updateListboxPosition);
        el.removeEventListener("resize", updateListboxPosition);
      });
    }

    // move focus back to the button, if needed
    callFocus && buttonRef?.focus();
  };

  const onListboxOutsideClick = (target: HTMLElement) => {
    // clicking on the button is not considered an "outside click"
    if (buttonRef && buttonRef.contains(target)) {
      return;
    }

    updateMenuState(false, false);
  };

  const assignButtonRef = (el: HTMLButtonElement) => {
    buttonRef = el;
  };

  const assignListboxRef = (el: HTMLUListElement) => {
    listboxRef = el;
  };

  const scrollToOption = (optionRef: HTMLLIElement) => {
    if (!listboxRef) {
      return;
    }

    // ensure the new option is in view
    if (isScrollable(listboxRef)) {
      maintainScrollVisibility(optionRef, listboxRef);
    }
  };

  const registerOption = (optionData: SelectOptionData) => {
    setState("options", prev => [...prev, optionData]);
    return state.options.length - 1;
  };

  const context: SelectContextValue = {
    state,
    listboxRef,
    assignButtonRef,
    assignListboxRef,
    registerOption,
    scrollToOption,
    onListboxOutsideClick,
    onButtonBlur,
    onButtonClick,
    onButtonKeyDown,
    onOptionClick,
    onOptionMouseEnter,
    onOptionMouseLeave,
    onOptionMouseDown,
  };

  return <SelectContext.Provider value={context}>{props.children}</SelectContext.Provider>;
}

export function useSelectContext() {
  const context = useContext(SelectContext);

  if (!context) {
    throw new Error("[Hope UI]: useSelectContext must be used within a `<Select />` component");
  }

  return context;
}
