/*!
 * Original code by Chakra UI
 * MIT Licensed, Copyright (c) 2019 Segun Adebayo.
 *
 * Credits to the Chakra UI team:
 * https://github.com/chakra-ui/chakra-ui/tree/main/packages/styled-system/src/config
 */

import { ClassProp, OverrideProps } from "@hope-ui/utils";
import type * as Stitches from "@stitches/core";

import { CSSObject } from "../stitches.config";
import { ColorSystemTokenName } from "./color-system";
import {
  ThemeBreakpoint,
  ThemeFontFamily,
  ThemeFontSize,
  ThemeFontWeight,
  ThemeLetterSpacing,
  ThemeLineHeight,
  ThemeRadii,
  ThemeShadow,
  ThemeSize,
  ThemeSpace,
  ThemeZIndice,
} from "./scales";
import { ThemeVarsAndBreakpoints } from "./vars";

/*
export type ResponsiveArray<T> = Array<T | null>;

export type ResponsiveObject<T> = Partial<Record<ThemeBreakpoint | string, T>>;

type ResponsiveValueRaw<T> = T | ResponsiveArray<T> | ResponsiveObject<T>;
*/

export interface SystemStyleColorModeValue<T> {
  light?: T;
  dark?: T;
}

type MaybeColorModeValue<T> = T | SystemStyleColorModeValue<T>;

export type ResponsiveArray<T> = Array<MaybeColorModeValue<T> | null>;

export type ResponsiveObject<T> = Partial<Record<ThemeBreakpoint | string, MaybeColorModeValue<T>>>;
type ResponsiveValueRaw<T> = MaybeColorModeValue<T> | ResponsiveArray<T> | ResponsiveObject<T>;

export type ResponsiveValue<T> =
  | ResponsiveValueRaw<T>
  | ((theme: ThemeVarsAndBreakpoints) => ResponsiveValueRaw<T>);

export type ResponsiveProps<Props> = {
  [K in keyof Props]?: ResponsiveValue<Props[K]>;
};

export type SystemStyleBorderProps = ResponsiveProps<{
  /** The CSS `border` property. */
  border: Stitches.CSS["border"];

  /** The CSS `border-width` property. */
  borderWidth: Stitches.CSS["borderWidth"] | number;

  /** The CSS `border-style` property. */
  borderStyle: Stitches.CSS["borderStyle"];

  /** The CSS `border-color` property. */
  borderColor: Stitches.CSS["borderColor"] | ColorSystemTokenName;

  /** The CSS `border-top` property. */
  borderTop: Stitches.CSS["borderTop"];

  /** The CSS `border-top-width` property. */
  borderTopWidth: Stitches.CSS["borderTopWidth"] | number;

  /** The CSS `border-top-style` property. */
  borderTopStyle: Stitches.CSS["borderTopStyle"];

  /** The CSS `border-top-color` property. */
  borderTopColor: Stitches.CSS["borderTopColor"] | ColorSystemTokenName;

  /** The CSS `border-right` property. */
  borderRight: Stitches.CSS["borderRight"];

  /** The CSS `border-right-width` property. */
  borderRightWidth: Stitches.CSS["borderRightWidth"] | number;

  /** The CSS `border-right-style` property. */
  borderRightStyle: Stitches.CSS["borderRightStyle"];

  /** The CSS `border-right-color` property. */
  borderRightColor: Stitches.CSS["borderRightColor"] | ColorSystemTokenName;

  /** The CSS `border-bottom` property. */
  borderBottom: Stitches.CSS["borderBottom"];

  /** The CSS `border-bottom-width` property. */
  borderBottomWidth: Stitches.CSS["borderBottomWidth"] | number;

  /** The CSS `border-bottom-style` property. */
  borderBottomStyle: Stitches.CSS["borderBottomStyle"];

  /** The CSS `border-bottom-color` property. */
  borderBottomColor: Stitches.CSS["borderBottomColor"] | ColorSystemTokenName;

  /** The CSS `border-left` property. */
  borderLeft: Stitches.CSS["borderLeft"];

  /** The CSS `border-left-width` property. */
  borderLeftWidth: Stitches.CSS["borderLeftWidth"] | number;

  /** The CSS `border-left-style` property. */
  borderLeftStyle: Stitches.CSS["borderLeftStyle"];

  /** The CSS `border-left-color` property. */
  borderLeftColor: Stitches.CSS["borderLeftColor"] | ColorSystemTokenName;

  /** The CSS `border-right` and `border-left` property. */
  borderX: Stitches.CSS["borderLeft"];

  /** The CSS `border-top` and `border-bottom` property. */
  borderY: Stitches.CSS["borderTop"];
}>;

