import { Property } from "csstype";

import {
  ColorTokens,
  RadiiTokens,
  ShadowTokens,
  SizeTokens,
  SpaceTokens,
  SystemStyleObject,
} from "../types";

/**
 * Utility props for setting component display
 */
export type DisplayProps = {
  /**
   * The CSS `display` property
   */
  display?: Property.Display;
};

/**
 * Utility props for setting component color and background color
 */
export type ColorProps = {
  /**
   * The CSS `color` property
   */
  color?: Property.Background<ColorTokens>;

  /**
   * The CSS `background` property
   */
  bg?: Property.Background<ColorTokens>;
};

/**
 * Utility props for setting component margin
 */
export type MarginProps = {
  /**
   * Margin on top, left, bottom and right
   */
  m?: Property.Margin<SpaceTokens> | number;

  /**
   * Margin on left and right
   */
  mx?: Property.MarginInlineStart<SpaceTokens> | number;

  /**
   * Margin on top and bottom
   */
  my?: Property.MarginTop<SpaceTokens> | number;

  /**
   * Margin on top
   */
  mt?: Property.MarginTop<SpaceTokens> | number;

  /**
   * Margin on right
   */
  mr?: Property.MarginRight<SpaceTokens> | number;

  /**
   * Margin on bottom
   */
  mb?: Property.MarginBottom<SpaceTokens> | number;

  /**
   * Margin on left
   */
  ml?: Property.MarginLeft<SpaceTokens> | number;
};

/**
 * Utility props for setting component padding
 */
export type PaddingProps = {
  /**
   * Padding on top, left, bottom and right
   */
  p?: Property.Padding<SpaceTokens> | number;

  /**
   * Padding on left and right
   */
  px?: Property.PaddingInlineStart<SpaceTokens> | number;

  /**
   * Padding on top and bottom
   */
  py?: Property.PaddingTop<SpaceTokens> | number;

  /**
   * Padding on top
   */
  pt?: Property.PaddingTop<SpaceTokens> | number;

  /**
   * Padding on right
   */
  pr?: Property.PaddingRight<SpaceTokens> | number;

  /**
   * Padding on bottom
   */
  pb?: Property.PaddingBottom<SpaceTokens> | number;

  /**
   * Padding on left
   */
  pl?: Property.PaddingLeft<SpaceTokens> | number;
};

/**
 * Utility props for setting component border radius
 */
export type BorderRadiusProps = {
  /**
   * The CSS `border-radius` property
   */
  borderRadius?: Property.BorderRadius<RadiiTokens> | number;
};

/**
 * Utility props for setting component box shadow
 */
export type ShadowProps = {
  /**
   * The CSS `box-shadow` property
   */
  boxShadow?: Property.BoxShadow | ShadowTokens;
};

/**
 * Utility props for setting component width and height
 */
export type SizeProps = {
  /**
   * The CSS `width` property
   */
  w?: Property.Width<SizeTokens> | number;

  /**
   * The CSS `min-width` property
   */
  minW?: Property.MinWidth<SizeTokens> | number;

  /**
   * The CSS `max-width` property
   */
  maxW?: Property.MaxWidth<SizeTokens> | number;

  /**
   * The CSS `height` property
   */
  h?: Property.Height<SizeTokens> | number;

  /**
   * The CSS `min-height` property
   */
  minH?: Property.MinHeight<SizeTokens> | number;

  /**
   * The CSS `max-height` property
   */
  maxH?: Property.MaxHeight<SizeTokens> | number;

  /**
   * The CSS `width` and `height` property
   */
  boxSize?: Property.Width<SizeTokens> | number;
};

/**
 * Utility props for flexbox based components
 */
