import { AnyFunction } from "@hope-ui/utils";

import { CSSObject, KeysOf, Theme } from "../../types";
import { BaseSystemStyleObject } from "../base-system-style-object";

const state = {
  hover: (str: string, post: string) => `${str}:hover ${post}, ${str}[data-hover] ${post}`,
  focus: (str: string, post: string) => `${str}:focus ${post}, ${str}[data-focus] ${post}`,
  focusVisible: (str: string, post: string) => `${str}:focus-visible ${post}`,
  focusWithin: (str: string, post: string) => `${str}:focus-within ${post}`,
  active: (str: string, post: string) => `${str}:active ${post}, ${str}[data-active] ${post}`,
  disabled: (str: string, post: string) => `${str}:disabled ${post}, ${str}[data-disabled] ${post}`,
  invalid: (str: string, post: string) => `${str}:invalid ${post}, ${str}[data-invalid] ${post}`,
  checked: (str: string, post: string) => `${str}:checked ${post}, ${str}[data-checked] ${post}`,
  placeholderShown: (str: string, post: string) => `${str}:placeholder-shown ${post}`,
};

const toGroup = (fn: AnyFunction) =>
  merge(v => fn(v, "&"), "[role=group]", "[data-group]", ".group");

const toPeer = (fn: AnyFunction) => merge(v => fn(v, "~ &"), "[data-peer]", ".peer");

const merge = (fn: AnyFunction, ...selectors: string[]) => selectors.map(fn).join(", ");