export type SystemStyleColorProps = ResponsiveProps<{
  /** The CSS `color` property. */
  color: Stitches.CSS["color"] | ColorSystemTokenName;

  /** The CSS `background` property. */
  background: Stitches.CSS["background"] | ColorSystemTokenName;

  /** The CSS `background` property. */
  bg: Stitches.CSS["background"] | ColorSystemTokenName;

  /** The CSS `background-color` property. */
  backgroundColor: Stitches.CSS["backgroundColor"] | ColorSystemTokenName;

  /** The CSS `background-color` property. */
  bgColor: Stitches.CSS["backgroundColor"] | ColorSystemTokenName;

  /** The CSS `opacity` property. */
  opacity: Stitches.CSS["opacity"];
}>;

export type SystemStyleFlexboxProps = ResponsiveProps<{
  /**
   * The CSS `align-items` property.
   *
   * It defines the `align-self` value on all direct children as a group.
   *
   * - In Flexbox, it controls the alignment of items on the Cross Axis.
   * - In Grid Layout, it controls the alignment of items on the Block Axis within their grid area.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/align-items)
   */
  alignItems: Stitches.CSS["alignItems"];

  /**
   * The CSS `align-content` property.
   *
   * It defines the distribution of space between and around
   * content items along a flexbox's cross-axis or a grid's block axis.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/align-content)
   */
  alignContent: Stitches.CSS["alignContent"];

  /**
   * The CSS `align-self` property.
   *
   * It works like `align-items`, but applies only to a
   * single flexbox item, instead of all of them.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/align-self)
   */
  alignSelf: Stitches.CSS["alignSelf"];

  /**
   * The CSS `justify-items` property.
   *
   * It defines the default `justify-self` for all items of the box,
   * giving them all a default way of justifying each box
   * along the appropriate axis.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/justify-items)
   */
  justifyItems: Stitches.CSS["justifyItems"];

  /**
   * The CSS `justify-content` property.
   *
   * It defines how the browser distributes space between and around content items
   * along the main-axis of a flex container, and the inline axis of a grid container.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/justify-content)
   */
  justifyContent: Stitches.CSS["justifyContent"];

  /**
   * The CSS `justify-self` property.
   *
   * It defines the way a box is justified inside its
   * alignment container along the appropriate axis.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-flow)
   */
  justifySelf: Stitches.CSS["justifySelf"];

  /**
   * The CSS `flex-wrap` property.
   *
   * It defines whether flex items are forced onto one line or
   * can wrap onto multiple lines. If wrapping is allowed,
   * it sets the direction that lines are stacked.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-wrap)
   */
  flexWrap: Stitches.CSS["flexWrap"];

  /**
   * The CSS `flex-direction` property.
   *
   * It defines how flex items are placed in the flex container
   * defining the main axis and the direction (normal or reversed).
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-direction)
   */
  flexDirection: Stitches.CSS["flexDirection"];

  /**
   * The CSS `flex` property.
   *
   * It defines how a flex item will grow or shrink
   * to fit the space available in its flex container.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex)
   */
  flex: Stitches.CSS["flex"];

  /**
   * The CSS `flex-grow` property.
   *
   * It defines how much a flexbox item should grow
   * if there's space available.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-grow)
   */
  flexGrow: Stitches.CSS["flexGrow"];

  /**
   * The CSS `flex-shrink` property.
   *
   * It defines how much a flexbox item should shrink
   * if there's not enough space available.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-shrink)
   */
  flexShrink: Stitches.CSS["flexShrink"];

  /**
   * The CSS `flex-basis` property.
   *
   * It defines the initial main size of a flex item.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-basis)
   */
  flexBasis: Stitches.CSS["flexBasis"];

  /**
   * The CSS `order` property.
   *
   * It defines the order to lay out an item in a flex or grid container.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/order)
   */
  order: Stitches.CSS["order"];
}>;