export type FlexboxProps = {
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
  alignItems?: Property.AlignItems;

  /**
   * The CSS `align-content` property.
   *
   * It defines the distribution of space between and around
   * content items along a flexbox's cross-axis or a grid's block axis.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/align-content)
   */
  alignContent?: Property.AlignContent;

  /**
   * The CSS `justify-items` property.
   *
   * It defines the default `justify-self` for all items of the box,
   * giving them all a default way of justifying each box
   * along the appropriate axis.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/justify-items)
   */
  justifyItems?: Property.JustifyItems;

  /**
   * The CSS `justify-content` property.
   *
   * It defines how the browser distributes space between and around content items
   * along the main-axis of a flex container, and the inline axis of a grid container.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/justify-content)
   */
  justifyContent?: Property.JustifyContent;

  /**
   * The CSS `flex-wrap` property.
   *
   * It defines whether flex items are forced onto one line or
   * can wrap onto multiple lines. If wrapping is allowed,
   * it sets the direction that lines are stacked.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-wrap)
   */
  flexWrap?: Property.FlexWrap;

  /**
   * The CSS `flex-direction` property.
   *
   * It defines how flex items are placed in the flex container
   * defining the main axis and the direction (normal or reversed).
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-direction)
   */
  flexDirection?: Property.FlexDirection;

  /**
   * The CSS `flex` property.
   *
   * It defines how a flex item will grow or shrink
   * to fit the space available in its flex container.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex)
   */
  flex?: Property.Flex;

  /**
   * The CSS `flex-grow` property.
   *
   * It defines how much a flexbox item should grow
   * if there's space available.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-grow)
   */
  flexGrow?: Property.FlexGrow;

  /**
   * The CSS `flex-shrink` property.
   *
   * It defines how much a flexbox item should shrink
   * if there's not enough space available.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-shrink)
   */
  flexShrink?: Property.FlexShrink;

  /**
   * The CSS `flex-basis` property.
   *
   * It defines the initial main size of a flex item.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-basis)
   */
  flexBasis?: Property.FlexBasis;

  /**
   * The CSS `justify-self` property.
   *
   * It defines the way a box is justified inside its
   * alignment container along the appropriate axis.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-flow)
   */
  justifySelf?: Property.JustifySelf;

  /**
   * The CSS `align-self` property.
   *
   * It works like `align-items`, but applies only to a
   * single flexbox item, instead of all of them.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/align-self)
   */
  alignSelf?: Property.AlignSelf;

  /**
   * The CSS `order` property.
   *
   * It defines the order to lay out an item in a flex or grid container.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/order)
   */
  order?: Property.Order;
};

/**
 * Utility props for CSS grid based components
 */
