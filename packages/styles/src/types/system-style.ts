import { OverrideProps } from "@hope-ui/utils";
import { Property } from "csstype";

import { CSSObject } from "../stitches.config";
import { ThemeBase } from "./theme-base";
import {
  ThemeBreakpoint,
  ThemeColorShade,
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
} from "./token";

export type ResponsiveArray<T> = Array<T | null>;

export type ResponsiveObject<T> = Partial<Record<ThemeBreakpoint | string, T>>;

export type ResponsiveValue<T> =
  | T
  | ResponsiveArray<T>
  | ResponsiveObject<T>
  | ((theme: ThemeBase) => T | ResponsiveArray<T> | ResponsiveObject<T>);

export type ResponsiveProps<Props> = {
  [K in keyof Props]?: ResponsiveValue<Props[K]>;
};

export type BorderProps = ResponsiveProps<{
  /** The CSS `border` property. */
  border: Property.Border;

  /** The CSS `border-width` property. */
  borderWidth: Property.BorderWidth | number;

  /** The CSS `border-style` property. */
  borderStyle: Property.BorderStyle;

  /** The CSS `border-color` property. */
  borderColor: Property.BorderColor | ThemeColorShade;

  /** The CSS `border-top` property. */
  borderTop: Property.BorderTop;

  /** The CSS `border-top-width` property. */
  borderTopWidth: Property.BorderTopWidth | number;

  /** The CSS `border-top-style` property. */
  borderTopStyle: Property.BorderTopStyle;

  /** The CSS `border-top-color` property. */
  borderTopColor: Property.BorderTopColor | ThemeColorShade;

  /** The CSS `border-right` property. */
  borderRight: Property.BorderRight;

  /** The CSS `border-right-width` property. */
  borderRightWidth: Property.BorderRightWidth | number;

  /** The CSS `border-right-style` property. */
  borderRightStyle: Property.BorderRightStyle;

  /** The CSS `border-right-color` property. */
  borderRightColor: Property.BorderRightColor | ThemeColorShade;

  /** The CSS `border-bottom` property. */
  borderBottom: Property.BorderBottom;

  /** The CSS `border-bottom-width` property. */
  borderBottomWidth: Property.BorderBottomWidth | number;

  /** The CSS `border-bottom-style` property. */
  borderBottomStyle: Property.BorderBottomStyle;

  /** The CSS `border-bottom-color` property. */
  borderBottomColor: Property.BorderBottomColor | ThemeColorShade;

  /** The CSS `border-left` property. */
  borderLeft: Property.BorderLeft;

  /** The CSS `border-left-width` property. */
  borderLeftWidth: Property.BorderLeftWidth | number;

  /** The CSS `border-left-style` property. */
  borderLeftStyle: Property.BorderLeftStyle;

  /** The CSS `border-left-color` property. */
  borderLeftColor: Property.BorderLeftColor | ThemeColorShade;

  /** The CSS `border-right` and `border-left` property. */
  borderX: Property.BorderLeft;

  /** The CSS `border-top` and `border-bottom` property. */
  borderY: Property.BorderTop;
}>;

export type ColorProps = ResponsiveProps<{
  /** The CSS `color` property. */
  color: Property.Color | ThemeColorShade;

  /** The CSS `background` property. */
  bg: Property.Background<ThemeColorShade>;

  /** The CSS `background` property. */
  background: Property.Background<ThemeColorShade>;

  /** The CSS `background-color` property. */
  bgColor: Property.BackgroundColor | ThemeColorShade;

  /** The CSS `background-color` property. */
  backgroundColor: Property.BackgroundColor | ThemeColorShade;

  /** The CSS `opacity` property. */
  opacity: Property.Opacity;
}>;