export type SystemStyleGridProps = ResponsiveProps<{
  /**
   * The CSS `grid-template` property.
   *
   * It is a shorthand property for defining grid columns, rows, and areas.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template)
   */
  gridTemplate: Stitches.CSS["gridTemplate"];

  /**
   * The CSS `grid-template-columns` property
   *
   * It defines the line names and track sizing functions of the grid columns.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns)
   */
  gridTemplateColumns: Stitches.CSS["gridTemplateColumns"];

  /**
   * The CSS `grid-template-rows` property.
   *
   * It defines the line names and track sizing functions of the grid rows.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows)
   */
  gridTemplateRows: Stitches.CSS["gridTemplateRows"];

  /**
   * The CSS `grid-template-areas` property.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-areas)
   */
  gridTemplateAreas: Stitches.CSS["gridTemplateAreas"];

  /**
   * The CSS `grid-area` property.
   *
   * It specifies a grid item’s size and location within a grid by
   * contributing a line, a span, or nothing (automatic)
   * to its grid placement, thereby specifying the edges of its grid area.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-area)
   */
  gridArea: Stitches.CSS["gridArea"];

  /**
   * The CSS `grid-auto-flow` property
   *
   * It controls how the auto-placement algorithm works,
   * specifying exactly how auto-placed items get flowed into the grid.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-flow)
   */
  gridAutoFlow: Stitches.CSS["gridAutoFlow"];

  /**
   * The CSS `grid-auto-columns` property.
   *
   * It specifies the size of an implicitly-created grid column track or pattern of tracks.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-columns)
   */
  gridAutoColumns: Stitches.CSS["gridAutoColumns"];

  /**
   * The CSS `grid-auto-rows` property.
   *
   * It specifies the size of an implicitly-created grid row track or pattern of tracks.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-rows)
   */
  gridAutoRows: Stitches.CSS["gridAutoRows"];

  /**
   * The CSS `grid-column` property.
   *
   * It specifies a grid item's size and location within a grid column
   * by contributing a line, a span, or nothing (automatic) to its grid placement,
   * thereby specifying the `inline-start` and `inline-end` edge of its grid area.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column)
   */
  gridColumn: Stitches.CSS["gridColumn"];

  /**
   * The CSS `grid-column-start` property.
   *
   * It specifies a grid item’s start position within the grid column by
   * contributing a line, a span, or nothing (automatic) to its grid placement
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-start)
   */
  gridColumnStart: Stitches.CSS["gridColumnStart"];

  /**
   * The CSS `grid-column-end` property
   *
   * It specifies a grid item’s end position within the grid column by
   * contributing a line, a span, or nothing (automatic) to its grid placement,
   * thereby specifying the block-end edge of its grid area.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-end)
   */
  gridColumnEnd: Stitches.CSS["gridColumnEnd"];

  /**
   * The CSS `grid-row` property
   *
   * It specifies a grid item’s size and location within the grid row
   * by contributing a line, a span, or nothing (automatic) to its grid placement,
   * thereby specifying the `inline-start` and `inline-end` edge of its grid area.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row)
   */
  gridRow: Stitches.CSS["gridRow"];

  /**
   * The CSS `grid-row-start` property
   *
   * It specifies a grid item’s start position within the grid row by
   * contributing a line, a span, or nothing (automatic) to its grid placement,
   * thereby specifying the `inline-start` edge of its grid area.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-start)
   */
  gridRowStart: Stitches.CSS["gridRowStart"];

  /**
   * The CSS `grid-row-end` property
   *
   * It specifies a grid item’s end position within the grid row by
   * contributing a line, a span, or nothing (automatic) to its grid placement,
   * thereby specifying the `inline-end` edge of its grid area.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-end)
   */
  gridRowEnd: Stitches.CSS["gridRowEnd"];

  /**
   * The CSS `place-items` property.
   *
   * It allows you to align items along both the block and
   * inline directions at once (i.e. the align-items and justify-items properties)
   * in a relevant layout system such as `Grid` or `Flex`.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/place-items)
   */
  placeItems: Stitches.CSS["placeItems"];

  /**
   * The CSS `place-content` property.
   *
   * It allows you to align content along both the block and
   * inline directions at once (i.e. the align-content and justify-content properties)
   * in a relevant layout system such as Grid or Flexbox.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/place-content)
   */
  placeContent: Stitches.CSS["placeContent"];

  /**
   * The CSS `place-self` property.
   *
   * It allows you to align an individual item in both the block and
   * inline directions at once (i.e. the align-self and justify-self properties)
   * in a relevant layout system such as Grid or Flexbox.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/place-self)
   */
  placeSelf: Stitches.CSS["placeSelf"];

  /**
   * The CSS `gap` property.
   *
   * It defines the gap between items in both flex and
   * grid contexts.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/gap)
   */
  gap: Stitches.CSS["gap"] | ThemeSpace | number;

  /**
   * The CSS `row-gap` property.
   *
   * It sets the size of the gap (gutter) between an element's grid rows.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/row-gap)
   */
  rowGap: Stitches.CSS["rowGap"] | ThemeSpace | number;

  /**
   * The CSS `column-gap` property.
   *
   * It sets the size of the gap (gutter) between an element's columns.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/column-gap)
   */
  columnGap: Stitches.CSS["columnGap"] | ThemeSpace | number;
}>;

