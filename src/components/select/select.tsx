import { computePosition, flip, getScrollParents, offset, shift, size } from "@floating-ui/dom";
import { createContext, createUniqueId, JSX, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { SelectTriggerVariants } from "./select.styles";
import {
  getActionFromKey,
  getIndexByLetter,
  getUpdatedIndex,
  isOptionEqual,
  isScrollable,
  maintainScrollVisibility,
  SelectActions,
  SelectOptionData,
} from "./select.utils";
import { SelectIcon } from "./select-icon";
import { SelectListbox } from "./select-listbox";
import { SelectOption } from "./select-option";
import { SelectOptionIndicator } from "./select-option-indicator";
import { SelectOptionText } from "./select-option-text";
import { SelectPanel } from "./select-panel";
import { SelectPlaceholder } from "./select-placeholder";
import { SelectTrigger } from "./select-trigger";
import { SelectValue } from "./select-value";

export interface SelectProps<T = any> extends SelectTriggerVariants {
  /**
   * The `id` of the Select.
   */
  id?: string;

  /**
   * Children of the Select.
   */
  children?: JSX.Element;

  /**
   * Offset between the listbox and the reference (trigger) element.
   */
  offset?: number;

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
   * If `true`, the select will be disabled.
   */
  disabled?: boolean;

  /**
   * When using an object as an option value, the object key that uniquely identifies an option.
   * Used to compare if two options are equal.
   */
  compareKey?: string;

  /**
   * When using an object as an option value, the object key that represents the option label.
   * Used for typeahead purposes.
   */
  labelKey?: string;

  /**
   * Callback invoked when the selected value changes.
   * (in controlled mode)
   */
  onChange?: (value: T) => void;
}

type SelectState<T = any> = Required<Pick<SelectProps<T>, "variant" | "size" | "compareKey" | "labelKey">> &
  Pick<SelectProps<T>, "value" | "disabled"> & {
    /**
     * The value of the select to be `selected`.
     * (in uncontrolled mode)
     */
    valueState?: T;

    /**
     * If `true`, the select is in controlled mode.
     */
    isControlled: boolean;

    /**
     * The base `id` used in other `Select` components.
     */
    baseId: string;

    /**
     * The `id` of the `SelectTrigger`.
     */
    buttonId: string;

    /**
     * The `id` of the `SelectListbox`.
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
     * The string to search for in the `SelectListbox`.
     */
    searchString: string;

    /**
     * The timeout id of the search functionnality.
     */
    searchTimeoutId?: number;
  };

interface SelectContextValue<T = any> {
  state: SelectState<T>;

  /**
   * Callback to assign the `SelectTrigger` ref.
   */
  assignButtonRef: (el: HTMLButtonElement) => void;

  /**
   * Callback to assign the `SelectPanel` ref.
   */
  assignPanelRef: (el: HTMLDivElement) => void;

  /**
   * Callback to assign the `SelectListbox` ref.
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
   * Callback invoked when the user click outside the `SelectPanel`.
   */
  onPanelOutsideClick: (target: HTMLElement) => void;

  /**
   * Callback invoked when the `SelectTrigger` loose focus.
   */
  onButtonBlur: () => void;

  /**
   * Callback invoked when the user click on the `SelectTrigger`.
   */
  onButtonClick: () => void;

  /**
   * Callback invoked when the user trigger the `SelectTrigger` with keyboard.
   */
  onButtonKeyDown: (event: KeyboardEvent) => void;

  /**
   * Callback invoked when the user click on a `SelectOption`.
   */
  onOptionClick: (index: number) => void;

  /**
   * Callback invoked when the user cursor move on a `SelectOption`.
   */
  onOptionMouseMove: (index: number) => void;

  /**
   * Callback invoked when the user click on a `SelectOption`.
   */
  onOptionMouseDown: () => void;

  /**
   * Callback invoked when the user cursor leave the `SelectListbox`.
   */
  onListboxMouseLeave: () => void;
}

const SelectContext = createContext<SelectContextValue>();

export function Select<T = any>(props: SelectProps<T>) {
  const defaultBaseId = `hope-select-${createUniqueId()}`;

  const [state, setState] = createStore<SelectState<T>>({
    // Internal state for uncontrolled select.
    // eslint-disable-next-line solid/reactivity
    valueState: props.defaultValue,
    get isControlled() {
      return props.value !== undefined;
    },
    get value() {
      return (this.isControlled ? props.value : this.valueState) as T | undefined;
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
    get disabled() {
      return props.disabled;
    },
    get compareKey() {
      return props.compareKey ?? "id";
    },
    get labelKey() {
      return props.labelKey ?? "label";
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
  let panelRef: HTMLDivElement | undefined;
  let listboxRef: HTMLUListElement | undefined;

  const buttonScrollParents = () => {
    if (!buttonRef) {
      return;
    }

    return getScrollParents(buttonRef);
  };

  async function updateContentPosition() {
    if (!buttonRef || !panelRef) {
      return;
    }

    const { x, y } = await computePosition(buttonRef, panelRef, {
      placement: "bottom",
      middleware: [
        offset(props.offset ?? 4),
        flip(),
        shift(),
        size({
          apply({ reference }) {
            if (!panelRef) {
              return;
            }

            Object.assign(panelRef.style, {
              width: `${reference.width}px`,
            });
          },
        }),
      ],
    });

    if (!panelRef) {
      return;
    }

    Object.assign(panelRef.style, {
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

  const onOptionChange = (index: number) => {
    setState("activeIndex", index);
  };

  const selectOption = (index: number) => {
    onOptionChange(index);

    if (!state.isControlled) {
      setState("valueState", state.options[index].value);
    }

    props.onChange?.(state.options[index].value as T);
  };

  const onButtonBlur = function () {
    // do not do blur action if ignoreBlur flag has been set
    if (state.ignoreBlur) {
      setState("ignoreBlur", false);
      return;
    }

    if (state.opened) {
      updateMenuState(false, false);
    }
  };

  const onButtonClick = function () {
    updateMenuState(!state.opened, false);
  };

  const isOptionDisabledCallback = (index: number) => {
    return state.options[index].disabled;
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
        event.preventDefault();
        return onOptionChange(
          getUpdatedIndex({
            currentIndex: state.activeIndex,
            maxIndex: max,
            initialAction: action,
            isOptionDisabled: isOptionDisabledCallback,
          })
        );

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
    const searchIndex = getIndexByLetter(state.options as SelectOptionData<T>[], searchString, state.activeIndex + 1);

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
    // if option is disabled ensure to bring back focus to the `SelectTrigger` in order to keep keyboard navigation working.
    if (state.options[index].disabled) {
      buttonRef?.focus();
      return;
    }

    selectOption(index);
    updateMenuState(false);
  };

  const onOptionMouseMove = (index: number) => {
    // if index is already the active one, do nothing
    if (state.activeIndex === index) {
      return;
    }

    onOptionChange(index);
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
      const selectedOptionIndex = state.options.findIndex(item => {
        return isOptionEqual(item.value, state.value, state.compareKey);
      });
      setState("activeIndex", selectedOptionIndex);
    } else {
      setState("activeIndex", 0);
    }

    if (state.opened) {
      updateContentPosition();

      buttonScrollParents()?.forEach(el => {
        el.addEventListener("scroll", updateContentPosition);
        el.addEventListener("resize", updateContentPosition);
      });
    } else {
      // select closed, clear the options
      setState("options", []);

      buttonScrollParents()?.forEach(el => {
        el.removeEventListener("scroll", updateContentPosition);
        el.removeEventListener("resize", updateContentPosition);
      });
    }

    // move focus back to the button, if needed
    callFocus && buttonRef?.focus();
  };

  const onListboxMouseLeave = () => {
    onOptionChange(-1);
  };

  const onPanelOutsideClick = (target: HTMLElement) => {
    // clicking on the button is not considered an "outside click"
    if (buttonRef && buttonRef.contains(target)) {
      return;
    }

    updateMenuState(false, false);
  };

  const assignButtonRef = (el: HTMLButtonElement) => {
    buttonRef = el;
  };

  const assignPanelRef = (el: HTMLDivElement) => {
    panelRef = el;
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
    assignButtonRef,
    assignPanelRef,
    assignListboxRef,
    registerOption,
    scrollToOption,
    onPanelOutsideClick,
    onButtonBlur,
    onButtonClick,
    onButtonKeyDown,
    onOptionClick,
    onOptionMouseMove,
    onOptionMouseDown,
    onListboxMouseLeave,
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

Select.Trigger = SelectTrigger;
Select.Placeholder = SelectPlaceholder;
Select.Value = SelectValue;
Select.Icon = SelectIcon;
Select.Panel = SelectPanel;
Select.Listbox = SelectListbox;
Select.Option = SelectOption;
Select.OptionText = SelectOptionText;
Select.OptionIndicator = SelectOptionIndicator;