export type FlexboxProps = ResponsiveProps<{
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
  alignItems: Property.AlignItems;

  /**
   * The CSS `align-content` property.
   *
   * It defines the distribution of space between and around
   * content items along a flexbox's cross-axis or a grid's block axis.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/align-content)
   */
  alignContent: Property.AlignContent;

  /**
   * The CSS `align-self` property.
   *
   * It works like `align-items`, but applies only to a
   * single flexbox item, instead of all of them.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/align-self)
   */
  alignSelf: Property.AlignSelf;

  /**
   * The CSS `justify-items` property.
   *
   * It defines the default `justify-self` for all items of the box,
   * giving them all a default way of justifying each box
   * along the appropriate axis.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/justify-items)
   */
  justifyItems: Property.JustifyItems;

  /**
   * The CSS `justify-content` property.
   *
   * It defines how the browser distributes space between and around content items
   * along the main-axis of a flex container, and the inline axis of a grid container.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/justify-content)
   */
  justifyContent: Property.JustifyContent;

  /**
   * The CSS `justify-self` property.
   *
   * It defines the way a box is justified inside its
   * alignment container along the appropriate axis.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-flow)
   */
  justifySelf: Property.JustifySelf;

  /**
   * The CSS `flex-wrap` property.
   *
   * It defines whether flex items are forced onto one line or
   * can wrap onto multiple lines. If wrapping is allowed,
   * it sets the direction that lines are stacked.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-wrap)
   */
  flexWrap: Property.FlexWrap;

  /**
   * The CSS `flex-direction` property.
   *
   * It defines how flex items are placed in the flex container
   * defining the main axis and the direction (normal or reversed).
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-direction)
   */
  flexDirection: Property.FlexDirection;

  /**
   * The CSS `flex` property.
   *
   * It defines how a flex item will grow or shrink
   * to fit the space available in its flex container.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex)
   */
  flex: Property.Flex;

  /**
   * The CSS `flex-grow` property.
   *
   * It defines how much a flexbox item should grow
   * if there's space available.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-grow)
   */
  flexGrow: Property.FlexGrow;

  /**
   * The CSS `flex-shrink` property.
   *
   * It defines how much a flexbox item should shrink
   * if there's not enough space available.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-shrink)
   */
  flexShrink: Property.FlexShrink;

  /**
   * The CSS `flex-basis` property.
   *
   * It defines the initial main size of a flex item.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/flex-basis)
   */
  flexBasis: Property.FlexBasis;

  /**
   * The CSS `order` property.
   *
   * It defines the order to lay out an item in a flex or grid container.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/order)
   */
  order: Property.Order;
}>;

