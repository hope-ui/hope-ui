import { autoUpdate, computePosition, flip, offset, shift, size } from "@floating-ui/dom";
import { createContext, createUniqueId, JSX, splitProps, useContext } from "solid-js";
import { createStore } from "solid-js/store";

import { SystemStyleObject } from "@/styled-system";
import { useComponentStyleConfigs } from "@/theme";

import { useFormControl, useFormControlPropNames, UseFormControlReturn } from "../form-control/use-form-control";
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

export interface SelectProps<T = any> extends ThemeableSelectOptions {
  /**
   * The `id` of the Select.
   */
  id?: string;

  /**
   * Children of the Select.
   */
  children?: JSX.Element;

  /**
   * The value of the select.
   * (in controlled mode)
   */
  value?: T;

  /**
   * The value of the select when initially rendered.
   * (in uncontrolled mode)
   */
  defaultValue?: T;

  /**
   * The value to display in `Select.Value` when initially rendered and no `children` is provided.
   */
  defaultTextValue?: string;

  /**
   * The placeholder of the select trigger.
   */
  placeholder?: string;

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
  onChange?: (value: T) => void;

  /**
   * Callback invoked when the select trigger gain focus.
   */
  onFocus?: JSX.EventHandlerUnion<HTMLButtonElement, FocusEvent>;

  /**
   * Callback invoked when the select trigger loose focus.
   */
  onBlur?: JSX.EventHandlerUnion<HTMLButtonElement, FocusEvent>;
}