export type SystemStyleLayoutProps = ResponsiveProps<{
  /** The CSS `display` property. */
  display: Stitches.CSS["display"];

  /** The CSS `display` property. */
  d: Stitches.CSS["display"];

  /** The CSS `vertical-align` property. */
  verticalAlign: Stitches.CSS["verticalAlign"];

  /** The CSS `overflow` property. */
  overflow: Stitches.CSS["overflow"];

  /** The CSS `overflow-x` property. */
  overflowX: Stitches.CSS["overflowX"];

  /** The CSS `overflow-y` property. */
  overflowY: Stitches.CSS["overflowY"];
}>;

export type SystemStyleInteractivityProps = ResponsiveProps<{
  /** The CSS `appearance` property. */
  appearance: Stitches.CSS["appearance"];

  /** The CSS `user-select` property. */
  userSelect: Stitches.CSS["userSelect"];

  /** The CSS `pointer-events` property. */
  pointerEvents: Stitches.CSS["pointerEvents"];

  /** The CSS `resize` property. */
  resize: Stitches.CSS["resize"];

  /** The CSS `cursor` property. */
  cursor: Stitches.CSS["cursor"];

  /** The CSS `outline` property. */
  outline: Stitches.CSS["outline"];

  /** The CSS `outline-offset` property. */
  outlineOffset: Stitches.CSS["outlineOffset"];

  /** The CSS `outline-color` property. */
  outlineColor: Stitches.CSS["outlineColor"] | ColorSystemTokenName;
}>;

export type SystemStyleMarginProps = ResponsiveProps<{
  /** The CSS `margin` property. */
  margin: Stitches.CSS["margin"] | ThemeSpace | number;

  /** The CSS `margin-top` property. */
  marginTop: Stitches.CSS["marginTop"] | ThemeSpace | number;

  /** The CSS `margin-right` property. */
  marginRight: Stitches.CSS["marginRight"] | ThemeSpace | number;

  /** The CSS `margin-inline-end` property. */
  marginEnd: Stitches.CSS["marginInlineEnd"] | ThemeSpace | number;

  /** The CSS `margin-bottom` property. */
  marginBottom: Stitches.CSS["marginBottom"] | ThemeSpace | number;

  /** The CSS `margin-left`  property. */
  marginLeft: Stitches.CSS["marginLeft"] | ThemeSpace | number;

  /** The CSS `margin-inline-start` property. */
  marginStart: Stitches.CSS["marginInlineStart"] | ThemeSpace | number;

  /** The CSS `margin` property. */
  m: Stitches.CSS["margin"] | ThemeSpace | number;

  /** The CSS `margin-top` property. */
  mt: Stitches.CSS["marginTop"] | ThemeSpace | number;

  /** The CSS `margin-right` property. */
  mr: Stitches.CSS["marginRight"] | ThemeSpace | number;

  /** The CSS `margin-inline-end` property. */
  me: Stitches.CSS["marginInlineEnd"] | ThemeSpace | number;

  /** The CSS `margin-bottom` property. */
  mb: Stitches.CSS["marginBottom"] | ThemeSpace | number;

  /** The CSS `margin-left`  property. */
  ml: Stitches.CSS["marginLeft"] | ThemeSpace | number;

  /** The CSS `margin-inline-start` property. */
  ms: Stitches.CSS["marginInlineStart"] | ThemeSpace | number;

  /** The CSS `margin-inline-start` and `margin-inline-end` property. */
  mx: Stitches.CSS["marginInlineStart"] | ThemeSpace | number;

  /** The CSS `margin-top` and `margin-bottom` property. */
  my: Stitches.CSS["marginTop"] | ThemeSpace | number;
}>;

export type SystemStylePaddingProps = ResponsiveProps<{
  /** The CSS `padding` property. */
  padding: Stitches.CSS["padding"] | ThemeSpace | number;

  /** The CSS `padding-top` property. */
  paddingTop: Stitches.CSS["paddingTop"] | ThemeSpace | number;

  /** The CSS `padding-right` property. */
  paddingRight: Stitches.CSS["paddingRight"] | ThemeSpace | number;

  /** The CSS `padding-inline-end` property. */
  paddingEnd: Stitches.CSS["paddingInlineEnd"] | ThemeSpace | number;

  /** The CSS `padding-bottom` property. */
  paddingBottom: Stitches.CSS["paddingBottom"] | ThemeSpace | number;

  /** The CSS `padding-left`  property. */
  paddingLeft: Stitches.CSS["paddingLeft"] | ThemeSpace | number;

  /** The CSS `padding-inline-start` property. */
  paddingStart: Stitches.CSS["paddingInlineStart"] | ThemeSpace | number;

  /** The CSS `padding` property. */
  p: Stitches.CSS["padding"] | ThemeSpace | number;

  /** The CSS `padding-top` property. */
  pt: Stitches.CSS["paddingTop"] | ThemeSpace | number;

  /** The CSS `padding-right` property. */
  pr: Stitches.CSS["paddingRight"] | ThemeSpace | number;

  /** The CSS `padding-inline-end` property. */
  pe: Stitches.CSS["paddingInlineEnd"] | ThemeSpace | number;

  /** The CSS `padding-bottom` property. */
  pb: Stitches.CSS["paddingBottom"] | ThemeSpace | number;

  /** The CSS `padding-left`  property. */
  pl: Stitches.CSS["paddingLeft"] | ThemeSpace | number;

  /** The CSS `padding-inline-start` property. */
  ps: Stitches.CSS["paddingInlineStart"] | ThemeSpace | number;

  /** The CSS `padding-inline-start` and `padding-inline-end` property. */
  px: Stitches.CSS["paddingInlineStart"] | ThemeSpace | number;

  /** The CSS `padding-top` and `padding-bottom` property. */
  py: Stitches.CSS["paddingTop"] | ThemeSpace | number;
}>;