export type GridLayoutProps = ResponsiveProps<{
  /**
   * The CSS `grid-template` property.
   *
   * It is a shorthand property for defining grid columns, rows, and areas.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template)
   */
  gridTemplate: Property.GridTemplate;

  /**
   * The CSS `grid-template-columns` property
   *
   * It defines the line names and track sizing functions of the grid columns.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns)
   */
  gridTemplateColumns: Property.GridTemplateColumns;

  /**
   * The CSS `grid-template-rows` property.
   *
   * It defines the line names and track sizing functions of the grid rows.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows)
   */
  gridTemplateRows: Property.GridTemplateRows;

  /**
   * The CSS `grid-template-areas` property.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-areas)
   */
  gridTemplateAreas: Property.GridTemplateAreas;

  /**
   * The CSS `grid-area` property.
   *
   * It specifies a grid item’s size and location within a grid by
   * contributing a line, a span, or nothing (automatic)
   * to its grid placement, thereby specifying the edges of its grid area.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-area)
   */
  gridArea: Property.GridArea;

  /**
   * The CSS `grid-auto-flow` property
   *
   * It controls how the auto-placement algorithm works,
   * specifying exactly how auto-placed items get flowed into the grid.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-flow)
   */
  gridAutoFlow: Property.GridAutoFlow;

  /**
   * The CSS `grid-auto-columns` property.
   *
   * It specifies the size of an implicitly-created grid column track or pattern of tracks.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-columns)
   */
  gridAutoColumns: Property.GridAutoColumns;

  /**
   * The CSS `grid-auto-rows` property.
   *
   * It specifies the size of an implicitly-created grid row track or pattern of tracks.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-auto-rows)
   */
  gridAutoRows: Property.GridAutoRows;

  /**
   * The CSS `grid-column` property.
   *
   * It specifies a grid item's size and location within a grid column
   * by contributing a line, a span, or nothing (automatic) to its grid placement,
   * thereby specifying the `inline-start` and `inline-end` edge of its grid area.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column)
   */
  gridColumn: Property.GridColumn;

  /**
   * The CSS `grid-column-start` property.
   *
   * It specifies a grid item’s start position within the grid column by
   * contributing a line, a span, or nothing (automatic) to its grid placement
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-start)
   */
  gridColumnStart: Property.GridColumnStart;

  /**
   * The CSS `grid-column-end` property
   *
   * It specifies a grid item’s end position within the grid column by
   * contributing a line, a span, or nothing (automatic) to its grid placement,
   * thereby specifying the block-end edge of its grid area.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-end)
   */
  gridColumnEnd: Property.GridColumnEnd;

  /**
   * The CSS `grid-row` property
   *
   * It specifies a grid item’s size and location within the grid row
   * by contributing a line, a span, or nothing (automatic) to its grid placement,
   * thereby specifying the `inline-start` and `inline-end` edge of its grid area.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row)
   */
  gridRow: Property.GridRow;

  /**
   * The CSS `grid-row-start` property
   *
   * It specifies a grid item’s start position within the grid row by
   * contributing a line, a span, or nothing (automatic) to its grid placement,
   * thereby specifying the `inline-start` edge of its grid area.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-start)
   */
  gridRowStart: Property.GridRowStart;

  /**
   * The CSS `grid-row-end` property
   *
   * It specifies a grid item’s end position within the grid row by
   * contributing a line, a span, or nothing (automatic) to its grid placement,
   * thereby specifying the `inline-end` edge of its grid area.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-end)
   */
  gridRowEnd: Property.GridRowEnd;

  /**
   * The CSS `place-items` property.
   *
   * It allows you to align items along both the block and
   * inline directions at once (i.e. the align-items and justify-items properties)
   * in a relevant layout system such as `Grid` or `Flex`.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/place-items)
   */
  placeItems: Property.PlaceItems;

  /**
   * The CSS `place-content` property.
   *
   * It allows you to align content along both the block and
   * inline directions at once (i.e. the align-content and justify-content properties)
   * in a relevant layout system such as Grid or Flexbox.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/place-content)
   */
  placeContent: Property.PlaceContent;

  /**
   * The CSS `place-self` property.
   *
   * It allows you to align an individual item in both the block and
   * inline directions at once (i.e. the align-self and justify-self properties)
   * in a relevant layout system such as Grid or Flexbox.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/place-self)
   */
  placeSelf: Property.PlaceSelf;

  /**
   * The CSS `gap` property.
   *
   * It defines the gap between items in both flex and
   * grid contexts.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/gap)
   */
  gap: Property.Gap<ThemeSpace> | number;

  /**
   * The CSS `row-gap` property.
   *
   * It sets the size of the gap (gutter) between an element's grid rows.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/row-gap)
   */
  rowGap: Property.RowGap<ThemeSpace> | number;

  /**
   * The CSS `column-gap` property.
   *
   * It sets the size of the gap (gutter) between an element's columns.
   *
   * @see [Mozilla Docs](https://developer.mozilla.org/docs/Web/CSS/column-gap)
   */
  columnGap: Property.ColumnGap<ThemeSpace> | number;
}>;

export type LayoutProps = ResponsiveProps<{
  /** The CSS `display` property. */
  d: Property.Display;

  /** The CSS `display` property. */
  display: Property.Display;

  /** The CSS `vertical-align` property. */
  verticalAlign: Property.VerticalAlign;

  /** The CSS `overflow` property. */
  overflow: Property.Overflow;

  /** The CSS `overflow-x` property. */
  overflowX: Property.OverflowX;

  /** The CSS `overflow-y` property. */
  overflowY: Property.OverflowY;
}>;

export type InteractivityProps = ResponsiveProps<{
  /** The CSS `appearance` property. */
  appearance: Property.Appearance;

  /** The CSS `user-select` property. */
  userSelect: Property.UserSelect;

  /** The CSS `pointer-events` property. */
  pointerEvents: Property.PointerEvents;

  /** The CSS `resize` property. */
  resize: Property.Resize;

  /** The CSS `cursor` property. */
  cursor: Property.Cursor;

  /** The CSS `outline` property. */
  outline: Property.Outline<string | 0 | number>;

  /** The CSS `outline-offset` property. */
  outlineOffset: Property.OutlineOffset<string | 0 | number>;

  /** The CSS `outline-color` property. */
  outlineColor: Property.OutlineColor | ThemeColorShade;
}>;

