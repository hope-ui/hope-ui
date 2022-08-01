import { Property } from "csstype";

import { ThemeBreakpoint, ThemeColorShade, ThemeSize, ThemeSpace } from "./token";

export type ResponsiveArray<T> = Array<T | null>;

export type ResponsiveObject<T> = Partial<Record<ThemeBreakpoint | string, T>>;

export type ResponsiveValue<T> = T | ResponsiveArray<T> | ResponsiveObject<T>;

type MarginProps = Partial<{
  /** The CSS `margin` property. */
  m: ResponsiveValue<Property.Margin<ThemeSpace> | number>;

  /** The CSS `margin-top` property. */
  mt: ResponsiveValue<Property.MarginTop<ThemeSpace> | number>;

  /** The CSS `margin-right` property. */
  mr: ResponsiveValue<Property.MarginRight<ThemeSpace> | number>;

  /** The CSS `margin-bottom` property. */
  mb: ResponsiveValue<Property.MarginBottom<ThemeSpace> | number>;

  /** The CSS `margin-left`  property. */
  ml: ResponsiveValue<Property.MarginLeft<ThemeSpace> | number>;

  /** The CSS `margin-inline-start` and `margin-inline-end` property. */
  mx: ResponsiveValue<Property.MarginInlineStart<ThemeSpace> | number>;

  /** The CSS `margin-top` and `margin-bottom` property. */
  my: ResponsiveValue<Property.MarginTop<ThemeSpace> | number>;
}>;

type PaddingProps = Partial<{
  /** The CSS `padding` property. */
  p: ResponsiveValue<Property.Padding<ThemeSpace> | number>;

  /** The CSS `padding-top` property. */
  pt: ResponsiveValue<Property.PaddingTop<ThemeSpace> | number>;

  /** The CSS `padding-right` property. */
  pr: ResponsiveValue<Property.PaddingRight<ThemeSpace> | number>;

  /** The CSS `padding-bottom` property. */
  pb: ResponsiveValue<Property.PaddingBottom<ThemeSpace> | number>;

  /** The CSS `padding-left`  property. */
  pl: ResponsiveValue<Property.PaddingLeft<ThemeSpace> | number>;

  /** The CSS `padding-inline-start` and `padding-inline-end` property. */
  px: ResponsiveValue<Property.PaddingInlineStart<ThemeSpace> | number>;

  /** The CSS `padding-top` and `padding-bottom` property. */
  py: ResponsiveValue<Property.PaddingTop<ThemeSpace> | number>;
}>;

export type ColorProps = Partial<{
  /** The CSS `color` property. */
  color: ResponsiveValue<Property.Color | ThemeColorShade>;

  /** The CSS `background` property. */
  bg: ResponsiveValue<Property.Background<ThemeColorShade>>;
}>;

export type LayoutProps = Partial<{
  /** The CSS `display` property. */
  d: ResponsiveValue<Property.Display>;

  /** The CSS `vertical-align` property. */
  verticalAlign: ResponsiveValue<Property.VerticalAlign>;

  /** The CSS `overflow` property. */
  overflow: ResponsiveValue<Property.Overflow>;

  /** The CSS `overflow-x` property. */
  overflowX: ResponsiveValue<Property.OverflowX>;

  /** The CSS `overflow-y` property. */
  overflowY: ResponsiveValue<Property.OverflowY>;
}>;

export type SizeProps = Partial<{
  /** The CSS `width` property. */
  w: ResponsiveValue<Property.Width<ThemeSize> | number>;

  /** The CSS `min-width` property. */
  minW: ResponsiveValue<Property.MinWidth<ThemeSize> | number>;

  /** The CSS `max-width` property. */
  maxW: ResponsiveValue<Property.MaxWidth<ThemeSize> | number>;

  /** The CSS `height` property. */
  h: ResponsiveValue<Property.Height<ThemeSize> | number>;

  /** The CSS `min-height` property. */
  minH: ResponsiveValue<Property.MinHeight<ThemeSize> | number>;

  /** The CSS `max-height` property. */
  maxH: ResponsiveValue<Property.MaxHeight<ThemeSize> | number>;

  /** The CSS `width` and `height` property. */
  boxSize: ResponsiveValue<Property.Width<ThemeSize> | number>;
}>;

