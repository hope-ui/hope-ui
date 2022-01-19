import type { CSS } from "@stitches/core";

export const pseudoSelectors = {
  /**
   * Styles for CSS selector `&:hover`
   */
  _hover: (value: CSS) => ({
    "&:hover, &[data-hover]": value,
  }),

  /**
   * Styles for CSS Selector `&:active`
   */
  _active: (value: CSS) => ({
    "&:active, &[data-active]": value,
  }),

  /**
   * Styles for CSS selector `&:focus`
   *
   */
  _focus: (value: CSS) => ({
    "&:focus, &[data-focus]": value,
  }),

  /**
   * Styles to apply when a child of this element has received focus
   * - CSS Selector `&:focus-within`
   */
  _focusWithin: (value: CSS) => ({
    "&:focus-within": value,
  }),

  /**
   * Styles to apply when this element has received focus via tabbing
   * - CSS Selector `&:focus-visible`
   */
  _focusVisible: (value: CSS) => ({
    "&:focus-visible": value,
  }),

  /**
   * Styles to apply when this element is disabled. The passed styles are applied to these CSS selectors:
   * - `&[aria-disabled=true]`
   * - `&:disabled`
   * - `&[data-disabled]`
   */
  _disabled: (value: CSS) => ({
    "&[disabled], &[aria-disabled=true], &[data-disabled]": value,
  }),

  /**
   * Styles to apply when a parent element with `.group`, `data-group` or `role=group` is hovered
   */
  _groupHover: (value: CSS) => ({
    "[role=group]:hover &, [role=group][data-hover] &": value,
  }),

  /**
   * Styles to apply when a parent element with `.group`, `data-group` or `role=group` is active
   */
  _groupActive: (value: CSS) => ({
    "[role=group]:active &, [role=group][data-active] &": value,
  }),

  /**
   * Styles to apply when a parent element with `.group`, `data-group` or `role=group` is focused
   */
  _groupFocus: (value: CSS) => ({
    "[role=group]:focus &, [role=group][data-focus] &": value,
  }),

  /**
   * Styles to apply when a parent element with `.group`, `data-group` or `role=group` is disabled
   */
  _groupDisabled: (value: CSS) => ({
    "[role=group]:disabled &, [role=group][data-disabled] &": value,
  }),
};

export type PseudoSelectorShorthands = typeof pseudoSelectors;
