import { SystemStyleObject } from "..";

export type PseudoProps = Partial<{
  _hover: SystemStyleObject;
  _active: SystemStyleObject;
  _focus: SystemStyleObject;
  _highlighted: SystemStyleObject;
  _focusWithin: SystemStyleObject;
  _focusVisible: SystemStyleObject;
  _disabled: SystemStyleObject;
  _readOnly: SystemStyleObject;
  _before: SystemStyleObject;
  _after: SystemStyleObject;
  _empty: SystemStyleObject;
  _expanded: SystemStyleObject;
  _checked: SystemStyleObject;
  _grabbed: SystemStyleObject;
  _pressed: SystemStyleObject;
  _invalid: SystemStyleObject;
  _valid: SystemStyleObject;
  _loading: SystemStyleObject;
  _selected: SystemStyleObject;
  _hidden: SystemStyleObject;
  _autofill: SystemStyleObject;
  _even: SystemStyleObject;
  _odd: SystemStyleObject;
  _first: SystemStyleObject;
  _last: SystemStyleObject;
  _notFirst: SystemStyleObject;
  _notLast: SystemStyleObject;
  _visited: SystemStyleObject;
  _activeLink: SystemStyleObject;
  _activeStep: SystemStyleObject;
  _indeterminate: SystemStyleObject;
  _groupHover: SystemStyleObject;
  _groupFocus: SystemStyleObject;
  _groupActive: SystemStyleObject;
  _groupDisabled: SystemStyleObject;
  _groupInvalid: SystemStyleObject;
  _groupChecked: SystemStyleObject;
  _placeholder: SystemStyleObject;
  _fullScreen: SystemStyleObject;
  _selection: SystemStyleObject;
}>;

export type PseudoPropsKeys = keyof PseudoProps;

/**
 * Array based on the `PseudoProps`.
 * Used to splitProps in SolidJS components
 */
export const pseudoPropsKeys: PseudoPropsKeys[] = [
  "_hover",
  "_active",
  "_focus",
  "_highlighted",
  "_focusWithin",
  "_focusVisible",
  "_disabled",
  "_readOnly",
  "_before",
  "_after",
  "_empty",
  "_expanded",
  "_checked",
  "_grabbed",
  "_pressed",
  "_invalid",
  "_valid",
  "_loading",
  "_selected",
  "_hidden",
  "_autofill",
  "_even",
  "_odd",
  "_first",
  "_last",
  "_notFirst",
  "_notLast",
  "_visited",
  "_activeLink",
  "_activeStep",
  "_indeterminate",
  "_groupHover",
  "_groupFocus",
  "_groupActive",
  "_groupDisabled",
  "_groupInvalid",
  "_groupChecked",
  "_placeholder",
  "_fullScreen",
  "_selection",
];