export type FlexboxProps = Partial<{
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
  alignItems: ResponsiveValue<Property.AlignItems>;

  /**
   * The CSS `align-content` property.
   *
   * It defines the distribution of space between and around
   * content items along a flexbox's cross-axis or a grid's block axis.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/align-content)
   */
  alignContent: ResponsiveValue<Property.AlignContent>;

  /**
   * The CSS `align-self` property.
   *
   * It works like `align-items`, but applies only to a
   * single flexbox item, instead of all of them.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/align-self)
   */
  alignSelf: ResponsiveValue<Property.AlignSelf>;

  /**
   * The CSS `justify-items` property.
   *
   * It defines the default `justify-self` for all items of the box,
   * giving them all a default way of justifying each box
   * along the appropriate axis.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/justify-items)
   */
  justifyItems: ResponsiveValue<Property.JustifyItems>;

  /**
   * The CSS `justify-content` property.
   *
   * It defines how the browser distributes space between and around content items
   * along the main-axis of a flex container, and the inline axis of a grid container.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/justify-content)
   */
  justifyContent: ResponsiveValue<Property.JustifyContent>;

  /**
   * The CSS `justify-self` property.
   *
   * It defines the way a box is justified inside its
   * alignment container along the appropriate axis.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-flow)
   */
  justifySelf: ResponsiveValue<Property.JustifySelf>;

  /**
   * The CSS `flex-wrap` property.
   *
   * It defines whether flex items are forced onto one line or
   * can wrap onto multiple lines. If wrapping is allowed,
   * it sets the direction that lines are stacked.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-wrap)
   */
  flexWrap: ResponsiveValue<Property.FlexWrap>;

  /**
   * The CSS `flex-direction` property.
   *
   * It defines how flex items are placed in the flex container
   * defining the main axis and the direction (normal or reversed).
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-direction)
   */
  flexDirection: ResponsiveValue<Property.FlexDirection>;

  /**
   * The CSS `flex` property.
   *
   * It defines how a flex item will grow or shrink
   * to fit the space available in its flex container.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex)
   */
  flex: ResponsiveValue<Property.Flex>;

  /**
   * The CSS `flex-grow` property.
   *
   * It defines how much a flexbox item should grow
   * if there's space available.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-grow)
   */
  flexGrow: ResponsiveValue<Property.FlexGrow>;

  /**
   * The CSS `flex-shrink` property.
   *
   * It defines how much a flexbox item should shrink
   * if there's not enough space available.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-shrink)
   */
  flexShrink: ResponsiveValue<Property.FlexShrink>;

  /**
   * The CSS `flex-basis` property.
   *
   * It defines the initial main size of a flex item.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-basis)
   */
  flexBasis: ResponsiveValue<Property.FlexBasis>;

  /**
   * The CSS `order` property.
   *
   * It defines the order to lay out an item in a flex or grid container.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/order)
   */
  order: ResponsiveValue<Property.Order>;
}>;