type SelectState<T = any> = Required<Pick<SelectProps<T>, "variant" | "size" | "compareKey">> &
  Pick<SelectProps<T>, "value" | "placeholder" | "invalid" | "disabled"> & {
    /**
     * The value of the select.
     * (in uncontrolled mode)
     */
    valueState?: T;

    /**
     * The value to display in `Select.Value` when no `children` is provided.
     */
    textValue?: string;

    /**
     * The id of the current `aria-activedescendent` element.
     */
    activeDescendantId?: string;

    /**
     * If `true`, the select is in controlled mode.
     */
    isControlled: boolean;

    /**
     * If `true`, the placeholder will be visible in the `SelectTrigger`.
     */
    isPlaceholderVisible: boolean;

    /**
     * The `id` of the `SelectTrigger`.
     */
    buttonId: string;

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
   * Props that should be spread on the select trigger to support embedding in `FormControl`.
   */
  formControlProps: UseFormControlReturn<HTMLButtonElement>;

  /**
   * Check if the option is the selected one by comparing its value with the selected value.
   */
  isOptionSelected: (value: any) => boolean;

  /**
   * Check if the option is the current active-descendant by comparing its index with the active index.
   */
  isOptionActiveDescendant: (index: number) => boolean;

  /**
   * Callback to assign the `SelectTrigger` ref.
   */
  assignButtonRef: (el: HTMLButtonElement) => void;

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
   * Callback to notify the context that a `SelectOption` is mounted.
   * @return The index of the option.
   */
  registerOption: (optionData: SelectOptionData) => number;

  /**
   * Callback invoked when the user click outside the `SelectContent`.
   */
  onContentOutsideClick: (target: HTMLElement) => void;

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

export interface SelectStyleConfig {
  baseStyle?: {
    trigger?: SystemStyleObject;
    placeholder?: SystemStyleObject;
    value?: SystemStyleObject;
    icon?: SystemStyleObject;
    content?: SystemStyleObject;
    listbox?: SystemStyleObject;
    optgroup?: SystemStyleObject;
    label?: SystemStyleObject;
    option?: SystemStyleObject;
  };
  defaultProps?: {
    root?: ThemeableSelectOptions;
  };
}

const SelectContext = createContext<SelectContextValue>();

export function Select<T = any>(props: SelectProps<T>) {
  const defaultBaseId = `hope-select-${createUniqueId()}`;

  const theme = useComponentStyleConfigs().Select;

  const [useFormControlProps] = splitProps(props, useFormControlPropNames);
  const formControlProps = useFormControl<HTMLButtonElement>(useFormControlProps);

  const [state, setState] = createStore<SelectState<T>>({
    // eslint-disable-next-line solid/reactivity
    valueState: props.defaultValue,

    // eslint-disable-next-line solid/reactivity
    textValue: props.defaultTextValue,

    get isControlled() {
      return props.value !== undefined;
    },
    get value() {
      return (this.isControlled ? props.value : this.valueState) as T | undefined;
    },
    get buttonId() {
      return props.id ?? formControlProps.id ?? `${defaultBaseId}-button`;
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
    get invalid() {
      return props.invalid ?? formControlProps["aria-invalid"] === true;
    },
    get disabled() {
      return props.disabled ?? formControlProps.disabled;
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
    get placeholder() {
      return props.placeholder;
    },
    get isPlaceholderVisible() {
      return !!this.placeholder && this.value == null;
    },
    get activeDescendantId() {
      return this.opened ? `${this.optionIdPrefix}-${this.activeIndex}` : undefined;
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
  let contentRef: HTMLDivElement | undefined;
  let listboxRef: HTMLDivElement | undefined;

  let cleanupContentAutoUpdate: (() => void) | undefined;

  async function updateContentPosition() {
    if (!buttonRef || !contentRef) {
      return;
    }

    const { x, y } = await computePosition(buttonRef, contentRef, {
      placement: "bottom",
      middleware: [
        offset(props.offset ?? theme?.defaultProps?.root?.offset ?? 7),
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

    const selectedOption = state.options[index];

    setState("textValue", selectedOption.textValue);

    if (!state.isControlled) {
      setState("valueState", selectedOption.value);
    }

    props.onChange?.(selectedOption.value as T);
  };

  const isOptionDisabledCallback = (index: number) => {
    return state.options[index].disabled;
  };

  const onButtonBlur = function () {
    // do not do blur action if ignoreBlur flag has been set
    if (state.ignoreBlur) {
      setState("ignoreBlur", false);
      return;
    }

    if (state.opened) {
      updateContentState(false, false);
    }
  };

  const onButtonClick = function () {
    if (formControlProps.readOnly) {
      return;
    }

    updateContentState(!state.opened, false);
  };

  const onButtonKeyDown = function (event: KeyboardEvent) {
    if (formControlProps.readOnly) {
      return;
    }

    const { key } = event;
    const max = state.options.length - 1;

    const action = getActionFromKey(event, state.opened);

    switch (action) {
      case SelectActions.Last:
      case SelectActions.First:
        updateContentState(true);
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
        return updateContentState(false);

      case SelectActions.Close:
        event.preventDefault();
        return updateContentState(false);

      case SelectActions.Type:
        return onButtonType(key);

      case SelectActions.Open:
        event.preventDefault();
        return updateContentState(true);
    }
  };

  const onButtonType = function (letter: string) {
    if (formControlProps.readOnly) {
      return;
    }

    // open the listbox if it is closed
    updateContentState(true);

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

    updateContentState(false);
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

  const updateContentState = function (opened: boolean, callFocus = true) {
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

      // schedule auto update of the content position
      if (buttonRef && contentRef) {
        cleanupContentAutoUpdate = autoUpdate(buttonRef, contentRef, updateContentPosition);
      }
    } else {
      // select closed, clear the options
      setState("options", []);

      cleanupContentAutoUpdate?.();
    }

    // move focus back to the button, if needed
    callFocus && buttonRef?.focus();
  };

  const onListboxMouseLeave = () => {
    onOptionChange(-1);
  };

  const onContentOutsideClick = (target: HTMLElement) => {
    // clicking on the button is not considered an "outside click"
    if (buttonRef && buttonRef.contains(target)) {
      return;
    }

    updateContentState(false, false);
  };

  const isOptionSelected = (value: any) => {
    if (state.value == null) {
      return false;
    }

    return isOptionEqual(value, state.value, state.compareKey);
  };

  const isOptionActiveDescendant = (index: number) => {
    return index === state.activeIndex;
  };

  const assignButtonRef = (el: HTMLButtonElement) => {
    buttonRef = el;
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
    setState("options", prev => [...prev, optionData]);

    if (isOptionSelected(optionData.value)) {
      setState("textValue", optionData.textValue);
    }

    return state.options.length - 1;
  };

  const context: SelectContextValue = {
    state,
    isOptionSelected,
    isOptionActiveDescendant,
    formControlProps,
    assignButtonRef,
    assignContentRef,
    assignListboxRef,
    registerOption,
    scrollToOption,
    onContentOutsideClick,
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