export type SystemStylePositionProps = ResponsiveProps<{
  /** The CSS `position` property. */
  position: Stitches.CSS["position"];

  /** The CSS `position` property. */
  pos: Stitches.CSS["position"];

  /** The CSS `z-index` property. */
  zIndex: Stitches.CSS["zIndex"] | ThemeZIndice;

  /** The CSS `top` property. */
  top: Stitches.CSS["top"] | ThemeSpace | number;

  /** The CSS `right` property. */
  right: Stitches.CSS["right"] | ThemeSpace | number;

  /** The CSS `bottom` property. */
  bottom: Stitches.CSS["bottom"] | ThemeSpace | number;

  /** The CSS `left` property. */
  left: Stitches.CSS["left"] | ThemeSpace | number;
}>;

export type SystemStyleRadiiProps = ResponsiveProps<{
  /** The CSS `border-radius` property. */
  borderRadius: Stitches.CSS["borderRadius"] | ThemeRadii | number;

  /** The CSS `border-top-left-radius` property. */
  borderTopLeftRadius: Stitches.CSS["borderTopLeftRadius"] | ThemeRadii | number;

  /** The CSS `border-top-right-radius` property. */
  borderTopRightRadius: Stitches.CSS["borderTopRightRadius"] | ThemeRadii | number;

  /** The CSS `border-bottom-right-radius`  property. */
  borderBottomRightRadius: Stitches.CSS["borderBottomRightRadius"] | ThemeRadii | number;

  /** The CSS  `border-bottom-left-radius` property. */
  borderBottomLeftRadius: Stitches.CSS["borderBottomLeftRadius"] | ThemeRadii | number;

  /** The CSS `border-top-left-radius` and `border-top-right-radius` property. */
  borderTopRadius: Stitches.CSS["borderTopLeftRadius"] | ThemeRadii | number;

  /** The CSS `border-top-right-radius` and `border-bottom-right-radius` property. */
  borderRightRadius: Stitches.CSS["borderTopRightRadius"] | ThemeRadii | number;

  /** The CSS `border-bottom-right-radius` and `border-bottom-left-radius` property. */
  borderBottomRadius: Stitches.CSS["borderBottomLeftRadius"] | ThemeRadii | number;

  /** The CSS `border-top-left-radius` and `border-bottom-left-radius` property. */
  borderLeftRadius: Stitches.CSS["borderTopLeftRadius"] | ThemeRadii | number;

  /** The CSS `border-radius` property. */
  rounded: Stitches.CSS["borderRadius"] | ThemeRadii | number;

  /** The CSS `border-top-left-radius` and `border-top-right-radius` property. */
  roundedTop: Stitches.CSS["borderTopLeftRadius"] | ThemeRadii | number;

  /** The CSS `border-top-right-radius` and `border-bottom-right-radius` property. */
  roundedRight: Stitches.CSS["borderTopRightRadius"] | ThemeRadii | number;

  /** The CSS `border-bottom-right-radius` and `border-bottom-left-radius` property. */
  roundedBottom: Stitches.CSS["borderBottomLeftRadius"] | ThemeRadii | number;

  /** The CSS `border-top-left-radius` and `border-bottom-left-radius` property. */
  roundedLeft: Stitches.CSS["borderTopLeftRadius"] | ThemeRadii | number;
}>;

export type SystemStyleShadowProps = ResponsiveProps<{
  /** The CSS `text-shadow` property. */
  textShadow: Stitches.CSS["textShadow"] | ThemeShadow;

  /** The CSS `box-shadow` property. */
  boxShadow: Stitches.CSS["boxShadow"] | ThemeShadow;

  /** The CSS `box-shadow` property. */
  shadow: Stitches.CSS["boxShadow"] | ThemeShadow;
}>;

