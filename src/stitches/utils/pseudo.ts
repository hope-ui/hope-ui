import type { CSS } from "@stitches/core";

export const pseudo = {
  _hover: (value: CSS) => ({
    "&:hover, &[data-hover]": value,
  }),
  _active: (value: CSS) => ({
    "&:active, &[data-active]": value,
  }),
  _focus: (value: CSS) => ({
    "&:focus, &[data-focus]": value,
  }),
  _highlighted: (value: CSS) => ({
    "&[data-highlighted]": value,
  }),
  _focusWithin: (value: CSS) => ({
    "&:focus-within": value,
  }),
  _focusVisible: (value: CSS) => ({
    "&:focus-visible": value,
  }),
  _disabled: (value: CSS) => ({
    "&[disabled], &[aria-disabled=true], &[data-disabled]": value,
  }),
  _readOnly: (value: CSS) => ({
    "&[aria-readonly=true], &[readonly], &[data-readonly]": value,
  }),
  _before: (value: CSS) => ({
    "&::before": value,
  }),
  _after: (value: CSS) => ({
    "&::after": value,
  }),
  _empty: (value: CSS) => ({
    "&:empty": value,
  }),
  _expanded: (value: CSS) => ({
    "&[aria-expanded=true], &[data-expanded]": value,
  }),
  _checked: (value: CSS) => ({
    "&[aria-checked=true], &[data-checked]": value,
  }),
  _grabbed: (value: CSS) => ({
    "&[aria-grabbed=true], &[data-grabbed]": value,
  }),
  _pressed: (value: CSS) => ({
    "&[aria-pressed=true], &[data-pressed]": value,
  }),
  _invalid: (value: CSS) => ({
    "&[aria-invalid=true], &[data-invalid]": value,
  }),
  _valid: (value: CSS) => ({
    "&[data-valid], &[data-state=valid]": value,
  }),
  _loading: (value: CSS) => ({
    "&[data-loading], &[aria-busy=true]": value,
  }),
  _selected: (value: CSS) => ({
    "&[aria-selected=true], &[data-selected]": value,
  }),
  _hidden: (value: CSS) => ({
    "&[hidden], &[data-hidden]": value,
  }),
  _autofill: (value: CSS) => ({
    "&:-webkit-autofill": value,
  }),
  _even: (value: CSS) => ({
    "&:nth-of-type(even)": value,
  }),
  _odd: (value: CSS) => ({
    "&:nth-of-type(odd)": value,
  }),
  _first: (value: CSS) => ({
    "&:first-of-type": value,
  }),
  _last: (value: CSS) => ({
    "&:last-of-type": value,
  }),
  _notFirst: (value: CSS) => ({
    "&:not(:first-of-type)": value,
  }),
  _notLast: (value: CSS) => ({
    "&:not(:last-of-type)": value,
  }),
  _visited: (value: CSS) => ({
    "&:visited": value,
  }),
  _activeLink: (value: CSS) => ({
    "&[aria-current=page]": value,
  }),
  _activeStep: (value: CSS) => ({
    "&[aria-current=step]": value,
  }),
  _indeterminate: (value: CSS) => ({
    "&:indeterminate, &[aria-checked=mixed], &[data-indeterminate]": value,
  }),
  _groupHover: (value: CSS) => ({
    "[role=group]:hover &, [role=group][data-hover] &": value,
  }),
  _groupFocus: (value: CSS) => ({
    "[role=group]:focus &, [role=group][data-focus] &": value,
  }),
  _groupActive: (value: CSS) => ({
    "[role=group]:active &, [role=group][data-active] &": value,
  }),
  _groupDisabled: (value: CSS) => ({
    "[role=group]:disabled &, [role=group][data-disabled] &": value,
  }),
  _groupInvalid: (value: CSS) => ({
    "[role=group][data-invalid] &": value,
  }),
  _groupChecked: (value: CSS) => ({
    "[role=group][data-checked] &": value,
  }),
  _placeholder: (value: CSS) => ({
    "&::placeholder": value,
  }),
  _fullScreen: (value: CSS) => ({
    "&:fullscreen": value,
  }),
  _selection: (value: CSS) => ({
    "&::selection": value,
  }),
};
