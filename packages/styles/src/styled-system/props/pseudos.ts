import { OverrideProps } from "@hope-ui/utils";

import { CSSObject } from "../../stitches.config";
import { KeysOf, Theme } from "../../types";
import { BaseSystemStyleProps } from "./base";

type BaseSystemStyleObject = OverrideProps<CSSObject, BaseSystemStyleProps>;
export type PseudoSelectorValue = BaseSystemStyleObject | ((theme: Theme) => BaseSystemStyleObject);

export type PseudoSelectorProps = Partial<{
  /** Styles for CSS selector `&:hover`. */
  _hover: PseudoSelectorValue;

  /** Styles for CSS Selector `&:active`. */
  _active: PseudoSelectorValue;

  /** Styles for CSS selector `&:focus`. */
  _focus: PseudoSelectorValue;

  /**
   * Styles to apply when a child of this element has received focus
   * - CSS Selector `&:focus-within`
   */
  _focusWithin: PseudoSelectorValue;

  /**
   * Styles to apply when this element has received focus via tabbing
   * - CSS Selector `&:focus-visible`
   */
  _focusVisible: PseudoSelectorValue;

  /**
   * Styles to apply when this element is disabled. The passed styles are applied to these CSS selectors:
   * - `&[aria-disabled=true]`
   * - `&:disabled`
   * - `&[data-disabled]`
   */
  _disabled: PseudoSelectorValue;

  /** Styles to apply when a parent element with `.group`, `data-group` or `role=group` is hovered. */
  _groupHover: PseudoSelectorValue;

  /** Styles to apply when a parent element with `.group`, `data-group` or `role=group` is active. */
  _groupActive: PseudoSelectorValue;

  /** Styles to apply when a parent element with `.group`, `data-group` or `role=group` is focused. */
  _groupFocus: PseudoSelectorValue;

  /** Styles to apply when a parent element with `.group`, `data-group` or `role=group` has focus within. */
  _groupFocusWithin: PseudoSelectorValue;

  /** Styles to apply when a parent element with `.group`, `data-group` or `role=group` has visible focus. */
  _groupFocusVisible: PseudoSelectorValue;

  /** Styles to apply when a parent element with `.group`, `data-group` or `role=group` is disabled. */
  _groupDisabled: PseudoSelectorValue;

  /** Styles to apply when a sibling element with `.peer` or `data-peer` is hovered. */
  _peerHover: PseudoSelectorValue;

  /** Styles to apply when a sibling element with `.peer` or `data-peer` is active. */
  _peerActive: PseudoSelectorValue;

  /** Styles to apply when a sibling element with `.peer` or `data-peer` is focused. */
  _peerFocus: PseudoSelectorValue;

  /** Styles to apply when a sibling element with `.peer` or `data-peer` has focus within. */
  _peerFocusWithin: PseudoSelectorValue;

  /** Styles to apply when a sibling element with `.peer`or `data-peer` has visible focus. */
  _peerFocusVisible: PseudoSelectorValue;

  /** Styles to apply when a sibling element with `.peer` or `data-peer` is disabled. */
  _peerDisabled: PseudoSelectorValue;
}>;

export const pseudoSelectorPropNames: KeysOf<PseudoSelectorProps> = {
  _hover: true,
  _active: true,
  _focus: true,
  _focusWithin: true,
  _focusVisible: true,
  _disabled: true,
  _groupHover: true,
  _groupActive: true,
  _groupFocus: true,
  _groupFocusWithin: true,
  _groupFocusVisible: true,
  _groupDisabled: true,
  _peerHover: true,
  _peerActive: true,
  _peerFocus: true,
  _peerFocusWithin: true,
  _peerFocusVisible: true,
  _peerDisabled: true,
};