export type MarginProps = ResponsiveProps<{
  /** The CSS `margin` property. */
  margin: Property.Margin<ThemeSpace> | number;

  /** The CSS `margin-top` property. */
  marginTop: Property.MarginTop<ThemeSpace> | number;

  /** The CSS `margin-right` property. */
  marginRight: Property.MarginRight<ThemeSpace> | number;

  /** The CSS `margin-bottom` property. */
  marginBottom: Property.MarginBottom<ThemeSpace> | number;

  /** The CSS `margin-left`  property. */
  marginLeft: Property.MarginLeft<ThemeSpace> | number;

  /** The CSS `margin` property. */
  m: Property.Margin<ThemeSpace> | number;

  /** The CSS `margin-top` property. */
  mt: Property.MarginTop<ThemeSpace> | number;

  /** The CSS `margin-right` property. */
  mr: Property.MarginRight<ThemeSpace> | number;

  /** The CSS `margin-bottom` property. */
  mb: Property.MarginBottom<ThemeSpace> | number;

  /** The CSS `margin-left`  property. */
  ml: Property.MarginLeft<ThemeSpace> | number;

  /** The CSS `margin-inline-start` and `margin-inline-end` property. */
  mx: Property.MarginInlineStart<ThemeSpace> | number;

  /** The CSS `margin-top` and `margin-bottom` property. */
  my: Property.MarginTop<ThemeSpace> | number;
}>;

export type PaddingProps = ResponsiveProps<{
  /** The CSS `padding` property. */
  padding: Property.Padding<ThemeSpace> | number;

  /** The CSS `padding-top` property. */
  paddingTop: Property.PaddingTop<ThemeSpace> | number;

  /** The CSS `padding-right` property. */
  paddingRight: Property.PaddingRight<ThemeSpace> | number;

  /** The CSS `padding-bottom` property. */
  paddingBottom: Property.PaddingBottom<ThemeSpace> | number;

  /** The CSS `padding-left`  property. */
  paddingLeft: Property.PaddingLeft<ThemeSpace> | number;

  /** The CSS `padding` property. */
  p: Property.Padding<ThemeSpace> | number;

  /** The CSS `padding-top` property. */
  pt: Property.PaddingTop<ThemeSpace> | number;

  /** The CSS `padding-right` property. */
  pr: Property.PaddingRight<ThemeSpace> | number;

  /** The CSS `padding-bottom` property. */
  pb: Property.PaddingBottom<ThemeSpace> | number;

  /** The CSS `padding-left`  property. */
  pl: Property.PaddingLeft<ThemeSpace> | number;

  /** The CSS `padding-inline-start` and `padding-inline-end` property. */
  px: Property.PaddingInlineStart<ThemeSpace> | number;

  /** The CSS `padding-top` and `padding-bottom` property. */
  py: Property.PaddingTop<ThemeSpace> | number;
}>;

export type PositionProps = ResponsiveProps<{
  /** The CSS `position` property. */
  position: Property.Position;

  /** The CSS `z-index` property. */
  zIndex: Property.ZIndex | ThemeZIndice;

  /** The CSS `top` property. */
  top: Property.Top<ThemeSpace> | number;

  /** The CSS `right` property. */
  right: Property.Right<ThemeSpace> | number;

  /** The CSS `bottom` property. */
  bottom: Property.Bottom<ThemeSpace> | number;

  /** The CSS `left` property. */
  left: Property.Left<ThemeSpace> | number;
}>;

export type RadiiProps = ResponsiveProps<{
  /** The CSS `border-radius` property. */
  borderRadius: Property.BorderRadius<ThemeRadii> | number;

  /** The CSS `border-top-left-radius` property. */
  borderTopLeftRadius: Property.BorderTopLeftRadius<ThemeRadii> | number;

  /** The CSS `border-top-right-radius` property. */
  borderTopRightRadius: Property.BorderTopRightRadius<ThemeRadii> | number;

  /** The CSS `border-bottom-right-radius`  property. */
  borderBottomRightRadius: Property.BorderBottomRightRadius<ThemeRadii> | number;

  /** The CSS  `border-bottom-left-radius` property. */
  borderBottomLeftRadius: Property.BorderBottomLeftRadius<ThemeRadii> | number;

  /** The CSS `border-top-left-radius` and `border-top-right-radius` property. */
  borderTopRadius: Property.BorderTopLeftRadius<ThemeRadii> | number;

  /** The CSS `border-top-right-radius` and `border-bottom-right-radius` property. */
  borderRightRadius: Property.BorderTopRightRadius<ThemeRadii> | number;

  /** The CSS `border-bottom-right-radius` and `border-bottom-left-radius` property. */
  borderBottomRadius: Property.BorderBottomLeftRadius<ThemeRadii> | number;

  /** The CSS `border-top-left-radius` and `border-bottom-left-radius` property. */
  borderLeftRadius: Property.BorderTopLeftRadius<ThemeRadii> | number;

  /** The CSS `border-radius` property. */
  rounded: Property.BorderRadius<ThemeRadii> | number;

  /** The CSS `border-top-left-radius` and `border-top-right-radius` property. */
  roundedTop: Property.BorderTopLeftRadius<ThemeRadii> | number;

  /** The CSS `border-top-right-radius` and `border-bottom-right-radius` property. */
  roundedRight: Property.BorderTopRightRadius<ThemeRadii> | number;

  /** The CSS `border-bottom-right-radius` and `border-bottom-left-radius` property. */
  roundedBottom: Property.BorderBottomLeftRadius<ThemeRadii> | number;

  /** The CSS `border-top-left-radius` and `border-bottom-left-radius` property. */
  roundedLeft: Property.BorderTopLeftRadius<ThemeRadii> | number;
}>;

