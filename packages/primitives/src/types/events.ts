export interface FocusEvents {
  /**
   * Handler that is called when the element receives focus.
   */
  onFocus?: (e: FocusEvent) => void;

  /**
   * Handler that is called when the element loses focus.
   */
  onBlur?: (e: FocusEvent) => void;

  /**
   * Handler that is called when the element's focus status changes.
   */
  onFocusChange?: (isFocused: boolean) => void;
}