export type GridLayoutProps = Partial<{
  /**
   * The CSS `grid-template` property.
   *
   * It is a shorthand property for defining grid columns, rows, and areas.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template)
   */
  gridTemplate: ResponsiveValue<Property.GridTemplate>;

  /**
   * The CSS `grid-template-columns` property
   *
   * It defines the line names and track sizing functions of the grid columns.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns)
   */
  gridTemplateColumns: ResponsiveValue<Property.GridTemplateColumns>;

  /**
   * The CSS `grid-template-rows` property.
   *
   * It defines the line names and track sizing functions of the grid rows.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows)
   */
  gridTemplateRows: ResponsiveValue<Property.GridTemplateRows>;

  /**
   * The CSS `grid-template-areas` property.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-areas)
   */
  gridTemplateAreas: ResponsiveValue<Property.GridTemplateAreas>;

  /**
   * The CSS `grid-areas` property.
   *
   * It specifies a grid item’s size and location within a grid by
   * contributing a line, a span, or nothing (automatic)
   * to its grid placement, thereby specifying the edges of its grid area.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-area)
   */
  gridArea: ResponsiveValue<Property.GridArea>;

  /**
   * The CSS `grid-auto-flow` property
   *
   * It controls how the auto-placement algorithm works,
   * specifying exactly how auto-placed items get flowed into the grid.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-flow)
   */
  gridAutoFlow: ResponsiveValue<Property.GridAutoFlow>;

  /**
   * The CSS `grid-auto-columns` property.
   *
   * It specifies the size of an implicitly-created grid column track or pattern of tracks.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-columns)
   */
  gridAutoColumns: ResponsiveValue<Property.GridAutoColumns>;

  /**
   * The CSS `grid-auto-rows` property.
   *
   * It specifies the size of an implicitly-created grid row track or pattern of tracks.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-rows)
   */
  gridAutoRows: ResponsiveValue<Property.GridAutoRows>;

  /**
   * The CSS `grid-column` property.
   *
   * It specifies a grid item's size and location within a grid column
   * by contributing a line, a span, or nothing (automatic) to its grid placement,
   * thereby specifying the `inline-start` and `inline-end` edge of its grid area.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column)
   */
  gridColumn: ResponsiveValue<Property.GridColumn>;

  /**
   * The CSS `grid-column` property.
   *
   * It specifies a grid item’s start position within the grid column by
   * contributing a line, a span, or nothing (automatic) to its grid placement
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-start)
   */
  gridColumnStart: ResponsiveValue<Property.GridColumnStart>;

  /**
   * The CSS `grid-column` property
   *
   * It specifies a grid item’s end position within the grid column by
   * contributing a line, a span, or nothing (automatic) to its grid placement,
   * thereby specifying the block-end edge of its grid area.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-end)
   */
  gridColumnEnd: ResponsiveValue<Property.GridColumnEnd>;

  /**
   * The CSS `grid-row` property
   *
   * It specifies a grid item’s size and location within the grid row
   * by contributing a line, a span, or nothing (automatic) to its grid placement,
   * thereby specifying the `inline-start` and `inline-end` edge of its grid area.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row)
   */
  gridRow: ResponsiveValue<Property.GridRow>;

  /**
   * The CSS `grid-row-start` property
   *
   * It specifies a grid item’s start position within the grid row by
   * contributing a line, a span, or nothing (automatic) to its grid placement,
   * thereby specifying the `inline-start` edge of its grid area.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-start)
   */
  gridRowStart: ResponsiveValue<Property.GridRowStart>;

  /**
   * The CSS `grid-row-end` property
   *
   * It specifies a grid item’s end position within the grid row by
   * contributing a line, a span, or nothing (automatic) to its grid placement,
   * thereby specifying the `inline-end` edge of its grid area.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-end)
   */
  gridRowEnd: ResponsiveValue<Property.GridRowEnd>;

  /**
   * The CSS `place-items` property.
   *
   * It allows you to align items along both the block and
   * inline directions at once (i.e. the align-items and justify-items properties)
   * in a relevant layout system such as `Grid` or `Flex`.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/place-items)
   */
  placeItems: ResponsiveValue<Property.PlaceItems>;

  /**
   * The CSS `place-content` property.
   *
   * It allows you to align content along both the block and
   * inline directions at once (i.e. the align-content and justify-content properties)
   * in a relevant layout system such as Grid or Flexbox.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/place-content)
   */
  placeContent: ResponsiveValue<Property.PlaceContent>;

  /**
   * The CSS `place-self` property.
   *
   * It allows you to align an individual item in both the block and
   * inline directions at once (i.e. the align-self and justify-self properties)
   * in a relevant layout system such as Grid or Flexbox.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/place-self)
   */
  placeSelf: ResponsiveValue<Property.PlaceSelf>;

  /**
   * The CSS `gap` property.
   *
   * It defines the gap between items in both flex and
   * grid contexts.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/gap)
   */
  gap: ResponsiveValue<Property.Gap<ThemeSpace> | number>;

  /**
   * The CSS `row-gap` property.
   *
   * It sets the size of the gap (gutter) between an element's grid rows.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/row-gap)
   */
  rowGap: ResponsiveValue<Property.RowGap<ThemeSpace> | number>;

  /**
   * The CSS `column-gap` property.
   *
   * It sets the size of the gap (gutter) between an element's columns.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/column-gap)
   */
  columnGap: ResponsiveValue<Property.ColumnGap<ThemeSpace> | number>;
}>;

export type SystemStyleProps = MarginProps &
  PaddingProps &
  ColorProps &
  LayoutProps &
  SizeProps &
  FlexboxProps &
  GridLayoutProps;
