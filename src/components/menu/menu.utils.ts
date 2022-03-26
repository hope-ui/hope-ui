export interface MenuItemData {
  /**
   * Optional text used for typeahead purposes.
   * By default the typeahead behavior will use the `.textContent` of the `MenuItem`.
   * Use this when the content is complex, or you have non-textual content inside.
   */
  textValue: string;

  /**
   * If `true`, the item will be disabled.
   */
  disabled: boolean;

  /**
   * If `true`, the menu will close when the menu item is selected.
   */
  closeOnSelect: boolean;

  /**
   * Event handler called when the user selects an item (via mouse or keyboard).
   */
  onSelect?: () => void;
}

interface GetUpdatedIndexParams {
  /**
   * The current active index.
   */
  currentIndex: number;

  /**
   * The index of the last item.
   */
  maxIndex: number;

  /**
   * The initialy performed action.
   */
  initialAction: MenuActions;

  /**
   * Callback invoked to check if an item at a given index is diabled or not.
   */
  isItemDisabled: (index: number) => boolean;
}

/**
 * List of named menu actions
 */
export enum MenuActions {
  Close,
  SelectAndClose,
  First,
  Last,
  Next,
  Open,
  OpenAndFocusLast,
  Previous,
  Select,
  Type,
}

/* -------------------------------------------------------------------------------------------------
 * Helper functions
 * -----------------------------------------------------------------------------------------------*/

/**
 * Filter an array of items against an input string.
 * @return an array of items that begin with the filter string, case-independent.
 */
function filterItems(items: MenuItemData[] = [], filter: string, exclude: string[] = []) {
  return items.filter(item => {
    if (item.disabled) {
      return false;
    }

    const matches = item.textValue.toLowerCase().indexOf(filter.toLowerCase()) === 0;
    return matches && exclude.indexOf(item.textValue) < 0;
  });
}

/**
 * Return the index of an item from an array of items, based on a search string
 * if the filter is multiple iterations of the same letter (e.g "aaa"), then cycle through first-letter matches
 */
export function getIndexByLetter(items: MenuItemData[], filter: string, startIndex = 0) {
  const orderedItems = [...items.slice(startIndex), ...items.slice(0, startIndex)];
  const firstMatch = filterItems(orderedItems, filter)[0];
  const allSameLetter = (array: string[]) => array.every(letter => letter === array[0]);

  // first check if there is an exact match for the typed string
  if (firstMatch) {
    return items.indexOf(firstMatch);
  }

  // if the same letter is being repeated, cycle through first-letter matches
  else if (allSameLetter(filter.split(""))) {
    const matches = filterItems(orderedItems, filter[0]);
    return items.indexOf(matches[0]);
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
  const openKeys = ["ArrowDown", "Enter", " "]; // all keys that will do the default open action

  // handle opening when closed
  if (!menuOpen && openKeys.includes(key)) {
    return MenuActions.Open;
  }

  // handle openeing when closed and arrow up is pressed
  if (!menuOpen && key === "ArrowUp") {
    return MenuActions.OpenAndFocusLast;
  }

  // home and end move the selected item when open or closed
  if (key === "Home") {
    return MenuActions.First;
  }
  if (key === "End") {
    return MenuActions.Last;
  }

  // handle typing characters when open or closed
  if (key === "Backspace" || key === "Clear" || (key.length === 1 && key !== " " && !altKey && !ctrlKey && !metaKey)) {
    return MenuActions.Type;
  }

  // handle keys when open
  if (menuOpen) {
    if (key === "ArrowDown") {
      return MenuActions.Next;
    } else if (key === "ArrowUp") {
      return MenuActions.Previous;
    } else if (key === "Escape") {
      return MenuActions.Close;
    } else if (key === "Enter" || key === " ") {
      return MenuActions.SelectAndClose;
    }
  }
}

/**
 * Get an updated item index after performing an action
 */
function calculateActiveIndex(currentIndex: number, maxIndex: number, action: MenuActions) {
  switch (action) {
    case MenuActions.First:
      return 0;
    case MenuActions.Last:
      return maxIndex;
    case MenuActions.Previous:
      return currentIndex - 1 < 0 ? maxIndex : currentIndex - 1;
    case MenuActions.Next:
      return currentIndex + 1 > maxIndex ? 0 : currentIndex + 1;
    default:
      return currentIndex;
  }
}

/**
 * Get an updated item index after performing an action, ignoring "disabled" item.
 */
export function getUpdatedIndex(params: GetUpdatedIndexParams) {
  const { currentIndex, maxIndex, initialAction, isItemDisabled: isItemDisabled } = params;

  let nextIndex = calculateActiveIndex(currentIndex, maxIndex, initialAction);

  while (isItemDisabled(nextIndex)) {
    let nextAction = initialAction;
    const isNextIndexFirst = nextIndex === 0;
    const isNextIndexLast = nextIndex === maxIndex;

    // If first item is disabled move down until find an enabled item.
    if (initialAction === MenuActions.First) {
      nextAction = MenuActions.Next;
    }

    // If last item is disabled move up until find an enabled item.
    if (initialAction === MenuActions.Last) {
      nextAction = MenuActions.Previous;
    }

    // If all previous items are disabled, don't move.
    if (initialAction === MenuActions.Previous && isNextIndexFirst) {
      nextIndex = currentIndex;
      break;
    }

    // If all next items are disabled, don't move.
    if (initialAction === MenuActions.Next && isNextIndexLast) {
      nextIndex = currentIndex;
      break;
    }

    nextIndex = calculateActiveIndex(nextIndex, maxIndex, nextAction);
  }

  return nextIndex;
}