export const pseudoSelectors = {
  /** Styles for CSS selector `&:hover`. */
  _hover: "&:hover, &[data-hover]",

  /** Styles for CSS Selector `&:active`. */
  _active: "&:active, &[data-active]",

  /** Styles for CSS selector `&:focus`. */
  _focus: "&:focus, &[data-focus]",

  /** Styles for the highlighted state. */
  _highlighted: "&[data-highlighted]",

  /**
   * Styles to apply when a child of this element has received focus
   * - CSS Selector `&:focus-within`
   */
  _focusWithin: "&:focus-within",

  /**
   * Styles to apply when this element has received focus via tabbing
   * - CSS Selector `&:focus-visible`
   */
  _focusVisible: "&:focus-visible, &[data-focus-visible]",

  /**
   * Styles to apply when this element is disabled. The passed styles are applied to these CSS selectors:
   * - `&[aria-disabled=true]`
   * - `&:disabled`
   * - `&[data-disabled]`
   */
  _disabled: "&[disabled], &[aria-disabled=true], &[data-disabled]",

  /** Styles for CSS Selector `&:readonly`. */
  _readOnly: "&[aria-readonly=true], &[readonly], &[data-readonly]",

  /**
   * Styles for CSS selector `&::before`
   *
   * NOTE:When using this, ensure the `content` is wrapped in a backtick.
   * @example
   * ```jsx
   * <Box _before={{content:`""` }}/>
   * ```
   */
  _before: "&::before",

  /**
   * Styles for CSS selector `&::after`
   *
   * NOTE:When using this, ensure the `content` is wrapped in a backtick.
   * @example
   * ```jsx
   * <Box _after={{content:`""` }}/>
   * ```
   */
  _after: "&::after",

  /** Styles for CSS selector `&:empty`. */
  _empty: "&:empty",

  /**
   * Styles to apply when the ARIA attribute `aria-expanded` is `true`
   * - CSS selector `&[aria-expanded=true]`
   */
  _expanded: "&[aria-expanded=true], &[data-expanded]",

  /**
   * Styles to apply when the ARIA attribute `aria-checked` is `true`
   * - CSS selector `&[aria-checked=true]`
   */
  _checked: "&[aria-checked=true], &[data-checked]",

  /**
   * Styles to apply when the ARIA attribute `aria-grabbed` is `true`
   * - CSS selector `&[aria-grabbed=true]`
   */
  _grabbed: "&[aria-grabbed=true], &[data-grabbed]",

  /**
   * Styles for CSS Selector `&[aria-pressed=true]`
   * Typically used to style the current "pressed" state of toggle buttons
   */
  _pressed: "&[aria-pressed=true], &[data-pressed]",

  /**
   * Styles to apply when the ARIA attribute `aria-invalid` is `true`
   * - CSS selector `&[aria-invalid=true]`
   */
  _invalid: "&[aria-invalid=true], &[data-invalid]",

  /**
   * Styles for the valid state
   * - CSS selector `&[data-valid], &[data-state=valid]`
   */
  _valid: "&[data-valid], &[data-state=valid]",

  /**
   * Styles for CSS Selector `&[aria-busy=true]` or `&[data-loading=true]`.
   * Useful for styling loading states
   */
  _loading: "&[data-loading], &[aria-busy=true]",

  /**
   * Styles to apply when the ARIA attribute `aria-selected` is `true`
   * - CSS selector `&[aria-selected=true]`
   */
  _selected: "&[aria-selected=true], &[data-selected]",

  /** Styles for CSS Selector `[hidden=true]`. */
  _hidden: "&[hidden], &[data-hidden]",

  /** Styles for CSS Selector `&:-webkit-autofill`. */
  _autofill: "&:-webkit-autofill",

  /** Styles for CSS Selector `&:nth-child(even)`. */
  _even: "&:nth-of-type(even)",

  /** Styles for CSS Selector `&:nth-child(odd)`. */
  _odd: "&:nth-of-type(odd)",

  /** Styles for CSS Selector `&:first-of-type`. */
  _first: "&:first-of-type",

  /** Styles for CSS Selector `&:last-of-type`. */
  _last: "&:last-of-type",

  /** Styles for CSS Selector `&:not(:first-of-type)`. */
  _notFirst: "&:not(:first-of-type)",

  /** Styles for CSS Selector `&:not(:last-of-type)`. */
  _notLast: "&:not(:last-of-type)",

  /** Styles for CSS Selector `&:visited`. */
  _visited: "&:visited",

  /**
   * Used to style the active link in a navigation
   * Styles for CSS Selector `&[aria-current=page]`
   */
  _activeLink: "&[aria-current=page]",

  /**
   * Used to style the current step within a process
   * Styles for CSS Selector `&[aria-current=step]`
   */
  _activeStep: "&[aria-current=step]",

  /**
   * Styles to apply when the ARIA attribute `aria-checked` is `mixed`
   * - CSS selector `&[aria-checked=mixed]`
   */
  _indeterminate: "&:indeterminate, &[aria-checked=mixed], &[data-indeterminate]",

  /** Styles to apply when a parent element with `.group`, `data-group` or `role=group` is hovered. */
  _groupHover: toGroup(state.hover),

  /** Styles to apply when a sibling element with `.peer` or `data-peer` is hovered. */
  _peerHover: toPeer(state.hover),

  /** Styles to apply when a parent element with `.group`, `data-group` or `role=group` is focused. */
  _groupFocus: toGroup(state.focus),

  /** Styles to apply when a sibling element with `.peer` or `data-peer` is focused. */
  _peerFocus: toPeer(state.focus),

  /** Styles to apply when a parent element with `.group`, `data-group` or `role=group` has visible focus. */
  _groupFocusVisible: toGroup(state.focusVisible),

  /** Styles to apply when a sibling element with `.peer`or `data-peer` has visible focus. */
  _peerFocusVisible: toPeer(state.focusVisible),

  /** Styles to apply when a parent element with `.group`, `data-group` or `role=group` is active. */
  _groupActive: toGroup(state.active),

  /** Styles to apply when a sibling element with `.peer` or `data-peer` is active. */
  _peerActive: toPeer(state.active),

  /** Styles to apply when a parent element with `.group`, `data-group` or `role=group` is disabled. */
  _groupDisabled: toGroup(state.disabled),

  /** Styles to apply when a sibling element with `.peer` or `data-peer` is disabled. */
  _peerDisabled: toPeer(state.disabled),

  /** Styles to apply when a parent element with `.group`, `data-group` or `role=group` is invalid. */
  _groupInvalid: toGroup(state.invalid),

  /** Styles to apply when a sibling element with `.peer` or `data-peer` is invalid. */
  _peerInvalid: toPeer(state.invalid),

  /** Styles to apply when a parent element with `.group`, `data-group` or `role=group` is checked. */
  _groupChecked: toGroup(state.checked),

  /** Styles to apply when a sibling element with `.peer` or `data-peer` is checked. */
  _peerChecked: toPeer(state.checked),

  /** Styles to apply when a parent element with `.group`, `data-group` or `role=group` has focus within. */
  _groupFocusWithin: toGroup(state.focusWithin),

  /** Styles to apply when a sibling element with `.peer` or `data-peer` has focus within. */
  _peerFocusWithin: toPeer(state.focusWithin),

  /** Styles to apply when a sibling element with `.peer` or `data-peer` has placeholder shown. */
  _peerPlaceholderShown: toPeer(state.placeholderShown),

  /** Styles for CSS Selector `&::placeholder`.. */
  _placeholder: "&::placeholder",

  /** Styles for CSS Selector `&:placeholder-shown`. */
  _placeholderShown: "&:placeholder-shown",

  /** Styles for CSS Selector `&:fullscreen`. */
  _fullScreen: "&:fullscreen",

  /** Styles for CSS Selector `&::selection`. */
  _selection: "&::selection",

  /**
   * Styles for CSS Selector `[dir=rtl] &`
   * It is applied when a parent element or this element has `dir="rtl"`
   */
  _rtl: "[dir=rtl] &, &[dir=rtl]",

  /**
   * Styles for CSS Selector `[dir=ltr] &`
   * It is applied when a parent element or this element has `dir="ltr"`
   */
  _ltr: "[dir=ltr] &, &[dir=ltr]",

  /**
   * Styles for CSS Selector `@media (prefers-color-scheme: dark)`
   * It is used when the user has requested the system use a light or dark color theme.
   */
  _mediaDark: "@media (prefers-color-scheme: dark)",

  /**
   * Styles for CSS Selector `@media (prefers-reduced-motion: reduce)`
   * It is used when the user has requested the system to reduce the amount of animations.
   */
  _mediaReduceMotion: "@media (prefers-reduced-motion: reduce)",

  /**
   * Styles for when `data-theme` is applied to any parent of
   * this component or element.
   */
  _dark:
    ".hope-theme-dark &:not([data-theme])," +
    "[data-theme=dark] &:not([data-theme])," +
    "&[data-theme=dark]",

  /**
   * Styles for when `data-theme` is applied to any parent of
   * this component or element.
   */
  _light:
    ".hope-theme-light &:not([data-theme])," +
    "[data-theme=light] &:not([data-theme])," +
    "&[data-theme=light]",
};

export type PseudoSelectorProps = Partial<{
  [k in keyof typeof pseudoSelectors]:
    | BaseSystemStyleObject
    | ((theme: Theme) => BaseSystemStyleObject);
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
  _rtl: true,
  _ltr: true,
  _mediaDark: true,
  _mediaReduceMotion: true,
  _dark: true,
  _light: true,
};
