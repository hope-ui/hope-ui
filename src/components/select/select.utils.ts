import { isObject } from "@/utils/assertion";

export interface SelectOptionData<T = any> {
  /**
   * The value to use when the option is selected.
   */
  value: T;

  /**
   * The label to use when searching for an option.
   */
  label: string;

  /**
   * If `true`, the option will be disabled.
   */
  disabled: boolean;
}

interface GetUpdatedIndexParams {
  /**
   * The current active index.
   */
  currentIndex: number;

  /**
   * The index of the last option.
   */
  maxIndex: number;

  /**
   * The initialy performed action.
   */
  initialAction: SelectActions;

  /**
   * Callback invoked to check if an option at a given index is diabled or not.
   */
  isOptionDisabled: (index: number) => boolean;
}

/**
 * List of named combobox actions
 */
export enum SelectActions {
  Close,
  CloseSelect,
  First,
  Last,
  Next,
  Open,
  Previous,
  Select,
  Type,
}

/* -------------------------------------------------------------------------------------------------
 * Helper functions
 * -----------------------------------------------------------------------------------------------*/

/**
 * Filter an array of options against an input string.
 * @return an array of options that begin with the filter string, case-independent.
 */
function filterOptions(options: SelectOptionData[] = [], filter: string, exclude: string[] = []) {
  return options.filter(option => {
    if (option.disabled) {
      return false;
    }

    const matches = option.label.toLowerCase().indexOf(filter.toLowerCase()) === 0;
    return matches && exclude.indexOf(option.label) < 0;
  });
}

/**
 * Return the index of an option from an array of options, based on a search string
 * if the filter is multiple iterations of the same letter (e.g "aaa"), then cycle through first-letter matches
 */
export function getIndexByLetter(options: SelectOptionData[], filter: string, startIndex = 0) {
  const orderedOptions = [...options.slice(startIndex), ...options.slice(0, startIndex)];
  const firstMatch = filterOptions(orderedOptions, filter)[0];
  const allSameLetter = (array: string[]) => array.every(letter => letter === array[0]);

  // first check if there is an exact match for the typed string
  if (firstMatch) {
    return options.indexOf(firstMatch);
  }

  // if the same letter is being repeated, cycle through first-letter matches
  else if (allSameLetter(filter.split(""))) {
    const matches = filterOptions(orderedOptions, filter[0]);
    return options.indexOf(matches[0]);
  }

  // if no matches, return -1
  else {
    return -1;
  }
}

/**
 * Map a key press to an action.
 */
export function getActionFromKey(event: KeyboardEvent, menuOpen: boolean) {
  const { key, altKey, ctrlKey, metaKey } = event;
  const openKeys = ["ArrowDown", "ArrowUp", "Enter", " "]; // all keys that will do the default open action

  // handle opening when closed
  if (!menuOpen && openKeys.includes(key)) {
    return SelectActions.Open;
  }

  // home and end move the selected option when open or closed
  if (key === "Home" || key === "PageUp") {
    return SelectActions.First;
  }
  if (key === "End" || key === "PageDown") {
    return SelectActions.Last;
  }

  // handle typing characters when open or closed
  if (key === "Backspace" || key === "Clear" || (key.length === 1 && key !== " " && !altKey && !ctrlKey && !metaKey)) {
    return SelectActions.Type;
  }

  // handle keys when open
  if (menuOpen) {
    if (key === "ArrowUp" && altKey) {
      return SelectActions.CloseSelect;
    } else if (key === "ArrowDown" && !altKey) {
      return SelectActions.Next;
    } else if (key === "ArrowUp") {
      return SelectActions.Previous;
    } else if (key === "Escape") {
      return SelectActions.Close;
    } else if (key === "Enter" || key === " ") {
      return SelectActions.CloseSelect;
    }
  }
}

/**
 * Get an updated option index after performing an action
 */
function calculateActiveIndex(currentIndex: number, maxIndex: number, action: SelectActions) {
  switch (action) {
    case SelectActions.First:
      return 0;
    case SelectActions.Last:
      return maxIndex;
    case SelectActions.Previous:
      return Math.max(0, currentIndex - 1);
    case SelectActions.Next:
      return Math.min(maxIndex, currentIndex + 1);
    default:
      return currentIndex;
  }
}

/**
 * Get an updated option index after performing an action, ignoring "disabled" option.
 */
export function getUpdatedIndex(params: GetUpdatedIndexParams) {
  const { currentIndex, maxIndex, initialAction, isOptionDisabled } = params;

  let nextIndex = calculateActiveIndex(currentIndex, maxIndex, initialAction);

  while (isOptionDisabled(nextIndex)) {
    let nextAction = initialAction;
    const isNextIndexFirst = nextIndex === 0;
    const isNextIndexLast = nextIndex === maxIndex;

    // If first option is disabled move down until find an enabled option.
    if (initialAction === SelectActions.First) {
      nextAction = SelectActions.Next;
    }

    // If last option is disabled move up until find an enabled option.
    if (initialAction === SelectActions.Last) {
      nextAction = SelectActions.Previous;
    }

    // If all previous options are disabled, don't move.
    if (initialAction === SelectActions.Previous && isNextIndexFirst) {
      nextIndex = currentIndex;
      break;
    }

    // If all next options are disabled, don't move.
    if (initialAction === SelectActions.Next && isNextIndexLast) {
      nextIndex = currentIndex;
      break;
    }

    nextIndex = calculateActiveIndex(nextIndex, maxIndex, nextAction);
  }

  return nextIndex;
}

/**
 * Check if two options value are equal.
 */
export function isOptionEqual(a: any, b: any, compareKey: string): boolean {
  if (!isObject(a)) {
    return a === b;
  }

  return a[compareKey] === b[compareKey];
}

/**
 * Get the label of an option's value.
 */
export function getOptionLabel(optionValue: any, labelKey: string): string {
  return isObject(optionValue) ? optionValue[labelKey] : optionValue;
}

/**
 * Check if an element is currently scrollable
 */
export function isScrollable(element: HTMLElement) {
  return element && element.clientHeight < element.scrollHeight;
}

/**
 * Ensure a given child element is within the parent's visible scroll area
 * if the child is not visible, scroll the parent
 */
export function maintainScrollVisibility(activeElement: HTMLElement, scrollParent: HTMLElement) {
  const { offsetHeight, offsetTop } = activeElement;
  const { offsetHeight: parentOffsetHeight, scrollTop } = scrollParent;

  const isAbove = offsetTop < scrollTop;
  const isBelow = offsetTop + offsetHeight > scrollTop + parentOffsetHeight;

  if (isAbove) {
    scrollParent.scrollTo(0, offsetTop);
  } else if (isBelow) {
    scrollParent.scrollTo(0, offsetTop - parentOffsetHeight + offsetHeight);
  }
}
