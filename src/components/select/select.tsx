import { autoUpdate, computePosition, flip, offset, shift, size } from "@floating-ui/dom";
import { createContext, createEffect, createSignal, createUniqueId, JSX, on, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { SystemStyleObject } from "@/styled-system";
import { useComponentStyleConfigs } from "@/theme";
import { isArray } from "@/utils/assertion";
import { isScrollable, maintainScrollVisibility } from "@/utils/dom";

import { useFormControl, UseFormControlReturn } from "../form-control/use-form-control";
import { SelectTriggerVariants } from "./select.styles";
import {
  getActionFromKey,
  getIndexByLetter,
  getUpdatedIndex,
  isOptionEqual,
  isValueEqual,
  SelectActions,
  SelectOptionData,
} from "./select.utils";

type Value = any | any[];

interface ThemeableSelectOptions extends SelectTriggerVariants {
  /**
   * Offset between the listbox and the reference (trigger) element.
   */
  offset?: number;

  /**
   * When using an object as an option value, the object key that uniquely identifies an option.
   * Used to compare if two options are equal.
   */
  compareKey?: string;
}

export interface SelectProps extends ThemeableSelectOptions {
  /**
   * The `id` of the select.
   */
  id?: string;

  /**
   * Children of the select.
   */
  children?: JSX.Element;

  /**
   * If `true`, allow multi-selection.
   */
  multiple?: boolean;

  /**
   * The value of the select.
   * (in controlled mode)
   */
  value?: Value;

  /**
   * The value of the select when initially rendered.
   * (in uncontrolled mode)
   */
  defaultValue?: Value;

  /**
   * If `true`, the select will be required.
   */
  required?: boolean;

  /**
   * If `true`, the select will be disabled.
   */
  disabled?: boolean;

  /**
   * If `true`, the select will have `aria-invalid` set to `true`.
   */
  invalid?: boolean;

  /**
   * If `true`, the select will be readonly.
   */
  readOnly?: boolean;

  /**
   * A11y: id of the element that provides additional description to the select.
   */
  "aria-describedby"?: string;

  /**
   * Callback invoked when the selected value changes.
   * (in controlled mode)
   */
  onChange?: (value: Value) => void;

  /**
   * Callback invoked when the select trigger gain focus.
   */
  onFocus?: JSX.EventHandlerUnion<HTMLButtonElement, FocusEvent>;

  /**
   * Callback invoked when the select trigger loose focus.
   */
  onBlur?: JSX.EventHandlerUnion<HTMLButtonElement, FocusEvent>;
}

type SelectState = Required<Pick<SelectProps, "variant" | "size" | "compareKey">> &
  Pick<SelectProps, "multiple" | "value" | "invalid" | "disabled"> & {
    /**
     * If `true`, the select has options selected.
     */
    hasSelectedOptions: boolean;

    /**
     * The id of the current `aria-activedescendent` element.
     */
    activeDescendantId?: string;

    /**
     * If `true`, the select is in controlled mode.
     */
    isControlled: boolean;

    /**
     * The `id` of the `SelectTrigger`.
     */
    triggerId: string;

    /**
     * The `id` of the `SelectListbox`.
     */
    listboxId: string;

    /**
     * The prefix of the group labels (`SelectLabel`) `id`.
     */
    labelIdPrefix: string;

    /**
     * The prefix of the options (`SelectOption`) `id`.
     */
    optionIdPrefix: string;

    /**
     * The list of available option.
     */
    options: SelectOptionData[];

    /**
     * The list of selected option.
     */
    selectedOptions: SelectOptionData[];

    /**
     * If `true`, the select will be open.
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

/**
 * The wrapper component that provides context for all its children.
 */
export function Select(props: SelectProps) {
  const defaultBaseId = `hope-select-${createUniqueId()}`;

  const theme = useComponentStyleConfigs().Select;

  const formControlProps = useFormControl<HTMLButtonElement>(props);

  const [initialized, setInitialized] = createSignal(false);

  const [state, setState] = createStore<SelectState>({
    get isControlled() {
      return props.value !== undefined;
    },
    get value() {
      if (this.isControlled) {
        return props.value;
      }

      if (this.multiple) {
        return this.selectedOptions.map((option: SelectOptionData) => option.value);
      }

      return this.selectedOptions[0].value ?? undefined;
    },
    get multiple() {
      return props.multiple;
    },
    get triggerId() {
      return props.id ?? formControlProps.id ?? `${defaultBaseId}-trigger`;
    },
    get listboxId() {
      return `${defaultBaseId}-listbox`;
    },
    get labelIdPrefix() {
      return `${defaultBaseId}-label`;
    },
    get optionIdPrefix() {
      return `${defaultBaseId}-option`;
    },
    get disabled() {
      return props.disabled ?? formControlProps.disabled;
    },
    get invalid() {
      return props.invalid ?? formControlProps.invalid;
    },
    get variant() {
      return props.variant ?? theme?.defaultProps?.root?.variant ?? "outline";
    },
    get size() {
      return props.size ?? theme?.defaultProps?.root?.size ?? "md";
    },
    get compareKey() {
      return props.compareKey ?? theme?.defaultProps?.root?.compareKey ?? "id";
    },
    get activeDescendantId() {
      return this.opened ? `${this.optionIdPrefix}-${this.activeIndex}` : undefined;
    },
    get hasSelectedOptions() {
      return this.selectedOptions.length > 0;
    },
    options: [],
    selectedOptions: [],
    opened: false,
    activeIndex: 0,
    ignoreBlur: false,
    searchString: "",
    searchTimeoutId: undefined,
  });

  // element refs
  let triggerRef: HTMLButtonElement | undefined;
  let contentRef: HTMLDivElement | undefined;
  let listboxRef: HTMLDivElement | undefined;

  let cleanupContentAutoUpdate: (() => void) | undefined;

  const updateContentPosition = async () => {
    if (!triggerRef || !contentRef) {
      return;
    }

    const { x, y } = await computePosition(triggerRef, contentRef, {
      placement: "bottom",
      middleware: [
        offset(props.offset ?? theme?.defaultProps?.root?.offset ?? 5),
        flip(),
        shift(),
        size({
          apply({ reference }) {
            if (!contentRef) {
              return;
            }

            Object.assign(contentRef.style, {
              width: `${reference.width}px`,
            });
          },
        }),
      ],
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

  const focusTrigger = () => {
    triggerRef?.focus();
  };

  const getDefaultSelectedValues = () => {
    if (state.isControlled) {
      if (props.value == null) {
        return [];
      }

      return isArray(props.value) ? props.value : [props.value];
    } else {
      if (props.defaultValue == null) {
        return [];
      }

      return isArray(props.defaultValue) ? props.defaultValue : [props.defaultValue];
    }
  };

  const initSelectedOptions = () => {
    if (initialized()) {
      return;
    }

    const selectedOptions = getDefaultSelectedValues()
      .map(value => state.options.find(option => isValueEqual(option.value, value, state.compareKey)))
      .filter(Boolean);

    setState("selectedOptions", prev => [...prev, ...selectedOptions]);

    setInitialized(true);
  };

  const onOptionChange = (index: number) => {
    setState("activeIndex", index);
  };

  const isOptionSelected = (option: SelectOptionData) => {
    if (state.selectedOptions.length <= 0) {
      return false;
    }

    if (state.multiple) {
      return !!state.selectedOptions.find(selectedOption => isOptionEqual(option, selectedOption, state.compareKey));
    } else {
      return isOptionEqual(option, state.selectedOptions[0], state.compareKey);
    }
  };

  const removeFromSelectedOptions = (selectedOption: SelectOptionData) => {
    setState("selectedOptions", prev =>
      prev.filter(option => !isOptionEqual(selectedOption, option, state.compareKey))
    );
  };

  const setSelectedOptions = (index: number) => {
    const newSelectedOption = state.options[index];

    if (state.multiple) {
      if (isOptionSelected(newSelectedOption)) {
        removeFromSelectedOptions(newSelectedOption);
      } else {
        setState("selectedOptions", prev => [...prev, newSelectedOption]);
      }
    } else {
      setState("selectedOptions", [newSelectedOption]);
    }
  };

  const getSelectedValue = () => {
    if (state.multiple) {
      return state.selectedOptions.map(item => item.value);
    } else {
      return state.selectedOptions[0].value ?? undefined;
    }
  };

  const selectOption = (index: number) => {
    onOptionChange(index);

    setSelectedOptions(index);

    props.onChange?.(getSelectedValue());
  };

  const unselectOption = (selectedOption: SelectOptionData) => {
    removeFromSelectedOptions(selectedOption);

    props.onChange?.(getSelectedValue());

    focusTrigger();
  };

  const isOptionDisabledCallback = (index: number) => {
    return state.options[index].disabled;
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
    if (formControlProps.readOnly) {
      return;
    }

    updateOpeningState(!state.opened, false);
  };

  const onTriggerKeyDown = (event: KeyboardEvent) => {
    if (formControlProps.readOnly) {
      return;
    }

    const { key } = event;

    // In multi-select, backspace unselect the last option
    if (state.hasSelectedOptions && state.multiple && key === "Backspace") {
      unselectOption(state.selectedOptions[state.selectedOptions.length - 1]);
      return;
    }

    const max = state.options.length - 1;
    const action = getActionFromKey(event, state.opened);

    switch (action) {
      case SelectActions.Last:
      case SelectActions.First:
        updateOpeningState(true);
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

      case SelectActions.SelectAndClose:
        event.preventDefault();
        selectOption(state.activeIndex);
        return state.multiple ? undefined : updateOpeningState(false); // don't close in multi-select.

      case SelectActions.Close:
        event.preventDefault();
        return updateOpeningState(false);

      case SelectActions.Type:
        return onTriggerType(key);

      case SelectActions.Open:
        event.preventDefault();
        return updateOpeningState(true);
    }
  };

  const onTriggerType = (letter: string) => {
    if (formControlProps.readOnly) {
      return;
    }

    // open the listbox if it is closed
    updateOpeningState(true);

    // find the index of the first matching option
    const searchString = getSearchString(letter);
    const searchIndex = getIndexByLetter(state.options as SelectOptionData[], searchString, state.activeIndex + 1);

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

  const onOptionClick = (index: number) => {
    // if option is disabled ensure to bring back focus to the `SelectTrigger` in order to keep keyboard navigation working.
    if (state.options[index].disabled) {
      focusTrigger();
      return;
    }

    selectOption(index);

    if (state.multiple) {
      // don't close on multi-select and ensure to bring back focus to the `SelectTrigger` in order to keep keyboard navigation working.
      focusTrigger();
    } else {
      updateOpeningState(false);
    }
  };

  const onOptionMouseMove = (index: number) => {
    // if index is already the active one, do nothing
    if (state.activeIndex === index) {
      return;
    }

    onOptionChange(index);
  };

  const onOptionMouseDown = () => {
    // Clicking an option will cause a blur event,
    // but we don't want to perform the default keyboard blur action
    setState("ignoreBlur", true);
  };

  const setDefaultActiveOption = () => {
    // focus on first selected option or the first one.
    if (state.selectedOptions.length > 0) {
      setState(
        "activeIndex",
        state.options.findIndex(option => isOptionSelected(option))
      );
    } else {
      setState("activeIndex", 0);
    }
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

  const updateOpeningState = (opened: boolean, callFocus = true) => {
    if (state.opened === opened) {
      return;
    }

    setState("opened", opened);

    setDefaultActiveOption();

    scheduleContentPositionAutoUpdate();

    // move focus back to the button, if needed.
    callFocus && focusTrigger();
  };

  const onListboxMouseLeave = () => {
    onOptionChange(-1);
  };

  const onContentOutsideClick = (target: HTMLElement) => {
    // clicking inside the trigger is not considered an "outside click"
    if (isInsideTrigger(target)) {
      return;
    }

    updateOpeningState(false, false);
  };

  const isOptionActiveDescendant = (index: number) => {
    return index === state.activeIndex;
  };

  const assignTriggerRef = (el: HTMLButtonElement) => {
    triggerRef = el;
  };

  const assignContentRef = (el: HTMLDivElement) => {
    contentRef = el;
  };

  const assignListboxRef = (el: HTMLDivElement) => {
    listboxRef = el;
  };

  const scrollToOption = (optionRef: HTMLDivElement) => {
    if (!listboxRef) {
      return;
    }

    // ensure the new option is in view
    if (isScrollable(listboxRef)) {
      maintainScrollVisibility(optionRef, listboxRef);
    }
  };

  const registerOption = (optionData: SelectOptionData) => {
    const index = state.options.findIndex(option => isOptionEqual(option, optionData, state.compareKey));

    // do not register the same option twice
    if (index != -1) {
      return index;
    }

    setState("options", prev => [...prev, optionData]);

    return state.options.length - 1;
  };

  createEffect(
    on(
      () => state.options,
      () => initSelectedOptions(),
      { defer: true }
    )
  );

  const context: SelectContextValue = {
    state: state as SelectState,
    isOptionSelected,
    unselectOption,
    isOptionActiveDescendant,
    formControlProps,
    assignTriggerRef,
    assignContentRef,
    assignListboxRef,
    registerOption,
    scrollToOption,
    onContentOutsideClick,
    onTriggerBlur,
    onTriggerClick,
    onTriggerKeyDown,
    onOptionClick,
    onOptionMouseMove,
    onOptionMouseDown,
    onListboxMouseLeave,
  };

  return <SelectContext.Provider value={context}>{props.children}</SelectContext.Provider>;
}

/* -------------------------------------------------------------------------------------------------
 * Context
 * -----------------------------------------------------------------------------------------------*/

interface SelectContextValue {
  state: SelectState;

  /**
   * Props that should be spread on the select trigger to support embedding in `FormControl`.
   */
  formControlProps: UseFormControlReturn<HTMLButtonElement>;

  /**
   * Check if the option is a selected one.
   */
  isOptionSelected: (option: SelectOptionData) => boolean;

  /**
   * Check if the option is the current active-descendant by comparing its index with the active index.
   */
  isOptionActiveDescendant: (index: number) => boolean;

  /**
   * Callback to assign the `SelectTrigger` ref.
   */
  assignTriggerRef: (el: HTMLButtonElement) => void;

  /**
   * Callback to assign the `SelectContent` ref.
   */
  assignContentRef: (el: HTMLDivElement) => void;

  /**
   * Callback to assign the `SelectListbox` ref.
   */
  assignListboxRef: (el: HTMLDivElement) => void;

  /**
   * Scroll to the active option.
   */
  scrollToOption: (optionRef: HTMLDivElement) => void;

  /**
   * Register a `SelectOption` to the context.
   * @return The index of the option.
   */
  registerOption: (optionData: SelectOptionData) => number;

  /**
   * Callback to remove an option from the selected options.
   */
  unselectOption: (optionData: SelectOptionData) => void;

  /**
   * Callback invoked when the user click outside the `SelectContent`.
   */
  onContentOutsideClick: (target: HTMLElement) => void;

  /**
   * Callback invoked when the `SelectTrigger` loose focus.
   */
  onTriggerBlur: (event: FocusEvent) => void;

  /**
   * Callback invoked when the user click on the `SelectTrigger`.
   */
  onTriggerClick: (event: MouseEvent) => void;

  /**
   * Callback invoked when the user trigger the `SelectTrigger` with keyboard.
   */
  onTriggerKeyDown: (event: KeyboardEvent) => void;

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

export function useSelectContext() {
  const context = useContext(SelectContext);

  if (!context) {
    throw new Error("[Hope UI]: useSelectContext must be used within a `<Select />` component");
  }

  return context;
}

/* -------------------------------------------------------------------------------------------------
 * StyleConfig
 * -----------------------------------------------------------------------------------------------*/

export interface SelectStyleConfig {
  baseStyle?: {
    trigger?: SystemStyleObject;
    placeholder?: SystemStyleObject;
    singleValue?: SystemStyleObject;
    multiValue?: SystemStyleObject;
    tag?: SystemStyleObject;
    tagCloseButton?: SystemStyleObject;
    icon?: SystemStyleObject;
    content?: SystemStyleObject;
    listbox?: SystemStyleObject;
    optgroup?: SystemStyleObject;
    label?: SystemStyleObject;
    option?: SystemStyleObject;
    optionText?: SystemStyleObject;
    optionIndicator?: SystemStyleObject;
  };
  defaultProps?: {
    root?: ThemeableSelectOptions;
  };
}
