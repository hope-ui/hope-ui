/*!
 * Original code by Chakra UI
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/blob/main/packages/styled-system/src/pseudos.ts
 */

import { AnyFunction } from "@hope-ui/utils";

import { CSSObject } from "../stitches.config";
import { BaseSystemStyleProps, PseudoSelectorProps } from "../types";
import { COLOR_MODE_CLASSNAMES } from "../utils";

const state = {
  hover: (str: string, post: string) => `${str}:hover ${post}, ${str}[data-hover] ${post}`,
  focus: (str: string, post: string) => `${str}:focus ${post}, ${str}[data-focus] ${post}`,
  focusWithin: (str: string, post: string) => `${str}:focus-within ${post}`,
  focusVisible: (str: string, post: string) => `${str}:focus-visible ${post}`,
  active: (str: string, post: string) => `${str}:active ${post}, ${str}[data-active] ${post}`,
  disabled: (str: string, post: string) => `${str}:disabled ${post}, ${str}[data-disabled] ${post}`,
  invalid: (str: string, post: string) => `${str}:invalid ${post}, ${str}[data-invalid] ${post}`,
};

function toGroup(fn: AnyFunction) {
  return merge(v => fn(v, "&"), "[role=group]", "[data-group]", ".group");
}

function toPeer(fn: AnyFunction) {
  return merge(v => fn(v, "~ &"), "[data-peer]", ".peer");
}

function merge(fn: AnyFunction, ...selectors: string[]) {
  return selectors.map(fn).join(", ");
}

// TODO: use tailwind pseudo https://tailwindcss.com/docs/hover-focus-and-other-states#quick-reference
/** Map system style pseudo props to css pseudo selectors. */
export const PSEUDO_SELECTORS_MAP: Record<keyof PseudoSelectorProps, string> = {
  _hover: "&:hover, &[data-hover]",
  _focus: "&:focus, &[data-focus]",
  _focusWithin: "&:focus-within",
  _focusVisible: "&:focus-visible, &[data-focus-visible]",
  _active: "&:active, &[data-active]",
  _disabled: "&[disabled], &[aria-disabled=true], &[data-disabled]",
  _invalid: "&[aria-invalid=true], &[data-invalid]",
  _first: "&:first-child",
  _last: "&:last-child",
  _odd: "&:nth-of-type(odd)",
  _even: "&:nth-of-type(even)",
  _before: "&::before",
  _after: "&::after",
  _groupHover: toGroup(state.hover),
  _groupFocus: toGroup(state.focus),
  _groupFocusWithin: toGroup(state.focusWithin),
  _groupFocusVisible: toGroup(state.focusVisible),
  _groupActive: toGroup(state.active),
  _groupDisabled: toGroup(state.disabled),
  _groupInvalid: toGroup(state.invalid),
  _peerHover: toPeer(state.hover),
  _peerFocus: toPeer(state.focus),
  _peerFocusWithin: toPeer(state.focusWithin),
  _peerFocusVisible: toPeer(state.focusVisible),
  _peerActive: toPeer(state.active),
  _peerDisabled: toPeer(state.disabled),
  _peerInvalid: toPeer(state.invalid),
  _light: `.${COLOR_MODE_CLASSNAMES.light} &:not([data-theme]), [data-theme=light] &:not([data-theme]), &[data-theme=light]`,
  _dark: `.${COLOR_MODE_CLASSNAMES.dark} &:not([data-theme]), [data-theme=dark] &:not([data-theme]), &[data-theme=dark]`,
};

/** Map system style shorthands props to css properties. */
export const SHORTHANDS_MAP: Partial<Record<keyof BaseSystemStyleProps, Array<keyof CSSObject>>> = {
  // border
  borderX: ["borderRight", "borderLeft"],
  borderY: ["borderTop", "borderBottom"],

  // color
  bg: ["background"],
  bgColor: ["backgroundColor"],

  // layout
  d: ["display"],

  // margin
  m: ["margin"],
  mt: ["marginTop"],
  mr: ["marginRight"],
  mb: ["marginBottom"],
  ml: ["marginLeft"],
  mx: ["marginInlineStart", "marginInlineEnd"],
  my: ["marginTop", "marginBottom"],

  // padding
  p: ["padding"],
  pt: ["paddingTop"],
  pr: ["paddingRight"],
  pb: ["paddingBottom"],
  pl: ["paddingLeft"],
  px: ["paddingInlineStart", "paddingInlineEnd"],
  py: ["paddingTop", "paddingBottom"],

  // radii
  borderTopRadius: ["borderTopLeftRadius", "borderTopRightRadius"],
  borderRightRadius: ["borderTopRightRadius", "borderBottomRightRadius"],
  borderBottomRadius: ["borderBottomRightRadius", "borderBottomLeftRadius"],
  borderLeftRadius: ["borderTopLeftRadius", "borderBottomLeftRadius"],
  rounded: ["borderRadius"],
  roundedTop: ["borderTopLeftRadius", "borderTopRightRadius"],
  roundedRight: ["borderTopRightRadius", "borderBottomRightRadius"],
  roundedBottom: ["borderBottomRightRadius", "borderBottomLeftRadius"],
  roundedLeft: ["borderTopLeftRadius", "borderBottomLeftRadius"],

  // shadow
  shadow: ["boxShadow"],

  // size
  w: ["width"],
  minW: ["minWidth"],
  maxW: ["maxWidth"],
  h: ["height"],
  minH: ["minHeight"],
  maxH: ["maxHeight"],
  boxSize: ["width", "height"],
};