export type SystemStyleSizeProps = ResponsiveProps<{
  /** The CSS `width` property. */
  width: Stitches.CSS["width"] | ThemeSize | number;

  /** The CSS `min-width` property. */
  minWidth: Stitches.CSS["minWidth"] | ThemeSize | number;

  /** The CSS `max-width` property. */
  maxWidth: Stitches.CSS["maxWidth"] | ThemeSize | number;

  /** The CSS `height` property. */
  height: Stitches.CSS["height"] | ThemeSize | number;

  /** The CSS `min-height` property. */
  minHeight: Stitches.CSS["minHeight"] | ThemeSize | number;

  /** The CSS `max-height` property. */
  maxHeight: Stitches.CSS["maxHeight"] | ThemeSize | number;

  /** The CSS `width` property. */
  w: Stitches.CSS["width"] | ThemeSize | number;

  /** The CSS `min-width` property. */
  minW: Stitches.CSS["minWidth"] | ThemeSize | number;

  /** The CSS `max-width` property. */
  maxW: Stitches.CSS["maxWidth"] | ThemeSize | number;

  /** The CSS `height` property. */
  h: Stitches.CSS["height"] | ThemeSize | number;

  /** The CSS `min-height` property. */
  minH: Stitches.CSS["minHeight"] | ThemeSize | number;

  /** The CSS `max-height` property. */
  maxH: Stitches.CSS["maxHeight"] | ThemeSize | number;

  /** The CSS `width` and `height` property. */
  boxSize: Stitches.CSS["width"] | ThemeSize | number;
}>;

export type SystemStyleTypographyProps = ResponsiveProps<{
  /** The CSS `font-family` property. */
  fontFamily: Stitches.CSS["fontFamily"] | ThemeFontFamily;

  /** The CSS `font-size` property. */
  fontSize: Stitches.CSS["fontSize"] | ThemeFontSize | number;

  /** The CSS `font-weight` property. */
  fontWeight: Stitches.CSS["fontWeight"] | ThemeFontWeight | number;

  /** The CSS `line-height` property. */
  lineHeight: Stitches.CSS["lineHeight"] | ThemeLineHeight | number;

  /** The CSS `letter-spacing` property. */
  letterSpacing: Stitches.CSS["letterSpacing"] | ThemeLetterSpacing | number;

  /** The CSS `text-align` property. */
  textAlign: Stitches.CSS["textAlign"];

  /** The CSS `font-style` property. */
  fontStyle: Stitches.CSS["fontStyle"];

  /** The CSS `text-transform` property. */
  textTransform: Stitches.CSS["textTransform"];

  /** The CSS `text-decoration` property. */
  textDecoration: Stitches.CSS["textDecoration"];
}>;

export type SystemStyleTransformProps = ResponsiveProps<{
  /** The CSS `transform` property. */
  transform: Stitches.CSS["transform"];

  /** The CSS `transform-origin` property. */
  transformOrigin: Stitches.CSS["transformOrigin"] | ThemeSize | number;

  /** The CSS `clip-path` property. */
  clipPath: Stitches.CSS["clipPath"];
}>;

export type SystemStyleTransitionProps = ResponsiveProps<{
  /** The CSS `transition` property. */
  transition: Stitches.CSS["transition"];

  /** The CSS `transition-property` property. */
  transitionProperty: Stitches.CSS["transitionProperty"];

  /** The CSS `transition-timing-function` property. */
  transitionTimingFunction: Stitches.CSS["transitionTimingFunction"];

  /** The CSS `transition-duration` property. */
  transitionDuration: Stitches.CSS["transitionDuration"];

  /** The CSS `transition-delay` property. */
  transitionDelay: Stitches.CSS["transitionDelay"];

  /** The CSS `animation` property. */
  animation: Stitches.CSS["animation"];

  /** The CSS `will-change` property. */
  willChange: Stitches.CSS["willChange"];
}>;

export type SystemStyleOthersProps = ResponsiveProps<{
  /** The CSS `object-fit` property. */
  objectFit?: Stitches.CSS["objectFit"];

  /** The CSS `object-position` property. */
  objectPosition?: Stitches.CSS["objectPosition"];
}>;

export type BaseSystemStyleProps = SystemStyleBorderProps &
  SystemStyleColorProps &
  SystemStyleFlexboxProps &
  SystemStyleGridProps &
  SystemStyleInteractivityProps &
  SystemStyleLayoutProps &
  SystemStyleMarginProps &
  SystemStylePaddingProps &
  SystemStylePositionProps &
  SystemStyleRadiiProps &
  SystemStyleShadowProps &
  SystemStyleSizeProps &
  SystemStyleTransformProps &
  SystemStyleTransitionProps &
  SystemStyleTypographyProps &
  SystemStyleOthersProps;