export type GridProps = {
  /**
   * The CSS `grid-column` property.
   *
   * It specifies a grid item’s start position within the grid column by
   * contributing a line, a span, or nothing (automatic) to its grid placement
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-start)
   */
  gridColumnStart?: Property.GridColumnStart;

  /**
   * The CSS `grid-row-start` property
   *
   * It specifies a grid item’s start position within the grid row by
   * contributing a line, a span, or nothing (automatic) to its grid placement,
   * thereby specifying the `inline-start` edge of its grid area.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-start)
   */
  gridRowStart?: Property.GridRowStart;

  /**
   * The CSS `grid-row-end` property
   *
   * It specifies a grid item’s end position within the grid row by
   * contributing a line, a span, or nothing (automatic) to its grid placement,
   * thereby specifying the `inline-end` edge of its grid area.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-end)
   */
  gridRowEnd?: Property.GridRowEnd;

  /**
   * The CSS `grid-template` property.
   *
   * It is a shorthand property for defining grid columns, rows, and areas.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template)
   */
  gridTemplate?: Property.GridTemplate;

  /**
   * The CSS `grid-column` property
   *
   * It specifies a grid item’s end position within the grid column by
   * contributing a line, a span, or nothing (automatic) to its grid placement,
   * thereby specifying the block-end edge of its grid area.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-end)
   */
  gridColumnEnd?: Property.GridColumnEnd;

  /**
   * The CSS `grid-column` property.
   *
   * It specifies a grid item's size and location within a grid column
   * by contributing a line, a span, or nothing (automatic) to its grid placement,
   * thereby specifying the `inline-start` and `inline-end` edge of its grid area.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column)
   */
  gridColumn?: Property.GridColumn;

  /**
   * The CSS `grid-row` property
   *
   * It specifies a grid item’s size and location within the grid row
   * by contributing a line, a span, or nothing (automatic) to its grid placement,
   * thereby specifying the `inline-start` and `inline-end` edge of its grid area.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row)
   */
  gridRow?: Property.GridRow;

  /**
   * The CSS `grid-auto-flow` property
   *
   * It controls how the auto-placement algorithm works,
   * specifying exactly how auto-placed items get flowed into the grid.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-flow)
   */
  gridAutoFlow?: Property.GridAutoFlow;

  /**
   * The CSS `grid-auto-columns` property.
   *
   * It specifies the size of an implicitly-created grid column track or pattern of tracks.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-columns)
   */
  gridAutoColumns?: Property.GridAutoColumns;

  /**
   * The CSS `grid-auto-rows` property.
   *
   * It specifies the size of an implicitly-created grid row track or pattern of tracks.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-rows)
   */
  gridAutoRows?: Property.GridAutoRows;

  /**
   * The CSS `grid-template-columns` property
   *
   * It defines the line names and track sizing functions of the grid columns.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns)
   */
  gridTemplateColumns?: Property.GridTemplateColumns;

  /**
   * The CSS `grid-template-rows` property.
   *
   * It defines the line names and track sizing functions of the grid rows.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows)
   */
  gridTemplateRows?: Property.GridTemplateRows;

  /**
   * The CSS `grid-template-areas` property.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-areas)
   */
  gridTemplateAreas?: Property.GridTemplateAreas;

  /**
   * The CSS `grid-areas` property.
   *
   * It specifies a grid item’s size and location within a grid by
   * contributing a line, a span, or nothing (automatic)
   * to its grid placement, thereby specifying the edges of its grid area.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-area)
   */
  gridArea?: Property.GridArea;
};

/**
 * Utility props for flexbox and CSS grid based components
 */
export type FlexboxAndGridProps = {
  /**
   * The CSS `gap` property.
   *
   * It defines the gap between items in both flex and
   * grid contexts.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/gap)
   */
  gap?: Property.Gap<SpaceTokens> | number;

  /**
   * The CSS `row-gap` property.
   *
   * It sets the size of the gap (gutter) between an element's grid rows.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/row-gap)
   */
  rowGap?: Property.RowGap<SpaceTokens> | number;

  /**
   * The CSS `column-gap` property.
   *
   * It sets the size of the gap (gutter) between an element's columns.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/column-gap)
   */
  columnGap?: Property.ColumnGap<SpaceTokens> | number;

  /**
   * The CSS `place-items` property.
   *
   * It allows you to align items along both the block and
   * inline directions at once (i.e. the align-items and justify-items properties)
   * in a relevant layout system such as `Grid` or `Flex`.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/place-items)
   */
  placeItems?: Property.PlaceItems;

  /**
   * The CSS `place-content` property.
   *
   * It allows you to align content along both the block and
   * inline directions at once (i.e. the align-content and justify-content properties)
   * in a relevant layout system such as Grid or Flexbox.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/place-content)
   */

  placeContent?: Property.PlaceContent;
  /**
   * The CSS `place-self` property.
   *
   * It allows you to align an individual item in both the block and
   * inline directions at once (i.e. the align-self and justify-self properties)
   * in a relevant layout system such as Grid or Flexbox.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/place-self)
   */
  placeSelf?: Property.PlaceSelf;
};

/**
 * The `css` prop allow you to override styles easily.
 * It’s like the style attribute, but it supports tokens, media queries, nesting and token-aware values.
 */
export type CSSProp = {
  css?: SystemStyleObject;
};