export type ShadowProps = ResponsiveProps<{
  /** The CSS `box-shadow` property. */
  boxShadow: Property.BoxShadow | ThemeShadow;

  /** The CSS `box-shadow` property. */
  shadow: Property.BoxShadow | ThemeShadow;
}>;

export type SizeProps = ResponsiveProps<{
  /** The CSS `width` property. */
  width: Property.Width<ThemeSize> | number;

  /** The CSS `min-width` property. */
  minWidth: Property.MinWidth<ThemeSize> | number;

  /** The CSS `max-width` property. */
  maxWidth: Property.MaxWidth<ThemeSize> | number;

  /** The CSS `height` property. */
  height: Property.Height<ThemeSize> | number;

  /** The CSS `min-height` property. */
  minHeight: Property.MinHeight<ThemeSize> | number;

  /** The CSS `max-height` property. */
  maxHeight: Property.MaxHeight<ThemeSize> | number;

  /** The CSS `width` property. */
  w: Property.Width<ThemeSize> | number;

  /** The CSS `min-width` property. */
  minW: Property.MinWidth<ThemeSize> | number;

  /** The CSS `max-width` property. */
  maxW: Property.MaxWidth<ThemeSize> | number;

  /** The CSS `height` property. */
  h: Property.Height<ThemeSize> | number;

  /** The CSS `min-height` property. */
  minH: Property.MinHeight<ThemeSize> | number;

  /** The CSS `max-height` property. */
  maxH: Property.MaxHeight<ThemeSize> | number;

  /** The CSS `width` and `height` property. */
  boxSize: Property.Width<ThemeSize> | number;
}>;

export type TypographyProps = ResponsiveProps<{
  /** The CSS `font-family` property. */
  fontFamily: Property.FontFamily | ThemeFontFamily;

  /** The CSS `font-size` property. */
  fontSize: Property.FontSize<ThemeFontSize> | number;

  /** The CSS `font-weight` property. */
  fontWeight: Property.FontWeight | ThemeFontWeight | number;

  /** The CSS `line-height` property. */
  lineHeight: Property.LineHeight<ThemeLineHeight> | string | number;

  /** The CSS `letter-spacing` property. */
  letterSpacing: Property.LetterSpacing<ThemeLetterSpacing> | string | number;

  /** The CSS `text-align` property. */
  textAlign: Property.TextAlign;

  /** The CSS `font-style` property. */
  fontStyle: Property.FontStyle;

  /** The CSS `text-transform` property. */
  textTransform: Property.TextTransform;

  /** The CSS `text-decoration` property. */
  textDecoration: Property.TextDecoration;
}>;

export type BaseSystemStyleProps = BorderProps &
  ColorProps &
  FlexboxProps &
  GridLayoutProps &
  InteractivityProps &
  LayoutProps &
  MarginProps &
  PaddingProps &
  PositionProps &
  RadiiProps &
  ShadowProps &
  SizeProps &
  TypographyProps;

export type BaseSystemStyleObject = OverrideProps<CSSObject, BaseSystemStyleProps>;

export type PseudoSelectorValue =
  | BaseSystemStyleObject
  | ((theme: ThemeBase) => BaseSystemStyleObject);

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

export type SystemStyleProps = BaseSystemStyleProps & PseudoSelectorProps;

export type SystemStyleObject = OverrideProps<CSSObject, SystemStyleProps>;

export type Sx = SystemStyleObject | ((theme: ThemeBase) => SystemStyleObject);