export type BaseSystemStyleObject = OverrideProps<CSSObject, BaseSystemStyleProps>;

export type PseudoSelectorValue =
  | BaseSystemStyleObject
  | ((theme: ThemeVarsAndBreakpoints) => BaseSystemStyleObject);

export type PseudoSelectorProps = Partial<{
  /** Styles for CSS selector `&:hover`. */
  _hover: PseudoSelectorValue;

  /** Styles for CSS Selector `&:active`. */
  _active: PseudoSelectorValue;

  /** Styles for CSS selector `&:focus. */
  _focus: PseudoSelectorValue;

  /** Styles for the highlighted state. */
  _highlighted: PseudoSelectorValue;

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

  /** Styles for CSS Selector `&:readonly`. */
  _readOnly: PseudoSelectorValue;

  /**
   * Styles for CSS selector `&::before`
   *
   * NOTE:When using this, ensure the `content` is wrapped in a backtick.
   * @example
   * ```jsx
   * <Box _before={{content:`""` }}/>
   * ```
   */
  _before: PseudoSelectorValue;

  /**
   * Styles for CSS selector `&::after`
   *
   * NOTE:When using this, ensure the `content` is wrapped in a backtick.
   * @example
   * ```jsx
   * <Box _after={{content:`""` }}/>
   * ```
   */
  _after: PseudoSelectorValue;

  /** Styles for CSS selector `&:empty`. */
  _empty: PseudoSelectorValue;

  /**
   * Styles to apply when the ARIA attribute `aria-expanded` is `true`
   * - CSS selector `&[aria-expanded=true]`
   */
  _expanded: PseudoSelectorValue;

  /**
   * Styles to apply when the ARIA attribute `aria-checked` is `true`
   * - CSS selector `&[aria-checked=true]`
   */
  _checked: PseudoSelectorValue;

  /**
   * Styles to apply when the ARIA attribute `aria-grabbed` is `true`
   * - CSS selector `&[aria-grabbed=true]`
   */
  _grabbed: PseudoSelectorValue;

  /**
   * Styles for CSS Selector `&[aria-pressed=true]`
   * Typically used to style the current "pressed" state of toggle buttons
   */
  _pressed: PseudoSelectorValue;

  /**
   * Styles to apply when the ARIA attribute `aria-invalid` is `true`
   * - CSS selector `&[aria-invalid=true]`
   */
  _invalid: PseudoSelectorValue;

  /**
   * Styles for the valid state
   * - CSS selector `&[data-valid], &[data-state=valid]`
   */
  _valid: PseudoSelectorValue;

  /**
   * Styles for CSS Selector `&[aria-busy=true]` or `&[data-loading=true]`.
   * Useful for styling loading states
   */
  _loading: PseudoSelectorValue;

  /**
   * Styles to apply when the ARIA attribute `aria-selected` is `true`
   *
   * - CSS selector `&[aria-selected=true]`
   */
  _selected: PseudoSelectorValue;

  /** Styles for CSS Selector `[hidden=true]`. */
  _hidden: PseudoSelectorValue;

  /** Styles for CSS Selector `&:-webkit-autofill`. */
  _autofill: PseudoSelectorValue;

  /** Styles for CSS Selector `&:nth-child(even)`. */
  _even: PseudoSelectorValue;

  /** Styles for CSS Selector `&:nth-child(odd)`. */
  _odd: PseudoSelectorValue;

  /** Styles for CSS Selector `&:first-child`. */
  _first: PseudoSelectorValue;

  /** Styles for CSS Selector `&:last-child`. */
  _last: PseudoSelectorValue;

  /** Styles for CSS Selector `&:not(:first-child)`. */
  _notFirst: PseudoSelectorValue;

  /** Styles for CSS Selector `&:not(:last-child)`. */
  _notLast: PseudoSelectorValue;

  /** Styles for CSS Selector `&:visited`. */
  _visited: PseudoSelectorValue;

  /**
   * Used to style the active link in a navigation
   * Styles for CSS Selector `&[aria-current=page]`
   */
  _activeLink: PseudoSelectorValue;

  /**
   * Used to style the current step within a process
   * Styles for CSS Selector `&[aria-current=step]`
   */
  _activeStep: PseudoSelectorValue;

  /**
   * Styles to apply when the ARIA attribute `aria-checked` is `mixed`
   * - CSS selector `&[aria-checked=mixed]`
   */
  _indeterminate: PseudoSelectorValue;

  /** Styles to apply when a parent element with `.group`, `data-group` or `role=group` is hovered. */
  _groupHover: PseudoSelectorValue;

  /** Styles to apply when a sibling element with `.peer` or `data-peer` is hovered. */
  _peerHover: PseudoSelectorValue;

  /** Styles to apply when a parent element with `.group`, `data-group` or `role=group` is focused. */
  _groupFocus: PseudoSelectorValue;

  /** Styles to apply when a sibling element with `.peer` or `data-peer` is focused. */
  _peerFocus: PseudoSelectorValue;

  /** Styles to apply when a parent element with `.group`, `data-group` or `role=group` has visible focus. */
  _groupFocusVisible: PseudoSelectorValue;

  /** Styles to apply when a sibling element with `.peer`or `data-peer` has visible focus. */
  _peerFocusVisible: PseudoSelectorValue;

  /** Styles to apply when a parent element with `.group`, `data-group` or `role=group` is active. */
  _groupActive: PseudoSelectorValue;

  /** Styles to apply when a sibling element with `.peer` or `data-peer` is active. */
  _peerActive: PseudoSelectorValue;

  /** Styles to apply when a parent element with `.group`, `data-group` or `role=group` is disabled. */
  _groupDisabled: PseudoSelectorValue;

  /** Styles to apply when a sibling element with `.peer` or `data-peer` is disabled. */
  _peerDisabled: PseudoSelectorValue;

  /** Styles to apply when a parent element with `.group`, `data-group` or `role=group` is invalid. */
  _groupInvalid: PseudoSelectorValue;

  /** Styles to apply when a sibling element with `.peer` or `data-peer` is invalid. */
  _peerInvalid: PseudoSelectorValue;

  /** Styles to apply when a parent element with `.group`, `data-group` or `role=group` is checked. */
  _groupChecked: PseudoSelectorValue;

  /** Styles to apply when a sibling element with `.peer` or `data-peer` is checked. */
  _peerChecked: PseudoSelectorValue;

  /** Styles to apply when a parent element with `.group`, `data-group` or `role=group` has focus within. */
  _groupFocusWithin: PseudoSelectorValue;

  /** Styles to apply when a sibling element with `.peer` or `data-peer` has focus within. */
  _peerFocusWithin: PseudoSelectorValue;

  /** Styles to apply when a sibling element with `.peer` or `data-peer` has placeholder shown. */
  _peerPlaceholderShown: PseudoSelectorValue;

  /** Styles for CSS Selector `&::placeholder`.. */
  _placeholder: PseudoSelectorValue;

  /** Styles for CSS Selector `&:placeholder-shown`.. */
  _placeholderShown: PseudoSelectorValue;

  /** Styles for CSS Selector `&:fullscreen`.. */
  _fullScreen: PseudoSelectorValue;

  /** Styles for CSS Selector `&::selection`. */
  _selection: PseudoSelectorValue;

  /**
   * Styles for CSS Selector `[dir=rtl] &`
   * It is applied when a parent element or this element has `dir="rtl"`
   */
  _rtl: PseudoSelectorValue;

  /**
   * Styles for CSS Selector `[dir=ltr] &`
   * It is applied when a parent element or this element has `dir="ltr"`
   */
  _ltr: PseudoSelectorValue;

  /**
   * Styles for CSS Selector `@media (prefers-color-scheme: dark)`
   * It is used when the user has requested the system use a light or dark color theme.
   */
  _mediaDark: PseudoSelectorValue;

  /**
   * Styles for CSS Selector `@media (prefers-reduced-motion: reduce)`
   * It is used when the user has requested the system to reduce the amount of animations.
   */
  _mediaReduceMotion: PseudoSelectorValue;

  /** Styles for when light theme is applied to any parent of this component or element. */
  _light: PseudoSelectorValue;

  /** Styles for when dark theme is applied to any parent of this component or element. */
  _dark: PseudoSelectorValue;
}>;

export type SystemStyleProps = BaseSystemStyleProps & PseudoSelectorProps;

export type SystemStyleObject = OverrideProps<CSSObject, SystemStyleProps>;

export type Sx = SystemStyleObject | ((theme: ThemeVarsAndBreakpoints) => SystemStyleObject);

export interface SxProp {
  /**
   * The `sx` prop is a shortcut for defining custom style that has access to the theme.
   * The property is a superset of CSS that packages all the style props that are exposed by Hope UI.
   * You can specify any valid CSS using this prop.
   */
  sx?: Sx | Array<Sx | undefined>;
}

/** Hope UI specific props. */
export interface HopeProps extends SystemStyleProps, SxProp, ClassProp {
  /**
   * The `__css` prop has the same API as the `sx` prop, but with a lower style priority.
   * Use it to apply base styles that can be overridden by `sx` and `system style` props.
   */
  __css?: SystemStyleObject;
}
