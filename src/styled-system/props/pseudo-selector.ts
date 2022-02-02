import { PseudoSelector } from "@/theme/stitches-utils/pseudo-selector";
import { SystemStyleObject } from "@/theme/types";

import { KeysOf } from "../types";

/**
 * Types for common CSS pseudo selectors
 */
export type PseudoSelectorProps = Partial<{
  [k in keyof PseudoSelector]: SystemStyleObject;
}>;

export const pseudoSelectorPropNames: KeysOf<PseudoSelectorProps> = {
  _hover: true,
  _active: true,
  _focus: true,
  _highlighted: true,
  _focusWithin: true,
  _focusVisible: true,
  _disabled: true,
  _readOnly: true,
  _before: true,
  _after: true,
  _empty: true,
  _expanded: true,
  _checked: true,
  _grabbed: true,
  _pressed: true,
  _invalid: true,
  _valid: true,
  _loading: true,
  _selected: true,
  _hidden: true,
  _autofill: true,
  _even: true,
  _odd: true,
  _first: true,
  _last: true,
  _notFirst: true,
  _notLast: true,
  _visited: true,
  _activeLink: true,
  _activeStep: true,
  _indeterminate: true,
  _groupHover: true,
  _peerHover: true,
  _groupFocus: true,
  _peerFocus: true,
  _groupFocusVisible: true,
  _peerFocusVisible: true,
  _groupActive: true,
  _peerActive: true,
  _groupDisabled: true,
  _peerDisabled: true,
  _groupInvalid: true,
  _peerInvalid: true,
  _groupChecked: true,
  _peerChecked: true,
  _groupFocusWithin: true,
  _peerFocusWithin: true,
  _peerPlaceholderShown: true,
  _placeholder: true,
  _placeholderShown: true,
  _fullScreen: true,
  _selection: true,
  _mediaDark: true,
  _mediaReduceMotion: true,
  _dark: true,
  _light: true,
};
