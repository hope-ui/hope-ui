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
   */
  _focus: (value: CSS) => ({
    "&:focus, &[data-focus]": value,
  }),

  /**
   * Styles for the highlighted state.
   */
  _highlighted: (value: CSS) => ({
    "&[data-highlighted]": value,
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
   * Styles for CSS Selector `&:readonly`
   */
  _readOnly: (value: CSS) => ({
    "&[aria-readonly=true], &[readonly], &[data-readonly]": value,
  }),

  /**
   * Styles for CSS selector `&::before`
   *
   * NOTE:When using this, ensure the `content` is wrapped in a backtick.
   * @example
   * ```jsx
   * <Box _before={{content:`""` }}/>
   * ```
   */
  _before: (value: CSS) => ({
    "&::before": value,
  }),

  /**
   * Styles for CSS selector `&::after`
   *
   * NOTE:When using this, ensure the `content` is wrapped in a backtick.
   * @example
   * ```jsx
   * <Box _after={{content:`""` }}/>
   * ```
   */
  _after: (value: CSS) => ({
    "&::after": value,
  }),

  /**
   * Styles for CSS selector `&:empty`
   */
  _empty: (value: CSS) => ({
    "&:empty": value,
  }),

  /**
   * Styles to apply when the ARIA attribute `aria-expanded` is `true`
   * - CSS selector `&[aria-expanded=true]`
   */
  _expanded: (value: CSS) => ({
    "&[aria-expanded=true], &[data-expanded]": value,
  }),

  /**
   * Styles to apply when the ARIA attribute `aria-checked` is `true`
   * - CSS selector `&[aria-checked=true]`
   */
  _checked: (value: CSS) => ({
    "&[aria-checked=true], &[data-checked]": value,
  }),

  /**
   * Styles to apply when the ARIA attribute `aria-grabbed` is `true`
   * - CSS selector `&[aria-grabbed=true]`
   */
  _grabbed: (value: CSS) => ({
    "&[aria-grabbed=true], &[data-grabbed]": value,
  }),

  /**
   * Styles for CSS Selector `&[aria-pressed=true]`
   * Typically used to style the current "pressed" state of toggle buttons
   */
  _pressed: (value: CSS) => ({
    "&[aria-pressed=true], &[data-pressed]": value,
  }),

  /**
   * Styles to apply when the ARIA attribute `aria-invalid` is `true`
   * - CSS selector `&[aria-invalid=true]`
   */
  _invalid: (value: CSS) => ({
    "&[aria-invalid=true], &[data-invalid]": value,
  }),

  /**
   * Styles for the valid state
   * - CSS selector `&[data-valid], &[data-state=valid]`
   */
  _valid: (value: CSS) => ({
    "&[data-valid], &[data-state=valid]": value,
  }),

  /**
   * Styles for CSS Selector `&[aria-busy=true]` or `&[data-loading=true]`.
   * Useful for styling loading states
   */
  _loading: (value: CSS) => ({
    "&[data-loading], &[aria-busy=true]": value,
  }),

  /**
   * Styles to apply when the ARIA attribute `aria-selected` is `true`
   *
   * - CSS selector `&[aria-selected=true]`
   */
  _selected: (value: CSS) => ({
    "&[aria-selected=true], &[data-selected]": value,
  }),

  /**
   * Styles for CSS Selector `[hidden=true]`
   */
  _hidden: (value: CSS) => ({
    "&[hidden], &[data-hidden]": value,
  }),

  /**
   * Styles for CSS Selector `&:-webkit-autofill`
   */
  _autofill: (value: CSS) => ({
    "&:-webkit-autofill": value,
  }),

  /**
   * Styles for CSS Selector `&:nth-child(even)`
   */
  _even: (value: CSS) => ({
    "&:nth-of-type(even)": value,
  }),

  /**
   * Styles for CSS Selector `&:nth-child(odd)`
   */
  _odd: (value: CSS) => ({
    "&:nth-of-type(odd)": value,
  }),

  /**
   * Styles for CSS Selector `&:first-of-type`
   */
  _first: (value: CSS) => ({
    "&:first-of-type": value,
  }),

  /**
   * Styles for CSS Selector `&:last-of-type`
   */
  _last: (value: CSS) => ({
    "&:last-of-type": value,
  }),

  /**
   * Styles for CSS Selector `&:not(:first-of-type)`
   */
  _notFirst: (value: CSS) => ({
    "&:not(:first-of-type)": value,
  }),

  /**
   * Styles for CSS Selector `&:not(:last-of-type)`
   */
  _notLast: (value: CSS) => ({
    "&:not(:last-of-type)": value,
  }),

  /**
   * Styles for CSS Selector `&:visited`
   */
  _visited: (value: CSS) => ({
    "&:visited": value,
  }),

  /**
   * Used to style the active link in a navigation
   * Styles for CSS Selector `&[aria-current=page]`
   */
  _activeLink: (value: CSS) => ({
    "&[aria-current=page]": value,
  }),

  /**
   * Used to style the current step within a process
   * Styles for CSS Selector `&[aria-current=step]`
   */
  _activeStep: (value: CSS) => ({
    "&[aria-current=step]": value,
  }),

  /**
   * Styles to apply when the ARIA attribute `aria-checked` is `mixed`
   * - CSS selector `&[aria-checked=mixed]`
   */
  _indeterminate: (value: CSS) => ({
    "&:indeterminate, &[aria-checked=mixed], &[data-indeterminate]": value,
  }),

  /**
   * Styles to apply when a parent element with `.group`, `data-group` or `role=group` is hovered
   */
  _groupHover: (value: CSS) => ({
    "[role=group]:hover &, [role=group][data-hover] &, [data-group]:hover &, [data-group][data-hover] &, .group:hover &, .group[data-hover] &":
      value,
  }),

  /**
   * Styles to apply when a sibling element with `.peer` or `data-peer` is hovered
   */
  _peerHover: (value: CSS) => ({
    "[data-peer]:hover ~ &, [data-peer][data-hover] ~ &, .peer:hover ~ &, .peer[data-hover] ~ &":
      value,
  }),

  /**
   * Styles to apply when a parent element with `.group`, `data-group` or `role=group` is focused
   */
  _groupFocus: (value: CSS) => ({
    "[role=group]:focus &, [role=group][data-focus] &, [data-group]:focus &, [data-group][data-focus] &, .group:focus &, .group[data-focus] &":
      value,
  }),

  /**
   * Styles to apply when a sibling element with `.peer` or `data-peer` is focused
   */
  _peerFocus: (value: CSS) => ({
    "[data-peer]:focus ~ &, [data-peer][data-focus] ~ &, .peer:focus ~ &, .peer[data-focus] ~ &":
      value,
  }),

  /**
   * Styles to apply when a parent element with `.group`, `data-group` or `role=group` has visible focus
   */
  _groupFocusVisible: (value: CSS) => ({
    "[role=group]:focus-visible &, [data-group]:focus-visible &, .group:focus-visible &": value,
  }),

  /**
   * Styles to apply when a sibling element with `.peer`or `data-peer` has visible focus
   */
  _peerFocusVisible: (value: CSS) => ({
    "[data-peer]:focus-visible ~ &, .peer:focus-visible ~ &": value,
  }),

  /**
   * Styles to apply when a parent element with `.group`, `data-group` or `role=group` is active
   */
  _groupActive: (value: CSS) => ({
    "[role=group]:active &, [role=group][data-active] &, [data-group]:active &, [data-group][data-active] &, .group:active &, .group[data-active] &":
      value,
  }),

  /**
   * Styles to apply when a sibling element with `.peer` or `data-peer` is active
   */
  _peerActive: (value: CSS) => ({
    "[data-peer]:active ~ &, [data-peer][data-active] ~ &, .peer:active ~ &, .peer[data-active] ~ &":
      value,
  }),

  /**
   * Styles to apply when a parent element with `.group`, `data-group` or `role=group` is disabled
   */
  _groupDisabled: (value: CSS) => ({
    "[role=group]:disabled &, [role=group][data-disabled] &, [data-group]:disabled &, [data-group][data-disabled] &, .group:disabled &, .group[data-disabled] &":
      value,
  }),

  /**
   *  Styles to apply when a sibling element with `.peer` or `data-peer` is disabled
   */
  _peerDisabled: (value: CSS) => ({
    "[data-peer]:disabled ~ &, [data-peer][data-disabled] ~ &, .peer:disabled ~ &, .peer[data-disabled] ~ &":
      value,
  }),

  /**
   *  Styles to apply when a parent element with `.group`, `data-group` or `role=group` is invalid
   */
  _groupInvalid: (value: CSS) => ({
    "[role=group]:invalid &, [role=group][data-invalid] &, [data-group]:invalid &, [data-group][data-invalid] &, .group:invalid &, .group[data-invalid] &":
      value,
  }),

  /**
   *  Styles to apply when a sibling element with `.peer` or `data-peer` is invalid
   */
  _peerInvalid: (value: CSS) => ({
    "[data-peer]:invalid ~ &, [data-peer][data-invalid] ~ &, .peer:invalid ~ &, .peer[data-invalid] ~ &":
      value,
  }),

  /**
   * Styles to apply when a parent element with `.group`, `data-group` or `role=group` is checked
   */
  _groupChecked: (value: CSS) => ({
    "[role=group]:checked &, [role=group][data-checked] &, [data-group]:checked &, [data-group][data-checked] &, .group:checked &, .group[data-checked] &":
      value,
  }),

  /**
   * Styles to apply when a sibling element with `.peer` or `data-peer` is checked
   */
  _peerChecked: (value: CSS) => ({
    "[data-peer]:checked ~ &, [data-peer][data-checked] ~ &, .peer:checked ~ &, .peer[data-checked] ~ &":
      value,
  }),

  /**
   *  Styles to apply when a parent element with `.group`, `data-group` or `role=group` has focus within
   */
  _groupFocusWithin: (value: CSS) => ({
    "[role=group]:focus-within &, [data-group]:focus-within &, .group:focus-within &": value,
  }),

  /**
   *  Styles to apply when a sibling element with `.peer` or `data-peer` has focus within
   */
  _peerFocusWithin: (value: CSS) => ({
    "[data-peer]:focus-within ~ &, .peer:focus-within ~ &": value,
  }),

  /**
   * Styles to apply when a sibling element with `.peer` or `data-peer` has placeholder shown
   */
  _peerPlaceholderShown: (value: CSS) => ({
    "[data-peer]:placeholder-shown ~ &, .peer:placeholder-shown ~ &": value,
  }),

  /**
   * Styles for CSS Selector `&:placeholder-shown`.
   */
  _placeholder: (value: CSS) => ({
    "&::placeholder": value,
  }),

  /**
   * Styles for CSS Selector `&:placeholder-shown`.
   */
  _placeholderShown: (value: CSS) => ({
    "&:placeholder-shown": value,
  }),

  /**
   * Styles for CSS Selector `&:fullscreen`.
   */
  _fullScreen: (value: CSS) => ({
    "&:fullscreen": value,
  }),

  /**
   * Styles for CSS Selector `&::selection`
   */
  _selection: (value: CSS) => ({
    "&::selection": value,
  }),

  /**
   * Styles for CSS Selector `@media (prefers-color-scheme: dark)`
   * It is used when the user has requested the system use a light or dark color theme.
   */
  _mediaDark: (value: CSS) => ({
    "@media (prefers-color-scheme: dark)": value,
  }),

  /**
   * Styles for CSS Selector `@media (prefers-reduced-motion: reduce)`
   * It is used when the user has requested the system to reduce the amount of animations.
   */
  _mediaReduceMotion: (value: CSS) => ({
    "@media (prefers-reduced-motion: reduce)": value,
  }),

  /**
   * Styles for when `data-theme` is applied to any parent of
   * this component or element.
   */
  _dark: (value: CSS) => ({
    ".hope-ui-dark &, [data-theme=dark] &, &[data-theme=dark]": value,
  }),

  /**
   * Styles for when `data-theme` is applied to any parent of
   * this component or element.
   */
  _light: (value: CSS) => ({
    ".hope-ui-light &, [data-theme=light] &, &[data-theme=light]": value,
  }),
};

export type PseudoSelector = typeof pseudoSelectors;
